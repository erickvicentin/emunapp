import {
  EmailAuthProvider,
  linkWithCredential,
  linkWithPopup,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  unlink,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, databaseId, db, functions, googleProvider } from '../config/firebase';
import { formatDni } from './studentService';
import { buildDniAuthEmail } from '../utils/authIdentifier';

export async function updateStudentOwnProfile(userProfile, profileData) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No hay una sesión activa.');
  }

  const updatedFields = {
    nombre: String(profileData.nombre || '').trim(),
    apellido: String(profileData.apellido || '').trim(),
    telefono: String(profileData.telefono || '').trim(),
    fechaNacimiento: String(profileData.fechaNacimiento || ''),
    genero: profileData.genero || 'no_especificar',
    dni: formatDni(profileData.dni),
  };

  const displayName = `${updatedFields.nombre} ${updatedFields.apellido}`.trim();
  if (displayName) {
    try {
      await updateProfile(currentUser, { displayName });
    } catch (err) {
      console.warn('Failed to update displayName:', err);
    }
  }

  await updateDoc(doc(db, 'usuarios', currentUser.uid), {
    ...updatedFields,
    actualizadoEn: serverTimestamp(),
  });

  return {
    ...(userProfile || {}),
    ...updatedFields,
    registroCompleto: true,
  };
}

export async function linkStudentGoogleAccount(userProfile) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No hay una sesión activa.');
  }

  try {
    const cred = await linkWithPopup(currentUser, googleProvider);
    const googlePhoto = cred.user?.photoURL || '';
    if (googlePhoto && !userProfile?.photoURL) {
      await updateDoc(doc(db, 'usuarios', currentUser.uid), {
        photoURL: googlePhoto,
        actualizadoEn: serverTimestamp(),
      });
    }
    await currentUser.reload();
    return auth.currentUser;
  } catch (err) {
    if (err?.code === 'auth/credential-already-in-use') {
      throw new Error('Esa cuenta de Google ya está vinculada a otro usuario.');
    }
    if (err?.code === 'auth/provider-already-linked') {
      throw new Error('Tu cuenta ya tiene Google vinculado.');
    }
    if (err?.code === 'auth/popup-closed-by-user') {
      throw new Error('Cancelaste la vinculación con Google.');
    }
    throw new Error(err?.message || 'No se pudo vincular la cuenta de Google.');
  }
}

export async function unlinkStudentGoogleAccount() {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No hay una sesión activa.');
  }
  const hasPasswordProvider = currentUser.providerData?.some(
    (provider) => provider.providerId === 'password'
  );
  if (!hasPasswordProvider) {
    throw new Error(
      'Primero debés crear una contraseña para no perder acceso a tu cuenta.'
    );
  }
  await unlink(currentUser, 'google.com');
  await currentUser.reload();
  return auth.currentUser;
}

export async function requestStudentEmailChange(newEmail) {
  if (!auth.currentUser) {
    throw new Error('No hay una sesión activa.');
  }
  const callable = httpsCallable(functions, 'requestEmailChangeCode');
  const response = await callable({ newEmail, databaseId });
  return response?.data;
}

export async function confirmStudentEmailChange(userProfile, newEmail, code) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No hay una sesión activa.');
  }
  const callable = httpsCallable(functions, 'confirmEmailChangeCode');
  const response = await callable({ newEmail, code, databaseId });
  await currentUser.reload();

  return {
    firebaseUser: auth.currentUser,
    nextProfile: {
      ...(userProfile || {}),
      email: response?.data?.email || newEmail,
      authEmail: response?.data?.email || newEmail,
    },
  };
}

export async function changeStudentOwnPassword(userProfile, { currentPassword, newPassword }) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No hay una sesión activa.');
  }

  const hasPasswordProvider = currentUser.providerData?.some(
    (provider) => provider.providerId === 'password'
  );
  const credentialEmail =
    currentUser.email ||
    userProfile?.authEmail ||
    userProfile?.email ||
    buildDniAuthEmail(userProfile?.dni);

  if (hasPasswordProvider) {
    try {
      const cred = EmailAuthProvider.credential(credentialEmail, currentPassword);
      await reauthenticateWithCredential(currentUser, cred);
    } catch (err) {
      if (
        err?.code === 'auth/wrong-password' ||
        err?.code === 'auth/invalid-credential'
      ) {
        throw new Error('La contraseña actual es incorrecta.');
      }
      throw new Error(err?.message || 'No se pudo verificar tu contraseña actual.');
    }
    await updatePassword(currentUser, newPassword);
  } else {
    const cred = EmailAuthProvider.credential(credentialEmail, newPassword);
    try {
      await linkWithCredential(currentUser, cred);
    } catch (err) {
      if (err?.code === 'auth/requires-recent-login') {
        await reauthenticateWithPopup(currentUser, googleProvider);
        await linkWithCredential(currentUser, cred);
      } else {
        throw err;
      }
    }
    await currentUser.reload();
  }

  await updateDoc(doc(db, 'usuarios', currentUser.uid), {
    requiereCambioPassword: false,
    actualizadoEn: serverTimestamp(),
  });

  return auth.currentUser;
}
