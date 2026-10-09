import { PresidencyChrome } from './PresidencyChrome';
import { useOfficeAudio } from './useOfficeAudio';
import { WorldExperience } from '../world/WorldExperience';
import { OfficeDossier } from './OfficeDossier';
import { MeetingLobby } from '../meetings/MeetingLobby';
import { MeetingRoom } from '../meetings/MeetingRoom';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Commodity } from '@republic/contracts';
import type { WorldController } from '../room/useWorld';
import { OfficeScene, type OfficeArea } from './OfficeScene';
import { ChiefOfStaff } from './ChiefOfStaff';
import { MatterDetail } from './MatterDetail';
import { BriefingDetail } from '../briefings/BriefingDetail';
import { Diplomacy } from '../game/Diplomacy';
import { RepublicVisit } from './RepublicVisit';
export function Presidency({ controller: c }: { controller: WorldController }) {
  const w = c.world!;
  const [view, setView] = useState('office'),
    [area, open] = useState<OfficeArea>(),
    [brief, setBrief] = useState<string>(),
    [matter, setMatter] = useState<string>();
  const [region, setRegion] = useState(w.me.regions[0].id),
    [selected, select] = useState(w.republics.find((r) => r.id !== w.playerId)?.id ?? w.playerId),
    [need, setNeed] = useState<Commodity>(),
    [meetingId, enter] = useState<string>(),
    [foreignPolicy, setForeignPolicy] = useState(false),
    [visiting, setVisiting] = useState<string>();
  const [returnContext, saveContext] = useState<{ brief?: string; matter?: string; area?: OfficeArea }>();
  useOfficeAudio(w, view);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [view]);
  const meeting = w.meetings?.find((m) => m.id === meetingId);
  const invitations = (w.meetings ?? []).filter(
    (m) =>
      (m.status === 'requested' && m.requestedBy !== w.playerId) ||
      (m.status === 'proposed' && m.proposedBy !== w.playerId) ||
      (m.status === 'agreed' && !m.signatures.includes(w.playerId)),
  );
  const meetingTitle = invitations[0]
    ? invitations[0].status === 'agreed'
      ? 'Your signature is requested'
      : invitations[0].status === 'proposed'
        ? 'A proposal awaits your response'
        : `${w.republics.find((r) => r.id === invitations[0].requestedBy)?.name} requests a meeting`
    : undefined;
  const count =
    (w.me.briefings ?? []).filter((b) => b.status === 'open').length +
    (w.me.officeMatters ?? []).filter((m) => m.status === 'open').length;
  const chosenMatter = w.me.officeMatters?.find((m) => m.id === matter);
  function visit(id?: string) {
    saveContext({ brief, matter, area });
    setVisiting(undefined);
    if (id) setRegion(id);
    setView('republic');
    open(undefined);
    setMatter(undefined);
    setBrief(undefined);
  }
  function navigate(next: string) {
    setView(next);
    if (next === 'republic') setVisiting(undefined);
    open(undefined);
    if (next === 'office' && returnContext) {
      setBrief(returnContext.brief);
      setMatter(returnContext.matter);
      open(returnContext.area);
      saveContext(undefined);
    }
  }
  function negotiate(id: string, resource?: Commodity) {
    select(id);
    setNeed(resource);
    setBrief(undefined);
    setView('meetings');
    enter(undefined);
    setForeignPolicy(false);
  }
  return (
    <main className={`presidency view-${view}`}>
      {view === 'office' && (
        <OfficeScene
          w={w}
          open={open}
          world={() => navigate('world')}
          republic={() => visit()}
          urgent={count}
          meetingCount={invitations.length}
        />
      )}
      {view === 'republic' && (
        <RepublicVisit w={w} target={visiting} regionId={region} select={setRegion} back={() => navigate('office')} />
      )}
      <PresidencyChrome w={w} view={view} navigate={navigate} economy={() => open('economy')} leave={c.leave} />
      {view === 'office' && !area && (
        <ChiefOfStaff
          w={w}
          brief={setBrief}
          matter={setMatter}
          inbox={() => open('inbox')}
          meeting={
            invitations.length
              ? () => {
                  enter(undefined);
                  navigate('meetings');
                }
              : undefined
          }
          meetingTitle={meetingTitle}
        />
      )}
      {view === 'office' && w.worldCrisis && !area && (
        <button className="office-world-wire" onClick={() => navigate('world')}>
          <span className="live-dot" /> WORLD SERVICE · {w.worldCrisis.title}
        </button>
      )}
      {view === 'world' && (
        <WorldExperience
          w={w}
          send={c.send}
          busy={c.busy}
          meet={negotiate}
          visit={(id) => {
            setVisiting(id);
            setView('republic');
            open(undefined);
          }}
          policy={(id) => {
            select(id);
            setForeignPolicy(true);
          }}
        />
      )}
      {view === 'meetings' &&
        (meeting ? (
          <MeetingRoom
            m={meeting}
            w={w}
            send={c.send}
            busy={c.busy}
            back={() => {
              enter(undefined);
              navigate('office');
            }}
            policy={() => {
              select(meeting.participants.find((id) => id !== w.playerId)!);
              setForeignPolicy(true);
            }}
          />
        ) : (
          <MeetingLobby
            w={w}
            selected={selected}
            select={select}
            send={c.send}
            busy={c.busy}
            enter={enter}
            policy={() => setForeignPolicy(true)}
          />
        ))}
      {foreignPolicy && (
        <div className="office-sheet-backdrop">
          <section className="office-sheet" role="dialog" aria-modal="true" aria-label="Foreign policy">
            <header>
              <span className="kicker">FOREIGN POLICY</span>
              <button aria-label="Close foreign policy" onClick={() => setForeignPolicy(false)}>
                <X size={20} />
              </button>
            </header>
            <Diplomacy
              key={`${selected}-${need}`}
              w={w}
              selected={selected}
              select={select}
              need={need}
              send={c.send}
              busy={c.busy}
            />
          </section>
        </div>
      )}
      {area && (
        <OfficeDossier
          c={c}
          area={area}
          open={open}
          brief={setBrief}
          matter={setMatter}
          meetings={() => navigate('meetings')}
          negotiate={negotiate}
        />
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
