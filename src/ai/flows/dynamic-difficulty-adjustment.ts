'use server';

/**
 * @fileOverview Dynamically adjusts the game's difficulty level based on the player's performance.
 *
 * - adjustDifficulty - A function that adjusts the game difficulty.
 * - AdjustDifficultyInput - The input type for the adjustDifficulty function.
 * - AdjustDifficultyOutput - The return type for the adjustDifficulty function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustDifficultyInputSchema = z.object({
  score: z.number().describe('The player\'s current score.'),
  level: z.number().describe('The current difficulty level (e.g., 1 for easy, 2 for medium, 3 for hard).'),
  gamesPlayed: z.number().describe('The number of games the player has played.'),
  averageSessionLength: z.number().describe('The average session length of the player in seconds.'),
  highestScore: z.number().describe('The highest score the player has achieved.'),
});
export type AdjustDifficultyInput = z.infer<typeof AdjustDifficultyInputSchema>;

const AdjustDifficultyOutputSchema = z.object({
  newLevel: z.number().describe('The new difficulty level, adjusted based on the player\'s performance.'),
  reason: z.string().describe('The reason for the difficulty adjustment.'),
});
export type AdjustDifficultyOutput = z.infer<typeof AdjustDifficultyOutputSchema>;

export async function adjustDifficulty(input: AdjustDifficultyInput): Promise<AdjustDifficultyOutput> {
  return adjustDifficultyFlow(input);
}

const adjustDifficultyPrompt = ai.definePrompt({
  name: 'adjustDifficultyPrompt',
  input: {schema: AdjustDifficultyInputSchema},
  output: {schema: AdjustDifficultyOutputSchema},
  prompt: `You are an AI game designer tasked with dynamically adjusting the difficulty of a game based on player performance.

  Current Score: {{{score}}}
  Current Level: {{{level}}}
  Games Played: {{{gamesPlayed}}}
  Average Session Length: {{{averageSessionLength}}} seconds
  Highest Score: {{{highestScore}}}

  Analyze the player's performance data and determine if the difficulty level should be adjusted.

  Consider the following factors:
  - If the player's score is consistently high, increase the difficulty.
  - If the player is struggling and the score is low, decrease the difficulty.
  - If the player has played many games, gradually increase the difficulty over time.
  - If the average session length is short, the game may be too difficult, consider decreasing the difficulty.

  Based on your analysis, set the newLevel to either the same, higher, or lower than the current level.

  Explain your reasoning for the adjustment in the reason field.

  The game difficulty ranges from 1 (easy) to 3 (hard). Only ever suggest a level 1, 2, or 3.
  `,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const adjustDifficultyFlow = ai.defineFlow(
  {
    name: 'adjustDifficultyFlow',
    inputSchema: AdjustDifficultyInputSchema,
    outputSchema: AdjustDifficultyOutputSchema,
  },
  async input => {
    const {output} = await adjustDifficultyPrompt(input);
    return output!;
  }
);
