import { CheckCircle2, ShieldCheck, TriangleAlert, LockKeyhole } from 'lucide-react';
import type { Room, RoomSummary } from '@republic/contracts';
export function ChallengeStep({
  options,
  setOptions,
  room,
  minimum,
}: {
  options: Room['options'];
  setOptions: (o: Room['options']) => void;
  room?: RoomSummary;
  minimum: number;
}) {
  return (
    <section className="challenge-step">
      <span className="kicker">03 / CHOOSE YOUR CHALLENGE</span>
      <h1>EVERY GREAT NATION HAS A STARTING POINT.</h1>
      <p>
        {room
          ? 'Your host chose the starting conditions. Everyone in this world begins on the same footing.'
          : 'Choose the conditions your Republic begins with. The same challenge applies to your friends.'}
      </p>
      <div className="challenge-deck">
        {(
          [
            [
              'developing',
              'DEVELOPING REPUBLIC',
              ['Moderate debt', 'Growing population', 'Basic infrastructure', 'Stable institutions'],
            ],
            [
              'struggling',
              'STRUGGLING REPUBLIC',
              ['High debt', 'Poor infrastructure', 'High unemployment', 'Low government reserves'],
            ],
          ] as const
        ).map(([key, title, features]) => (
          <button
            key={key}
            type="button"
            className={`challenge-card ${key} ${options.difficulty === key ? 'chosen' : ''}`}
            aria-pressed={options.difficulty === key}
            disabled={!!room && options.difficulty !== key}
            onClick={() => setOptions({ ...options, difficulty: key })}
          >
            <div className="challenge-art">
              <span>{key === 'developing' ? <ShieldCheck /> : <TriangleAlert />}</span>
            </div>
            <div className="challenge-body">
              <h3>
                {title}
                {options.difficulty === key && <CheckCircle2 size={20} />}
              </h3>
              {features.map((feature) => (
                <p key={feature}>
                  <CheckCircle2 size={14} />
                  {feature}
                </p>
              ))}
              <small>
                {key === 'developing' ? 'RECOMMENDED' : 'HIGHER DIFFICULTY'}
                {room && options.difficulty === key && (
                  <>
                    {' '}
                    · HOST’S CHOICE <LockKeyhole size={11} />
                  </>
                )}
              </small>
            </div>
          </button>
        ))}
      </div>
      {!room && (
        <div className="world-settings">
          <div>
            <h3>SET THE TABLE</h3>
            <p>Twenty simulated years. Choose your real-world session length.</p>
          </div>
          <fieldset>
            <legend>Session length</legend>
            <div>
              {([45, 60, 90] as const).map((duration) => (
                <button
                  type="button"
                  className={duration === options.duration ? 'chosen' : ''}
                  key={duration}
                  onClick={() => setOptions({ ...options, duration })}
                >
                  {duration} min
                </button>
              ))}
            </div>
          </fieldset>
          <label>
            World seats
            <select
              aria-label="World seats"
              value={options.maxPlayers}
              onChange={(e) => setOptions({ ...options, maxPlayers: Number(e.target.value) })}
            >
              {Array.from({ length: 9 - minimum }, (_, i) => i + minimum).map((n) => (
                <option key={n} value={n}>
                  {n} players
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </section>
  );
}
