import type { RoomView } from '@republic/contracts';
export const MAP_CENTRES = [
  [145, 155],
  [355, 130],
  [575, 140],
  [150, 335],
  [360, 330],
  [585, 340],
  [835, 180],
  [845, 375],
];
export function MapRelationships({ w }: { w: RoomView }) {
  const edges = [
    ...w.publicTrades.map((e) => ({ ...e, kind: 'trade' })),
    ...w.alliances.filter((a) => a.status === 'active').map((a) => ({ ...a, kind: 'alliance' })),
    ...w.wars.filter((a) => a.status === 'active').map((a) => ({ from: a.attacker, to: a.defender, kind: 'conflict' })),
    ...w.sanctions.filter((s) => s.ends > w.month).map((s) => ({ ...s, kind: 'sanction' })),
  ];
  return (
    <g aria-label="International relationships">
      {edges.map((e, i) => {
        const a = MAP_CENTRES[w.republics.findIndex((r) => r.id === e.from)],
          b = MAP_CENTRES[w.republics.findIndex((r) => r.id === e.to)];
        if (!a || !b) return null;
        const y = (a[1] + b[1]) / 2 - (e.kind === 'trade' ? 50 : e.kind === 'alliance' ? 30 : 70);
        return (
          <path
            key={`${e.kind}-${i}`}
            d={`M${a[0]},${a[1] - 24} Q${(a[0] + b[0]) / 2},${y} ${b[0]},${b[1] - 24}`}
            fill="none"
            stroke={
              e.kind === 'trade'
                ? '#e4c382'
                : e.kind === 'alliance'
                  ? '#76d5c8'
                  : e.kind === 'conflict'
                    ? '#ef857b'
                    : '#b6a0dc'
            }
            strokeWidth="3"
            strokeDasharray={e.kind === 'conflict' ? '0' : e.kind === 'sanction' ? '3 7' : '7 5'}
          >
            <title>{e.kind} relationship</title>
          </path>
        );
      })}
    </g>
  );
}
