import { startingAdvantages } from './resource-economy';
import {
  FLAGS,
  MONTHLY_DEMAND,
  RESOURCES,
  DEFAULT_MIN_PLAYERS,
  type Draft,
  type Republic,
  type Room,
  type Region,
} from '@republic/contracts';
export function createRepublic(id: string, draft: Draft, _legacyDifficulty = false): Republic {
  // Legacy callers may pass difficulty; all new Republics share one baseline.
  const base = 55;
  const regions: Region[] = [
    'Federal Capital',
    'Northreach',
    'Verdant Coast',
    'Eastern Vale',
    'Copper Highlands',
    'Westhaven',
  ].map((name, i) => ({
    id: `${id}-${i}`,
    name,
    population: i === 0 ? 2 : 1.6,
    development: base + (i === 0 ? 15 : -i),
    economy: 10,
    infrastructure: base,
    unemployment: 10,
    stability: base + 10,
    industry: draft.resources[i % draft.resources.length] ?? 'agriculture',
    plots: Array.from({ length: i === 0 ? 49 : 25 }, (_, p) => ({
      id: p,
      x: (p % (i === 0 ? 7 : 5)) - (i === 0 ? 3 : 2),
      z: Math.floor(p / (i === 0 ? 7 : 5)) - (i === 0 ? 3 : 2),
      kind:
        p === 24 && i === 0
          ? 'civic'
          : draft.resources[i % draft.resources.length] === 'agriculture' && i > 0
            ? 'farm'
            : p % 9 === 0
              ? 'factory'
              : p % 3 === 0
                ? 'tower'
                : 'home',
      stage: p % 6 === 0 ? 0 : 4,
      height: 0.5 + ((p * 17 + i * 3) % 11) / 6,
    })),
  }));
  const republic: Republic = {
    id,
    ...draft,
    stocks: Object.fromEntries(
      RESOURCES.map((k) => [
        k,
        ['coastline', 'rivers'].includes(k)
          ? 0
          : draft.resources.includes(k)
            ? 28
            : (MONTHLY_DEMAND[k as keyof typeof MONTHLY_DEMAND] ?? 0) * 5,
      ]),
    ) as Republic['stocks'],
    metrics: {
      population: 10,
      gdp: 68,
      treasury: 12,
      debt: 12,
      inflation: 5,
      unemployment: 10,
      approval: base + 10,
      infrastructure: base,
      education: base,
      healthcare: base,
      energy: base,
      military: 30,
      stability: base + 12,
    },
    policies: {
      corporateTax: 22,
      incomeTax: 18,
      education: 8,
      healthcare: 8,
      infrastructure: 8,
      defence: 6,
      energy: 7,
      social: 7,
    },
    pendingPolicies: [],
    regions,
    house: 58,
    capital: 65,
    reputation: 70,
    influence: 35,
    effects: [],
    credit: 70,
    relations: {},
    briefings: [],
    nextBriefingAt: 0,
    history: [68],
    stats: { wars: 0, sanctions: 0, betrayals: 0, deliveries: 0 },
  };
  startingAdvantages(republic);
  return republic;
}
export function createRoom(
  code: string,
  host: string,
  tokenHash: string,
  draft: Draft,
  options: Room['options'],
): Room {
  return {
    code,
    host,
    minPlayers: DEFAULT_MIN_PLAYERS,
    options,
    phase: 'lobby',
    version: 0,
    month: 0,
    nextTick: 0,
    activeMs: 0,
    nextWorldAt: 720000,
    paused: false,
    seed: Array.from(code).reduce((n, c) => n * 31 + c.charCodeAt(0), 7) >>> 0,
    players: [{ id: host, tokenHash, requests: [] }],
    republics: [createRepublic(host, draft, options.difficulty === 'struggling')],
    deals: [],
    alliances: [],
    loans: [],
    wars: [],
    sanctions: [],
    notices: [],
    results: [],
    speed: 1,
  };
}
export function botDraft(n: number): Draft {
  return {
    name: ['Solara', 'Kanto', 'Aurelia', 'Meridian', 'Novara', 'Caldera', 'Verdania'][n - 1] ?? `Republic ${n}`,
    leader: 'Development delegate',
    flag: FLAGS[n % FLAGS.length],
    resources: [RESOURCES[n % 7]],
  };
}
