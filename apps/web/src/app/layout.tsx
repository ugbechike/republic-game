import type { Metadata } from 'next';
import '@fontsource/barlow/400.css';
import '@fontsource/barlow/600.css';
import '@fontsource/barlow-condensed/600.css';
import './globals.css';
import { InteractionFeedback } from '../components/InteractionFeedback';
export const metadata: Metadata = {
  title: 'Republic — Five minutes. No easy deals.',
  description: 'A five-minute multiplayer negotiation party game. Win your people’s trust and the world’s respect.',
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
