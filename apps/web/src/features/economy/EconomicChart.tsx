type Point = { month: number; annotations: string[] };
export function EconomicChart<T extends Point>({
  title,
  points,
  field,
  other,
  unit = '',
  third,
  labels,
}: {
  title: string;
  points: T[];
  field: Exclude<keyof T, 'annotations' | 'resources'>;
  other?: Exclude<keyof T, 'annotations' | 'resources'>;
  unit?: string;
  third?: Exclude<keyof T, 'annotations' | 'resources'>;
  labels?: string[];
}) {
  const values = points.flatMap((p) => [
      Number(p[field]),
      ...(other ? [Number(p[other])] : []),
      ...(third ? [Number(p[third])] : []),
    ]),
    low = Math.min(0, ...values),
    high = Math.max(1, ...values),
    span = high - low;
  const path = (key: typeof field) =>
    points
      .map(
        (p, i) => `${28 + (i / Math.max(1, points.length - 1)) * 410},${130 - ((Number(p[key]) - low) / span) * 105}`,
      )
      .join(' ');
  return (
    <article className="economic-chart">
      <h3>{title}</h3>
      <b>
        {points.length ? Number(points.at(-1)![field]).toFixed(2) : '—'}
        {unit}
      </b>
      <svg viewBox="0 0 460 160" role="img" aria-label={`${title}, ${points.length} monthly observations`}>
        <path d="M28 20V130H440" fill="none" stroke="#ffffff30" />
        <text x="2" y="20">
          {high.toFixed(0)}
        </text>
        <text x="2" y="133">
          {low.toFixed(0)}
        </text>
        <polyline points={path(field)} fill="none" stroke="#e5c683" strokeWidth="2" />
        {other && <polyline points={path(other)} fill="none" stroke="#77c8b9" strokeWidth="2" />}
        {third && <polyline points={path(third)} fill="none" stroke="#b3a0df" strokeWidth="2" />}
        {points.map((p, i) =>
          p.annotations.length > 0 ? (
            <circle
              key={p.month}
              cx={28 + (i / Math.max(1, points.length - 1)) * 410}
              cy={130 - ((Number(p[field]) - low) / span) * 105}
              r="3"
              fill="#e1a08d"
            >
              <title>
                Month {p.month}: {p.annotations.join(' · ')}
              </title>
            </circle>
          ) : null,
        )}
        <text x="28" y="151">
          Month {points[0]?.month ?? 0}
        </text>
        <text x="385" y="151">
          {points.at(-1)?.month ?? 0}
        </text>
      </svg>
      {other && (
        <small>
          <i className="gold-key" />
          {labels?.[0] ?? String(field)} <i className="green-key" />
          {labels?.[1] ?? String(other)}
          {third && <> · {labels?.[2] ?? String(third)} (violet)</>}
        </small>
      )}
    </article>
  );
}
