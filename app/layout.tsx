import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crossword Game',
  description: 'Interactive educational crossword platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
