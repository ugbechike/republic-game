import { FLAGS, RESOURCES, RESOURCE_COST, RESOURCE_LABEL, type Draft } from '@republic/contracts';
export function RepublicForm({ draft, setDraft }: { draft: Draft; setDraft: (d: Draft) => void }) {
  const points = draft.resources.reduce((n, r) => n + RESOURCE_COST[r], 0);
  return <div className="form-stack">
    <div className="form-row"><label>Republic name<input required minLength={2} maxLength={28} value={draft.name} placeholder="e.g. Solara" onChange={e => setDraft({ ...draft, name: e.target.value })} /></label>
      <label>President<input required minLength={2} maxLength={28} value={draft.leader} placeholder="Your name" onChange={e => setDraft({ ...draft, leader: e.target.value })} /></label></div>
    <label>Choose your standard</label><div className="flag-options">{FLAGS.map(flag => <button type="button" aria-label={`Flag ${flag}`} aria-pressed={draft.flag === flag} className={draft.flag === flag ? 'selected' : ''} onClick={() => setDraft({ ...draft, flag })} key={flag}>{flag}</button>)}</div>
    <div className="section-label">NATURAL ADVANTAGES <span>{points} / 4 POINTS</span></div>
    <div className="resource-options">{RESOURCES.map(resource => {
      const selected = draft.resources.includes(resource);
      return <button type="button" key={resource} aria-pressed={selected} disabled={!selected && points + RESOURCE_COST[resource] > 4} className={selected ? 'selected' : ''} onClick={() => setDraft({ ...draft, resources: selected ? draft.resources.filter(r => r !== resource) : [...draft.resources, resource] })}>{RESOURCE_LABEL[resource]} <small>{RESOURCE_COST[resource]}pt</small></button>;
    })}</div><p className="muted small">Energy and food keep your economy moving. What you lack, negotiate for.</p>
  </div>;
}
