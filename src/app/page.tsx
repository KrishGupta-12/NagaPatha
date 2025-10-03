
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Gamepad2, Heart, Scale, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[100svh] bg-background">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-card/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline text-primary">
                    NāgaPatha: The Serpent's Path
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    A modern twist on the classic snake game. Navigate the serpent, devour the food, and climb the global leaderboards. Simple to learn, hard to master.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/play">
                    <Button size="lg" className="w-full min-[400px]:w-auto">Play Now</Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="secondary" className="w-full min-[400px]:w-auto">
                      Login / Sign Up
                    </Button>
                  </Link>
                </div>
              </div>
              <Image
                src="https://picsum.photos/seed/snakegame/600/400"
                width="600"
                height="400"
                alt="NāgaPatha Game"
                data-ai-hint="snake game"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Why You'll Get Hooked</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  NāgaPatha is more than just a game; it's a test of skill, strategy, and reflexes.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <Card className="h-full">
                <CardContent className="flex flex-col items-center text-center p-6 gap-4">
                  <Trophy className="w-12 h-12 text-accent" />
                  <h3 className="text-xl font-bold font-headline">Global Leaderboards</h3>
                  <p className="text-sm text-muted-foreground">
                    Compete against players from around the world and prove your skills. Can you reach the top?
                  </p>
                </CardContent>
              </Card>
              <Card className="h-full">
                <CardContent className="flex flex-col items-center text-center p-6 gap-4">
                  <Scale className="w-12 h-12 text-accent" />
                  <h3 className="text-xl font-bold font-headline">Adjustable Difficulty</h3>
                  <p className="text-sm text-muted-foreground">
                    Whether you're a beginner or a seasoned pro, choose a difficulty that matches your skill level.
                  </p>
                </CardContent>
              </Card>
               <Card className="h-full">
                <CardContent className="flex flex-col items-center text-center p-6 gap-4">
                  <Heart className="w-12 h-12 text-accent" />
                  <h3 className="text-xl font-bold font-headline">Power-Ups</h3>
                  <p className="text-sm text-muted-foreground">
                    Grab special items to gain temporary advantages, like passing through walls. Use them strategically!
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-center h-16 border-t bg-card/50">
        <div className="container flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-primary" />
            <p className="text-sm text-muted-foreground">&copy; 2024 NāgaPatha. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
