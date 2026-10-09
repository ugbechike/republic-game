import { useState } from 'react';
import { RESOURCE_LABEL, TRADE_RESOURCES, type Commodity, type EconomicPoint } from '@republic/contracts';
import { EconomicChart } from './EconomicChart';
export function ResourceHistory({ points }: { points: EconomicPoint[] }) {
  const [resource, setResource] = useState<Commodity>('gas');
  const history = points
    .filter((p) => p.resources)
    .map((p) => ({
      month: p.month,
      annotations: p.annotations,
      production: p.resources?.[resource]?.production ?? 0,
      imports: p.resources?.[resource]?.imports ?? 0,
      exports: p.resources?.[resource]?.exports ?? 0,
    }));
  return (
    <section className="panel">
      <label>
        Resource flow history
        <select value={resource} onChange={(e) => setResource(e.target.value as Commodity)}>
          {TRADE_RESOURCES.map((k) => (
            <option key={k} value={k}>
              {RESOURCE_LABEL[k]}
            </option>
          ))}
        </select>
      </label>
      <EconomicChart
        title={`${RESOURCE_LABEL[resource]} · production and trade`}
        points={history}
        field="production"
        other="imports"
        third="exports"
        labels={['Production', 'Imports', 'Exports']}
      />
    </section>
  );
}
