export const RESOURCE_POINTS = 5;
export const DEFAULT_MIN_PLAYERS = 2;
export const RESOURCES = [
  'oil',
  'gas',
  'agriculture',
  'gold',
  'iron',
  'rareEarths',
  'timber',
  'coastline',
  'rivers',
  'uranium',
] as const;
export const TRADE_RESOURCES = [
  'oil',
  'gas',
  'agriculture',
  'gold',
  'iron',
  'rareEarths',
  'timber',
  'uranium',
] as const;
export type Resource = (typeof RESOURCES)[number];
export const RESOURCE_COST: Record<Resource, number> = {
  oil: 2,
  gas: 2,
  agriculture: 1,
  gold: 2,
  iron: 1,
  rareEarths: 3,
  timber: 1,
  coastline: 2,
  rivers: 1,
  uranium: 3,
};
export const RESOURCE_LABEL: Record<Resource, string> = {
  oil: 'Oil reserves',
  gas: 'Natural gas',
  agriculture: 'Fertile farmland',
  gold: 'Gold',
  iron: 'Iron ore',
  rareEarths: 'Rare earth minerals',
  timber: 'Timber',
  coastline: 'Large coastline',
  rivers: 'Major rivers',
  uranium: 'Uranium',
};
export type ResourceInfo = {
  tagline: string;
  opportunities: string[];
  risks: string[];
  color: string;
  production: number;
  exportPrice: number;
  extraction: number;
  energy: number;
  growth: number;
  influence: number;
};
