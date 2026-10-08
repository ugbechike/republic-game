import type { Resource, TRADE_RESOURCES } from './resources';
export * from './resources';
export const FLAGS = ['🌅', '🌊', '🌲', '☀️', '🏔️', '🌙', '⚡', '🦅'] as const;
export type Policy =
  'corporateTax' | 'incomeTax' | 'education' | 'healthcare' | 'infrastructure' | 'defence' | 'energy' | 'social';
export type Metrics = {
  population: number;
  gdp: number;
  treasury: number;
  debt: number;
  inflation: number;
  unemployment: number;
  approval: number;
  infrastructure: number;
  education: number;
  healthcare: number;
  energy: number;
  military: number;
  stability: number;
};
export type Plot = {
  id: number;
  x: number;
  z: number;
  kind: 'home' | 'tower' | 'factory' | 'farm' | 'civic';
  stage: number;
  height: number;
};
export type Region = {
  id: string;
  name: string;
  population: number;
  development: number;
  economy: number;
  infrastructure: number;
  unemployment: number;
  stability: number;
  industry: Resource;
  plots: Plot[];
};
export type Crisis = {
  id: string;
  kind: 'flood' | 'power' | 'scandal' | 'boom' | 'health' | 'drought' | 'resource';
  resource?: Resource;
  affectedMetric?: keyof Metrics;
  title: string;
  description: string;
  expires: number;
};
export type Republic = {
  id: string;
  name: string;
  leader: string;
  flag: string;
  resources: Resource[];
  stocks: Record<Resource, number>;
  disruptions?: { resource: Resource; ends: number }[];
  metrics: Metrics;
  policies: Record<Policy, number>;
  pendingPolicies: { key: Policy; value: number; month: number }[];
  regions: Region[];
  house: number;
  capital: number;
  reputation: number;
  influence: number;
  crisis?: Crisis;
  effects: { month: number; metric: keyof Metrics; amount: number }[];
  history: number[];
  stats: { wars: number; sanctions: number; betrayals: number; deliveries: number };
};
export type Player = { id: string; tokenHash: string; requests: string[] };
export type Bundle = { money: number; resource: (typeof TRADE_RESOURCES)[number]; amount: number };
export type Deal = {
  id: string;
  from: string;
  to: string;
  offer: Bundle;
  want: Bundle;
  years: number;
  status: 'pending' | 'active' | 'rejected' | 'broken' | 'completed';
  ends: number;
  created: number;
};
export type Alliance = {
  id: string;
  from: string;
  to: string;
  kind: 'trade' | 'defence';
  status: 'pending' | 'active' | 'ended';
};
export type Loan = {
  id: string;
  from: string;
  to: string;
  amount: number;
  remaining: number;
  months: number;
  status: 'pending' | 'active' | 'paid' | 'rejected';
};
export type War = {
  id: string;
  attacker: string;
  defender: string;
  ends: number;
  support: Record<string, { side: string; strength: number }>;
  status: 'active' | 'ended';
  winner?: string;
};
export type Vote = {
  id: string;
  title: string;
  kind: 'sanction' | 'aid' | 'trade';
  target: string;
  ends: number;
  ballots: Record<string, boolean>;
};
export type Notice = { id: string; month: number; text: string; audience?: string[] };
export type Score = {
  id: string;
  name: string;
  flag: string;
  total: number;
  economy: number;
  prosperity: number;
  influence: number;
  strength: number;
  stability: number;
  debt: number;
  military: number;
  diplomacy: number;
};
export type Room = {
  code: string;
  host: string;
  minPlayers: number;
  options: { duration: 45 | 60 | 90; maxPlayers: number; difficulty: 'developing' | 'struggling' };
  phase: 'lobby' | 'playing' | 'ended';
  version: number;
  month: number;
  nextTick: number;
  seed: number;
  players: Player[];
  republics: Republic[];
  deals: Deal[];
  alliances: Alliance[];
  loans: Loan[];
  wars: War[];
  sanctions: { from: string; to: string; ends: number }[];
  vote?: Vote;
  notices: Notice[];
  results: Score[];
  speed: number;
};
export type PublicRepublic = Pick<
  Republic,
  'id' | 'name' | 'leader' | 'flag' | 'resources' | 'influence' | 'reputation' | 'stats'
> & { gdp: number; population: number; stability: number; militaryEstimate: number };
export type RoomView = Omit<Room, 'players' | 'republics' | 'seed'> & {
  playerId: string;
  republics: PublicRepublic[];
  me: Republic;
  development: boolean;
  publicTrades: { from: string; to: string }[];
};
export type Session = { code: string; playerId: string; token: string };
export type Ack = { ok: boolean; error?: string };

export type RoomSummary = Pick<Room, 'code' | 'phase' | 'options' | 'minPlayers'> & { occupied: number };
export type RepublicPreview = { metrics: Metrics; influence: number };
