'use client';

import React, { createContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface GameContextType {
  difficulty: number;
  setDifficulty: (level: number) => void;
  highScore: number;
  setHighScore: (score: number) => void;
  gamesPlayed: number;
  incrementGamesPlayed: () => void;
  sessionDurations: number[];
  addSessionDuration: (duration: number) => void;
  averageSessionLength: number;
  resetGameStats: () => void;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [difficulty, setDifficulty] = useState(1); // 1: easy, 2: medium, 3: hard
  const [highScore, setHighScore] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [sessionDurations, setSessionDurations] = useState<number[]>([]);

  const userPrefix = user?.uid || 'guest';

  useEffect(() => {
    const savedState = localStorage.getItem(`retrosnake_gamestate_${userPrefix}`);
    if (savedState) {
      const {
        difficulty: savedDifficulty,
        highScore: savedHighScore,
        gamesPlayed: savedGamesPlayed,
        sessionDurations: savedSessionDurations,
      } = JSON.parse(savedState);
      
      setDifficulty(savedDifficulty || 1);
      setHighScore(savedHighScore || 0);
      setGamesPlayed(savedGamesPlayed || 0);
      setSessionDurations(savedSessionDurations || []);
    } else {
        resetGameStats();
    }
  }, [userPrefix]);
  
  useEffect(() => {
    const gameState = {
        difficulty,
        highScore,
        gamesPlayed,
        sessionDurations
    };
    localStorage.setItem(`retrosnake_gamestate_${userPrefix}`, JSON.stringify(gameState));
  }, [difficulty, highScore, gamesPlayed, sessionDurations, userPrefix]);
  

  const handleSetDifficulty = (level: number) => {
    setDifficulty(Math.max(1, Math.min(3, level)));
  };

  const handleSetHighScore = (score: number) => {
    if (score > highScore) {
      setHighScore(score);
    }
  };
  
  const incrementGamesPlayed = () => setGamesPlayed(prev => prev + 1);

  const addSessionDuration = (duration: number) => {
    setSessionDurations(prev => [...prev, duration]);
  };
  
  const averageSessionLength = sessionDurations.length > 0
    ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length
    : 0;
    
  const resetGameStats = () => {
    setDifficulty(1);
    setHighScore(0);
    setGamesPlayed(0);
    setSessionDurations([]);
  }

  const value = {
    difficulty,
    setDifficulty: handleSetDifficulty,
    highScore,
    setHighScore: handleSetHighScore,
    gamesPlayed,
    incrementGamesPlayed,
    sessionDurations,
    addSessionDuration,
    averageSessionLength,
    resetGameStats
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
