'use client';

import React, { useState } from 'react';
import { GameBoard } from './GameBoard';

export function Game() {
  const [gameId, setGameId] = useState(1);

  // This function is passed to GameBoard and called on reset
  const handleRestart = () => {
    setGameId(prevId => prevId + 1);
  };

  return <GameBoard key={gameId} onRestart={handleRestart} />;
}

    