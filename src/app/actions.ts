'use server';

import {
  adjustDifficulty,
  type AdjustDifficultyInput,
} from '@/ai/flows/dynamic-difficulty-adjustment';
import { db } from '@/lib/firebase';
import type { LeaderboardEntry } from '@/lib/types';
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
} from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export async function getAdjustedDifficulty(input: AdjustDifficultyInput) {
  return await adjustDifficulty(input);
}

export async function saveScore(playerName: string, score: number) {
  if (!playerName || typeof score !== 'number') {
    return { error: 'Invalid player name or score.' };
  }
  try {
    await addDoc(collection(db, 'leaderboard'), {
      playerName,
      score,
      createdAt: new Date(),
    });
    revalidatePath('/'); // Revalidate to show updated leaderboard
    return { success: true };
  } catch (error) {
    return { error: 'Could not save score to the leaderboard.' };
  }
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const q = query(
      collection(db, 'leaderboard'),
      orderBy('score', 'desc'),
      limit(10)
    );
    const querySnapshot = await getDocs(q);
    const leaderboard: LeaderboardEntry[] = [];
    querySnapshot.forEach(doc => {
      leaderboard.push({ id: doc.id, ...doc.data() } as LeaderboardEntry);
    });
    return leaderboard;
  } catch (error) {
    console.error('Error fetching leaderboard: ', error);
    return [];
  }
}
