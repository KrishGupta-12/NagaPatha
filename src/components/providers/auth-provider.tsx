'use client';

import { useFirebase } from '@/firebase';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, GoogleAuthProvider } from 'firebase/auth';
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
      setUser(user);
      if (user) {
        setIsGuest(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const signInWithGoogle = async () => {
    if (!auth) return;
    try {
      setLoading(true);
      const googleProvider = new GoogleAuthProvider();
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    } finally {
      // Auth state change is handled by onAuthStateChanged
    }
  };

  const signOut = async () => {
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
      setIsGuest(false);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const playAsGuest = () => {
    setIsGuest(true);
    setUser(null);
  };
  
  const endGuestSession = () => {
    setIsGuest(false);
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
