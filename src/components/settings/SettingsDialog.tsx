'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useGame } from '@/hooks/use-game';
import { Settings, RefreshCcw, Apple, Coins, Gem, Palette } from 'lucide-react';
import { useState } from 'react';
import type { SnakeStyle, FoodStyle } from '@/lib/types';
import { Separator } from '../ui/separator';

export function SettingsDialog() {
  const {
    difficulty,
    setDifficulty,
    soundEnabled,
    setSoundEnabled,
    resetGameStats,
    playGameSound,
    snakeStyle,
    setSnakeStyle,
    foodStyle,
    setFoodStyle,
  } = useGame();
  const [isOpen, setIsOpen] = useState(false);

  const handleDifficultyChange = (value: string) => {
    playGameSound('click');
    setDifficulty(parseInt(value, 10));
  };
  
  const handleSnakeStyleChange = (value: SnakeStyle) => {
    playGameSound('click');
    setSnakeStyle(value);
  }
  
  const handleFoodStyleChange = (value: FoodStyle) => {
    playGameSound('click');
    setFoodStyle(value);
  }

  const handleSoundToggle = (checked: boolean) => {
    if (checked) {
       playGameSound('click');
    }
    setSoundEnabled(checked);
  }

  const handleReset = () => {
    playGameSound('click');
    resetGameStats();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-6 w-6" />
          <span className="sr-only">Game Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary">Settings</DialogTitle>
          <DialogDescription>
            Adjust your game experience.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="space-y-3">
            <Label className="font-headline text-lg">Difficulty</Label>
            <RadioGroup
              value={difficulty.toString()}
              onValueChange={handleDifficultyChange}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="easy" />
                <Label htmlFor="easy" className="cursor-pointer">Easy</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="medium" />
                <Label htmlFor="medium" className="cursor-pointer">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="hard" />
                <Label htmlFor="hard" className="cursor-pointer">Hard</Label>
              </div>
            </RadioGroup>
          </div>
          
          <Separator />
          
           <div className="space-y-3">
            <Label className="font-headline text-lg">Snake Style</Label>
            <RadioGroup
              value={snakeStyle}
              onValueChange={handleSnakeStyleChange}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="classic" id="classic" />
                <Label htmlFor="classic" className="cursor-pointer flex items-center gap-1"><Palette size={16}/>Classic</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="striped" id="striped" />
                <Label htmlFor="striped" className="cursor-pointer flex items-center gap-1"><Palette size={16}/>Striped</Label>
              </div>
            </RadioGroup>
          </div>
          
           <div className="space-y-3">
            <Label className="font-headline text-lg">Food Style</Label>
            <RadioGroup
              value={foodStyle}
              onValueChange={handleFoodStyleChange}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="apple" id="apple" />
                <Label htmlFor="apple" className="cursor-pointer flex items-center gap-1"><Apple size={16} className="text-red-500" /> Apple</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gold" id="gold" />
                <Label htmlFor="gold" className="cursor-pointer flex items-center gap-1"><Coins size={16} className="text-yellow-500"/> Gold</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gem" id="gem" />
                <Label htmlFor="gem" className="cursor-pointer flex items-center gap-1"><Gem size={16} className="text-purple-500"/> Gem</Label>
              </div>
            </RadioGroup>
          </div>
          
          <Separator />

          <div className="flex items-center justify-between">
            <Label htmlFor="sound-switch" className="font-headline text-lg">Sound Effects</Label>
            <Switch
              id="sound-switch"
              checked={soundEnabled}
              onCheckedChange={handleSoundToggle}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="font-headline text-lg">Game Data</Label>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <RefreshCcw className="mr-2" /> Reset Stats
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will reset your high score, games played, and other local stats. Your leaderboard scores will not be affected.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => playGameSound('click')}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => { playGameSound('click'); setIsOpen(false); }}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
