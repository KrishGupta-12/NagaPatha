
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Game } from "@/components/game/Game";
import { Header } from "@/components/layout/Header";
import { Gamepad2 } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PlayPage() {
  const { user, isGuest, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && !isGuest) {
      router.replace('/login');
    }
  }, [user, isGuest, loading, router]);


  return (
    <div className="flex flex-col h-[100svh] bg-card/50">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <Gamepad2 className="w-16 h-16 animate-pulse text-primary" />
            <p className="text-xl text-muted-foreground font-headline">Loading NāgaPatha...</p>
          </div>
        ) : (user || isGuest) ? (
          <Game />
        ) : (
           <div className="flex flex-col items-center gap-4">
             <p className="text-xl text-muted-foreground font-headline">Redirecting to login...</p>
           </div>
        )}
      </main>
    </div>
  );
}
