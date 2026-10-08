import { useEffect, useState } from 'react';
import { ArrowRight, Users, BookOpen, Play, Volume2, VolumeX } from 'lucide-react';
import { DEFAULT_MIN_PLAYERS, type RoomSummary } from '@republic/contracts';
import type { WorldController } from './useWorld';
import { Backdrop, GameBrand } from './Backdrop';
import { HowToPlay } from './HowToPlay';
import { JoinWorld } from './JoinWorld';
import { FoundingWizard } from './founding/FoundingWizard';
export function Landing({ controller: c }: { controller: WorldController }) {
  const [screen, setScreen] = useState<'title' | 'create' | 'join' | 'help'>('title');
  const [room, setRoom] = useState<RoomSummary>(),
    [minimum, setMinimum] = useState(DEFAULT_MIN_PLAYERS);
  const [sound, setSound] = useState(false);
  useEffect(() => {
    c.client
      .config()
      .then((config) => setMinimum(config.minPlayers))
      .catch(() => {});
  }, [c.client]);
  if (screen === 'create')
    return (
      <FoundingWizard
        c={c}
        room={room}
        minimum={minimum}
        close={() => {
          setScreen('title');
          setRoom(undefined);
        }}
      />
    );
  return (
    <main className="title-screen">
      <Backdrop />
      <header className="title-header">
        <GameBrand />
        <span className="title-motto">
          STRATEGY <i /> DIPLOMACY <i /> POWER <i /> FRIENDS
        </span>
      </header>
      {screen === 'title' ? (
        <section className="title-menu">
          <div className="kicker">
            <span className="live-dot" /> A NEW WORLD. YOUR RULES.
          </div>
          <h1>
            BUILD.
            <br />
            NEGOTIATE.
            <br />
            <em>OUTMANEUVER.</em>
          </h1>
          <p>
            Create your Republic. Build your power.
            <br />
            Outmaneuver your friends.
          </p>
          <div className="title-actions">
            <button className="game-button gold" onClick={() => setScreen('create')}>
              CREATE REPUBLIC <ArrowRight size={21} />
            </button>
            <button className="game-button" onClick={() => setScreen('join')}>
              <Users size={20} /> JOIN WORLD <ArrowRight size={18} />
            </button>
            <button className="game-button quiet" onClick={() => setScreen('help')}>
              <BookOpen size={20} /> HOW TO PLAY
            </button>
            {c.resumeSession && (
              <button className="resume-game" onClick={() => c.setSession(c.resumeSession)}>
                <Play size={14} /> Resume world {c.resumeSession.code}
              </button>
            )}
          </div>
          <div className="title-facts">
            <span>{minimum}–8 PLAYERS</span>
            <i />
            <span>45–90 MINUTES</span>
            <i />
            <span>NO ACCOUNTS</span>
          </div>
        </section>
      ) : screen === 'join' ? (
        <JoinWorld
          c={c}
          enter={(summary) => {
            setRoom(summary);
            setScreen('create');
          }}
          close={() => setScreen('title')}
        />
      ) : (
        <HowToPlay close={() => setScreen('title')} />
      )}
      <footer className="title-footer">
        <span>
          FIRST ASSEMBLY <b>V0</b>
        </span>
        <p>“Power is a game. Play it well.”</p>
        <button
          className="sound-toggle"
          aria-label={sound ? 'Disable interaction sounds' : 'Enable interaction sounds'}
          aria-pressed={sound}
          onClick={() => {
            const value = !sound;
            setSound(value);
            window.dispatchEvent(new CustomEvent('republic:sound', { detail: value }));
          }}
        >
          {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </footer>
    </main>
  );
}
