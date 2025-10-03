
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
import type { LeaderboardEntry } from '@/lib/types';
import { Award, Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';

interface LeaderboardDialogProps {
    trigger: React.ReactNode;
}

export function LeaderboardDialog({ trigger }: LeaderboardDialogProps) {
  const firestore = useFirestore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function fetchLeaderboard() {
        if (isOpen && firestore) {
          setLoading(true);
          try {
            const q = query(
              collection(firestore, 'leaderboard'),
              orderBy('score', 'desc'),
              limit(50) // Fetch more to account for duplicates
            );
            const querySnapshot = await getDocs(q);
            const data: LeaderboardEntry[] = [];
            querySnapshot.forEach(doc => {
              data.push({ id: doc.id, ...doc.data() } as LeaderboardEntry);
            });

            // Filter for unique players with highest score
            const uniquePlayers = new Map<string, LeaderboardEntry>();
            for (const entry of data) {
              const existing = uniquePlayers.get(entry.playerName);
              if (!existing || entry.score > existing.score) {
                uniquePlayers.set(entry.playerName, entry);
              }
            }
            
            const uniqueEntries = Array.from(uniquePlayers.values());
            uniqueEntries.sort((a, b) => b.score - a.score);
            
            setLeaderboard(uniqueEntries.slice(0, 10));

          } catch (error) {
              console.error("Error fetching leaderboard: ", error);
          } finally {
            setLoading(false);
          }
        }
    }
    fetchLeaderboard();
  }, [isOpen, firestore]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <Award /> Global Top 10
          </DialogTitle>
          <DialogDescription>
            See who is the best NāgaPatha player in the world!
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
                  <TableHead className="w-[50px] text-center">Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry, index) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium text-center">{getRank(index)}</TableCell>
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


function getRank(index: number) {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return index + 1;
}
