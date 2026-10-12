import { emptyInventory, type PartyMatch, type PartyPlayer } from '@republic/contracts';
import { requireThat } from '../helpers';
import { subtract, takeLots, add } from './inventory';
import { score } from './scoring';
import { fulfill } from './needs';
export const CANAL_RULES = { repairs: 4, restriction: 30000, shipmentCredits: 6, emergencyCredits: 10 };
export function canalCheckpoint(m: PartyMatch, now: number) {
  if (m.players.length !== 2) return;
  const oil = m.players.find((p) => p.role === 'oil')!;
  if (!m.canal && (oil.needs[0].status === 'fulfilled' || now >= m.startedAt + 60000)) {
    m.canal = { maintenance: 'pending', dueAt: Math.min(m.endsAt, now + 45000), restrictedUntil: 0, emergency: false };
    m.news.unshift({
      id: `${m.id}-maintenance`,
      at: now,
      text: 'Canal machinery is failing. The Authority must fund repairs, negotiate assistance, or suspend passage.',
    });
  }
  const c = m.canal;
  if (!c) return;
  if (c.maintenance === 'pending' && now >= c.dueAt)
    maintenance(
      m,
      m.players.find((p) => p.role === 'canal')!,
      'restrict',
      now,
    );
  if (c.maintenance === 'restricted' && now >= c.restrictedUntil) {
    c.maintenance = 'repaired';
    m.news.unshift({
      id: `${m.id}-reopen`,
      at: now,
      text: 'The canal reopens after the maintenance suspension. Passage is available again.',
    });
  }
  if (!c.emergency && oil.needs[0].status === 'fulfilled') {
    c.emergency = true;
    oil.needs.push({
      id: `${m.id}-emergency`,
      title: 'Ship the emergency oil order',
      description:
        'Demand has surged. Deliver 4 Oil using 2 passage slots for 10 Credits and +8 Support. Canal maintenance affects this route.',
      shipment: true,
      optional: true,
      requirements: [
        { assets: ['oil'], amount: 4 },
        { assets: ['passage'], amount: 2 },
      ],
      dueAt: m.endsAt,
      status: 'open',
    });
  }
}
export function maintenance(m: PartyMatch, p: PartyPlayer, choice: 'repair' | 'restrict', now: number) {
  const c = m.canal;
  requireThat(p.role === 'canal' && c && c.maintenance === 'pending', 'No pending canal maintenance decision.');
  if (choice === 'repair') {
    const cost = { ...emptyInventory(), credits: CANAL_RULES.repairs };
    subtract(p, cost);
    takeLots(p, cost);
    c.maintenance = 'repaired';
    score(p, `${m.id}-repairs`, now, 6, 4, 'Emergency repairs funded: canal stays open for your trading partner.');
  } else {
    c.maintenance = 'restricted';
    c.restrictedUntil = Math.min(m.endsAt, now + CANAL_RULES.restriction);
    score(
      p,
      `${m.id}-restriction`,
      now,
      -4,
      0,
      'Passage suspended for 30 seconds to repair safely without spending Credits.',
    );
  }
  m.news.unshift({
    id: `${m.id}-maintenance-choice`,
    at: now,
    text:
      choice === 'repair'
        ? `${p.name} funds repairs. Passage remains open.`
        : `${p.name} suspends passage for 30 seconds. Signed transfers remain valid; shipments must wait.`,
  });
}
export function ship(m: PartyMatch, p: PartyPlayer, needId: string, now: number) {
  const need = p.needs.find((n) => n.id === needId);
  requireThat(p.role === 'oil' && need?.shipment, 'Choose an available oil shipment.');
  requireThat(
    m.canal?.maintenance !== 'restricted',
    'The canal is temporarily closed. Review the reopening countdown in your Office.',
  );
  if (need.optional)
    requireThat(
      m.canal?.maintenance === 'repaired',
      'The canal needs repairs. Request a maintenance meeting with the Authority.',
    );
  fulfill(m, p, needId, false, now);
  const credits = need.optional ? CANAL_RULES.emergencyCredits : CANAL_RULES.shipmentCredits;
  add(p, { ...emptyInventory(), credits });
  p.lots.push({ asset: 'credits', amount: credits, origin: p.id });
  m.news.unshift({
    id: `${needId}-shipment`,
    at: now,
    text: `${p.name} ships oil and earns ${credits} Credits. Fuel and passage were consumed.`,
  });
  canalCheckpoint(m, now);
}
