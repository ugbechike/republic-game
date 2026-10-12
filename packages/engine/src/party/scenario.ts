import {
  ASSETS,
  ROLES,
  ROLE_INFO,
  emptyInventory,
  PARTY_RULES,
  type PartyPlayer,
  type Room,
  type Requirement,
  type PartyRole,
  type PartyMatch,
} from '@republic/contracts';
import { random } from '../helpers';
export function nationalRequirements(role: PartyRole, count: number): Requirement[] {
  const oil = (amount: number): Requirement => ({ assets: ['oil'], amount });
  if (role === 'oil') return [oil(3), { assets: ['passage', 'shipping'], amount: 3 }];
  if (role === 'canal')
    return [
      oil(2),
      ...(count >= 3 ? [{ assets: ['shipping'] as 'shipping'[], amount: 1 }] : []),
      ...(count >= 4
        ? [{ assets: ['protection', ...(count === 6 ? ['repairs'] : [])] as ('protection' | 'repairs')[], amount: 1 }]
        : []),
    ];
  if (role === 'shipping') return [oil(2), { assets: ['passage'], amount: 1 }];
  if (role === 'military') return [oil(1), { assets: [count >= 5 ? 'food' : 'passage'], amount: 1 }];
  return [oil(1), { assets: [role === 'food' ? 'shipping' : 'passage'], amount: 1 }];
}
export function newPresident(r: Room['republics'][number]): PartyPlayer {
  return {
    id: r.id,
    name: r.name,
    leader: r.leader,
    emblem: r.flag,
    ready: false,
    inventory: emptyInventory(),
    support: PARTY_RULES.initialSupport,
    influence: 0,
    needs: [],
    intel: '',
    ledger: [],
    lots: [],
    tradeBalance: 0,
    strategicCredit: 0,
    bargainingPenalty: 0,
    weaknessPenalty: 0,
    supportBase: PARTY_RULES.initialSupport,
    influenceBase: 0,
    deliveryInfluence: 0,
    supplied: 0,
    fallbackUsed: false,
  };
}
export function newParty(room: Room, round = 1): PartyMatch {
  return {
    id: `${room.code}-${round}`,
    round,
    stage: 'lobby',
    revealEndsAt: 0,
    startedAt: 0,
    endsAt: 0,
    offsetMs: 0,
    players: room.republics.map(newPresident),
    meetings: [],
    agreements: [],
    twistKind: ['security', 'machinery', 'shipping'][Math.floor(random(room) * 3)] as PartyMatch['twistKind'],
    news: [],
    results: [],
    awards: [],
  };
}
export function dealRoles(room: Room, now: number) {
  const m = room.party!;
  const deck = [...ROLES.slice(0, m.players.length)];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random(room) * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  m.players.forEach((p, i) => {
    p.role = deck[i];
    p.ready = false;
    p.intel =
      p.role === 'canal' && deck.length === 2
        ? 'You need two oil units to keep the canal open. Your partner needs three passage slots. Keep four Credits available if you need neutral relief.'
        : ROLE_INFO[p.role].intel;
    p.inventory.credits = PARTY_RULES.initialCredits;
    p.inventory[ROLE_INFO[p.role].asset] = p.role === 'oil' ? PARTY_RULES.oilInventory : PARTY_RULES.roleInventory;
    p.lots = ASSETS.filter((a) => p.inventory[a]).map((asset) => ({ asset, amount: p.inventory[asset], origin: p.id }));
    p.needs = [
      {
        id: `${m.id}-${p.id}-national`,
        title:
          p.role === 'oil'
            ? 'Deliver the blocked oil shipment'
            : p.role === 'canal'
              ? 'Keep the canal operating'
              : p.role === 'shipping'
                ? 'Bring the stranded fleet home'
                : p.role === 'military'
                  ? 'Supply your escort crews'
                  : p.role === 'food'
                    ? 'Get the harvest to market'
                    : 'Mobilize your engineers',
        description: ROLE_INFO[p.role].headline,
        requirements: nationalRequirements(p.role, deck.length),
        shipment: p.role === 'oil' && deck.length === 2,
        dueAt: 0,
        status: 'open',
      },
    ];
  });
  m.stage = 'reveal';
  m.revealEndsAt = now + PARTY_RULES.reveal;
  room.phase = 'playing';
}
export function activate(m: PartyMatch, now: number) {
  m.stage = 'active';
  m.startedAt = now;
  m.endsAt = now + (m.durationMs ?? PARTY_RULES.duration);
  m.players.forEach((p) =>
    p.needs.forEach(
      (n) => (n.dueAt = now + Math.min(PARTY_RULES.needDeadline, (m.durationMs ?? PARTY_RULES.duration) * 0.8)),
    ),
  );
  m.news.unshift({
    id: `${m.id}-start`,
    at: now,
    text: 'The Canal Crisis begins. Five minutes. Every President stays in the game.',
  });
}
