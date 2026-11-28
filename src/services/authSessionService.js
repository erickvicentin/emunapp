import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, databaseId, db, functions, googleProvider } from '../config/firebase';
import { formatDni } from './studentService';
import { buildDniAuthEmail, isDniIdentifier } from '../utils/authIdentifier';

export const withTimeout = (promise, ms = 5000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firestore timeout')), ms)
    ),
  ]);

export function getLocalProfile(uid) {
  try {
    const raw = localStorage.getItem(`emuna_profile_${uid}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setLocalProfile(uid, profile) {
  try {
    localStorage.setItem(`emuna_profile_${uid}`, JSON.stringify(profile));
  } catch {
    // Ignore storage quota errors
  }
}

export function removeLocalProfile(uid) {
  try {
    localStorage.removeItem(`emuna_profile_${uid}`);
  } catch {
    // ignore storage errors
  }
}

export function createDisabledAccountError() {
  const error = new Error(
    'Tu cuenta está desactivada. Comunicate con la administración de Emuná para reactivarla.'
  );
  error.code = 'auth/user-disabled';
  return error;
}

function buildFallbackProfile(firebaseUser, cached) {
  const isKnownStaff = firebaseUser.email === 'admin@emuna.com' || cached?.rol === 'staff';
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    nombre: firebaseUser.displayName?.split(' ')[0] || (isKnownStaff ? 'Administradora' : ''),
    apellido: firebaseUser.displayName?.split(' ').slice(1).join(' ') || (isKnownStaff ? 'Emuná' : ''),
    photoURL: firebaseUser.photoURL || '',
    rol: isKnownStaff ? 'staff' : 'customer',
    registroCompleto: isKnownStaff,
  };
}

export async function resolveUserProfile(firebaseUser) {
  const cached = getLocalProfile(firebaseUser.uid);

  try {
    const userDocRef = doc(db, 'usuarios', firebaseUser.uid);
    const userDocSnap = await withTimeout(getDoc(userDocRef), 5000);

    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      const isStaff = data.rol === 'staff' || data.rol === 'administradora';
      const isComplete = Boolean(
        data.registroCompleto || isStaff || (data.telefono && data.fechaNacimiento && data.genero)
      );
      const fullProfile = {
        ...data,
        rol: data.rol || (firebaseUser.email === 'admin@emuna.com' ? 'staff' : 'customer'),
        registroCompleto: isComplete,
      };
      setLocalProfile(firebaseUser.uid, fullProfile);
      return fullProfile;
    }

    if (cached && (cached.registroCompleto || cached.rol === 'staff')) {
      return cached;
    }

    const pendingProfile = buildFallbackProfile(firebaseUser, cached);
    setLocalProfile(firebaseUser.uid, pendingProfile);
    return pendingProfile;
  } catch (err) {
    console.warn('Firestore unavailable or timed out, using fallback profile:', err.message);
    if (cached && (cached.registroCompleto || cached.rol === 'staff')) {
      return cached;
    }
    const fallback = buildFallbackProfile(firebaseUser, cached);
    setLocalProfile(firebaseUser.uid, fallback);
    return fallback;
  }
}

export async function signInWithIdentifier(identifier, password) {
  const trimmed = String(identifier || '').trim();
  if (!isDniIdentifier(trimmed)) {
    return signInWithEmailAndPassword(auth, trimmed, password);
  }

  const syntheticEmail = buildDniAuthEmail(trimmed);
  try {
    return await signInWithEmailAndPassword(auth, syntheticEmail, password);
  } catch (err) {
    if (err?.code !== 'auth/invalid-credential' && err?.code !== 'auth/user-not-found') {
      throw err;
    }
    let targetEmail = null;
    try {
      const resolveEmail = httpsCallable(functions, 'resolveAuthEmailByDni');
      const resolved = await resolveEmail({ dni: trimmed, databaseId });
      targetEmail = resolved?.data?.authEmail;
    } catch {
      throw err;
    }
    if (!targetEmail || targetEmail === syntheticEmail) {
      throw err;
    }
    return signInWithEmailAndPassword(auth, targetEmail, password);
  }
}

export async function registerStudentAccount(email, password, profileData) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const authEmail = cleanEmail || buildDniAuthEmail(profileData.dni);
  const cred = await createUserWithEmailAndPassword(auth, authEmail, password);
  const displayName = `${profileData.nombre} ${profileData.apellido}`.trim();

  if (displayName) {
    try {
      await updateProfile(cred.user, { displayName });
    } catch (e) {
      console.warn('Failed to update displayName:', e);
    }
  }

  const newProfile = {
    uid: cred.user.uid,
    email: cleanEmail,
    authEmail,
    nombre: profileData.nombre,
    apellido: profileData.apellido,
    dni: formatDni(profileData.dni),
    telefono: profileData.telefono || '',
    fechaNacimiento: profileData.fechaNacimiento || '',
    genero: profileData.genero || 'no_especificar',
    photoURL: cred.user.photoURL || '',
    rol: 'customer',
    active: true,
    estado: 'activo',
    registroCompleto: true,
    requiereCambioPassword: false,
    creadoEn: new Date().toISOString(),
  };

  setLocalProfile(cred.user.uid, newProfile);

  try {
    const userDocRef = doc(db, 'usuarios', cred.user.uid);
    await withTimeout(setDoc(userDocRef, { ...newProfile, creadoEn: serverTimestamp() }), 2000);
  } catch (err) {
    console.warn('Could not persist profile to Firestore (check Firestore console setup):', err.message);
  }

  return { user: cred.user, profile: newProfile };
}

export async function signInWithGooglePopup() {
  return signInWithPopup(auth, googleProvider);
}

export async function completeGoogleUserProfile(profileData) {
  if (!auth.currentUser) throw new Error('No hay usuario autenticado');
  const uid = auth.currentUser.uid;

  const updatedProfile = {
    uid,
    email: auth.currentUser.email,
    nombre: profileData.nombre || auth.currentUser.displayName?.split(' ')[0] || '',
    apellido: profileData.apellido || '',
    dni: formatDni(profileData.dni),
    telefono: profileData.telefono || '',
    fechaNacimiento: profileData.fechaNacimiento || '',
    genero: profileData.genero || 'no_especificar',
    photoURL: auth.currentUser.photoURL || '',
    rol: 'customer',
    active: true,
    estado: 'activo',
    registroCompleto: true,
    actualizadoEn: new Date().toISOString(),
  };

  setLocalProfile(uid, updatedProfile);

  try {
    const userDocRef = doc(db, 'usuarios', uid);
    await withTimeout(
      setDoc(userDocRef, { ...updatedProfile, actualizadoEn: serverTimestamp() }, { merge: true }),
      2000
    );
  } catch (err) {
    console.warn('Could not persist Google profile to Firestore (check Firestore console setup):', err.message);
  }

  return updatedProfile;
}

export async function completeForcedPasswordUpdate(userProfile, newPassword) {
  if (!auth.currentUser) {
    throw new Error('No hay una sesión activa.');
  }
  await updatePassword(auth.currentUser, newPassword);
  await updateDoc(doc(db, 'usuarios', auth.currentUser.uid), {
    requiereCambioPassword: false,
    actualizadoEn: serverTimestamp(),
  });
  const next = { ...(userProfile || {}), requiereCambioPassword: false };
  setLocalProfile(auth.currentUser.uid, next);
  return next;
}
