import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, googleProvider, databaseId, db, functions } from '../config/firebase';
import { AuthContext } from './authContextInstance';
import { formatDni } from '../services/studentService';
import { buildDniAuthEmail, isDniIdentifier } from '../utils/authIdentifier';

const withTimeout = (promise, ms = 5000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firestore timeout')), ms)
    ),
  ]);
};

const getLocalProfile = (uid) => {
  try {
    const raw = localStorage.getItem(`emuna_profile_${uid}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const setLocalProfile = (uid, profile) => {
  try {
    localStorage.setItem(`emuna_profile_${uid}`, JSON.stringify(profile));
  } catch {
    // Ignore storage quota errors
  }
};

function removeLocalProfile(uid) {
  try {
    localStorage.removeItem(`emuna_profile_${uid}`);
  } catch {
    // ignore storage errors
  }
}

function createDisabledAccountError() {
  const error = new Error(
    'Tu cuenta está desactivada. Comunicate con la administración de Emuná para reactivarla.'
  );
  error.code = 'auth/user-disabled';
  return error;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch or evaluate user profile from Firestore or local cache
  const fetchUserProfile = useCallback(async (firebaseUser) => {
    if (!firebaseUser) {
      setUserProfile(null);
      return null;
    }

    const cached = getLocalProfile(firebaseUser.uid);
    if (cached) {
      setUserProfile(cached);
    }

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
        setUserProfile(fullProfile);
        return fullProfile;
      }

      if (cached && (cached.registroCompleto || cached.rol === 'staff')) {
        setUserProfile(cached);
        return cached;
      }

      // User document does not exist yet in Firestore
      const isKnownStaff = firebaseUser.email === 'admin@emuna.com' || cached?.rol === 'staff';
      const pendingProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        nombre: firebaseUser.displayName?.split(' ')[0] || (isKnownStaff ? 'Administradora' : ''),
        apellido: firebaseUser.displayName?.split(' ').slice(1).join(' ') || (isKnownStaff ? 'Emuná' : ''),
        photoURL: firebaseUser.photoURL || '',
        rol: isKnownStaff ? 'staff' : 'customer',
        registroCompleto: isKnownStaff,
      };
      setLocalProfile(firebaseUser.uid, pendingProfile);
      setUserProfile(pendingProfile);
      return pendingProfile;
    } catch (err) {
      console.warn('Firestore unavailable or timed out, using fallback profile:', err.message);
      if (cached && (cached.registroCompleto || cached.rol === 'staff')) {
        setUserProfile(cached);
        return cached;
      }
      const isKnownStaff = firebaseUser.email === 'admin@emuna.com' || cached?.rol === 'staff';
      const fallback = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        nombre: firebaseUser.displayName?.split(' ')[0] || (isKnownStaff ? 'Administradora' : ''),
        apellido: firebaseUser.displayName?.split(' ').slice(1).join(' ') || (isKnownStaff ? 'Emuná' : ''),
        photoURL: firebaseUser.photoURL || '',
        rol: isKnownStaff ? 'staff' : 'customer',
        registroCompleto: isKnownStaff,
      };
      setLocalProfile(firebaseUser.uid, fallback);
      setUserProfile(fallback);
      return fallback;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!isMounted) return;
      setUser(currentUser);
      if (currentUser) {
        const profile = await fetchUserProfile(currentUser);
        if (profile?.active === false) {
          removeLocalProfile(currentUser.uid);
          await signOut(auth);
          if (isMounted) {
            setUser(null);
            setUserProfile(null);
          }
        }
      } else {
        setUserProfile(null);
      }
      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [fetchUserProfile]);

  const enforceActiveAccount = useCallback(async (uid, profile) => {
    if (profile?.active === false) {
      removeLocalProfile(uid);
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      throw createDisabledAccountError();
    }
  }, []);

  const loginWithEmail = useCallback(async (identifier, password) => {
    const trimmed = String(identifier || '').trim();
    let cred;

    if (isDniIdentifier(trimmed)) {
      const syntheticEmail = buildDniAuthEmail(trimmed);
      try {
        cred = await signInWithEmailAndPassword(auth, syntheticEmail, password);
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
        cred = await signInWithEmailAndPassword(auth, targetEmail, password);
      }
    } else {
      cred = await signInWithEmailAndPassword(auth, trimmed, password);
    }

    const profile = await fetchUserProfile(cred.user);
    await enforceActiveAccount(cred.user.uid, profile);
    return { user: cred.user, profile };
  }, [fetchUserProfile, enforceActiveAccount]);

  const registerWithEmail = useCallback(async (email, password, profileData) => {
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
    setUserProfile(newProfile);

    // Persist to Firestore in background
    try {
      const userDocRef = doc(db, 'usuarios', cred.user.uid);
      await withTimeout(setDoc(userDocRef, { ...newProfile, creadoEn: serverTimestamp() }), 2000);
    } catch (err) {
      console.warn('Could not persist profile to Firestore (check Firestore console setup):', err.message);
    }

    return { user: cred.user, profile: newProfile };
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    const profile = await fetchUserProfile(cred.user);
    await enforceActiveAccount(cred.user.uid, profile);
    return { user: cred.user, profile };
  }, [fetchUserProfile, enforceActiveAccount]);

  const completeGoogleRegistration = useCallback(async (profileData) => {
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
    setUserProfile(updatedProfile);

    // Persist to Firestore in background
    try {
      const userDocRef = doc(db, 'usuarios', uid);
      await withTimeout(setDoc(userDocRef, { ...updatedProfile, actualizadoEn: serverTimestamp() }, { merge: true }), 2000);
    } catch (err) {
      console.warn('Could not persist Google profile to Firestore (check Firestore console setup):', err.message);
    }

    return updatedProfile;
  }, []);

  const completeRequiredPasswordChange = useCallback(async (newPassword) => {
    if (!auth.currentUser) {
      throw new Error('No hay una sesión activa.');
    }
    await updatePassword(auth.currentUser, newPassword);
    const userDocRef = doc(db, 'usuarios', auth.currentUser.uid);
    await updateDoc(userDocRef, {
      requiereCambioPassword: false,
      actualizadoEn: serverTimestamp(),
    });
    const next = { ...(userProfile || {}), requiereCambioPassword: false };
    setLocalProfile(auth.currentUser.uid, next);
    setUserProfile(next);
  }, [userProfile]);

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      userProfile,
      role: userProfile?.rol || 'customer',
      loading,
      loginWithEmail,
      registerWithEmail,
      loginWithGoogle,
      completeGoogleRegistration,
      completeRequiredPasswordChange,
      logout,
    }),
    [
      user,
      userProfile,
      loading,
      loginWithEmail,
      registerWithEmail,
      loginWithGoogle,
      completeGoogleRegistration,
      completeRequiredPasswordChange,
      logout,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
