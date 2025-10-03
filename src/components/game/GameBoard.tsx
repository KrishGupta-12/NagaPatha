'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useInterval } from '@/hooks/use-interval';
import { useSwipeControls } from '@/hooks/use-swipe-controls';
import { useAuth } from '@/hooks/use-auth';
import { useGame } from '@/hooks/use-game';
import type { Coordinates, Direction } from '@/lib/types';
import {
  GRID_SIZE,
  DIFFICULTY_LEVELS,
  INITIAL_SNAKE_POSITION,
  INITIAL_DIRECTION,
} from '@/lib/constants';
import { startAudioContext } from '@/lib/utils';
import { GameOverScreen } from './GameOverScreen';
import { Button } from '@/components/ui/button';

interface GameBoardProps {
  onRestart: () => void;
}

export function GameBoard({ onRestart }: GameBoardProps) {
  const [snake, setSnake] = useState<Coordinates[]>(INITIAL_SNAKE_POSITION);
  const [food, setFood] = useState<Coordinates>(() => generateFood(INITIAL_SNAKE_POSITION));
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [score, setScore] = useState(0);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  const { difficulty, highScore, setHighScore, incrementGamesPlayed, addSessionDuration, playGameSound } = useGame();
  const { user } = useAuth();
  
  const gameBoardRef = useRef<HTMLDivElement>(null);

  const handleDirectionChange = (newDirection: Direction) => {
    const isOpposite = (dir1: Direction, dir2: Direction) => {
      return (
        (dir1 === 'UP' && dir2 === 'DOWN') ||
        (dir1 === 'DOWN' && dir2 === 'UP') ||
        (dir1 === 'LEFT' && dir2 === 'RIGHT') ||
        (dir1 === 'RIGHT' && dir2 === 'LEFT')
      );
    };
    if (!isOpposite(direction, newDirection)) {
      setDirection(newDirection);
    }
  };

  const swipeHandlers = useSwipeControls(handleDirectionChange);

  const startGame = () => {
    startAudioContext();
    setIsGameRunning(true);
    setIsGameOver(false);
    setStartTime(Date.now());
    gameBoardRef.current?.focus();
    incrementGamesPlayed();
  };

  function generateFood(currentSnake: Coordinates[]): Coordinates {
    while (true) {
      const newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        return newFood;
      }
    }
  }

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE_POSITION);
    setFood(generateFood(INITIAL_SNAKE_POSITION));
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setIsGameRunning(false);
    setIsGameOver(false);
    setStartTime(null);
    onRestart();
  }, [onRestart]);

  const endGame = useCallback(() => {
    if (startTime) {
        addSessionDuration((Date.now() - startTime) / 1000);
    }
    setIsGameRunning(false);
    setIsGameOver(true);
    playGameSound('crash');
  }, [startTime, addSessionDuration, playGameSound]);

  const moveSnake = useCallback(() => {
    if (!isGameRunning) return;

    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };

      switch (direction) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }

      // Wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        endGame();
        return prevSnake;
      }

      // Self collision
      for (let i = 1; i < newSnake.length; i++) {
        if (head.x === newSnake[i].x && head.y === newSnake[i].y) {
          endGame();
          return prevSnake;
        }
      }

      newSnake.unshift(head);

      // Food consumption
      if (head.x === food.x && head.y === food.y) {
        setScore(s => s + 1);
        setHighScore(score + 1);
        setFood(generateFood(newSnake));
        playGameSound('eat');
      } else {
        newSnake.pop();
      }
      return newSnake;
    });
  }, [isGameRunning, direction, food, score, setHighScore, playGameSound, endGame]);

  useInterval(moveSnake, isGameRunning ? DIFFICULTY_LEVELS[difficulty] : null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      switch (e.key) {
        case 'ArrowUp': handleDirectionChange('UP'); break;
        case 'ArrowDown': handleDirectionChange('DOWN'); break;
        case 'ArrowLeft': handleDirectionChange('LEFT'); break;
        case 'ArrowRight': handleDirectionChange('RIGHT'); break;
        case ' ':
          if (!isGameRunning && !isGameOver) startGame();
          break;
      }
    };
    
    const board = gameBoardRef.current;
    board?.addEventListener('keydown', handleKeyDown);
    return () => board?.removeEventListener('keydown', handleKeyDown);
  }, [isGameRunning, isGameOver, handleDirectionChange]);
  
  const difficultyName = {1: 'Easy', 2: 'Medium', 3: 'Hard'}[difficulty];


  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-between w-full max-w-md lg:max-w-lg px-2 text-lg font-headline">
        <p>Score: <span className="text-accent font-mono">{score}</span></p>
        <p>Difficulty: <span className="text-accent">{difficultyName}</span></p>
        <p>Best: <span className="text-accent font-mono">{highScore}</span></p>
      </div>

      <div
        ref={gameBoardRef}
        className="relative bg-card rounded-md border-2 border-primary shadow-lg overflow-hidden"
        style={{
          width: 'min(90vw, 600px)',
          height: 'min(90vw, 600px)',
        }}
        tabIndex={0}
        {...swipeHandlers}
        aria-label="Game Board"
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
            width: '100%',
            height: '100%',
          }}
        >
          {snake.map((segment, index) => (
            <div
              key={index}
              className={` ${index === 0 ? 'bg-primary' : 'bg-primary/80'} rounded-[2px]`}
              style={{
                gridColumnStart: segment.x + 1,
                gridRowStart: segment.y + 1,
                boxShadow: index === 0 ? '0 0 8px hsl(var(--primary))' : 'none',
              }}
              aria-label={`Snake segment at ${segment.x}, ${segment.y}`}
            />
          ))}
          <div
            className="bg-accent rounded-full animate-pulse-food"
            style={{
              gridColumnStart: food.x + 1,
              gridRowStart: food.y + 1,
            }}
             aria-label={`Food at ${food.x}, ${food.y}`}
          />
        </div>
        
        {!isGameRunning && !isGameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
            <h2 className="text-4xl font-headline text-accent">NāgaPatha</h2>
            <Button onClick={startGame} className="mt-4 animate-bounce" size="lg">
              Start Game
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">Use Arrow Keys or Swipe to Move</p>
          </div>
        )}
        
        {isGameOver && <GameOverScreen score={score} onPlayAgain={resetGame} />}
      </div>
    </div>
  );
}
