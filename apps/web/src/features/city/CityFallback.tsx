import { useId } from 'react';
import type { Plot, Region } from '@republic/contracts';

function PlotBuilding({ plot: p, powered }: { plot: Plot; powered: boolean }) {
  const h = p.stage === 0 ? 2 : p.stage < 4 ? p.stage * 8 : p.kind === 'tower' ? 20 + p.height * 16 : 20;
  const x = 500 + (p.x - p.z) * 28,
    y = 350 + (p.x + p.z) * 14;
  const roof = p.kind === 'civic' ? '#b9cab8' : p.kind === 'factory' ? '#6b8582' : '#c09270';
  return (
    <g transform={`translate(${x} ${y})`}>
      <title>
        {p.kind} · {p.stage < 4 ? 'under construction' : 'completed'}
      </title>
      <path d="M-24 0 0-12 24 0 0 12Z" fill="#849a78" stroke="#607971" />
      {p.kind === 'farm' && p.stage === 4 ? (
        <g stroke="#d3c582" strokeWidth="3">
          {[-10, -4, 2, 8].map((n) => (
            <path key={n} d={`M${n - 10} ${n / 2} l24 -12`} />
          ))}
        </g>
      ) : (
        <>
          <path d={`M-17 0v-${h}l17 9V9Z`} fill={p.kind === 'civic' ? '#d6c9a3' : '#829a99'} />
          <path d={`M0 9V${9 - h}l17-9V0Z`} fill="#526e70" />
          <path d={`M-17 ${-h} 0 ${-h - 9} 17 ${-h} 0 ${9 - h}Z`} fill={roof} />
          {p.stage === 4 &&
            Array.from({ length: Math.max(1, Math.floor(h / 10)) }, (_, i) => (
              <g key={i} stroke={powered ? '#f2d392' : '#29464e'} strokeWidth="3">
                <path d={`M-13 ${-i * 10 - 4}l8 4M4 ${-i * 10}l8-4`} />
              </g>
            ))}
          {p.stage > 0 && p.stage < 4 && (
            <path d={`M22 5V${-h - 25}h-40m30 0v15`} stroke="#e0bb6e" strokeWidth="2" fill="none" />
          )}
          {p.kind === 'factory' && p.stage === 4 && (
            <>
              <path d={`M8 ${-h}v-22`} stroke="#b39982" strokeWidth="5" />
              {powered && (
                <g fill="#d3d7c9" opacity=".5">
                  <circle cx="8" cy={-h - 28} r="5" />
                  <circle cx="12" cy={-h - 38} r="7" />
                </g>
              )}
            </>
          )}
          {p.kind === 'civic' && p.stage === 4 && <path d={`M-9 ${-h - 4}a9 9 0 0 1 18 0Z`} fill="#83afa1" />}
        </>
      )}
    </g>
  );
}

export function CityFallback({ region, energy, approval }: { region: Region; energy: number; approval: number }) {
  const id = useId();
  return (
    <svg
      className="city-map-fallback"
      viewBox="0 0 1000 750"
      role="img"
      aria-label={`${region.name}: persistent city, ${region.flood ? 'flood damage, ' : ''}${energy < 45 ? 'power interruptions' : 'operating buildings'}`}
    >
      <defs>
        <linearGradient id={`${id}-sky`} x2="0" y2="1">
          <stop stopColor="#183943" />
          <stop offset="1" stopColor="#6e9693" />
        </linearGradient>
        <linearGradient id={`${id}-sea`} x2="1" y2="1">
          <stop stopColor="#254f5b" />
          <stop offset="1" stopColor="#3e7884" />
        </linearGradient>
      </defs>
      <rect width="1000" height="750" fill={`url(#${id}-sky)`} />
      <path
        d="M0 280 110 180 210 240 350 100 480 240 610 150 800 260 910 140 1000 210V750H0Z"
        fill="#42645f"
        opacity=".65"
      />
      <path d="M0 500 500 220 1000 500V750H0Z" fill={`url(#${id}-sea)`} />
      <path d="M100 355 500 150 900 355 500 565Z" fill="#688778" stroke="#a8af90" strokeWidth="12" />
      <path d="M110 362 500 565 890 362v22L500 590 110 384Z" fill="#445e59" />
      {[-4, -2, 0, 2, 4].map((n) => (
        <g key={n} stroke="#546968" strokeWidth="12">
          <path d={`M${500 + (n - 6) * 28} ${350 + (n + 6) * 14}l336-168`} />
          <path d={`M${500 + (-6 - n) * 28} ${350 + (-6 + n) * 14}l336 168`} />
        </g>
      ))}
      <path d="M332 434 668 266M332 266 668 434" stroke="#bdba99" strokeWidth="1" strokeDasharray="5 8" />
      {[120, 170, 210, 750, 800, 850].map((x, i) => (
        <g key={x} transform={`translate(${x} ${345 + (i % 3) * 16})`}>
          <path d="M0 0v-20" stroke="#6c7052" strokeWidth="3" />
          <ellipse cy="-23" rx="10" ry="15" fill="#3d6f59" />
        </g>
      ))}
      {[...region.plots]
        .sort((a, b) => a.x + a.z - b.x - b.z)
        .map((p) => (
          <PlotBuilding key={p.id} plot={p} powered={energy >= 45} />
        ))}
      {region.flood && (
        <g>
          <path d="M160 378 400 262 575 350 325 477Z" fill="#61afc6" opacity={0.25 + region.flood.severity * 0.45} />
          <path d="m220 405 45-22m18-9 36-18" stroke="#d8bf8b" strokeWidth="7" />
          <path d="m270 386 4-13 8 8-1-14" fill="none" stroke="#334c51" strokeWidth="3" />
          {[250, 280, 310].map((x) => (
            <path key={x} d={`M${x} 412l10-5`} stroke="#f5c665" strokeWidth="5" />
          ))}
          <rect x="325" y="418" width="15" height="9" rx="2" fill="#e9debb" />
          <rect x="330" y="414" width="5" height="4" fill="#ec9669" />
        </g>
      )}
      {approval < 35 && (
        <g>
          {Array.from({ length: 12 }, (_, i) => (
            <g key={i} transform={`translate(${473 + (i % 6) * 7} ${452 + Math.floor(i / 6) * 9})`}>
              <circle cy="-5" r="2" fill="#dab996" />
              <path d="M0-2v6" stroke="#c28c70" strokeWidth="3" />
              {i % 3 === 0 && <path d="M3 2v-12h6v4H3" stroke="#e7d9ad" strokeWidth="2" />}
            </g>
          ))}
        </g>
      )}
      <g fill="#e5ddbc">
        <path d="m710 520 25 12-24 4-14-10Z" />
        <path d="m735 570 17 8-16 3-10-7Z" />
      </g>
      <text x="500" y="655" textAnchor="middle" fill="#d5ddd0" fontSize="11" letterSpacing="3">
        {region.name.toUpperCase()} · PERSISTENT CITY
      </text>
    </svg>
  );
}
