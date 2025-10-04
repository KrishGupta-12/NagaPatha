
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { LeaderboardDialog } from '@/components/leaderboard/LeaderboardDialog';
import { Trophy, Repeat, Sparkles, Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useGame } from '@/hooks/use-game';
import { adjustDifficulty, type AdjustDifficultyOutput } from '@/ai/flows/dynamic-difficulty-adjustment';

interface GameOverScreenProps {
  score: number;
  onPlayAgain: () => void;
}

export function GameOverScreen({ score, onPlayAgain }: GameOverScreenProps) {
  const { user } = useAuth();
  const firestore = useFirestore();
  const { difficulty, setDifficulty, averageSessionLength, gamesPlayed } = useGame();
  const [isSaving, setIsSaving] = useState(false);
  const scoreSubmittedRef = useRef(false);
  const [aiAnalysis, setAiAnalysis] = useState<AdjustDifficultyOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    async function handlePostGame() {
      if (user && firestore && score > 0 && !scoreSubmittedRef.current) {
        scoreSubmittedRef.current = true; // Mark as submitted immediately
        setIsSaving(true);
        
        const leaderboardRef = collection(firestore, 'leaderboard');
        const leaderboardData = {
          playerName: user.displayName || 'Anonymous',
          score,
          createdAt: new Date(),
        };

        try {
          await addDoc(leaderboardRef, leaderboardData);
        } catch (serverError) {
          const permissionError = new FirestorePermissionError({
            path: leaderboardRef.path,
            operation: 'create',
            requestResourceData: leaderboardData,
          });
          errorEmitter.emit('permission-error', permissionError);
        } finally {
          setIsSaving(false);
        }
      }
      
      // AI analysis
      setIsAnalyzing(true);
      try {
        const analysisResult = await adjustDifficulty({
          currentDifficulty: difficulty,
          lastScore: score,
          averageSessionLength,
          gamesPlayed,
        });
        setAiAnalysis(analysisResult);
      } catch (error) {
        console.error("AI analysis failed:", error);
      } finally {
        setIsAnalyzing(false);
      }
    }

    handlePostGame();
  }, [score, user, firestore, difficulty, averageSessionLength, gamesPlayed]);
  
  const handleDifficultyChange = (newDifficulty: number) => {
    setDifficulty(newDifficulty);
    onPlayAgain();
  }

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

      <div className="mt-8 p-4 rounded-lg bg-card/80 border border-primary/20 max-w-sm w-full">
        <h3 className="font-headline text-primary text-xl flex items-center justify-center gap-2"><Sparkles className="text-accent" /> AI Analyzer</h3>
        {isAnalyzing ? (
          <div className='flex items-center justify-center gap-2 mt-2 text-muted-foreground'>
            <Loader2 className="animate-spin" />
            <p>Analyzing performance...</p>
          </div>
        ) : aiAnalysis ? (
          <div className="text-center mt-2">
            <p className="text-muted-foreground text-sm mb-3">{aiAnalysis.reasoning}</p>
            {aiAnalysis.recommendation !== 'stay' && (
              <Button onClick={() => handleDifficultyChange(aiAnalysis.newDifficulty)} variant="outline">
                Change to {aiAnalysis.newDifficulty === 1 ? 'Easy' : aiAnalysis.newDifficulty === 2 ? 'Medium' : 'Hard'} and Play
              </Button>
            )}
          </div>
        ) : <p className="text-center mt-2 text-muted-foreground text-sm">Could not get AI analysis.</p>}
      </div>
    </div>
  );
}

    