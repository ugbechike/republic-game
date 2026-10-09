import type { Room, WorldCrisisKind, Resource } from '@republic/contracts';
import { notice } from './helpers';
const worlds = {
  energy: [
    'GLOBAL ENERGY CRISIS',
    'Oil and gas output falls 25%; scarce fuel earns producers 50% higher external prices. Importers must secure reliable contracts.',
  ],
  food: [
    'GLOBAL FOOD SHORTAGE',
    'Harvests and fishing fall 25%; food export prices rise 40%. Existing fixed-price agreements protect buyers.',
  ],
  commodities: [
    'COMMODITY CRASH',
    'Mining export prices fall 40%. Producers lose income; buyers can negotiate cheaper industrial supplies.',
  ],
  recession: [
    'GLOBAL RECESSION',
    'External export demand falls 25% and debt servicing rises. Trade alliances cushion the downturn.',
  ],
} as const;
export function worldEvent(room: Room, kind: WorldCrisisKind) {
  const now = room.activeMs ?? 0;
  room.worldCrisis = {
    kind,
    title: worlds[kind][0],
    description: worlds[kind][1],
    startedAt: now,
    endsAt: now + 180000,
  };
  room.nextWorldAt = now + 720000;
  notice(room, `${worlds[kind][0]}: ${worlds[kind][1]}`);
}
export function worldDirector(room: Room) {
  const now = room.activeMs ?? 0;
  if (room.worldCrisis && now >= room.worldCrisis.endsAt) {
    notice(room, `${room.worldCrisis.title} has eased. Production and markets are recovering.`);
    delete room.worldCrisis;
  }
  if (now >= (room.nextWorldAt ?? 720000) && !room.worldCrisis) {
    const kinds = Object.keys(worlds) as WorldCrisisKind[];
    worldEvent(room, kinds[Math.floor(now / 720000 - 1) % kinds.length]);
  }
}
export function marketFactor(room: Room, resource: Resource) {
  const k = room.worldCrisis?.kind;
  const energy = ['oil', 'gas'].includes(resource),
    food = ['agriculture', 'coastline', 'fisheries'].includes(resource),
    mining = ['iron', 'gold', 'rareEarths', 'uranium', 'copper'].includes(resource);
  return {
    production: (k === 'energy' && energy) || (k === 'food' && food) ? 0.75 : 1,
    price: k === 'energy' && energy ? 1.5 : k === 'food' && food ? 1.4 : k === 'commodities' && mining ? 0.6 : 1,
    demand: k === 'recession' ? 0.75 : 1,
  };
}
