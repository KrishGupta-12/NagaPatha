'use client';

import React, { useState } from 'react';
import { GameBoard } from './GameBoard';

export function Game() {
  const [gameId, setGameId] = useState(1);

  const restartGame = () => {
    setGameId(prevId => prevId + 1);
  };

  return <GameBoard key={gameId} onRestart={restartGame} />;
}
