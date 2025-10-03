'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getAdjustedDifficulty } from '@/app/actions';
import { useAuth } from '@/hooks/use-auth';
import { useGame } from '@/hooks/use-game';
import { LeaderboardDialog } from '@/components/leaderboard/LeaderboardDialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Zap, Trophy, Repeat } from 'lucide-react';
import type { AdjustDifficultyOutput } from '@/ai/flows/dynamic-difficulty-adjustment';
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
  const { difficulty, setDifficulty, highScore, gamesPlayed, averageSessionLength } = useGame();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<AdjustDifficultyOutput | null>(null);
  const [loadingAi, setLoadingAi] = useState(true);

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
      
      try {
        setLoadingAi(true);
        const feedback = await getAdjustedDifficulty({
          score,
          level: difficulty,
          gamesPlayed,
          averageSessionLength,
          highestScore: highScore,
        });
        setAiFeedback(feedback);
        if(feedback.newLevel !== difficulty) {
            setDifficulty(feedback.newLevel);
        }
      } catch (error) {
        console.error("Failed to get AI difficulty adjustment:", error);
      } finally {
        setLoadingAi(false);
      }
    }

    handlePostGame();
  }, [score, user, firestore, difficulty, gamesPlayed, averageSessionLength, highScore, setDifficulty, toast]);
  

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md p-4 text-center z-10">
      <h2 className="text-6xl font-headline text-destructive mb-2">Game Over</h2>
      <p className="text-2xl text-foreground mb-4">Final Score: <span className="text-accent font-mono font-bold">{score}</span></p>

      {loadingAi ? (
        <div className="flex items-center gap-2 p-3 bg-card rounded-lg my-4">
          <Loader2 className="animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">AI is analyzing your performance...</p>
        </div>
      ) : aiFeedback && (
        <div className="p-3 bg-card rounded-lg my-4 text-sm max-w-sm">
          <h3 className="font-headline text-primary flex items-center justify-center gap-2"><Zap size={16}/> AI Feedback</h3>
          <p className="text-muted-foreground mt-1">{aiFeedback.reason}</p>
          {aiFeedback.newLevel !== difficulty && (
             <p className="mt-2">Next game difficulty: <span className="font-bold text-accent">{aiFeedback.newLevel === 1 ? 'Easy' : aiFeedback.newLevel === 2 ? 'Medium' : 'Hard'}</span></p>
          )}
        </div>
      )}

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
