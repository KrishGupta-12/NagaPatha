import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { GameProvider } from '@/components/providers/game-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export const metadata: Metadata = {
  title: 'NāgaPatha',
  description: 'A classic Snake game with modern polish and Firebase integration.',
  manifest: '/manifest.json',
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=VT323&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#223d2b" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={cn('font-body antialiased min-h-screen bg-background text-foreground')}>
        <FirebaseClientProvider>
          <AuthProvider>
            <GameProvider>
              {children}
              <Toaster />
            </GameProvider>
          </AuthProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
