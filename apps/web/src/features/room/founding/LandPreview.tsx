import { useId } from 'react';
import { RESOURCE_LABEL, type Resource } from '@republic/contracts';
import { LandSite } from './LandSites';
const locations: Record<Resource, [number, number]> = {
  oil: [205, 228],
  gas: [413, 200],
  gold: [179, 136],
  rareEarths: [424, 116],
  iron: [326, 127],
  agriculture: [310, 275],
  timber: [128, 205],
  coastline: [398, 333],
  rivers: [345, 230],
  uranium: [455, 253],
};
export function LandPreview({
  resources,
  name = 'Your Republic',
  labels = true,
}: {
  resources: Resource[];
  name?: string;
  labels?: boolean;
}) {
  const id = useId().replaceAll(':', '');
  const coast = resources.includes('coastline'),
    river = resources.includes('rivers');
  return (
    <div className="land-preview">
      <svg
        viewBox="0 0 620 420"
        role="img"
        aria-label={`${name}: ${resources.map((r) => RESOURCE_LABEL[r]).join(', ') || 'land awaiting your choices'}`}
      >
        <defs>
          <linearGradient id={`${id}-water`} x2="0" y2="1">
            <stop stopColor="#224b57" />
            <stop offset="1" stopColor="#102c37" />
          </linearGradient>
          <linearGradient id={`${id}-land`} x2="1" y2="1">
            <stop stopColor="#a2aa73" />
            <stop offset="1" stopColor="#4d785b" />
          </linearGradient>
        </defs>
        <rect width="620" height="420" rx="10" fill={`url(#${id}-water)`} />
        {[70, 150, 230, 310].map((y) => (
          <path key={y} d={`M0 ${y}L620 ${y + 150}`} stroke="#a0c2b910" />
        ))}
        <path
          d="M70 199L139 101L290 56L464 110L543 219L483 319L314 376L136 309Z"
          transform="translate(0 12)"
          fill="#455d4c"
        />
        <path
          d={
            coast
              ? 'M70 199L139 101L290 56L464 110L543 219L478 271L455 314L399 300L353 345L314 362L136 309Z'
              : 'M70 199L139 101L290 56L464 110L543 219L483 319L314 362L136 309Z'
          }
          fill={`url(#${id}-land)`}
          stroke="#b3ba872d"
          strokeWidth="3"
        />
        <path d="M165 135L204 60L244 131L261 87L300 144" fill="#8a967b" />
        <path d="M204 60L190 88L207 81L220 91Z" fill="#c8cbb0" />
        <path d="M369 113L408 59L451 131L469 91L505 161" fill="#6f8371" />
        <path d="M408 59L395 78L411 74L423 82Z" fill="#c4c6aa" />
        {river && (
          <path
            d="M272 81C222 145 390 136 356 190S267 246 346 276S364 335 346 354"
            fill="none"
            stroke="#78b6bd"
            strokeWidth="15"
            className="river-reveal"
          />
        )}
        <path
          d="M180 268L298 203L448 258M298 203L286 139M298 203L318 325"
          fill="none"
          stroke="#c8bc8b"
          strokeWidth="9"
        />
        <path d="M180 268L298 203L448 258M298 203L286 139" fill="none" stroke="#797c66" strokeWidth="5" />
        {Array.from({ length: 15 }, (_, i) => {
          const x = 256 + (i % 5) * 20,
            y = 183 + Math.floor(i / 5) * 18;
          return (
            <g key={i}>
              <path d={`M${x} ${y}l10 -5l8 5v${-18 - (i % 3) * 7}l-8 -5l-10 5Z`} fill={i % 3 ? '#bdc5a5' : '#e1d4ab'} />
              <path d={`M${x + 10} ${y - 5}v${-18 - (i % 3) * 7}l8 5v${18 + (i % 3) * 7}Z`} fill="#889d8e" />
            </g>
          );
        })}
        <path d="M277 238L311 218L338 233L306 252Z" fill="#e3d4a6" />
        <path d="M277 238V220L311 200L338 215V233L306 252V233Z" fill="#c7ba94" />
        <ellipse cx="307" cy="209" rx="16" ry="13" fill="#9fb48d" />
        <path d="M307 199V183" stroke="#e3c880" strokeWidth="2" />
        {resources.map((resource) => (
          <LandSite resource={resource} x={locations[resource][0]} y={locations[resource][1]} key={resource} />
        ))}
        {labels &&
          resources.map((resource) => {
            const [x, y] = locations[resource];
            return (
              <g key={resource} transform={`translate(${x - 45} ${y + 28})`} className="land-label">
                <rect width="100" height="21" rx="3" fill="#09212de8" stroke="#dabd7040" />
                <text x="50" y="14" textAnchor="middle" fill="#e9e5ce" fontSize="9">
                  {RESOURCE_LABEL[resource]}
                </text>
              </g>
            );
          })}
      </svg>
      <div className="land-preview-caption">
        <span className="live-dot" />{' '}
        {resources.length ? 'YOUR CHOICES ARE SHAPING THE LAND' : 'A NEW REPUBLIC BEGINS WITH YOU'}
      </div>
    </div>
  );
}
