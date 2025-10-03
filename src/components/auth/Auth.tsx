'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Ghost, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { startAudioContext } from '@/lib/utils';


export function Auth() {
  const { signInWithGoogle, playAsGuest } = useAuth();
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingGuest, setLoadingGuest] = useState(false);

  const googleLogo = PlaceHolderImages.find(img => img.id === 'google-logo');

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    startAudioContext();
    await signInWithGoogle();
    // setLoadingGoogle(false) is not needed as the component will unmount
  };

  const handleGuestPlay = () => {
    setLoadingGuest(true);
    startAudioContext();
    playAsGuest();
    // setLoadingGuest(false) is not needed as the component will unmount
  };

  return (
    <Card className="w-full max-w-sm shadow-lg border-primary/50">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-3xl text-primary">Welcome to RetroSnake</CardTitle>
        <CardDescription className="pt-2">Sign in to save your high scores to the global leaderboard or play as a guest.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button onClick={handleGoogleSignIn} disabled={loadingGoogle || loadingGuest} className="w-full" variant="secondary">
          {loadingGoogle ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
             googleLogo && <Image src={googleLogo.imageUrl} data-ai-hint={googleLogo.imageHint} alt="Google logo" width={20} height={20} className="mr-2" />
          )}
          Sign in with Google
        </Button>
        <Button onClick={handleGuestPlay} disabled={loadingGoogle || loadingGuest} className="w-full" variant="outline">
           {loadingGuest ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Ghost className="mr-2 h-4 w-4" />
          )}
          Play as Guest
        </Button>
      </CardContent>
    </Card>
  );
}
