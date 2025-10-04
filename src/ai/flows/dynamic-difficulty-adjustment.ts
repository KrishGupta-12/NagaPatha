
'use server';

/**
 * @fileOverview This flow analyzes player performance and recommends difficulty adjustments.
 * It helps in creating a dynamic and engaging gameplay experience by adapting to the player's skill level.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AdjustDifficultyInputSchema = z.object({
  currentDifficulty: z.number().min(1).max(3).describe("The current difficulty level (1=Easy, 2=Medium, 3=Hard)."),
  lastScore: z.number().describe("The player's score in the last game."),
  averageSessionLength: z.number().describe("The average length of the player's game sessions in seconds."),
  gamesPlayed: z.number().describe("The total number of games the player has played."),
});

const AdjustDifficultyOutputSchema = z.object({
  recommendation: z.enum(['increase', 'decrease', 'stay']).describe("The recommendation to increase, decrease, or keep the difficulty level."),
  newDifficulty: z.number().min(1).max(3).describe("The suggested new difficulty level."),
  reasoning: z.string().describe("A brief explanation for the recommendation, to be shown to the player."),
});

export type AdjustDifficultyInput = z.infer<typeof AdjustDifficultyInputSchema>;
export type AdjustDifficultyOutput = z.infer<typeof AdjustDifficultyOutputSchema>;

const difficultyPrompt = ai.definePrompt({
  name: 'difficultyPrompt',
  input: { schema: AdjustDifficultyInputSchema },
  output: { schema: AdjustDifficultyOutputSchema },
  prompt: `
    You are an expert game designer analyzing a player's performance in a Snake-like game called NāgaPatha.
    Your goal is to recommend a difficulty adjustment to keep the player engaged.
    The difficulty levels are 1 (Easy), 2 (Medium), and 3 (Hard).

    Here is the player's data:
    - Current Difficulty: {{currentDifficulty}}
    - Last Score: {{lastScore}}
    - Average Session Length (seconds): {{averageSessionLength}}
    - Total Games Played: {{gamesPlayed}}

    Analyze the data and decide whether to recommend increasing, decreasing, or staying at the current difficulty.
    - If the player is doing very well (e.g., high score on a lower difficulty), suggest an increase.
    - If the player is struggling (e.g., very low scores, short sessions on a high difficulty), suggest a decrease.
    - If the player's performance seems balanced for the current difficulty, recommend staying.

    Provide a concise, encouraging, and user-friendly 'reasoning' for your recommendation. Do not just state the facts, but interpret them.
    For example, instead of "Score was high", say "You're mastering this level!".
    Your reasoning should be a single sentence.
  `,
});

const adjustDifficultyFlow = ai.defineFlow(
  {
    name: 'adjustDifficultyFlow',
    inputSchema: AdjustDifficultyInputSchema,
    outputSchema: AdjustDifficultyOutputSchema,
  },
  async (input) => {
    const { output } = await difficultyPrompt(input);
    if (!output) {
      throw new Error("AI failed to provide a difficulty analysis.");
    }
    return output;
  }
);

export async function adjustDifficulty(input: AdjustDifficultyInput): Promise<AdjustDifficultyOutput> {
  return await adjustDifficultyFlow(input);
}

    