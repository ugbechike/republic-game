import { partyView } from './party/view';
import type { Room, RoomView } from '@republic/contracts';
export function view(room: Room, playerId: string, development: boolean, online = new Set<string>()): RoomView {
  const { players: _players, seed: _seed, republics, ...publicRoom } = room;
  return structuredClone({
    ...publicRoom,
    party: room.party ? partyView(room.party, playerId, Date.now(), online) : undefined,
    meetings: room.meetings?.filter((m) => m.participants.includes(playerId)),
    playerId,
    development,
    republics: republics.map((r) => ({
      id: r.id,
      name: r.name,
      leader: r.leader,
      flag: r.flag,
      resources: r.resources,
      gdp: r.metrics.gdp,
      population: r.metrics.population,
      stability: r.metrics.stability,
      militaryEstimate: Math.round(r.metrics.military / 10) * 10,
      influence: r.influence,
      reputation: r.reputation,
      stats: r.stats,
      landscape: { regions: r.regions, energy: r.metrics.energy, approval: r.metrics.approval },
      credit: r.credit ?? 70,
      market: Object.fromEntries(
        Object.entries(r.economy?.supply ?? {}).map(([k, f]) => [
          k,
          Math.round(Math.max(0, f.production - f.consumption) * 10) / 10,
        ]),
      ),
    })),
    publicTrades: room.deals.filter((d) => d.status === 'active').map((d) => ({ from: d.from, to: d.to })),
    me: republics.find((r) => r.id === playerId)!,
    notices: room.notices.filter((n) => !n.audience || n.audience.includes(playerId)),
    deals: room.deals.filter((d) => d.from === playerId || d.to === playerId),
    loans: room.loans.filter((d) => d.from === playerId || d.to === playerId),
    alliances: room.alliances.filter((a) => a.status === 'active' || a.from === playerId || a.to === playerId),
  });
}
