import { RESOURCE_LABEL, type Bundle, type Meeting, type RoomView } from '@republic/contracts';
import { FlagBanner } from '../../components/FlagBanner';
import { ResourceIcon } from '../../components/ResourceIcon';
import { Plus, PenLine, Check } from 'lucide-react';
function Contribution({ bundle }: { bundle: Bundle }) {
  const items = [
    ...(bundle.amount ? [{ resource: bundle.resource, amount: bundle.amount, timing: 'annual' as const }] : []),
    ...(bundle.items ?? []).filter((i) => i.amount > 0),
  ];
  return (
    <div className="table-contribution">
      {bundle.money > 0 && (
        <div className="table-term">
          <span className="money-token">$</span>
          <span>
            <b>${bundle.money.toFixed(2)}B</b>
            <small>{bundle.moneyTiming === 'annual' ? 'Each year' : 'Immediate payment'}</small>
          </span>
        </div>
      )}
      {items.map((i, n) => (
        <div className="table-term" key={n}>
          <ResourceIcon resource={i.resource} size={24} />
          <span>
            <b>
              {i.amount}M {RESOURCE_LABEL[i.resource]}
            </b>
            <small>{i.timing === 'now' ? 'Immediate delivery' : 'Per year'}</small>
          </span>
        </div>
      ))}
      {!bundle.money && !items.length && (
        <p className="empty-table">
          An open hand.
          <br />
          <small>No contribution placed yet.</small>
        </p>
      )}
    </div>
  );
}
export function NegotiationTable({ m, w, edit }: { m: Meeting; w: RoomView; edit: (side: 'offer' | 'want') => void }) {
  return (
    <div className={`negotiation-table status-${m.status}`}>
      {(['offer', 'want'] as const).map((side, index) => {
        const r = w.republics.find((r) => r.id === m.participants[index])!;
        return (
          <section className="president-seat" key={side}>
            <div className="table-nameplate">
              <FlagBanner flag={r.flag} />
              <span>
                <b>{r.name}</b>
                <small>PRESIDENT {r.leader.toUpperCase()}</small>
              </span>
              <i
                className={m.joined.includes(r.id) ? 'seat-present' : 'seat-absent'}
                aria-label={m.joined.includes(r.id) ? 'Joined' : 'Invited'}
              />
            </div>
            <div className="treaty-leaf">
              <span className="kicker">{r.name.toUpperCase()} WILL PROVIDE</span>
              <Contribution bundle={m.terms[side]} />
              {m.status === 'active' && (
                <button className="add-table-term" onClick={() => edit(side)}>
                  <Plus size={16} /> ADD / EDIT OFFER
                </button>
              )}
              {['agreed', 'signed'].includes(m.status) && (
                <div className={`treaty-signature ${m.signatures.includes(r.id) ? 'signed' : ''}`}>
                  <PenLine size={18} />
                  <span>{m.signatures.includes(r.id) ? r.leader : 'Awaiting signature'}</span>
                  {m.signatures.includes(r.id) && <Check size={20} />}
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
