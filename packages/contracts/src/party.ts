export const ASSETS = ['credits', 'oil', 'passage', 'shipping', 'protection', 'food', 'repairs'] as const;
export type Asset = (typeof ASSETS)[number];
export const ROLES = ['oil', 'canal', 'shipping', 'military', 'food', 'repairs'] as const;
export type PartyRole = (typeof ROLES)[number];
export type Inventory = Record<Asset, number>;
export type Requirement = { assets: Asset[]; amount: number };
export type NationalNeed = {
  id: string;
  title: string;
  description: string;
  requirements: Requirement[];
  dueAt: number;
  status: 'open' | 'late' | 'fulfilled' | 'missed';
  optional?: boolean;
};
export type ScoreEntry = { id: string; at: number; support: number; influence: number; reason: string };
export type StockLot = { asset: Asset; amount: number; origin: string };
export type PartyPlayer = {
  id: string;
  name: string;
  leader: string;
  emblem: string;
  ready: boolean;
  role?: PartyRole;
  inventory: Inventory;
  support: number;
  influence: number;
  needs: NationalNeed[];
  intel: string;
  ledger: ScoreEntry[];
  lots: StockLot[];
  tradeBalance: number;
  strategicCredit: number;
  bargainingPenalty: number;
  weaknessPenalty: number;
  supportBase: number;
  influenceBase: number;
  deliveryInfluence: number;
  supplied: number;
  fallbackUsed: boolean;
};
export type PartyTerms = { offer: Inventory; want: Inventory; delay: 0 | 15 | 30 };
export type DealEvaluation = {
  grade: 'Weak' | 'Fair' | 'Excellent' | 'Strategically Justified' | 'Uncertain';
  offered: number;
  received: number;
  reasons: string[];
  projectedSupport: number;
};
export type PartyMeeting = {
  id: string;
  participants: [string, string];
  status: 'requested' | 'open' | 'proposed' | 'accepted' | 'signed' | 'closed';
  revision: number;
  terms: PartyTerms;
  proposer?: string;
  signatures: string[];
  expiresAt: number;
  escrow: Record<string, Inventory>;
  evaluations?: Record<string, DealEvaluation>;
  chat: { id: string; from: string; text: string; at: number }[];
};
export type PartyAgreement = {
  id: string;
  meeting: string;
  participants: [string, string];
  terms: PartyTerms;
  signedAt: number;
  dueAt: number;
  status: 'scheduled' | 'settled';
  evaluations: Record<string, DealEvaluation>;
  lots: Record<string, StockLot[]>;
};
export type PartyResult = {
  id: string;
  name: string;
  emblem: string;
  support: number;
  influence: number;
  legacy: number;
};
export type PartyNews = { id: string; at: number; text: string };
export type PartyMatch = {
  id: string;
  round: number;
  stage: 'lobby' | 'reveal' | 'active' | 'ended';
  revealEndsAt: number;
  startedAt: number;
  endsAt: number;
  offsetMs: number;
  players: PartyPlayer[];
  meetings: PartyMeeting[];
  agreements: PartyAgreement[];
  twistKind: 'security' | 'machinery' | 'shipping';
  twist?: { title: string; description: string; at: number };
  news: PartyNews[];
  results: PartyResult[];
  awards: { title: string; player: string; reason: string }[];
};
export type PublicPresident = Pick<
  PartyPlayer,
  'id' | 'name' | 'leader' | 'emblem' | 'ready' | 'role' | 'support' | 'influence'
> & { online: boolean };
export type PartyView = Omit<PartyMatch, 'players' | 'twistKind' | 'offsetMs'> & {
  players: PublicPresident[];
  me: PartyPlayer;
  serverNow: number;
  reference: Inventory;
};
