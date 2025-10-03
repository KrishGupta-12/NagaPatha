'use client';

import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Gamepad2, LogOut, User as UserIcon, Loader2, Trophy } from 'lucide-react';
import { SettingsDialog } from '../settings/SettingsDialog';
import { LeaderboardDialog } from '../leaderboard/LeaderboardDialog';

export function Header() {
  const { user, isGuest, loading, signOut, endGuestSession } = useAuth();

  const getInitials = (name?: string | null) => {
    if (!name) return 'G';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleSignOut = () => {
    if (user) {
      signOut();
    } else if (isGuest) {
      endGuestSession();
    }
  };

  return (
    <header className="flex items-center justify-between p-4 border-b border-primary/20 bg-background">
      <div className="flex items-center gap-2">
        <Gamepad2 className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold font-headline text-primary">
          NāgaPatha
        </h1>
      </div>
      <div className="flex items-center gap-2">
        {(user || isGuest) && <SettingsDialog />}
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (user || isGuest) ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10 border-2 border-primary">
                  {user && <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />}
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {user ? getInitials(user.displayName) : <UserIcon />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user ? user.displayName : 'Guest Player'}
                  </p>
                  {user && (
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
               <LeaderboardDialog trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                  <Trophy className="mr-2 h-4 w-4" />
                  <span>Leaderboard</span>
                </DropdownMenuItem>
              }/>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>{user ? 'Log out' : 'End Guest Session'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </header>
  );
}
