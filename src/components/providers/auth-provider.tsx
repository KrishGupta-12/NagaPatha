
'use client';

import { useFirebase } from '@/firebase';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut as firebaseSignOut, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import React, { createContext, useEffect, useState } from 'react';
import { setDoc, doc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { SignUpData, SignInData } from '@/lib/types';


interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  loading: boolean;
  signUpWithEmail: (data: SignUpData) => Promise<void>;
  signInWithEmail: (data: SignInData) => Promise<void>;
  signOut: () => Promise<void>;
  playAsGuest: () => void;
  endGuestSession: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { auth, firestore } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
        setLoading(true);
        return;
    };
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !user.isAnonymous) {
        setUser(user);
        setIsGuest(false);
      } else if (user && user.isAnonymous) {
        setUser(user);
        setIsGuest(true);
      } else {
        setUser(null);
        setIsGuest(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const signUpWithEmail = async ({ name, email, password }: SignUpData) => {
    if (!auth || !firestore) throw new Error("Firebase not initialized");
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      await updateProfile(newUser, { displayName: name });
      
      const userRef = doc(firestore, 'users', newUser.uid);
      const userData = {
        id: newUser.uid,
        username: name,
        email: newUser.email,
        authProvider: 'password'
      };

      setDoc(userRef, userData).catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'create',
            requestResourceData: userData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });

      setUser(newUser);
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async ({ email, password }: SignInData) => {
    if (!auth) throw new Error("Firebase not initialized");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setIsGuest(false);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const playAsGuest = async () => {
    if (!auth) return;
    setLoading(true);
    try {
        const userCredential = await signInAnonymously(auth);
        setUser(userCredential.user);
        setIsGuest(true);
    } catch (error) {
        console.error("Error signing in as guest:", error);
    } finally {
        setLoading(false);
    }
  };
  
  const endGuestSession = async () => {
    if (user && user.isAnonymous) {
      await signOut();
    }
    setIsGuest(false);
    setUser(null);
  };

  const value = {
    user,
    isGuest,
    loading,
    signUpWithEmail,
    signInWithEmail,
    signOut,
    playAsGuest,
    endGuestSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
