import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import './globals.css';

export const metadata: Metadata = {
  title: 'SpeakBetter - English Learning',
  description: 'Improve your English pronunciation, reading, and interview skills',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-gray-900">
        <Navigation />
        <main className="mx-auto max-w-3xl px-4 py-6 sm:py-10">{children}</main>
      </body>
    </html>
  );
}
