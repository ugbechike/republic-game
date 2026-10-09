import { useEffect, useState } from 'react';
import { Users, TrendingUp, Landmark, Scale, TriangleAlert } from 'lucide-react';
import { RESOURCE_INFO, RESOURCE_LABEL, type Draft, type RepublicPreview, type Room } from '@republic/contracts';
import type { RepublicClient } from '@republic/api-client';
import { FlagBanner } from '../../../components/FlagBanner';
import { ResourceIcon } from '../../../components/ResourceIcon';
import { LandPreview } from './LandPreview';
export function RepublicReveal({
  draft,
  options,
  client,
  onReady,
}: {
  draft: Draft;
  options: Room['options'];
  client: RepublicClient;
  onReady: (ready: boolean) => void;
}) {
  const [preview, setPreview] = useState<RepublicPreview>(),
    [error, setError] = useState('');
  useEffect(() => {
    const abort = new AbortController();
    onReady(false);
    setError('');
    client
      .preview(draft, undefined, abort.signal)
      .then((result) => {
        setPreview(result);
        onReady(true);
      })
      .catch((e) => {
        if (!abort.signal.aborted) setError(e.message);
      });
    return () => abort.abort();
  }, [client, draft, onReady]);
  return (
    <section className="republic-reveal">
      <div className="reveal-heading">
        <FlagBanner flag={draft.flag} />
        <div>
          <span className="kicker">04 / A NEW CHAPTER BEGINS</span>
          <h1>THE REPUBLIC OF {draft.name.toUpperCase()}</h1>
          <p>President {draft.leader} · Founding President</p>
        </div>
      </div>
      <div className="reveal-grid">
        <LandPreview resources={draft.resources} name={draft.name} />
        <div className="reveal-summary">
          <h3>YOUR STARTING POSITION</h3>
          {error ? (
            <p role="alert" className="error">
              {error} Go back and try the review again.
            </p>
          ) : !preview ? (
            <div className="preview-loading">
              <div className="spinner" />
              Preparing your Republic…
            </div>
          ) : (
            <div className="reveal-stats">
              {[
                [Users, 'Population', `${preview.metrics.population.toFixed(1)}M`],
                [TrendingUp, 'GDP', `$${preview.metrics.gdp.toFixed(1)}B`],
                [Landmark, 'Treasury', `$${preview.metrics.treasury.toFixed(1)}B`],
                [Scale, 'Debt', `$${preview.metrics.debt.toFixed(1)}B`],
              ].map(([Icon, label, value]) => {
                const Glyph = Icon as typeof Users;
                return (
                  <div key={String(label)}>
                    <Glyph size={23} />
                    <span>
                      {String(label)}
                      <b>{String(value)}</b>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <h3>NATURAL STRENGTHS</h3>
          <div className="selected-resources">
            {draft.resources.map((r) => (
              <span key={r}>
                <ResourceIcon resource={r} size={16} />
                {RESOURCE_LABEL[r]}
              </span>
            ))}
          </div>
          <h3>NATIONAL RISKS</h3>
          <div className="reveal-risks">
            {draft.resources
              .flatMap((r) => RESOURCE_INFO[r].risks)
              .map((risk) => (
                <span key={risk}>
                  <TriangleAlert size={13} />
                  {risk}
                </span>
              ))}
          </div>
        </div>
      </div>
      <p className="reveal-pledge">
        A stronger people. A brighter tomorrow.<span>— President {draft.leader}</span>
      </p>
    </section>
  );
}
