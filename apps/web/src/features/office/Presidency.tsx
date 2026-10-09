import { useState } from 'react';
import { Building2, Globe2, Landmark, Handshake, X, LogOut, ArrowLeft, Shield } from 'lucide-react';
import type { Commodity } from '@republic/contracts';
import type { WorldController } from '../room/useWorld';
import { FlagBanner } from '../../components/FlagBanner';
import { OfficeScene, type OfficeArea } from './OfficeScene';
import { ChiefOfStaff } from './ChiefOfStaff';
import { OfficeInbox } from './OfficeInbox';
import { MatterDetail } from './MatterDetail';
import { BriefingDetail } from '../briefings/BriefingDetail';
import { EconomicAnalysis } from '../economy/EconomicAnalysis';
import { Domestic } from '../game/Domestic';
import { Policies } from '../game/Policies';
import { Diplomacy } from '../game/Diplomacy';
import { Assembly } from '../game/Assembly';
import { Conflicts } from '../game/Conflict';
import { DirectorControls } from '../briefings/DirectorControls';
import { Crisis } from '../game/Crisis';
import { WorldMap } from '../game/WorldMap';
import { RepublicVisit } from './RepublicVisit';
export function Presidency({ controller: c }: { controller: WorldController }) {
  const w = c.world!;
  const [view, setView] = useState('office'),
    [area, open] = useState<OfficeArea>(),
    [brief, setBrief] = useState<string>(),
    [matter, setMatter] = useState<string>();
  const [region, setRegion] = useState(w.me.regions[0].id),
    [selected, select] = useState(w.republics.find((r) => r.id !== w.playerId)?.id ?? w.playerId),
    [need, setNeed] = useState<Commodity>();
  const count =
    (w.me.briefings ?? []).filter((b) => b.status === 'open').length +
    (w.me.officeMatters ?? []).filter((m) => m.status === 'open').length;
  const chosenMatter = w.me.officeMatters?.find((m) => m.id === matter);
  function visit(id?: string) {
    if (id) setRegion(id);
    setView('republic');
    open(undefined);
    setMatter(undefined);
    setBrief(undefined);
  }
  function navigate(next: string) {
    setView(next);
    open(undefined);
  }
  function negotiate(id: string, resource?: Commodity) {
    select(id);
    setNeed(resource);
    setBrief(undefined);
    setView('meetings');
  }
  return (
    <main className={`presidency view-${view}`}>
      {view === 'office' && (
        <OfficeScene w={w} open={open} world={() => navigate('world')} republic={() => visit()} urgent={count} />
      )}
      {view === 'republic' && (
        <RepublicVisit w={w} regionId={region} select={setRegion} back={() => navigate('office')} />
      )}
      <header className="presidency-header">
        <button className="presidency-brand" onClick={() => navigate('office')}>
          <FlagBanner flag={w.me.flag} />
          <span>
            {w.me.name}
            <small>THE PRESIDENCY</small>
          </span>
        </button>
        <div className="presidential-vitals">
          <button onClick={() => open('economy')}>
            <small>TREASURY</small>${w.me.metrics.treasury.toFixed(1)}B
          </button>
          <button onClick={() => open('economy')}>
            <small>APPROVAL</small>
            {w.me.metrics.approval.toFixed(0)}%
          </button>
          <button aria-label="Return to title" onClick={c.leave}>
            <LogOut size={17} />
          </button>
        </div>
      </header>
      <nav className="presidency-nav" aria-label="Presidential navigation">
        {[
          ['office', 'OFFICE', Landmark],
          ['republic', 'REPUBLIC', Building2],
          ['world', 'WORLD', Globe2],
          ['meetings', 'MEETINGS', Handshake],
        ].map(([id, label, Icon]) => {
          const Glyph = Icon as typeof Landmark;
          return (
            <button key={String(id)} className={view === id ? 'active' : ''} onClick={() => navigate(String(id))}>
              <Glyph size={18} />
              <span>{String(label)}</span>
            </button>
          );
        })}
      </nav>
      {view === 'office' && !area && (
        <ChiefOfStaff w={w} brief={setBrief} matter={setMatter} inbox={() => open('inbox')} />
      )}
      {view === 'office' && w.worldCrisis && !area && (
        <button className="office-world-wire" onClick={() => navigate('world')}>
          <span className="live-dot" /> WORLD SERVICE · {w.worldCrisis.title}
        </button>
      )}
      {view === 'world' && (
        <div className="presidency-world">
          <WorldMap w={w} select={(id) => (id === w.playerId ? visit() : negotiate(id))} />
          <Assembly w={w} send={c.send} busy={c.busy} />
          {w.worldCrisis && (
            <article className="world-crisis-story">
              <span className="kicker">WORLD SERVICE</span>
              <h2>{w.worldCrisis.title}</h2>
              <p>{w.worldCrisis.description}</p>
            </article>
          )}
        </div>
      )}
      {view === 'meetings' && (
        <div className="presidency-world">
          <h1>THE DIPLOMATIC TABLE</h1>
          <Diplomacy
            key={`${selected}-${need}`}
            w={w}
            selected={selected}
            select={select}
            need={need}
            send={c.send}
            busy={c.busy}
          />
        </div>
      )}
      {area && (
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
                    navigate('meetings');
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
                    navigate('meetings');
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
      )}
      {brief && (
        <BriefingDetail
          w={w}
          id={brief}
          close={() => setBrief(undefined)}
          send={c.send}
          busy={c.busy}
          negotiate={negotiate}
          visit={visit}
        />
      )}
      {chosenMatter && (
        <MatterDetail
          m={chosenMatter}
          w={w}
          close={() => setMatter(undefined)}
          send={c.send}
          busy={c.busy}
          visit={visit}
        />
      )}
    </main>
  );
}
