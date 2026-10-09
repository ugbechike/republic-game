import type { Action, Meeting, Republic, Room } from '@republic/contracts';
import { notice, requireThat } from './helpers';
import { tradeAction } from './trade';
export function meetingProposal(room: Room, me: Republic, m: Meeting, a: Extract<Action, { type: 'meetingProposal' }>) {
  requireThat(m.revision === a.revision, 'The proposal changed. Review the current revision');
  if (a.response === 'propose') {
    requireThat(m.status === 'active', 'This table is not open for proposals');
    const { offer, want } = m.terms;
    requireThat(
      [offer, want].some((b) => b.money + b.amount + (b.items ?? []).reduce((n, i) => n + i.amount, 0) > 0),
      'Place money or resources on the table first',
    );
    m.status = 'proposed';
    m.proposedBy = me.id;
    m.signatures = [];
  } else if (a.response === 'accept') {
    requireThat(m.status === 'proposed' && m.proposedBy !== me.id, 'Only the other President can accept this proposal');
    m.status = 'agreed';
  } else if (a.response === 'counter' || a.response === 'reject') {
    requireThat(
      m.status === 'proposed' && m.proposedBy !== me.id,
      'Only the other President can respond to this proposal',
    );
    m.status = 'active';
    m.signatures = [];
    m.revision++;
    delete m.proposedBy;
    if (a.response === 'reject') {
      m.terms.offer = { money: 0, resource: 'oil', amount: 0, items: [] };
      m.terms.want = { money: 0, resource: 'oil', amount: 0, items: [] };
    }
  } else {
    requireThat(
      m.status === 'agreed' && !m.signatures.includes(me.id),
      'This revision is already signed or not agreed',
    );
    if (m.signatures.length + 1 === m.participants.length) {
      // Validate and settle on an isolated snapshot: failed funding or new sanctions must
      // never create a deal, move one side's assets, or consume the second signature.
      const settled = structuredClone(room);
      const from = settled.republics.find((r) => r.id === m.participants[0])!;
      const to = settled.republics.find((r) => r.id === m.participants[1])!;
      tradeAction(settled, from, { type: 'trade', to: to.id, ...m.terms, reason: `${m.agenda} · bilateral agreement` });
      const deal = settled.deals.at(-1)!;
      tradeAction(settled, to, { type: 'dealResponse', id: deal.id, accept: true });
      const signed = settled.meetings!.find((x) => x.id === m.id)!;
      signed.signatures.push(me.id);
      signed.status = 'signed';
      signed.dealId = deal.id;
      notice(settled, `${from.name} and ${to.name} signed a bilateral agreement.`);
      Object.assign(room, settled);
    } else m.signatures.push(me.id);
  }
  return true;
}
