import type { Resource } from '@republic/contracts';
export function LandSite({ resource, x, y }: { resource: Resource; x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} className="land-site">
      {resource === 'agriculture' ? (
        <g>
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={i}
              d={`M${-40 + i * 12},-8 l32,17 l-12,7 l-32,-17z`}
              fill={i % 2 ? '#d9b769' : '#7f9a53'}
              stroke="#d0c17f"
              strokeWidth="1"
            />
          ))}
        </g>
      ) : resource === 'oil' ? (
        <g stroke="#343b34" strokeWidth="5" fill="none">
          <path d="M-20 17 L-7 -25 L8 16 M-11 -14 L16 -31 M-24 -21 L13 -36 L28 -24 M22 -23 L22 12" />
          <ellipse cx="20" cy="16" rx="19" ry="7" fill="#a8a996" strokeWidth="2" />
        </g>
      ) : resource === 'coastline' ? (
        <g fill="#c4b48a">
          <path d="M-40 -8L24 10L18 18L-47 0Z" />
          <path d="M-23 -5L-30 28L-23 30L-16 -3Z" />
          <path d="M-3 2L-10 34L-3 36L4 4Z" />
          <path d="M23 8L16 40L23 42L30 10Z" />
          <path d="M-10 12L16 20L24 16L-4 7Z" fill="#f1e3ba" />
          <path d="M9 -3L9 -31L33 -21L33 -6" fill="none" stroke="#d0a960" strokeWidth="3" />
        </g>
      ) : resource === 'timber' ? (
        <g>
          {[-23, 0, 22].map((x, i) => (
            <g transform={`translate(${x} ${(i % 2) * 8})`} key={x}>
              <path d="M0 -30L-17 4H17Z" fill="#365d43" />
              <path d="M0 -18L-20 14H20Z" fill="#557b50" />
              <path d="M0 10V23" stroke="#7a6546" strokeWidth="5" />
            </g>
          ))}
        </g>
      ) : resource === 'rivers' ? (
        <g>
          <path d="M-28 -10L30 10L30 24L-28 4Z" fill="#9dafa7" />
          <path d="M-22 -7L-22 8M-8 -2L-8 13M7 3L7 18M22 7L22 23" stroke="#d4d9c3" strokeWidth="5" />
        </g>
      ) : resource === 'uranium' ? (
        <g>
          {[-15, 15].map((x) => (
            <path
              key={x}
              transform={`translate(${x} 0)`}
              d="M-12 17Q-5 -8 -8 -22L9 -22Q5 -8 15 17Z"
              fill="#aeb8a4"
              stroke="#6d8b7c"
            />
          ))}
          <ellipse cy="20" rx="37" ry="9" fill="#7a907c" />
          <path
            d="M-16 -28Q-30 -50 -11 -63M16 -26Q35 -45 17 -55"
            stroke="#d6deca"
            strokeWidth="8"
            fill="none"
            opacity=".5"
          />
        </g>
      ) : resource === 'gas' ? (
        <g fill="#a7b6a8">
          <rect x="-30" y="-10" width="60" height="28" rx="8" />
          <path d="M-23 -4V-30M-5 -4V-35M13 -4V-28" stroke="#c2c8ae" strokeWidth="8" />
          <path d="M32 15V-43" stroke="#675f48" strokeWidth="4" />
          <path d="M30 -43Q20 -58 32 -67Q44 -52 30 -43" fill="#efb564" />
        </g>
      ) : (
        <g>
          <path
            d="M-40 16L-18 -23L5 -37L39 16Z"
            fill={resource === 'iron' ? '#93664f' : resource === 'gold' ? '#a48c54' : '#777a91'}
          />
          <path d="M-23 11L0 -16L23 11Z" fill="#39463f" />
          <path d="M-13 11L0 -6L12 11Z" fill="#242f2e" />
          <path d="M-11 17L9 17L32 34L10 35Z" fill="#b5a474" />
          <path d="M13 -25L26 -12L3 -18Z" fill={resource === 'gold' ? '#f1cb6c' : '#b4c5c4'} />
        </g>
      )}
    </g>
  );
}
