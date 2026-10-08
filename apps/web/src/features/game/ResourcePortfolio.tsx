import { RESOURCE_INFO, RESOURCE_LABEL, type Republic } from '@republic/contracts';
import { ResourceIcon } from '../../components/ResourceIcon';
export function ResourcePortfolio({ r, month }: { r: Republic; month: number }) {
  return (
    <section className="panel resource-portfolio">
      <div className="section-label">YOUR LAND · OPPORTUNITIES & RISKS</div>
      {r.resources.map((resource) => (
        <article key={resource}>
          <h3>
            <ResourceIcon resource={resource} size={18} />
            {RESOURCE_LABEL[resource]}
          </h3>
          <p className="muted small">{RESOURCE_INFO[resource].opportunities.join(' · ')}</p>
          <p className="small">Risks: {RESOURCE_INFO[resource].risks.join(' · ')}</p>
          {r.disruptions
            ?.filter((d) => d.resource === resource && d.ends > month)
            .map((d) => (
              <p className="error small" key={d.ends}>
                Output reduced by 50% for {d.ends - month} more months.
              </p>
            ))}
        </article>
      ))}
    </section>
  );
}
