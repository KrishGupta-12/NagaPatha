
'use client';

import React, { useEffect, useCallback, useReducer, useRef } from 'react';
import { useInterval } from '@/hooks/use-interval';
import { useSwipeControls } from '@/hooks/use-swipe-controls';
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
import { Pause, Play } from 'lucide-react';

// --- Game State and Actions ---
interface GameState {
  snake: Coordinates[];
  food: Coordinates;
  direction: Direction;
  score: number;
  isGameRunning: boolean;
  isGameOver: boolean;
  isPaused: boolean;
  startTime: number | null;
  powerUp: Coordinates | null;
  isPowerUpActive: boolean;
}

type GameAction =
  | { type: 'START_GAME' }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'END_GAME' }
  | { type: 'RESET_GAME'; payload: { onRestart: () => void } }
  | { type: 'CHANGE_DIRECTION'; payload: Direction }
  | { type: 'MOVE_SNAKE' }
  | { type: 'EAT_FOOD' }
  | { type: 'ACTIVATE_POWERUP' }
  | { type: 'DEACTIVATE_POWERUP' };

const generateFood = (currentSnake: Coordinates[]): Coordinates => {
  while (true) {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
      return newFood;
    }
  }
};

const createInitialState = (): GameState => ({
  snake: INITIAL_SNAKE_POSITION,
  food: generateFood(INITIAL_SNAKE_POSITION),
  direction: INITIAL_DIRECTION,
  score: 0,
  isGameRunning: false,
  isGameOver: false,
  isPaused: false,
  startTime: null,
  powerUp: null,
  isPowerUpActive: false,
});

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        isGameRunning: true,
        isGameOver: false,
        isPaused: false,
        startTime: Date.now(),
      };
    case 'PAUSE_GAME':
      return { ...state, isPaused: true, isGameRunning: false };
    case 'RESUME_GAME':
      return { ...state, isPaused: false, isGameRunning: true };
    case 'END_GAME':
      return { ...state, isGameRunning: false, isGameOver: true };
    case 'RESET_GAME':
      action.payload.onRestart();
      return createInitialState();
    case 'CHANGE_DIRECTION': {
      const isOpposite = (dir1: Direction, dir2: Direction) =>
        (dir1 === 'UP' && dir2 === 'DOWN') ||
        (dir1 === 'DOWN' && dir2 === 'UP') ||
        (dir1 === 'LEFT' && dir2 === 'RIGHT') ||
        (dir1 === 'RIGHT' && dir2 === 'LEFT');
      if (!isOpposite(state.direction, action.payload)) {
        return { ...state, direction: action.payload };
      }
      return state;
    }
    case 'MOVE_SNAKE': {
      let newSnake = [...state.snake];
      let head = { ...newSnake[0] };

      switch (state.direction) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }

      if (state.isPowerUpActive) {
        if (head.x < 0) head.x = GRID_SIZE - 1;
        if (head.x >= GRID_SIZE) head.x = 0;
        if (head.y < 0) head.y = GRID_SIZE - 1;
        if (head.y >= GRID_SIZE) head.y = 0;
      }

      newSnake.unshift(head);
      
      const ateFood = head.x === state.food.x && head.y === state.food.y;
      if (!ateFood) {
        newSnake.pop();
      }

      return { ...state, snake: newSnake };
    }
    case 'EAT_FOOD': {
        const newScore = state.score + 1;
        const newFood = generateFood(state.snake);
        let newPowerUp = state.powerUp;
        if (newScore % 5 === 0 && !state.powerUp) {
            newPowerUp = generateFood([...state.snake, newFood]);
        }
        return {
            ...state,
            score: newScore,
            food: newFood,
            powerUp: newPowerUp
        };
    }
    case 'ACTIVATE_POWERUP':
        return {...state, powerUp: null, isPowerUpActive: true};
    case 'DEACTIVATE_POWERUP':
        return {...state, isPowerUpActive: false};
    default:
      return state;
  }
}


// --- Component ---
interface GameBoardProps {
  onRestart: () => void;
}

