import type { Resource } from './resources';
export type ResourceQuality = 'Small' | 'Moderate' | 'Large' | 'Exceptional';
export type Deposit = { id: string; resource: Resource; quality: ResourceQuality; owner?: string };
export type WorldDraft = {
  deposits: Deposit[];
  order: string[];
  turn: number;
  rounds: number;
  deadline: number;
  remainingMs?: number;
  ready: string[];
  complete: boolean;
};
export const QUALITY_FACTOR: Record<ResourceQuality, number> = {
  Small: 0.88,
  Moderate: 1,
  Large: 1.12,
  Exceptional: 1.22,
};
export function draftPresident(d: WorldDraft) {
  const round = Math.floor(d.turn / d.order.length),
    position = d.turn % d.order.length;
  return d.order[round % 2 ? d.order.length - 1 - position : position];
}
