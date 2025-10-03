export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type Coordinates = {
  x: number;
  y: number;
};

export type LeaderboardEntry = {
  id: string;
  playerName: string;
  score: number;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
};
