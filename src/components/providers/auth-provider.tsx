'use client';

import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import React, { createContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '@/lib/firebase';

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
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        setIsGuest(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    } finally {
      // Auth state change is handled by onAuthStateChanged
    }
  };

  const signOut = async () => {
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
