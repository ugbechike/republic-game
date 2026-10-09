import { X, Shield, ArrowLeft, Handshake } from 'lucide-react';
import type { WorldController } from '../room/useWorld';
import type { OfficeArea } from './OfficeScene';
import { FlagBanner } from '../../components/FlagBanner';
import { OfficeInbox } from './OfficeInbox';
import { EconomicAnalysis } from '../economy/EconomicAnalysis';
import { Domestic } from '../game/Domestic';
import { Policies } from '../game/Policies';
import { Assembly } from '../game/Assembly';
import { Conflicts } from '../game/Conflict';
import { DirectorControls } from '../briefings/DirectorControls';
import { Crisis } from '../game/Crisis';
export function OfficeDossier({
  c,
  area,
  open,
  brief: setBrief,
  matter: setMatter,
  meetings,
  negotiate,
}: {
  c: WorldController;
  area: OfficeArea;
  open: (a: OfficeArea | undefined) => void;
  brief: (id: string) => void;
  matter: (id: string) => void;
  meetings: () => void;
  negotiate: (id: string) => void;
}) {
  const w = c.world!;
  return (
    <div className="office-sheet-backdrop">
      <section className={`office-sheet sheet-${area}`} role="dialog" aria-modal="true" aria-label={area}>
        <header>
          <span className="kicker">OFFICE OF THE PRESIDENT / {area.toUpperCase()}</span>
          <button aria-label="Close office dossier" onClick={() => open(undefined)}>
            <X size={20} />
          </button>
        </header>
        {area === 'inbox' && (
          <>
            <OfficeInbox
              w={w}
              brief={setBrief}
              matter={setMatter}
              foreign={() => {
                open(undefined);
                meetings();
              }}
            />
            <DirectorControls w={w} send={c.send} busy={c.busy} />
          </>
        )}
        {area === 'economy' && (
          <>
            <EconomicAnalysis w={w} />
            <Domestic w={w} send={c.send} busy={c.busy} />
          </>
        )}
        {area === 'cabinet' && (
          <>
            <h2>Your cabinet is assembled.</h2>
            <button className="cabinet-security" onClick={() => open('security')}>
              <Shield size={18} /> Security briefing <ArrowLeft size={16} />
            </button>
            <Policies r={w.me} send={c.send} busy={c.busy} />
            {w.me.crisis && <Crisis crisis={w.me.crisis} send={c.send} busy={c.busy} />}
          </>
        )}
        {area === 'security' && (
          <>
            <Conflicts w={w} send={c.send} busy={c.busy} />
            <Assembly w={w} send={c.send} busy={c.busy} />
            <button
              onClick={() => {
                open(undefined);
                meetings();
              }}
            >
              Open foreign policy
            </button>
          </>
        )}
        {area === 'foreign' && (
          <>
            <h2>The secure line is open.</h2>
            <p>Choose a President to begin a conversation.</p>
            {w.republics
              .filter((r) => r.id !== w.playerId)
              .map((r) => (
                <button
                  className="correspondence-letter"
                  key={r.id}
                  onClick={() => {
                    open(undefined);
                    negotiate(r.id);
                  }}
                >
                  <FlagBanner flag={r.flag} />
                  <span>
                    <b>{r.name}</b>
                    <small>President {r.leader}</small>
                  </span>
                  <Handshake />
                </button>
              ))}
          </>
        )}
      </section>
    </div>
  );
}
