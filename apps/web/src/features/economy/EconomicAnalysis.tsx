import { RESOURCE_LABEL, SHORTAGE_STAGES, TRADE_RESOURCES, type RoomView } from '@republic/contracts';
import { ResourceHistory } from './ResourceHistory';
import { EconomicChart } from './EconomicChart';
export function EconomicAnalysis({ w }: { w: RoomView }) {
  const e = w.me.economy,
    points = e?.timeline ?? [];
  return (
    <section className="economic-analysis">
      <h2>WHY YOUR ECONOMY IS MOVING</h2>
      <p className="muted">
        Monthly flows and recorded outcomes. Hover event markers for context; the event log below provides the same
        annotations in text.
      </p>
      <div className="economic-charts">
        {(
          [
            ['GDP', 'gdp', undefined, 'B'],
            ['Revenue vs expenditure', 'revenue', 'expenditure', 'B'],
            ['National debt', 'debt', undefined, 'B'],
            ['Inflation', 'inflation', undefined, '%'],
            ['Unemployment', 'unemployment', undefined, '%'],
            ['Energy delivered vs demand', 'energySupply', 'energyDemand', ''],
            ['Food delivered vs demand', 'foodSupply', 'foodDemand', ''],
            ['Trade cash balance', 'tradeBalance', undefined, 'B'],
          ] as const
        ).map(([title, field, other, unit]) => (
          <EconomicChart key={field} title={title} field={field} other={other} unit={unit} points={points} />
        ))}
      </div>
      <ResourceHistory points={points} />
      <h3>SUPPLY & DEMAND · UNITS PER MONTH</h3>
      <div className="supply-table">
        <table>
          <thead>
            <tr>
              {['Resource', 'Production', 'Demand', 'Imports', 'Exports', 'Reserves', 'Runway', 'Pressure'].map((x) => (
                <th key={x}>{x}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TRADE_RESOURCES.map((k) => {
              const f = e?.supply[k];
              return (
                <tr key={k}>
                  <th>{RESOURCE_LABEL[k]}</th>
                  <td>{f?.production.toFixed(2) ?? '—'}</td>
                  <td>{f?.consumption.toFixed(2) ?? '—'}</td>
                  <td>{f?.imports.toFixed(2) ?? '—'}</td>
                  <td>{f?.exports.toFixed(2) ?? '—'}</td>
                  <td>{w.me.stocks[k].toFixed(2)}</td>
                  <td>{f ? (f.coverage >= 999 ? 'Covered' : `${f.coverage.toFixed(1)} mo`) : '—'}</td>
                  <td className={f?.stage ? 'pressure-text' : ''}>{SHORTAGE_STAGES[f?.stage ?? 0]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="economy-explanations">
        <section className="panel">
          <h3>LATEST MONTH · EXPLAINED CHANGES</h3>
          {['gdp', 'approval', 'treasury', 'energy', 'inflation', 'unemployment', 'debt'].map((metric) => (
            <details key={metric}>
              <summary>
                {metric.toUpperCase()}{' '}
                {e?.causes
                  .filter((c) => c.metric === metric)
                  .reduce((n, c) => n + c.amount, 0)
                  .toFixed(2) ?? '0'}{' '}
                net
              </summary>
              {e?.causes
                .filter((c) => c.metric === metric)
                .map((c, i) => (
                  <p className="small" key={i}>
                    {c.amount > 0 ? '+' : ''}
                    {c.amount.toFixed(3)} · {c.reason}
                  </p>
                ))}
            </details>
          ))}
        </section>
        <section className="panel">
          <h3>EVENT ANNOTATIONS</h3>
          {points
            .filter((p) => p.annotations.length)
            .slice(-8)
            .reverse()
            .map((p) => (
              <article key={p.month}>
                <small>Month {p.month}</small>
                {p.annotations.map((a, i) => (
                  <p className="small muted" key={i}>
                    {a}
                  </p>
                ))}
              </article>
            ))}
          {!points.length && <p className="muted">The first monthly report is being prepared.</p>}
        </section>
      </div>
      {w.me.bankFacility && (
        <div className="error">
          Emergency facility: ${w.me.bankFacility.remaining.toFixed(2)}B remaining. Corporate tax floor{' '}
          {w.me.bankFacility.taxFloor}%. Spending caps binding. Infrastructure suspension:{' '}
          {Math.max(0, w.me.bankFacility.suspensionEnds - w.month)} months.
        </div>
      )}
    </section>
  );
}
