
'use client';

import { useFirebase } from '@/firebase';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, GoogleAuthProvider, signInAnonymously } from 'firebase/auth';
import React, { createContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  playAsGuest: () => void;
  endGuestSession: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { auth } = useFirebase();
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

  const signInWithGoogle = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      const googleProvider = new GoogleAuthProvider();
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error("Error signing in with Google: ", error);
      }
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
    signInWithGoogle,
    signOut,
    playAsGuest,
    endGuestSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
