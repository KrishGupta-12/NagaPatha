import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as Tone from 'tone';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

let eatSound: Tone.Synth;
let crashSound: Tone.Synth;

if (typeof window !== 'undefined') {
  eatSound = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 0.1 }
  }).toDestination();

  crashSound = new Tone.Synth({
    oscillator: { type: 'fmsquare' },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.2 }
  }).toDestination();
}


export const playEatSound = () => {
  if (eatSound && Tone.context.state === 'running') {
    eatSound.triggerAttackRelease('C5', '8n');
  }
}

export const playCrashSound = () => {
  if (crashSound && Tone.context.state === 'running') {
    crashSound.triggerAttackRelease('C3', '4n');
  }
}

export const startAudioContext = () => {
  if (Tone.context.state !== 'running') {
    Tone.start();
  }
}
