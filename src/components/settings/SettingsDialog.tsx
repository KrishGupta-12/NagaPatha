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
import { Settings, RefreshCcw, Square, Grid, Palette, Contrast, Moon } from 'lucide-react';
import { useState } from 'react';
import type { SnakeStyle, FoodStyle, BoardStyle, BoardTheme } from '@/lib/types';
import { Separator } from '../ui/separator';

export function SettingsDialog() {
  const {
    difficulty, setDifficulty,
    soundEnabled, setSoundEnabled,
    resetGameStats,
    playGameSound,
    snakeStyle, setSnakeStyle,
    foodStyle, setFoodStyle,
    boardStyle, setBoardStyle,
    boardTheme, setBoardTheme,
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
  
  const handleBoardStyleChange = (value: BoardStyle) => {
    playGameSound('click');
    setBoardStyle(value);
  }

  const handleBoardThemeChange = (value: BoardTheme) => {
    playGameSound('click');
    setBoardTheme(value);
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
          {/* Difficulty */}
          <div className="space-y-3">
            <Label className="font-headline text-lg">Difficulty</Label>
            <RadioGroup value={difficulty.toString()} onValueChange={handleDifficultyChange} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="easy" /><Label htmlFor="easy" className="cursor-pointer">Easy</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="medium" /><Label htmlFor="medium" className="cursor-pointer">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="hard" /><Label htmlFor="hard" className="cursor-pointer">Hard</Label>
              </div>
            </RadioGroup>
          </div>
          
          <Separator />
          
          {/* Customization */}
          <div className="space-y-4">
            <h3 className="font-headline text-lg">Appearance</h3>
            
            <div className="pl-2 space-y-3">
              <Label className='text-base'>Snake Style</Label>
              <RadioGroup value={snakeStyle} onValueChange={handleSnakeStyleChange} className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="classic" id="classic" /><Label htmlFor="classic" className="cursor-pointer flex items-center gap-1"><Palette size={16}/>Classic</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="striped" id="striped" /><Label htmlFor="striped" className="cursor-pointer flex items-center gap-1"><Palette size={16}/>Striped</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="gradient" id="gradient" /><Label htmlFor="gradient" className="cursor-pointer flex items-center gap-1"><Palette size={16}/>Gradient</Label>
                </div>
                 <div className="flex items-center space-x-2">
                  <RadioGroupItem value="digital" id="digital" /><Label htmlFor="digital" className="cursor-pointer flex items-center gap-1"><Palette size={16}/>Digital</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="pl-2 space-y-3">
              <Label className='text-base'>Food Style</Label>
              <RadioGroup value={foodStyle} onValueChange={handleFoodStyleChange} className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="apple-red" id="apple-red" /><Label htmlFor="apple-red" className="cursor-pointer flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"/>Red Apple</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="apple-gold" id="apple-gold" /><Label htmlFor="apple-gold" className="cursor-pointer flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-400"/>Golden</Label>
                  </div>
                   <div className="flex items-center space-x-2">
                    <RadioGroupItem value="apple-blue" id="apple-blue" /><Label htmlFor="apple-blue" className="cursor-pointer flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500"/>Blue Apple</Label>
                  </div>
                   <div className="flex items-center space-x-2">
                    <RadioGroupItem value="apple-green" id="apple-green" /><Label htmlFor="apple-green" className="cursor-pointer flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-lime-500"/>Green Apple</Label>
                  </div>
                   <div className="flex items-center space-x-2">
                    <RadioGroupItem value="apple-pink" id="apple-pink" /><Label htmlFor="apple-pink" className="cursor-pointer flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-pink-500"/>Pink Apple</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="gem" id="gem" /><Label htmlFor="gem" className="cursor-pointer flex items-center gap-1"><div className="w-3 h-3 rotate-45 bg-purple-500"/>Gem</Label>
                  </div>
              </RadioGroup>
            </div>

             <div className="pl-2 space-y-3">
              <Label className='text-base'>Board Style</Label>
              <RadioGroup value={boardStyle} onValueChange={handleBoardStyleChange} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="default" id="board-default" /><Label htmlFor="board-default" className="cursor-pointer flex items-center gap-1"><Square size={16}/>Default</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="grid" id="board-grid" /><Label htmlFor="board-grid" className="cursor-pointer flex items-center gap-1"><Grid size={16}/>Grid</Label>
                  </div>
              </RadioGroup>
            </div>

            <div className="pl-2 space-y-3">
              <Label className='text-base'>Board Theme</Label>
              <RadioGroup value={boardTheme} onValueChange={handleBoardThemeChange} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="default" id="theme-default" /><Label htmlFor="theme-default" className="cursor-pointer flex items-center gap-1"><Moon size={16}/>Default</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="theme-light" /><Label htmlFor="theme-light" className="cursor-pointer flex items-center gap-1"><Palette size={16}/>Light</Label>
                  </div>
                   <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mono" id="theme-mono" /><Label htmlFor="theme-mono" className="cursor-pointer flex items-center gap-1"><Contrast size={16}/>Mono</Label>
                  </div>
              </RadioGroup>
            </div>
          </div>
          
          <Separator />

          {/* Sound & Data */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="sound-switch" className="font-headline text-lg">Sound Effects</Label>
              <Switch id="sound-switch" checked={soundEnabled} onCheckedChange={handleSoundToggle} />
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
        </div>
        <DialogFooter>
          <Button onClick={() => { playGameSound('click'); setIsOpen(false); }}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
