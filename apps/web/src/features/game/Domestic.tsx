import { RESOURCE_LABEL, TRADE_RESOURCES, type RoomView, type Action } from '@republic/contracts';
import { ResourcePortfolio } from './ResourcePortfolio';
import { money, human } from './format';
export function Domestic({ w, send, busy }: { w: RoomView; send: (a: Action) => void; busy: boolean }) {
  const r = w.me,
    m = r.metrics;
  return (
    <div className="detail-grid">
      <ResourcePortfolio r={r} month={w.month} />
      <section className="panel">
        <div className="section-label">THE NATIONAL BALANCE SHEET</div>
        <h2 className="panel-title">Room to manoeuvre.</h2>
        <div className="metric-grid">
          {Object.entries(m).map(([k, v]) => (
            <div key={k}>
              <span>{human(k)}</span>
              <b>
                {['gdp', 'treasury', 'debt'].includes(k)
                  ? money(v)
                  : k === 'population'
                    ? `${v.toFixed(1)}M`
                    : `${v.toFixed(1)}${['inflation', 'unemployment', 'approval'].includes(k) ? '%' : ''}`}
              </b>
            </div>
          ))}
          <div>
            <span>GDP per capita</span>
            <b>${((m.gdp / m.population) * 1000).toFixed(0)}</b>
          </div>
        </div>
      </section>
      <section className="panel">
        <div className="section-label">STRATEGIC RESERVES</div>
        <h2 className="panel-title">No nation has everything.</h2>
        {TRADE_RESOURCES.map((k) => (
          <div className="stock-row" key={k}>
            <span>
              {RESOURCE_LABEL[k]} {r.resources.includes(k) && <small className="green">PRODUCER</small>}
            </span>
            <b>
              {r.stocks[k].toFixed(1)} <small>units</small>
            </b>
            <div className="bar">
              <i style={{ width: `${Math.min(100, (r.stocks[k] / 60) * 100)}%` }} />
            </div>
          </div>
        ))}
        <p className="muted small">
          Monthly demand scales with population and geography; exact flows and reserve runway appear above. Gold creates
          export revenue. Trade quantities are delivered monthly at 1/12 of their annual amount.
        </p>
      </section>
      <section className="panel">
        <div className="section-label">HOUSE OF REPRESENTATIVES</div>
        <h2 className="panel-title">{r.house >= 50 ? 'A working majority.' : 'An opposition House.'}</h2>
        <div className="house-bar">
          <i style={{ width: `${r.house}%` }} />
        </div>
        <div className="section-label">
          <span>GOVERNMENT {r.house}%</span>
          <span>OPPOSITION {100 - r.house}%</span>
        </div>
        <p className="muted">
          Elections every four years. You remain President; the House changes the political cost of your decisions.
        </p>
      </section>
      <section className="panel">
        <div className="section-label">GLOBAL INSTITUTIONS</div>
        <h2 className="panel-title">There is always a price.</h2>
        {(
          [
            [
              'development',
              'Global Development Bank',
              '$5B loan; infrastructure +5 in six months. Debt incurs monthly interest.',
            ],
            [
              'emergency',
              'Global Development Bank · Emergency Facility',
              '$5B emergency facility at 7% total interest. Requires reserves below $5B. Spending cut at least 8%, corporate tax +3; five-year caps and two-year infrastructure suspension.',
            ],
            ['dispute', 'World Trade Council', 'Spend $1B to open an Assembly vote to remove sanctions.'],
          ] as const
        ).map(([kind, name, hint]) => (
          <div className="institution" key={kind}>
            <h3>{name}</h3>
            <p className="muted small">{hint}</p>
            <button disabled={busy} onClick={() => send({ type: 'institution', kind })}>
              Request {kind === 'dispute' ? 'arbitration' : 'assistance'}
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
