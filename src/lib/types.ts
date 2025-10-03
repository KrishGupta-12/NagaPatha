
import { z } from 'zod';

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

export const SignUpSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export type SignUpData = z.infer<typeof SignUpSchema>;

export const SignInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export type SignInData = z.infer<typeof SignInSchema>;
