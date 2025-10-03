import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as Tone from 'tone';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

let synths: { [key: string]: Tone.Synth | Tone.NoiseSynth } = {};

if (typeof window !== 'undefined') {
  synths.eat = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 0.1 }
  }).toDestination();
  
  synths.crash = new Tone.NoiseSynth({
    noise: { type: 'brown' },
    envelope: { attack: 0.005, decay: 0.15, sustain: 0 }
  }).toDestination();
  
  synths.click = new Tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.1 }
  }).toDestination();
}

export const playSound = (sound: 'eat' | 'crash' | 'click') => {
  if (Tone.context.state !== 'running') {
    Tone.start();
  }
  const synth = synths[sound];
  if (!synth) return;

  switch(sound) {
    case 'eat':
      (synth as Tone.Synth).triggerAttackRelease('C5', '8n');
      break;
    case 'crash':
       (synth as Tone.NoiseSynth).triggerAttackRelease('0.1');
      break;
    case 'click':
       (synth as Tone.Synth).triggerAttackRelease('C4', '16n');
       break;
  }
}

export const startAudioContext = () => {
  if (Tone.context.state !== 'running') {
    Tone.start();
  }
}
