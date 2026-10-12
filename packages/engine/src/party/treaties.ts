import { fulfill } from './needs';
import { requirementBundle } from './inventory';
import {
  emptyInventory,
  PARTY_RULES,
  type PartyMatch,
  type PartyMeeting,
  type PartyPlayer,
  type PartyIntent,
} from '@republic/contracts';
import { requireThat } from '../helpers';
import { add, hasInventory, subtract, takeLots } from './inventory';
import { evaluate, validExchange } from './evaluator';
import { value, reconcileBargaining } from './scoring';
export function release(m: PartyMatch, meeting: PartyMeeting) {
  for (const [id, bundle] of Object.entries(meeting.escrow))
    add(
      m.players.find((p) => p.id === id)!,
      bundle,
    );
  meeting.escrow = {};
  meeting.signatures = [];
}
export function settle(m: PartyMatch, now: number) {
  for (const agreement of m.agreements) {
    if (agreement.status === 'settled' || agreement.dueAt > now) continue;
    const [a, b] = agreement.participants.map((id) => m.players.find((p) => p.id === id)!);
    add(a, agreement.terms.want);
    add(b, agreement.terms.offer);
    a.lots.push(...agreement.lots[b.id]);
    b.lots.push(...agreement.lots[a.id]);
    const balance = value(agreement.terms.want) - value(agreement.terms.offer);
    a.tradeBalance += balance;
    b.tradeBalance -= balance;
    reconcileBargaining(a, `${agreement.id}-settled`, now);
    reconcileBargaining(b, `${agreement.id}-settled`, now);
    agreement.status = 'settled';
    if (m.players.length === 2) {
      const canal = m.players.find((p) => p.role === 'canal')!;
      const need = canal.needs[0];
      if (need && ['open', 'late'].includes(need.status) && requirementBundle(canal, need.requirements))
        fulfill(m, canal, need.id, false, now);
    }
    m.news.unshift({
      id: `${agreement.id}-news`,
      at: now,
      text: `${a.name} and ${b.name} fulfill a signed agreement. Assets delivered.`,
    });
  }
}
export function proposal(
  m: PartyMatch,
  p: PartyPlayer,
  meeting: PartyMeeting,
  intent: Extract<PartyIntent, { kind: 'proposal' }>,
  now: number,
) {
  requireThat(meeting.revision === intent.revision, 'Terms changed. Review the latest revision.');
  const own = meeting.participants[0] === p.id ? meeting.terms.offer : meeting.terms.want;
  const incoming = meeting.participants[0] === p.id ? meeting.terms.want : meeting.terms.offer;
  if (intent.response === 'propose') {
    requireThat(meeting.status === 'open', 'This table is not open for proposals.');
    requireThat(
      validExchange(meeting.terms.offer, meeting.terms.want),
      'Add a meaningful exchange. The same asset cannot appear on both sides.',
    );
    requireThat(
      now + meeting.terms.delay * 1000 < m.endsAt,
      'There is not enough time for this commitment. Choose immediate delivery.',
    );
    subtract(p, own);
    meeting.escrow[p.id] = { ...own };
    meeting.proposer = p.id;
    meeting.status = 'proposed';
    meeting.expiresAt = Math.min(m.endsAt, now + PARTY_RULES.proposal);
  } else if (intent.response === 'accept') {
    requireThat(
      meeting.status === 'proposed' && meeting.proposer !== p.id,
      'Only the invited counterparty can accept.',
    );
    subtract(p, own);
    meeting.escrow[p.id] = { ...own };
    meeting.status = 'accepted';
  } else if (intent.response === 'counter' || intent.response === 'reject') {
    requireThat(['proposed', 'accepted'].includes(meeting.status), 'No proposal to respond to.');
    release(m, meeting);
    meeting.revision++;
    meeting.status = 'open';
    meeting.proposer = undefined;
  } else {
    requireThat(meeting.status === 'accepted', 'Both governments must accept these terms before signing.');
    requireThat(!meeting.signatures.includes(p.id), 'You already signed this revision.');
    requireThat(
      now + meeting.terms.delay * 1000 < m.endsAt,
      'Delivery would miss the end. Counter with immediate terms.',
    );
    meeting.signatures.push(p.id);
    if (meeting.signatures.length < 2) return;
    const [a, b] = meeting.participants.map((id) => m.players.find((r) => r.id === id)!);
    const evaluations = {
      [a.id]: evaluate(m, a, meeting.terms.offer, meeting.terms.want, meeting.terms.delay),
      [b.id]: evaluate(m, b, meeting.terms.want, meeting.terms.offer, meeting.terms.delay),
    };
    const agreement = {
      id: `${meeting.id}-signed`,
      meeting: meeting.id,
      participants: meeting.participants,
      terms: structuredClone(meeting.terms),
      signedAt: now,
      dueAt: now + meeting.terms.delay * 1000,
      status: 'scheduled' as const,
      evaluations,
      lots: { [a.id]: takeLots(a, meeting.terms.offer), [b.id]: takeLots(b, meeting.terms.want) },
    };
    requireThat(!m.agreements.some((d) => d.id === agreement.id), 'This agreement is already recorded.');
    m.agreements.push(agreement);
    meeting.evaluations = evaluations;
    meeting.escrow = {};
    meeting.status = 'signed';
    m.news.unshift({
      id: `${agreement.id}-signature`,
      at: now,
      text: `${a.name} and ${b.name} sign a binding treaty${meeting.terms.delay ? `; escrow delivers in ${meeting.terms.delay}s` : ''}.`,
    });
    settle(m, now);
  }
}
