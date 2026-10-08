import type { Room, RoomView } from '@republic/contracts';
export function view(room: Room, playerId: string, development: boolean): RoomView {
  const { players: _players, seed: _seed, republics, ...publicRoom } = room;
  return structuredClone({ ...publicRoom, playerId, development,
    republics: republics.map(r => ({ id: r.id, name: r.name, leader: r.leader, flag: r.flag, resources: r.resources, gdp: r.metrics.gdp, population: r.metrics.population, stability: r.metrics.stability, militaryEstimate: Math.round(r.metrics.military / 10) * 10, influence: r.influence, reputation: r.reputation, stats: r.stats })),
    me: republics.find(r => r.id === playerId)!,
    notices: room.notices.filter(n => !n.audience || n.audience.includes(playerId)),
    deals: room.deals.filter(d => d.from === playerId || d.to === playerId),
    loans: room.loans.filter(d => d.from === playerId || d.to === playerId),
    alliances: room.alliances.filter(a => a.status === 'active' || a.from === playerId || a.to === playerId),
  });
}
