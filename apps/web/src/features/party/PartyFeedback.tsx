import type { PartyProps } from './types';
export function PartyFeedback({ game, now }: Pick<PartyProps, 'game'> & { now: number }) {
  const score = [...game.me.ledger].reverse().find((e) => e.support || e.influence);
  const shipment = game.news.find((n) => n.id.endsWith('-shipment') && n.text.startsWith(game.me.name + ' '));
  if (shipment && now - shipment.at < 15000)
    return (
      <p className="party-feedback" role="status">
        {shipment.text}
      </p>
    );
  if (!score || now - score.at > 15000) return null;
  return (
    <p className="party-feedback" role="status">
      {score.support >= 0 ? '+' : ''}
      {score.support.toFixed(1)} Support · {score.influence >= 0 ? '+' : ''}
      {score.influence.toFixed(1)} Influence — {score.reason}
    </p>
  );
}
