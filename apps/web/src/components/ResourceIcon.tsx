import { Fuel, Flame, Wheat, Gem, Pickaxe, CircuitBoard, Trees, Anchor, Waves, Radiation } from 'lucide-react';
import type { Resource } from '@republic/contracts';
const icons = {
  oil: Fuel,
  gas: Flame,
  agriculture: Wheat,
  gold: Gem,
  iron: Pickaxe,
  rareEarths: CircuitBoard,
  timber: Trees,
  coastline: Anchor,
  rivers: Waves,
  uranium: Radiation,
};
export function ResourceIcon({ resource, size = 18 }: { resource: Resource; size?: number }) {
  const Icon = icons[resource];
  return <Icon size={size} aria-hidden="true" />;
}
