
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { LeaderboardDialog } from '@/components/leaderboard/LeaderboardDialog';
import { Trophy, Repeat } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface GameOverScreenProps {
  score: number;
  onPlayAgain: () => void;
}

export function GameOverScreen({ score, onPlayAgain }: GameOverScreenProps) {
  const { user } = useAuth();
  const firestore = useFirestore();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function handlePostGame() {
      if (user && firestore && score > 0) {
        setIsSaving(true);
        const leaderboardRef = collection(firestore, 'leaderboard');
        const leaderboardData = {
          playerName: user.displayName || 'Anonymous',
          score,
          createdAt: new Date(),
        };
        addDoc(leaderboardRef, leaderboardData).catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: leaderboardRef.path,
            operation: 'create',
            requestResourceData: leaderboardData,
          });
          errorEmitter.emit('permission-error', permissionError);
        }).finally(() => {
            setIsSaving(false);
        });
      }
    }

    handlePostGame();
  }, [score, user, firestore]);
  

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md p-4 text-center z-10">
      <h2 className="text-6xl font-headline text-destructive mb-2">Game Over</h2>
      <p className="text-2xl text-foreground mb-4">Final Score: <span className="text-accent font-mono font-bold">{score}</span></p>

      <div className="flex gap-4 mt-4">
        <Button onClick={onPlayAgain} size="lg" autoFocus>
          <Repeat className="mr-2 h-4 w-4" />
          Play Again
        </Button>
        <LeaderboardDialog trigger={
          <Button variant="secondary" size="lg">
            <Trophy className="mr-2 h-4 w-4" />
            Leaderboard
          </Button>
        }/>
      </div>
      {isSaving && <p className="text-sm mt-4 text-muted-foreground">Saving score...</p>}
    </div>
  );
}
