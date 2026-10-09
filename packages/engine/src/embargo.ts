import type { Commodity, Room } from '@republic/contracts';
export function embargo(room: Room, from: string, to: string, resources: Commodity[] = [], financial = false) {
  return room.sanctions.some(
    (s) =>
      s.ends > room.month &&
      [from, to].includes(s.from) &&
      [from, to].includes(s.to) &&
      ((s.kind ?? 'trade') === 'trade' ||
        (s.kind === 'resource' && !!s.resource && resources.includes(s.resource)) ||
        (s.kind === 'financial' && financial)),
  );
}
