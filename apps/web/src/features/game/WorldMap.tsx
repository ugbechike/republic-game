import { MapRelationships } from '../world/MapRelationships';
import type { RoomView } from '@republic/contracts';
import { FlagBanner } from '../../components/FlagBanner';
import { money } from './format';
const territories = [
  '55,85 200,40 270,115 235,235 80,230 25,160',
  '275,55 425,30 475,135 380,210 245,235 280,140',
  '480,65 625,40 720,135 630,230 480,200 435,140',
  '80,250 240,255 290,350 225,435 70,405 30,330',
  '255,255 385,230 470,270 445,420 285,440 310,345',
  '490,230 630,250 725,310 685,425 465,430',
  '740,100 880,75 930,200 850,280 740,235',
  '745,270 850,305 945,260 975,420 780,440 715,350',
];
const colors = ['#537c56', '#86544c', '#64648b', '#998546', '#427a81', '#907450', '#506b89', '#956284'];
export function WorldMap({ w, select }: { w: RoomView; select: (id: string) => void }) {
  return (
    <section className="world-map-panel">
      <span className="kicker">RIVALS. PARTNERS. OPPORTUNITIES.</span>
      <h2>THE WORLD AWAITS</h2>
      <p className="muted">
        The world is a web of promises. Select a territory or nameplate to open its public profile.
      </p>
      <svg
        viewBox={w.republics.length <= 2 ? '0 0 500 270' : '0 0 1000 490'}
        role="group"
        aria-label="Republic territories"
      >
        <defs>
          <pattern id="map-grid" width="35" height="35" patternUnits="userSpaceOnUse">
            <path d="M35 0H0V35" fill="none" stroke="#638a9320" />
          </pattern>
        </defs>
        <rect width="1000" height="490" fill="#103440" />
        <rect width="1000" height="490" fill="url(#map-grid)" />
        {w.republics.map((r, i) => (
          <g
            key={r.id}
            role="button"
            tabIndex={0}
            aria-label={`Open ${r.name} profile`}
            onClick={() => select(r.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                select(r.id);
              }
            }}
            className="map-territory"
          >
            <polygon points={territories[i]} fill={colors[i]} stroke="#e0cc9466" strokeWidth="2" />
            <text
              x={[145, 355, 575, 150, 360, 585, 835, 845][i]}
              y={[155, 130, 140, 335, 330, 340, 180, 375][i]}
              textAnchor="middle"
              fill="#f3ecd3"
              fontSize="20"
            >
              {r.name}
            </text>
          </g>
        ))}
        <MapRelationships w={w} />
      </svg>
      <div className="map-legend">
        <span>━ Trade routes</span>
        <span>━ Alliances</span>
        <span>━ Conflicts</span>
        <span>┄ Sanctions</span>
      </div>
      <div className="map-republics">
        {w.republics.map((r) => (
          <button key={r.id} onClick={() => select(r.id)}>
            <FlagBanner flag={r.flag} />
            <span>
              <b>{r.name}</b>
              <small>
                {money(r.gdp)} GDP · {r.id === w.playerId ? 'Your Republic' : `President ${r.leader}`}
              </small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
