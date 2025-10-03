import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/providers/auth-provider';
import { GameProvider } from '@/components/providers/game-provider';

export const metadata: Metadata = {
  title: 'RetroSnake',
  description: 'A classic Snake game with modern polish and Firebase integration.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Space+Grotesk:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased min-h-screen bg-background text-foreground')}>
        <AuthProvider>
          <GameProvider>
            {children}
            <Toaster />
          </GameProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
