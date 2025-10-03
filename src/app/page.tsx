"use client";

import { useAuth } from "@/hooks/use-auth";
import { Auth } from "@/components/auth/Auth";
import { Game } from "@/components/game/Game";
import { Header } from "@/components/layout/Header";
import { Gamepad2 } from "lucide-react";

export default function Home() {
  const { user, isGuest, loading } = useAuth();

  const showGame = user || isGuest;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <Gamepad2 className="w-16 h-16 animate-pulse text-primary" />
            <p className="text-xl text-muted-foreground font-headline">Loading RetroSnake...</p>
          </div>
        ) : showGame ? (
          <Game />
        ) : (
          <Auth />
        )}
      </main>
    </div>
  );
}
