import type { Metadata } from 'next';
import '@fontsource/barlow/400.css';
import '@fontsource/barlow/600.css';
import '@fontsource/barlow-condensed/600.css';
import './globals.css';
import { InteractionFeedback } from '../components/InteractionFeedback';
export const metadata: Metadata = {
  title: 'Republic — The world is negotiable',
  description: 'A multiplayer political strategy game. Build a nation. Negotiate a world.',
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <InteractionFeedback />
        {children}
      </body>
    </html>
  );
}
