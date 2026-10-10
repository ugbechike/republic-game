import { useState } from 'react';
import { ArrowRight, Users, BookOpen, X } from 'lucide-react';
import { FLAGS, type Draft } from '@republic/contracts';
import type { WorldController } from '../room/useWorld';
import { Backdrop, GameBrand } from '../room/Backdrop';
import { FLAG_STYLES } from '../../components/FlagBanner';
import { Emblem } from './Emblem';
export function PartyLanding({ c }: { c: WorldController }) {
  const [screen, setScreen] = useState<'title' | 'create' | 'join' | 'help'>('title');
  const [name, setName] = useState(''),
    [leader, setLeader] = useState(''),
    [emblem, setEmblem] = useState<Draft['flag']>('☀️'),
    [code, setCode] = useState(''),
    [working, setWorking] = useState(false);
  async function enter() {
    setWorking(true);
    c.setError('');
    try {
      const identity = { name, leader, flag: emblem, resources: [] };
      const session =
        screen === 'join'
          ? await c.client.join(code, identity)
          : await c.client.create(identity, { duration: 5, maxPlayers: 6 });
      c.setSession(session);
    } catch (e) {
      c.setError((e as Error).message);
    } finally {
      setWorking(false);
    }
  }
  return (
    <main className="title-screen party-title">
      <Backdrop />
      <header className="title-header">
        <GameBrand />
        <span className="title-motto">THE CANAL CRISIS</span>
      </header>
      {screen === 'title' ? (
        <section className="title-menu">
          <span className="kicker">A FIVE-MINUTE DIPLOMATIC THRILLER</span>
          <h1>
            FIVE MINUTES.
            <br />
            SIX PRESIDENTS.
            <br />
            <em>NO EASY DEALS.</em>
          </h1>
          <p>
            Win your people’s trust.
            <br />
            Earn the world’s respect.
          </p>
          <div className="title-actions">
            <button className="game-button gold" onClick={() => setScreen('create')}>
              CREATE GAME <ArrowRight />
            </button>
            <button className="game-button" onClick={() => setScreen('join')}>
              <Users /> JOIN GAME <ArrowRight />
            </button>
            <button className="game-button quiet" onClick={() => setScreen('help')}>
              <BookOpen /> HOW TO PLAY
            </button>
            {c.resumeSession && (
              <button onClick={() => c.setSession(c.resumeSession)}>Resume {c.resumeSession.code}</button>
            )}
          </div>
          <div className="title-facts">
            2–6 FRIENDS <i /> FIVE MINUTES <i /> NO ACCOUNTS
          </div>
        </section>
      ) : (
        <section className="party-entry" aria-label={screen === 'help' ? 'How to play' : 'Your presidential identity'}>
          <button className="party-close" aria-label="Back to title" onClick={() => setScreen('title')}>
            <X />
          </button>
          {screen === 'help' ? (
            <>
              <span className="kicker">THE CANAL CRISIS</span>
              <h1>
                Talk. Trade.
                <br />
                Keep your promises.
              </h1>
              <ol>
                <li>The server deals each President a unique advantage and one urgent national objective.</li>
                <li>Call a friend, bargain in person or chat. Put assets on the table. Counter until both agree.</li>
                <li>Both Presidents sign. Assets are reserved; signed deals are binding. Chat promises are not.</li>
                <li>Use the delivered assets to fulfill your national briefing. Adapt to a shared twist at halfway.</li>
              </ol>
              <p>Five minutes. No elimination. Legacy = 70% Public Support + 30% Global Influence.</p>
              <p>Negotiate for the strongest outcome. Costly neutral relief keeps you in the game if talks fail.</p>
              <button className="gold game-button" onClick={() => setScreen('create')}>
                LET’S PLAY <ArrowRight />
              </button>
            </>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void enter();
              }}
            >
              <span className="kicker">{screen === 'create' ? 'CALL THE PRESIDENTS' : 'YOUR SEAT AT THE TABLE'}</span>
              <h1>
                A nation.
                <br />A name. A nerve.
              </h1>
              {screen === 'join' && (
                <label>
                  Room code
                  <input
                    required
                    minLength={5}
                    maxLength={5}
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="ABCDE"
                    autoCapitalize="characters"
                  />
                </label>
              )}
              <label>
                Republic name
                <input
                  required
                  minLength={2}
                  maxLength={28}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Solara"
                />
              </label>
              <label>
                President’s name
                <input
                  required
                  minLength={2}
                  maxLength={28}
                  value={leader}
                  onChange={(e) => setLeader(e.target.value)}
                  placeholder="Your name"
                />
              </label>
              <fieldset>
                <legend>Choose your emblem</legend>
                <div className="party-emblems">
                  {FLAGS.map((flag) => (
                    <button
                      type="button"
                      key={flag}
                      aria-label={`${FLAG_STYLES[flag].name} emblem`}
                      aria-pressed={emblem === flag}
                      onClick={() => setEmblem(flag)}
                    >
                      <Emblem value={flag} />
                    </button>
                  ))}
                </div>
              </fieldset>
              <p>Your advantage is dealt at the table. Everyone gets a chance to win.</p>
              <button disabled={working} className="game-button gold">
                {working ? 'TAKING YOUR SEAT…' : screen === 'create' ? 'CREATE GAME' : 'JOIN GAME'}
                <ArrowRight />
              </button>
            </form>
          )}
        </section>
      )}
    </main>
  );
}
