'use client';

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { initializeFirebase } from '.';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

type FirebaseContextValue = {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
};

const FirebaseContext = createContext<FirebaseContextValue>({
  app: null,
  auth: null,
  firestore: null,
});

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [firebase, setFirebase] = useState<FirebaseContextValue>({
    app: null,
    auth: null,
    firestore: null,
  });

  useEffect(() => {
    const { app, auth, firestore } = initializeFirebase();
    setFirebase({ app, auth, firestore });
  }, []);

  return (
    <FirebaseContext.Provider value={firebase}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => useContext(FirebaseContext);
export const useFirebaseApp = () => useContext(FirebaseContext).app;
export const useAuthContext = () => useContext(FirebaseContext).auth;
export const useFirestore = () => useContext(FirebaseContext).firestore;
