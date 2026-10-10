import { FLAG_STYLES } from '../../components/FlagBanner';
export function Emblem({ value, large = false }: { value: string; large?: boolean }) {
  const style = FLAG_STYLES[value] ?? FLAG_STYLES['☀️'];
  const Icon = style.icon;
  return (
    <span
      className={`party-emblem ${large ? 'large' : ''}`}
      style={{ background: style.color, color: style.ink }}
      aria-label={`${style.name} emblem`}
    >
      <Icon aria-hidden="true" strokeWidth={1.4} />
    </span>
  );
}
