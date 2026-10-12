import { Globe2, Phone, BookOpen } from 'lucide-react';
import { NeedBriefing } from './NeedBriefing';
import type { PartyProps } from './types';
export function PartyOffice(
  props: PartyProps & {
    now: number;
    call: (id: string, purpose?: 'passage' | 'assistance') => void;
    navigate: (view: string) => void;
    history: () => void;
  },
) {
  const { game, navigate, history } = props;
  return (
    <section className="party-office" aria-label="President's Office">
      <div className="party-office-art" />
      <div className="party-light" />
      <div className="party-office-shade" />
      <div className="party-greeting">
        <span className="kicker">THE EXECUTIVE RESIDENCE / CANAL CRISIS</span>
        <h1>
          President {game.me.leader},<br />
          <em>the world is on the line.</em>
        </h1>
      </div>
      <div className="party-desk">
        <NeedBriefing {...props} />
      </div>
      <div className="party-office-objects">
        <button onClick={() => navigate('world')}>
          <Globe2 />
          <span>
            WORLD MAP<small>Find your next partner</small>
          </span>
        </button>
        <button onClick={() => navigate('meetings')}>
          <Phone />
          <span>
            SECURE LINE<small>Calls & signed agreements</small>
          </span>
        </button>
        <button onClick={history}>
          <BookOpen />
          <span>
            THE RECORD<small>Every score, explained</small>
          </span>
        </button>
      </div>
    </section>
  );
}
