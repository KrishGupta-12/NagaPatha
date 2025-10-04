
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
import { cn } from '@/lib/utils';


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
  | { type: 'RESET_GAME' }
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
        ...createInitialState(),
        isGameRunning: true,
        startTime: Date.now(),
      };
    case 'PAUSE_GAME':
      return { ...state, isPaused: true, isGameRunning: false };
    case 'RESUME_GAME':
      return { ...state, isPaused: false, isGameRunning: true };
    case 'END_GAME':
      return { ...state, isGameRunning: false, isGameOver: true };
    case 'RESET_GAME':
      return createInitialState();
    case 'CHANGE_DIRECTION': {
      const isOpposite = (dir1: Direction, dir2: Direction) =>
        (dir1 === 'UP' && dir2 === 'DOWN') ||
        (dir1 === 'DOWN' && dir2 === 'UP') ||
        (dir1 === 'LEFT' && dir2 === 'RIGHT') ||
        (dir1 === 'RIGHT' && dir2 === 'LEFT');
      if (state.isGameRunning && !isOpposite(state.direction, action.payload)) {
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
        if (newScore % 5 === 0 && !state.powerUp && !state.isPowerUpActive) {
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

  const { difficulty, highScore, setHighScore, incrementGamesPlayed, addSessionDuration, playGameSound, snakeStyle, foodStyle, boardStyle, boardTheme } = useGame();
  
  const gameBoardRef = useRef<HTMLDivElement>(null);

  const handleDirectionChange = useCallback((newDirection: Direction) => {
    if (isGameRunning) {
        dispatch({ type: 'CHANGE_DIRECTION', payload: newDirection });
    }
  }, [isGameRunning]);

  const swipeHandlers = useSwipeControls(handleDirectionChange);

  const startGame = useCallback(() => {
    startAudioContext();
    dispatch({ type: 'START_GAME' });
    gameBoardRef.current?.focus();
    incrementGamesPlayed();
  }, [incrementGamesPlayed]);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
    if(powerUpTimerRef.current) clearTimeout(powerUpTimerRef.current);
    onRestart();
  }, [onRestart]);

  const endGame = useCallback(() => {
    if (isGameRunning) {
      if (startTime) {
        addSessionDuration((Date.now() - startTime) / 1000);
      }
      dispatch({ type: 'END_GAME' });
      playGameSound('crash');
      if (powerUpTimerRef.current) {
        clearTimeout(powerUpTimerRef.current);
        dispatch({ type: 'DEACTIVATE_POWERUP' });
      };
    }
  }, [isGameRunning, startTime, addSessionDuration, playGameSound]);

  const moveSnake = useCallback(() => {
    if (!isGameRunning) return;
    dispatch({ type: 'MOVE_SNAKE' });
  }, [isGameRunning]);

  useInterval(moveSnake, isGameRunning ? DIFFICULTY_LEVELS[difficulty] : null);

  const resumeGame = useCallback(() => {
    dispatch({ type: 'RESUME_GAME' });
    gameBoardRef.current?.focus();
  }, []);

  // Effect for game logic (collisions, eating food)
  useEffect(() => {
    if (!isGameRunning) return;

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
  }, [snake, food, powerUp, isGameRunning, isPowerUpActive, score, setHighScore, playGameSound, endGame]);

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
            else if (isPaused) resumeGame();
            break;
      }
    };
    
    const board = gameBoardRef.current;
    board?.addEventListener('keydown', handleKeyDown);
    return () => board?.removeEventListener('keydown', handleKeyDown);
  }, [isGameRunning, isGameOver, isPaused, handleDirectionChange, startGame, resumeGame]);
  
  const difficultyName = {1: 'Easy', 2: 'Medium', 3: 'Hard'}[difficulty];
  
  const handlePauseResumeClick = () => {
    if(isGameRunning) {
        dispatch({type: 'PAUSE_GAME'});
    } else if (isPaused) {
        resumeGame();
    }
  }

  const getSnakeSegmentClass = (index: number) => {
    const isHead = index === 0;
    const baseClass = 'transition-colors duration-200';
    switch (snakeStyle) {
      case 'striped':
        return cn(baseClass, isHead ? 'bg-primary' : (index % 2 === 0 ? 'bg-primary/80' : 'bg-green-300'), 'rounded-sm');
      case 'gradient':
        return cn(baseClass, 'rounded-sm', isHead && 'rounded-sm');
      case 'digital':
        return cn(baseClass, isHead ? 'bg-lime-400' : 'bg-lime-600', 'border-[1px] border-lime-800');
      case 'classic':
      default:
        return cn(baseClass, isHead ? 'bg-primary' : 'bg-primary/80', 'rounded-sm');
    }
  };

  const getSnakeSegmentStyle = (index: number): React.CSSProperties => {
     if (snakeStyle === 'gradient') {
        const opacity = 1 - (index / (snake.length + 5));
        return { backgroundColor: `hsl(var(--primary) / ${opacity})` };
     }
     return {};
  }

  const getFoodClass = () => {
    const baseClasses = "rounded-full animate-pulse-food";
    switch(foodStyle) {
      case 'apple-gold': return `${baseClasses} bg-yellow-400 shadow-[0_0_8px_#facc15]`;
      case 'apple-blue': return `${baseClasses} bg-blue-500 shadow-[0_0_8px_#3b82f6]`;
      case 'apple-green': return `${baseClasses} bg-lime-500 shadow-[0_0_8px_#84cc16]`;
      case 'apple-pink': return `${baseClasses} bg-pink-500 shadow-[0_0_8px_#ec4899]`;
      case 'gem': return `bg-purple-500 rotate-45 animate-pulse-food shadow-[0_0_10px_#a855f7]`;
      case 'apple-red':
      default: return `${baseClasses} bg-accent shadow-[0_0_8px_hsl(var(--accent))]`;
    }
  }

  const getBoardThemeClasses = () => {
    switch(boardTheme) {
        case 'light': return 'bg-slate-200 border-slate-400';
        case 'mono': return 'bg-white border-black';
        case 'default':
        default: return 'bg-card border-primary';
    }
  }
   const getGridColor = () => {
    switch (boardTheme) {
      case 'light': return 'rgba(150, 150, 150, 0.2)';
      case 'mono': return 'rgba(0, 0, 0, 0.1)';
      default: return 'hsla(var(--primary) / 0.1)';
    }
  };


  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex justify-between items-center w-full max-w-md lg:max-w-lg px-2 text-lg font-headline">
        <p>Score: <span className="text-accent font-mono">{score}</span></p>
        <p>Difficulty: <span className="text-accent">{difficultyName}</span></p>
        <p>Best: <span className="text-accent font-mono">{highScore}</span></p>
      </div>

      <div
        ref={gameBoardRef}
        className={cn(
          "relative rounded-md border-2 shadow-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-ring",
           getBoardThemeClasses(),
           isPowerUpActive && 'animate-pulse-food'
        )}
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
            transition: 'background-color 0.5s ease',
            ...(boardStyle === 'grid' && {
              backgroundImage: `linear-gradient(to right, ${getGridColor()} 1px, transparent 1px), linear-gradient(to bottom, ${getGridColor()} 1px, transparent 1px)`,
              backgroundSize: `calc(100% / ${GRID_SIZE}) calc(100% / ${GRID_SIZE})`,
            }),
          }}
        >
          {snake.map((segment, index) => (
            <div
              key={index}
              className={getSnakeSegmentClass(index)}
              style={{
                gridColumnStart: segment.x + 1,
                gridRowStart: segment.y + 1,
                boxShadow: index === 0 ? `0 0 8px hsl(var(--primary)), ${isPowerUpActive ? '0 0 12px hsl(var(--accent))' : ''}` : 'none',
                transition: 'box-shadow 0.3s ease, background-color 0.2s linear',
                 ...getSnakeSegmentStyle(index),
              }}
              aria-label={`Snake segment at ${segment.x}, ${segment.y}`}
            />
          ))}
          <div
            className={getFoodClass()}
            style={{
              gridColumnStart: food.x + 1,
              gridRowStart: food.y + 1,
            }}
             aria-label={`Food at ${food.x}, ${food.y}`}
          />
          {powerUp && (
             <div
                className="bg-blue-400 rounded-full animate-ping"
                style={{
                gridColumnStart: powerUp.x + 1,
                gridRowStart: powerUp.y + 1,
                boxShadow: '0 0 10px blue'
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
             <Button onClick={resumeGame} className="mt-4" size="lg">
                <Play className="mr-2"/>
                Resume
             </Button>
           </div>
        )}

        {isGameOver && <GameOverScreen score={score} onPlayAgain={resetGame} />}
      </div>
      
      <div className="flex w-full max-w-md lg:max-w-lg justify-between items-center h-10">
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
}

    
