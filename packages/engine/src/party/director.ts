import { endParty } from './ending';
import { canalCheckpoint } from './canal';
import { ROLE_INFO, PARTY_RULES, type PartyMatch, type Asset, type Room } from '@republic/contracts';
import { activate } from './scenario';
import { expireMeetings } from './meetings';
import { settle } from './treaties';
import { score } from './scoring';
export function twist(m: PartyMatch, now: number) {
  if (m.twist) return;
  const roles = m.players.map((p) => p.role);
  const info = {
    security: {
      title: 'Security incident at the canal',
      description: 'Escorts are in demand. Protect an emergency convoy; signed agreements remain binding.',
      assets: (roles.includes('military') ? ['protection'] : ['passage', 'shipping']) as Asset[],
    },
    machinery: {
      title: 'Canal machinery failure',
      description: 'An emergency repair effort opens. Engineers need backing; signed agreements remain binding.',
      assets: (roles.includes('repairs') ? ['repairs'] : ['oil']) as Asset[],
    },
    shipping: {
      title: 'Alternative shipping disrupted',
      description: 'Canal passage is now more valuable. Organize a relief transit; signed agreements remain binding.',
      assets: ['passage'] as Asset[],
    },
  }[m.twistKind];
  m.twist = { title: info.title, description: info.description, at: now };
  m.news.unshift({
    id: `${m.id}-twist`,
    at: now,
    text: `${info.title}. Existing transfers and escrow commitments remain valid.`,
  });
  for (const p of m.players) {
    const foreign = info.assets.filter(
      (a) =>
        m.players.some((other) => other.id !== p.id && ROLE_INFO[other.role!].asset === a) &&
        a !== ROLE_INFO[p.role!].asset,
    );
    const assets: Asset[] =
      foreign.length && (m.twistKind !== 'machinery' || roles.includes('repairs'))
        ? foreign
        : p.role === 'oil'
          ? ['passage', 'shipping']
          : ['oil'];
    p.needs.push({
      id: `${m.id}-${p.id}-response`,
      title: 'Secure the emergency convoy',
      description:
        'The shared response needs fresh supplies from a partner. Organize a binding delivery before the clock runs out.',
      requirements: [
        { assets, amount: 2 },
        { assets: ['credits'], amount: 2 },
      ],
      dueAt: m.endsAt,
      status: 'open',
      optional: true,
    });
  }
}
export function partyClock(room: Room, wallNow: number) {
  const m = room.party!;
  const now = wallNow + m.offsetMs;
  if (m.stage === 'reveal' && (now >= m.revealEndsAt || m.players.every((p) => p.ready))) activate(m, now);
  if (m.stage !== 'active') return;
  if (m.players.length !== 2 && now >= m.startedAt + PARTY_RULES.twist) twist(m, m.startedAt + PARTY_RULES.twist);
  settle(m, Math.min(now, m.endsAt));
  expireMeetings(m, now);
  if (now < m.endsAt) canalCheckpoint(m, now);
  for (const p of m.players)
    for (const n of p.needs)
      if (!n.optional && n.status === 'open' && now >= n.dueAt) {
        n.status = 'late';
        score(
          p,
          `${n.id}-deadline`,
          n.dueAt,
          -PARTY_RULES.missedPenalty,
          0,
          `National deadline missed: ${n.title}. Late recovery is still possible.`,
        );
      }
  if (now >= m.endsAt) endParty(room, m.endsAt);
}
