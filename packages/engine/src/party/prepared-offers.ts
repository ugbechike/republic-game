import { emptyInventory, type PartyMatch, type PartyPlayer, type PartyMeeting } from '@republic/contracts';
import { requireThat } from '../helpers';
import { subtract } from './inventory';
export function prepareOffer(m: PartyMatch, p: PartyPlayer, meeting: PartyMeeting, purpose: 'passage' | 'assistance') {
  const other = m.players.find((x) => x.id === meeting.participants[1])!;
  requireThat(
    m.players.length === 2 && [p.role, other.role].includes('oil') && [p.role, other.role].includes('canal'),
    'This scenario offer requires Oil and Canal.',
  );
  const oilGives = { ...emptyInventory(), ...(purpose === 'passage' ? { oil: 2 } : { credits: 4 }) };
  const canalGives = { ...emptyInventory(), passage: purpose === 'passage' && !m.canal?.emergency ? 3 : 2 };
  meeting.terms = {
    offer: p.role === 'oil' ? oilGives : canalGives,
    want: p.role === 'oil' ? canalGives : oilGives,
    delay: 0,
  };
  meeting.purpose = purpose === 'passage' ? 'CANAL ACCESS NEGOTIATION' : 'CANAL REPAIR ASSISTANCE';
  subtract(p, meeting.terms.offer);
  meeting.escrow[p.id] = { ...meeting.terms.offer };
  meeting.proposer = p.id;
  meeting.revision = 1;
}
