import type { Room, RoomSummary } from '@republic/contracts';
import { Clock3, Users, Handshake } from 'lucide-react';
export function WorldSettingsStep({
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
      <span className="kicker">03 / SET THE TABLE</span>
      <h1>ONE WORLD. DIFFERENT ADVANTAGES.</h1>
      <p>
        Every President begins with the same national baseline. Your land determines what you can offer—and what you
        will need from someone else.
      </p>
      <div className="how-to-grid">
        <article className="panel">
          <Handshake />
          <h3>Your resources are your bargaining power.</h3>
          <p>
            No Republic produces every essential input. Watch your advisers, find suppliers and agree terms with the
            person across the table.
          </p>
        </article>
        <article className="panel">
          <Users />
          <h3>Every deal needs another President.</h3>
          <p>
            Offer resources, money or future deliveries. Your counterpart can accept, reject or counter. Help is never
            automatic.
          </p>
        </article>
      </div>
      {room ? (
        <div className="panel">
          <Clock3 /> {options.duration} minutes · {options.maxPlayers} seats · World {room.code}
          <p className="muted">The host chose the session settings.</p>
        </div>
      ) : (
        <div className="world-settings">
          <div>
            <h3>SESSION SETTINGS</h3>
            <p>Twenty simulated years. Deadlines pause when everyone disconnects.</p>
          </div>
          <fieldset>
            <legend>Session length</legend>
            <div>
              {([45, 60, 90] as const).map((duration) => (
                <button
                  type="button"
                  key={duration}
                  className={duration === options.duration ? 'chosen' : ''}
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
