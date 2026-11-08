import type { Metadata } from 'next';
import './globals.css';
import SessionProvider from '@/components/layout/SessionProvider';

export const metadata: Metadata = {
  title: 'Registration Hub — Management Platform',
  description: 'Enterprise Dynamic Registration Management Platform for Wonderla Events',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}

