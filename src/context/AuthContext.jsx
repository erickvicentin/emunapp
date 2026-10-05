import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';
import { AuthContext } from './authContextInstance';

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
        await fetchUserProfile(currentUser);
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

  const loginWithEmail = useCallback(async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const profile = await fetchUserProfile(cred.user);
    return { user: cred.user, profile };
  }, [fetchUserProfile]);

  const registerWithEmail = useCallback(async (email, password, profileData) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
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
      email: cred.user.email,
      nombre: profileData.nombre,
      apellido: profileData.apellido,
      telefono: profileData.telefono || '',
      fechaNacimiento: profileData.fechaNacimiento || '',
      genero: profileData.genero || 'no_especificar',
      photoURL: cred.user.photoURL || '',
      rol: 'customer',
      estado: 'activo',
      registroCompleto: true,
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
    return { user: cred.user, profile };
  }, [fetchUserProfile]);

  const completeGoogleRegistration = useCallback(async (profileData) => {
    if (!auth.currentUser) throw new Error('No hay usuario autenticado');
    const uid = auth.currentUser.uid;

    const updatedProfile = {
      uid,
      email: auth.currentUser.email,
      nombre: profileData.nombre || auth.currentUser.displayName?.split(' ')[0] || '',
      apellido: profileData.apellido || '',
      telefono: profileData.telefono || '',
      fechaNacimiento: profileData.fechaNacimiento || '',
      genero: profileData.genero || 'no_especificar',
      photoURL: auth.currentUser.photoURL || '',
      rol: 'customer',
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
      logout,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
