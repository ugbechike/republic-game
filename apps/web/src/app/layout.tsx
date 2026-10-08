import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Republic — The world is negotiable',
  description: 'A multiplayer political strategy game. Build a nation. Negotiate a world.',
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
