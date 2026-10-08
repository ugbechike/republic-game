import { Sun, Waves, Trees, Mountain, Moon, Zap, Bird, Sunrise, type LucideIcon } from 'lucide-react';
export const FLAG_STYLES: Record<string, { icon: LucideIcon; name: string; color: string; ink: string }> = {
  '🌅': { icon: Sunrise, name: 'New dawn', color: '#783e37', ink: '#f3cc83' },
  '🌊': { icon: Waves, name: 'Ocean', color: '#174c6c', ink: '#b8e7ee' },
  '🌲': { icon: Trees, name: 'Evergreen', color: '#235547', ink: '#bddeb4' },
  '☀️': { icon: Sun, name: 'Sunburst', color: '#7a5c27', ink: '#ffdb80' },
  '🏔️': { icon: Mountain, name: 'Highlands', color: '#2d4563', ink: '#e2eef1' },
  '🌙': { icon: Moon, name: 'Crescent', color: '#45375e', ink: '#edcf8c' },
  '⚡': { icon: Zap, name: 'Storm', color: '#39464b', ink: '#f1c975' },
  '🦅': { icon: Bird, name: 'Free spirit', color: '#67402c', ink: '#e7cd98' },
};
export function FlagBanner({ flag, large = false }: { flag: string; large?: boolean }) {
  const style = FLAG_STYLES[flag] ?? FLAG_STYLES['☀️'];
  const Icon = style.icon;
  return (
    <span
      className={`flag-banner ${large ? 'flag-large' : ''}`}
      style={{ backgroundColor: style.color, color: style.ink }}
      aria-label={`${style.name} flag`}
    >
      <Icon aria-hidden="true" strokeWidth={1.5} />
      <i />
    </span>
  );
}
