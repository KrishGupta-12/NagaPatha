'use client';
import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: Error) => {
      // For development, we throw the error to leverage the Next.js error overlay.
      if (process.env.NODE_ENV === 'development') {
        setTimeout(() => {
          throw error;
        }, 0);
      } else {
        // In production, you might want to log this to a monitoring service.
        console.error('Firestore Permission Error:', error);
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  return null;
}
