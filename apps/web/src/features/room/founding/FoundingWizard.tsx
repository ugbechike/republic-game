import { useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { draftSchema, type Draft, type Room, type RoomSummary } from '@republic/contracts';
import type { WorldController } from '../useWorld';
import { Backdrop, GameBrand } from '../Backdrop';
import { RepublicForm } from '../RepublicForm';
import { FlagBanner } from '../../../components/FlagBanner';
import { ResourceStep } from './ResourceStep';
import { WorldSettingsStep } from './WorldSettingsStep';
import { RepublicReveal } from './RepublicReveal';
const steps = ['Identity', 'Resources', 'World', 'Review'];
export function FoundingWizard({
  c,
  room,
  minimum,
  close,
}: {
  c: WorldController;
  room?: RoomSummary;
  minimum: number;
  close: () => void;
}) {
  const [step, setStep] = useState(0),
    [busy, setBusy] = useState(false),
    [ready, setReady] = useState(false),
    [error, setError] = useState('');
  const [draft, setDraft] = useState<Draft>({ name: '', leader: '', flag: '☀️', resources: [] });
  const [options, setOptions] = useState<Room['options']>(
    room?.options ?? { duration: 60, maxPlayers: Math.max(6, minimum) },
  );
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (step === 0 && (draft.name.trim().length < 2 || draft.leader.trim().length < 2)) {
      setError('Give your Republic and its President a name of at least two characters.');
      return;
    }
    if (step === 1 && !draft.resources.length) {
      setError('Choose at least one resource to shape your Republic.');
      return;
    }
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    if (!ready || busy) return;
    setBusy(true);
    try {
      const identity = draftSchema.parse(draft);
      const session = room ? await c.client.join(room.code, identity) : await c.client.create(identity, options);
      c.setSession(session);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <main className="founding-screen">
      <Backdrop />
      <header className="founding-header">
        <GameBrand small />
        <span>{room ? `JOINING WORLD ${room.code}` : 'FOUNDING YOUR REPUBLIC'}</span>
        <button aria-label="Back to title" className="icon-button" onClick={close} disabled={busy}>
          <X size={21} />
        </button>
      </header>
      <nav className="founding-progress" aria-label="Founding progress">
        {steps.map((title, index) => (
          <button
            type="button"
            key={title}
            disabled={index > step || busy}
            aria-current={index === step ? 'step' : undefined}
            className={index <= step ? 'reached' : ''}
            onClick={() => {
              setError('');
              setStep(index);
            }}
          >
            <span>{index < step ? <Check size={14} /> : index + 1}</span>
            {title}
          </button>
        ))}
      </nav>
      <form className="founding-content" onSubmit={submit}>
        <div className="step-transition" key={step}>
          {step === 0 && (
            <div className="identity-step">
              <section>
                <span className="kicker">01 / NAME YOUR REPUBLIC</span>
                <h1>
                  GIVE YOUR NATION
                  <br />
                  AN IDENTITY.
                </h1>
                <p>A name to stand behind. A flag your friends will remember.</p>
                <RepublicForm draft={draft} setDraft={setDraft} />
              </section>
              <aside className="identity-preview">
                <div className="identity-rays" />
                <span className="kicker">THE NEXT CHAPTER IS YOURS</span>
                <FlagBanner flag={draft.flag} large />
                <h2>{draft.name || 'Your Republic'}</h2>
                <p>{draft.leader ? `President ${draft.leader}` : 'Your people. Your choices. Your legacy.'}</p>
                <span className="identity-motto">PROGRESS THROUGH PEOPLE</span>
              </aside>
            </div>
          )}
          {step === 1 && <ResourceStep draft={draft} setDraft={setDraft} />}
          {step === 2 && (
            <WorldSettingsStep
              options={options}
              setOptions={setOptions}
              room={room}
              minimum={room?.minPlayers ?? minimum}
            />
          )}
          {step === 3 && <RepublicReveal draft={draft} options={options} client={c.client} onReady={setReady} />}
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <footer className="founding-footer">
          <button
            type="button"
            className="game-button quiet"
            disabled={busy}
            onClick={() => {
              if (step === 0) close();
              else setStep(step - 1);
              setError('');
            }}
          >
            <ArrowLeft size={17} /> Back
          </button>
          <span>
            {step === 1
              ? 'YOU CANNOT EAT YOUR CAKE AND HAVE IT.'
              : step === 3
                ? 'YOUR PEOPLE. YOUR CHOICES. YOUR LEGACY.'
                : `${step + 1} OF 4 · FOUNDING YOUR REPUBLIC`}
          </span>
          <button className="game-button gold" disabled={busy || (step === 3 && !ready)}>
            {busy
              ? 'Founding your Republic…'
              : ['Next: Choose your land', 'Next: Set the table', 'Next: Review your Republic', 'FOUND THE REPUBLIC'][
                  step
                ]}
            <ArrowRight size={18} />
          </button>
        </footer>
      </form>
    </main>
  );
}