export function GameBoard({ onRestart }: GameBoardProps) {
  const [state, dispatch] = useReducer(gameReducer, createInitialState());
  const { snake, food, direction, score, isGameRunning, isGameOver, isPaused, startTime, powerUp, isPowerUpActive } = state;
  
  const powerUpTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { difficulty, highScore, setHighScore, incrementGamesPlayed, addSessionDuration, playGameSound } = useGame();
  
  const gameBoardRef = useRef<HTMLDivElement>(null);

  const handleDirectionChange = useCallback((newDirection: Direction) => {
    dispatch({ type: 'CHANGE_DIRECTION', payload: newDirection });
  }, []);

  const swipeHandlers = useSwipeControls(handleDirectionChange);

  const startGame = useCallback(() => {
    startAudioContext();
    dispatch({ type: 'START_GAME' });
    gameBoardRef.current?.focus();
    incrementGamesPlayed();
  }, [incrementGamesPlayed]);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME', payload: { onRestart } });
    if(powerUpTimerRef.current) clearTimeout(powerUpTimerRef.current);
  }, [onRestart]);

  const endGame = useCallback(() => {
    if (isGameRunning) {
      if (startTime) {
        addSessionDuration((Date.now() - startTime) / 1000);
      }
      dispatch({ type: 'END_GAME' });
      playGameSound('crash');
      if (powerUpTimerRef.current) clearTimeout(powerUpTimerRef.current);
    }
  }, [isGameRunning, startTime, addSessionDuration, playGameSound]);

  const moveSnake = useCallback(() => {
    if (!isGameRunning) return;
    dispatch({ type: 'MOVE_SNAKE' });
  }, [isGameRunning]);

  useInterval(moveSnake, isGameRunning ? DIFFICULTY_LEVELS[difficulty] : null);

  // Effect for game logic (collisions, eating food)
  useEffect(() => {
    if (!isGameRunning && !isPaused) return;

    const head = snake[0];

    // Food collision
    if (head.x === food.x && head.y === food.y) {
      playGameSound('eat');
      setHighScore(score + 1);
      dispatch({ type: 'EAT_FOOD' });
    }
    
    // Power-up collision
    if (powerUp && head.x === powerUp.x && head.y === powerUp.y) {
        playGameSound('eat');
        dispatch({ type: 'ACTIVATE_POWERUP' });
        if (powerUpTimerRef.current) clearTimeout(powerUpTimerRef.current);
        powerUpTimerRef.current = setTimeout(() => {
            dispatch({ type: 'DEACTIVATE_POWERUP' });
        }, 5000);
    }

    // Wall and self collision
    if (!isPowerUpActive) {
      const isWallCollision = head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE;
      const isSelfCollision = snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
      if (isWallCollision || isSelfCollision) {
        endGame();
      }
    }
  }, [snake, food, powerUp, isGameRunning, isPaused, isPowerUpActive, score, setHighScore, playGameSound, endGame]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      switch (e.key) {
        case 'ArrowUp': handleDirectionChange('UP'); break;
        case 'ArrowDown': handleDirectionChange('DOWN'); break;
        case 'ArrowLeft': handleDirectionChange('LEFT'); break;
        case 'ArrowRight': handleDirectionChange('RIGHT'); break;
        case ' ':
          if (!isGameRunning && !isGameOver && !isPaused) startGame();
          break;
        case 'p':
        case 'P':
            if(isGameRunning) dispatch({type: 'PAUSE_GAME'});
            else if (isPaused) dispatch({type: 'RESUME_GAME'});
            break;
      }
    };
    
    const board = gameBoardRef.current;
    board?.addEventListener('keydown', handleKeyDown);
    return () => board?.removeEventListener('keydown', handleKeyDown);
  }, [isGameRunning, isGameOver, isPaused, handleDirectionChange, startGame]);
  
  const difficultyName = {1: 'Easy', 2: 'Medium', 3: 'Hard'}[difficulty];
  
  const handlePauseResumeClick = () => {
    if(isGameRunning) {
        dispatch({type: 'PAUSE_GAME'});
    } else if (isPaused) {
        dispatch({type: 'RESUME_GAME'});
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex justify-between items-center w-full max-w-md lg:max-w-lg px-2 text-lg font-headline">
        <p>Score: <span className="text-accent font-mono">{score}</span></p>
        <p>Difficulty: <span className="text-accent">{difficultyName}</span></p>
        <p>Best: <span className="text-accent font-mono">{highScore}</span></p>
      </div>

      <div
        ref={gameBoardRef}
        className="relative bg-card rounded-md border-2 border-primary shadow-lg overflow-hidden"
        style={{
          width: 'min(90vw, 80vh, 600px)',
          height: 'min(90vw, 80vh, 600px)',
          touchAction: 'none',
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
            backgroundColor: isPowerUpActive ? 'hsl(var(--primary)/0.1)' : 'transparent',
            transition: 'background-color 0.5s ease'
          }}
        >
          {snake.map((segment, index) => (
            <div
              key={index}
              className={` ${index === 0 ? 'bg-primary' : 'bg-primary/80'} rounded-[2px]`}
              style={{
                gridColumnStart: segment.x + 1,
                gridRowStart: segment.y + 1,
                boxShadow: index === 0 ? `0 0 8px hsl(var(--primary)), ${isPowerUpActive ? '0 0 12px hsl(var(--accent))' : ''}` : 'none',
                transition: 'box-shadow 0.3s ease'
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
          {powerUp && (
             <div
                className="bg-yellow-400 rounded-full animate-ping"
                style={{
                gridColumnStart: powerUp.x + 1,
                gridRowStart: powerUp.y + 1,
                boxShadow: '0 0 10px yellow'
                }}
                aria-label={`Power-up at ${powerUp.x}, ${powerUp.y}`}
            />
          )}
        </div>
        
        {!isGameRunning && !isGameOver && !isPaused && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
            <h2 className="text-4xl font-headline text-accent">NāgaPatha</h2>
            <Button onClick={startGame} className="mt-4 animate-bounce" size="lg">
              Start Game
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">Use Arrow Keys or Swipe to Move</p>
          </div>
        )}
        
        {isPaused && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
             <h2 className="text-4xl font-headline text-accent">Paused</h2>
             <Button onClick={() => dispatch({type: 'RESUME_GAME'})} className="mt-4" size="lg">
                <Play className="mr-2"/>
                Resume
             </Button>
           </div>
        )}

        {isGameOver && <GameOverScreen score={score} onPlayAgain={resetGame} />}
      </div>
      
      <div className="flex w-full max-w-md lg:max-w-lg justify-between items-center">
        {(isGameRunning || isPaused) && !isGameOver ? (
            <Button onClick={handlePauseResumeClick} variant="outline" size="sm" className='w-28'>
            {isPaused ? <Play className="mr-2" /> : <Pause className="mr-2" />}
            {isPaused ? 'Resume' : 'Pause'}
            </Button>
        ) : <div className='w-28'/>}
        {isPowerUpActive && <p className="text-accent font-headline text-lg animate-pulse">Power-up Active!</p>}
      </div>

    </div>
  );

    