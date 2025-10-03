import { Coordinates, Direction } from './types';

export const GRID_SIZE = 20;
export const TICK_RATE_EASY = 200;
export const TICK_RATE_MEDIUM = 150;
export const TICK_RATE_HARD = 100;

export const DIFFICULTY_LEVELS: { [key: number]: number } = {
  1: TICK_RATE_EASY,
  2: TICK_RATE_MEDIUM,
  3: TICK_RATE_HARD,
};

export const INITIAL_SNAKE_POSITION: Coordinates[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

export const INITIAL_DIRECTION: Direction = 'RIGHT';
