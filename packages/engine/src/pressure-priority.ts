import type { Commodity, Republic, Room } from '@republic/contracts';
export function pressurePriority(room: Room, r: Republic, resource: Commodity, suppliers: Republic[]) {
  const f = r.economy!.supply[resource]!;
  const energy = ['oil', 'gas', 'uranium'].includes(resource);
  const recent = r.briefings?.at(-1)?.resource === resource;
  const allied = suppliers.some((s) =>
    room.alliances.some((a) => a.status === 'active' && [a.from, a.to].includes(s.id) && [a.from, a.to].includes(r.id)),
  );
  const contracted = room.deals.some(
    (d) =>
      d.status === 'active' &&
      [d.from, d.to].includes(r.id) &&
      [d.offer, d.want].some(
        (b) => (b.resource === resource && b.amount > 0) || b.items?.some((i) => i.resource === resource),
      ),
  );
  const stressed =
    (energy && r.metrics.energy < 50) ||
    (resource === 'agriculture' && r.metrics.approval < 45) ||
    (resource === 'iron' && r.metrics.infrastructure < 45);
  const recession = room.worldCrisis?.kind === 'recession' && r.metrics.debt > r.metrics.gdp * 0.6;
  return (
    f.stage * 3 +
    Math.max(0, 8 - f.coverage) +
    (suppliers.length ? 6 : 0) +
    (allied ? 1 : 0) +
    (stressed ? 3 : 0) +
    (recession ? 1 : 0) -
    (contracted && f.coverage > 3 ? 3 : 0) -
    (recent ? 5 : 0)
  );
}
export function briefingCadence(room: Room) {
  return room.month < 40 ? 210000 : room.month < 160 ? 180000 : 150000;
}
