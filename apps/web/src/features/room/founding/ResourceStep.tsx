import { useState, type CSSProperties } from 'react';
import { Check, Plus, ArrowUpRight, TriangleAlert } from 'lucide-react';
import {
  RESOURCE_POINTS,
  RESOURCE_COST,
  RESOURCE_LABEL,
  RESOURCE_INFO,
  type Draft,
  type Resource,
} from '@republic/contracts';
import { LandPreview } from './LandPreview';
import { ResourceIcon } from '../../../components/ResourceIcon';
export const CARD_ORDER: Resource[] = [
  'oil',
  'gas',
  'gold',
  'rareEarths',
  'iron',
  'agriculture',
  'timber',
  'coastline',
  'rivers',
  'uranium',
];
export function ResourceStep({ draft, setDraft }: { draft: Draft; setDraft: (d: Draft) => void }) {
  const [focus, setFocus] = useState<Resource>('oil'),
    [hint, setHint] = useState('');
  const used = draft.resources.reduce((n, r) => n + RESOURCE_COST[r], 0),
    info = RESOURCE_INFO[focus];
  function toggle(resource: Resource) {
    setFocus(resource);
    setHint('');
    if (draft.resources.includes(resource))
      setDraft({ ...draft, resources: draft.resources.filter((r) => r !== resource) });
    else if (used + RESOURCE_COST[resource] <= RESOURCE_POINTS)
      setDraft({ ...draft, resources: [...draft.resources, resource] });
    else
      setHint(
        `You need ${RESOURCE_COST[resource]} points for ${RESOURCE_LABEL[resource]}. Remove another choice to make room.`,
      );
  }
  return (
    <div className="land-step">
      <section>
        <div className="step-heading">
          <div>
            <span className="kicker">02 / CHOOSE YOUR LAND</span>
            <h1>THE WEALTH BENEATH YOUR SOIL.</h1>
            <p>Every advantage opens a door. Every advantage comes with a risk.</p>
          </div>
          <div className="points-counter">
            <b key={used}>
              {used}
              <span> / {RESOURCE_POINTS}</span>
            </b>
            <small>POINTS USED</small>
          </div>
        </div>
        <div className="resource-deck">
          {CARD_ORDER.map((resource, index) => {
            const selected = draft.resources.includes(resource),
              unavailable = !selected && used + RESOURCE_COST[resource] > RESOURCE_POINTS;
            return (
              <button
                type="button"
                key={resource}
                aria-label={`${RESOURCE_LABEL[resource]}, ${RESOURCE_COST[resource]} points`}
                aria-pressed={selected}
                aria-disabled={unavailable}
                className={`resource-card ${selected ? 'chosen' : ''} ${unavailable ? 'unaffordable' : ''}`}
                onClick={() => toggle(resource)}
                onFocus={() => setFocus(resource)}
                onMouseEnter={() => setFocus(resource)}
              >
                <div
                  className="resource-art"
                  style={{ '--art-x': `${(index % 5) * 25}%`, '--art-y': index < 5 ? '0%' : '100%' } as CSSProperties}
                />
                <span className="resource-choice">{selected ? <Check size={14} /> : <Plus size={14} />}</span>
                <div className="resource-card-label">
                  <ResourceIcon resource={resource} size={15} />
                  <b>{RESOURCE_LABEL[resource]}</b>
                  <small>
                    {RESOURCE_COST[resource]} {RESOURCE_COST[resource] === 1 ? 'point' : 'points'}
                  </small>
                </div>
              </button>
            );
          })}
        </div>
        <p className="resource-hint" role="status">
          {hint || `${RESOURCE_POINTS - used} points remaining. You can leave points unspent.`}
        </p>
        <div className="resource-inspect" key={focus}>
          <div className="inspect-title">
            <ResourceIcon resource={focus} size={27} />
            <div>
              <h3>{RESOURCE_LABEL[focus]}</h3>
              <p>{info.tagline}</p>
            </div>
          </div>
          <div className="tradeoff-columns">
            <div>
              <h4>
                <ArrowUpRight size={15} /> OPPORTUNITY
              </h4>
              {info.opportunities.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </div>
            <div>
              <h4>
                <TriangleAlert size={14} /> YOUR REPUBLIC NOW FACES
              </h4>
              {info.risks.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </div>
          </div>
        </div>
      </section>
      <aside className="founding-land">
        <span className="kicker">YOUR REPUBLIC TAKES SHAPE</span>
        <LandPreview resources={draft.resources} name={draft.name} />
        <h3>{draft.name || 'Your Republic'}</h3>
        <p>Resources change your production, exports and future crises. Geography cannot be traded away.</p>
        <div className="selected-resources">
          {draft.resources.map((r) => (
            <span key={r}>
              <ResourceIcon resource={r} size={14} />
              {RESOURCE_LABEL[r]}
            </span>
          ))}
        </div>
      </aside>
    </div>
  );
}
