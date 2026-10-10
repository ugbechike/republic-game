import type { PartyMatch, PartyView } from '@republic/contracts';
import { evaluate, referenceValues } from './evaluator';
export function partyView(m: PartyMatch, playerId: string, wallNow: number, online: Set<string>): PartyView {
  const { players, twistKind: _twist, offsetMs, ...rest } = m;
  const me = players.find((p) => p.id === playerId)!;
  return structuredClone({
    ...rest,
    serverNow: wallNow + offsetMs,
    me,
    reference: referenceValues(m),
    players: players.map(({ id, name, leader, emblem, ready, role, support, influence }) => ({
      id,
      name,
      leader,
      emblem,
      ready,
      role: m.stage === 'lobby' ? undefined : role,
      support,
      influence,
      online: online.has(id),
    })),
    meetings: m.meetings
      .filter((x) => x.participants.includes(playerId))
      .map((x) => ({
        ...x,
        evaluations: x.evaluations ?? {
          [playerId]: evaluate(
            m,
            me,
            x.participants[0] === playerId ? x.terms.offer : x.terms.want,
            x.participants[0] === playerId ? x.terms.want : x.terms.offer,
            x.terms.delay,
          ),
        },
      })),
    agreements: m.agreements.filter((x) => x.participants.includes(playerId)),
  });
}
