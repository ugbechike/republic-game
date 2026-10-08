import { useState } from 'react';
import type { Policy, Republic, Action } from '@republic/contracts';
import { human } from './format';
const hints: Record<Policy, string> = { corporateTax: 'Revenue now, slower private growth later.', incomeTax: 'Fund the state at a cost to public approval.', education: 'Raises long-term productivity and employment.', healthcare: 'Improves population growth and public confidence.', infrastructure: 'Supports construction and resource production.', defence: 'Builds military strength; upkeep strains reserves.', energy: 'Reduces dependence on imported fuel.', social: 'Protects approval and supports agricultural regions.' };
function PolicyRow({ policy, r, send, busy }: { policy: Policy; r: Republic; send: (a: Action) => void; busy: boolean }) {
  const [value, setValue] = useState(r.policies[policy]);
  const pending = r.pendingPolicies.find(p => p.key === policy);
  return <div className="policy-row"><div><b>{human(policy)}</b><p className="muted small">{hints[policy]}</p></div><div className="policy-control"><input aria-label={human(policy)} type="range" min="0" max={policy.endsWith('Tax') ? 40 : 20} value={value} onChange={e => setValue(Number(e.target.value))} /><span>{value}{policy.endsWith('Tax') ? '%' : ''}</span><button disabled={busy || !!pending || value === r.policies[policy]} onClick={() => send({ type: 'policy', key: policy, value })}>{pending ? 'Pending' : 'Enact'}</button></div></div>;
}
export function Policies({ r, send, busy }: { r: Republic; send: (a: Action) => void; busy: boolean }) {
  return <section className="panel"><div className="section-label">THE DOMESTIC AGENDA <span>{r.capital.toFixed(0)} POLITICAL CAPITAL</span></div><h2 className="panel-title">Policy is a long game.</h2><p className="muted">Changes take three months. Each bill costs {r.house < 50 ? 12 : 5} political capital. Spending levels increase monthly expenditure.</p>{(Object.keys(r.policies) as Policy[]).map(policy => <PolicyRow key={policy} policy={policy} r={r} send={send} busy={busy} />)}</section>;
}
