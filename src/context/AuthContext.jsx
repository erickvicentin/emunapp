import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { AuthContext } from './authContextInstance';
import {
  completeForcedPasswordUpdate,
  completeGoogleUserProfile,
  createDisabledAccountError,
  getLocalProfile,
  registerStudentAccount,
  removeLocalProfile,
  resolveUserProfile,
  setLocalProfile,
  signInWithGooglePopup,
  signInWithIdentifier,
} from '../services/authSessionService';
import {
  changeStudentOwnPassword,
  confirmStudentEmailChange,
  linkStudentGoogleAccount,
  requestStudentEmailChange,
  unlinkStudentGoogleAccount,
  updateStudentOwnProfile,
} from '../services/accountProfileService';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (firebaseUser) => {
    if (!firebaseUser) {
      setUserProfile(null);
      return null;
    }

    const cached = getLocalProfile(firebaseUser.uid);
    if (cached) setUserProfile(cached);

    const profile = await resolveUserProfile(firebaseUser);
    setUserProfile(profile);
    return profile;
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
      if (isMounted) setLoading(false);
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
    const cred = await signInWithIdentifier(identifier, password);
    const profile = await fetchUserProfile(cred.user);
    await enforceActiveAccount(cred.user.uid, profile);
    return { user: cred.user, profile };
  }, [fetchUserProfile, enforceActiveAccount]);

  const registerWithEmail = useCallback(async (email, password, profileData) => {
    const result = await registerStudentAccount(email, password, profileData);
    setUserProfile(result.profile);
    return result;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const cred = await signInWithGooglePopup();
    const profile = await fetchUserProfile(cred.user);
    await enforceActiveAccount(cred.user.uid, profile);
    return { user: cred.user, profile };
  }, [fetchUserProfile, enforceActiveAccount]);

  const completeGoogleRegistration = useCallback(async (profileData) => {
    const updatedProfile = await completeGoogleUserProfile(profileData);
    setUserProfile(updatedProfile);
    return updatedProfile;
  }, []);

  const completeRequiredPasswordChange = useCallback(async (newPassword) => {
    const next = await completeForcedPasswordUpdate(userProfile, newPassword);
    setUserProfile(next);
  }, [userProfile]);

  const updateOwnProfile = useCallback(async (profileData) => {
    const nextProfile = await updateStudentOwnProfile(userProfile, profileData);
    if (auth.currentUser) setLocalProfile(auth.currentUser.uid, nextProfile);
    setUserProfile(nextProfile);
    return nextProfile;
  }, [userProfile]);

  const linkGoogleAccount = useCallback(async () => {
    const updatedUser = await linkStudentGoogleAccount(userProfile);
    setUser(updatedUser);
    await fetchUserProfile(updatedUser);
    return updatedUser;
  }, [fetchUserProfile, userProfile]);

  const unlinkGoogleAccount = useCallback(async () => {
    const updatedUser = await unlinkStudentGoogleAccount();
    setUser(updatedUser);
    await fetchUserProfile(updatedUser);
    return updatedUser;
  }, [fetchUserProfile]);

  const requestEmailChange = useCallback(
    (newEmail) => requestStudentEmailChange(newEmail),
    []
  );

  const confirmEmailChange = useCallback(async (newEmail, code) => {
    const { firebaseUser, nextProfile } = await confirmStudentEmailChange(
      userProfile,
      newEmail,
      code
    );
    setUser(firebaseUser);
    if (firebaseUser) setLocalProfile(firebaseUser.uid, nextProfile);
    setUserProfile(nextProfile);
    return nextProfile;
  }, [userProfile]);

  const changeOwnPassword = useCallback(async (payload) => {
    const updatedUser = await changeStudentOwnPassword(userProfile, payload);
    setUser(updatedUser);
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
      updateOwnProfile,
      linkGoogleAccount,
      unlinkGoogleAccount,
      requestEmailChange,
      confirmEmailChange,
      changeOwnPassword,
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
      updateOwnProfile,
      linkGoogleAccount,
      unlinkGoogleAccount,
      requestEmailChange,
      confirmEmailChange,
      changeOwnPassword,
      logout,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
