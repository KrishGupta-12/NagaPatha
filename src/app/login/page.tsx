
'use client';

import { Auth } from "@/components/auth/Auth";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/hooks/use-auth";
import { Gamepad2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function LoginPage() {
  const { user, isGuest, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user || isGuest) {
      router.replace('/play');
    }
  }, [user, isGuest, router]);

  if (loading || user || isGuest) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
        <Gamepad2 className="w-16 h-16 animate-pulse text-primary" />
        <p className="text-xl text-muted-foreground font-headline">Loading NāgaPatha...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100svh] bg-card/50">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <Auth />
      </main>
    </div>
  );
}
