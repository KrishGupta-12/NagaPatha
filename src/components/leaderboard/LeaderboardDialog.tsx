'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getLeaderboard } from '@/app/actions';
import type { LeaderboardEntry } from '@/lib/types';
import { Award, Loader2 } from 'lucide-react';

interface LeaderboardDialogProps {
    trigger: React.ReactNode;
}

export function LeaderboardDialog({ trigger }: LeaderboardDialogProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getLeaderboard().then(data => {
        setLeaderboard(data);
        setLoading(false);
      });
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <Award /> Global Top 10
          </DialogTitle>
          <DialogDescription>
            See who is the best RetroSnake player in the world!
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
             <div className="flex justify-center items-center h-40">
                <Loader2 className="w-8 h-8 animate-spin text-primary"/>
             </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry, index) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium text-center">{index + 1}</TableCell>
                    <TableCell>{entry.playerName}</TableCell>
                    <TableCell className="text-right font-mono font-bold text-accent">{entry.score}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
           {(!loading && leaderboard.length === 0) && (
              <p className="text-center text-muted-foreground p-8">No scores yet. Be the first!</p>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
