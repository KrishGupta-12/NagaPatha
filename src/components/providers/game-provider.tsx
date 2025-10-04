'use client';

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { playSound } from '@/lib/utils';
import type { SnakeStyle, FoodStyle, BoardStyle, BoardTheme } from '@/lib/types';

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
  isMobile: boolean;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  playGameSound: (sound: 'eat' | 'crash' | 'click') => void;
  snakeStyle: SnakeStyle;
  setSnakeStyle: (style: SnakeStyle) => void;
  foodStyle: FoodStyle;
  setFoodStyle: (style: FoodStyle) => void;
  boardStyle: BoardStyle;
  setBoardStyle: (style: BoardStyle) => void;
  boardTheme: BoardTheme;
  setBoardTheme: (theme: BoardTheme) => void;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { user, isGuest } = useAuth();
  const isMobile = useIsMobile();
  
  const [difficulty, setDifficulty] = useState(1); // 1: easy, 2: medium, 3: hard
  const [highScore, setHighScore] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [sessionDurations, setSessionDurations] = useState<number[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [snakeStyle, setSnakeStyle] = useState<SnakeStyle>('classic');
  const [foodStyle, setFoodStyle] = useState<FoodStyle>('apple-red');
  const [boardStyle, setBoardStyle] = useState<BoardStyle>('default');
  const [boardTheme, setBoardTheme] = useState<BoardTheme>('default');


  const userPrefix = user?.uid || (isGuest ? 'guest' : '');

  useEffect(() => {
    if (!userPrefix) return;

    const savedState = localStorage.getItem(`nagapatha_gamestate_${userPrefix}`);
    if (savedState) {
      const {
        difficulty: savedDifficulty,
        highScore: savedHighScore,
        gamesPlayed: savedGamesPlayed,
        sessionDurations: savedSessionDurations,
        soundEnabled: savedSoundEnabled,
        snakeStyle: savedSnakeStyle,
        foodStyle: savedFoodStyle,
        boardStyle: savedBoardStyle,
        boardTheme: savedBoardTheme,
      } = JSON.parse(savedState);
      
      setDifficulty(savedDifficulty || 1);
      setHighScore(savedHighScore || 0);
      setGamesPlayed(savedGamesPlayed || 0);
      setSessionDurations(savedSessionDurations || []);
      setSoundEnabled(savedSoundEnabled === undefined ? true : savedSoundEnabled);
      setSnakeStyle(savedSnakeStyle || 'classic');
      setFoodStyle(savedFoodStyle || 'apple-red');
      setBoardStyle(savedBoardStyle || 'default');
      setBoardTheme(savedBoardTheme || 'default');
    } else {
        resetGameStats();
    }
  }, [userPrefix]);
  
  useEffect(() => {
    if (!userPrefix) return;
    
    const gameState = {
        difficulty,
        highScore,
        gamesPlayed,
        sessionDurations,
        soundEnabled,
        snakeStyle,
        foodStyle,
        boardStyle,
        boardTheme,
    };
    localStorage.setItem(`nagapatha_gamestate_${userPrefix}`, JSON.stringify(gameState));
  }, [difficulty, highScore, gamesPlayed, sessionDurations, soundEnabled, snakeStyle, foodStyle, boardStyle, boardTheme, userPrefix]);
  
  const playGameSound = useCallback((sound: 'eat' | 'crash' | 'click') => {
    if (soundEnabled) {
      playSound(sound);
    }
  }, [soundEnabled]);

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
    setSessionDurations(prev => [...prev.slice(-99), duration]); // Keep last 100
  };
  
  const averageSessionLength = sessionDurations.length > 0
    ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length
    : 0;
    
  const resetGameStats = () => {
    setDifficulty(1);
    setHighScore(0);
    setGamesPlayed(0);
    setSessionDurations([]);
    setSnakeStyle('classic');
    setFoodStyle('apple-red');
    setBoardStyle('default');
    setBoardTheme('default');
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
    resetGameStats,
    isMobile,
    soundEnabled,
    setSoundEnabled,
    playGameSound,
    snakeStyle,
    setSnakeStyle,
    foodStyle,
    setFoodStyle,
    boardStyle,
    setBoardStyle,
    boardTheme,
    setBoardTheme,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
