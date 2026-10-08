import type { Action, Crisis as CrisisType } from '@republic/contracts';
export function Crisis({ crisis, send, busy }: { crisis: CrisisType; send: (a: Action) => void; busy: boolean }) {
  return (
    <section className="crisis panel">
      <div className="eyebrow">CABINET BRIEFING · DECISION REQUIRED</div>
      <h2>{crisis.title}</h2>
      <p className="muted">{crisis.description}</p>
      <div className="crisis-options">
        {(
          [
            ['intervene', 'Public intervention', 'Spend $2B. Services +8 in three months; approval +5 in two.'],
            [
              'appeal',
              'Ask the world',
              'Approval −3. Publicly request assistance and open an aid vote if the Assembly is free.',
            ],
            ['market', 'Private intervention', 'Services +5 in three months; inflation +3 in four. Approval −4 now.'],
          ] as const
        ).map(([choice, label, detail]) => (
          <button disabled={busy} key={choice} onClick={() => send({ type: 'crisis', choice })}>
            <b>{label}</b>
            <span>{detail}</span>
          </button>
        ))}
      </div>
      <small className="muted">Ignoring the crisis for six months costs 7 approval and 3 infrastructure.</small>
    </section>
  );
}
