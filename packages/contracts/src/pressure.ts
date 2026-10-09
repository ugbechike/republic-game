import type { Metrics } from './model';
import type { Resource, TRADE_RESOURCES } from './resources';
export type Commodity = (typeof TRADE_RESOURCES)[number];
export type ResourceFlow = {
  production: number;
  consumption: number;
  delivered: number;
  imports: number;
  exports: number;
  reserve: number;
  balance: number;
  coverage: number;
  stage: number;
  shortageMonths: number;
};
export type FlowLedger = {
  production?: Partial<Record<Commodity, number>>;
  imports: Partial<Record<Commodity, number>>;
  exports: Partial<Record<Commodity, number>>;
  received: number;
  paid: number;
};
export type MetricCause = { metric: keyof Metrics; amount: number; reason: string };
export type EconomicPoint = {
  month: number;
  gdp: number;
  debt: number;
  inflation: number;
  unemployment: number;
  approval: number;
  revenue: number;
  expenditure: number;
  energySupply: number;
  energyDemand: number;
  foodSupply: number;
  foodDemand: number;
  tradeBalance: number;
  annotations: string[];
  resources?: Partial<Record<Commodity, { production: number; imports: number; exports: number }>>;
};
export type EconomyState = {
  supply: Partial<Record<Commodity, ResourceFlow>>;
  timeline: EconomicPoint[];
  causes: MetricCause[];
  revenue: number;
  expenditure: number;
  tradeBalance: number;
};
export type Briefing = {
  id: string;
  kind: 'shortage' | 'flood' | 'treasury' | 'security';
  minister: string;
  title: string;
  description: string;
  resource?: Commodity;
  amount: number;
  cost: number;
  damage: number;
  createdAt: number;
  dueAt: number;
  status: 'open' | 'resolved' | 'expired';
  delayed?: boolean;
  alternativeUsed?: boolean;
  requested?: boolean;
  target?: string;
  region?: string;
};
export type WorldCrisisKind = 'energy' | 'food' | 'commodities' | 'recession';
export type WorldCrisis = {
  kind: WorldCrisisKind;
  title: string;
  description: string;
  startedAt: number;
  endsAt: number;
};
export type BankFacility = {
  principal: number;
  remaining: number;
  ends: number;
  spendingCaps: Record<string, number>;
  taxFloor: number;
  suspensionEnds: number;
};
export type Sanction = {
  from: string;
  to: string;
  ends: number;
  kind?: 'trade' | 'resource' | 'financial' | 'condemnation';
  resource?: Commodity;
};
export type TradeItem = { resource: Commodity; amount: number; timing: 'now' | 'annual' };
export const MONTHLY_DEMAND: Record<Commodity, number> = {
  oil: 0.85,
  gas: 0.7,
  agriculture: 1.4,
  iron: 0.8,
  timber: 0.3,
  rareEarths: 0.18,
  uranium: 0.04,
  gold: 0,
  copper: 0.15,
};
export const SHORTAGE_STAGES = [
  'Secure',
  'Prices rising',
  'Service interruptions',
  'Output falling',
  'Jobs at risk',
  'Public confidence falling',
];
export const EMPTY_FLOWS = (): FlowLedger => ({ imports: {}, exports: {}, received: 0, paid: 0 });
export function briefingSeconds(dueAt: number, activeMs: number) {
  return Math.max(0, Math.ceil((dueAt - activeMs) / 1000));
}
export type Supplier = { id: string; resource: Resource; surplus: number };
