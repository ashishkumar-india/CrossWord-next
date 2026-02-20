import './globals.css';
import './styles/style.css';
import './styles/responsive.css';
import type { Metadata } from 'next';
import Footer from './components/Footer';

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
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', margin: 0 }}>
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
