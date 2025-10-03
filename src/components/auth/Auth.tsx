
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ghost, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { startAudioContext } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { useRouter } from 'next/navigation';

export function Auth() {
  const { playAsGuest, loading: authLoading } = useAuth();
  const [loadingGuest, setLoadingGuest] = useState(false);
  const router = useRouter();

  const handleGuestPlay = () => {
    setLoadingGuest(true);
    startAudioContext();
    playAsGuest();
  };

  return (
    <Card className="w-full max-w-sm shadow-lg border-primary/50">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-3xl text-primary">Welcome Back!</CardTitle>
        <CardDescription className="pt-2">Sign in to save your high scores or play as a guest.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          <TabsContent value="signup">
            <SignUpForm />
          </TabsContent>
        </Tabs>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or
            </span>
          </div>
        </div>
        
        <Button onClick={handleGuestPlay} disabled={authLoading || loadingGuest} className="w-full" variant="outline">
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
