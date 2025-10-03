'use server';

import {
  adjustDifficulty,
  type AdjustDifficultyInput,
} from '@/ai/flows/dynamic-difficulty-adjustment';
import { revalidatePath } from 'next/cache';

export async function getAdjustedDifficulty(input: AdjustDifficultyInput) {
  return await adjustDifficulty(input);
}
