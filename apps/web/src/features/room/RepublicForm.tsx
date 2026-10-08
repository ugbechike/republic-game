import { FLAGS, type Draft } from '@republic/contracts';
import { FlagBanner, FLAG_STYLES } from '../../components/FlagBanner';
export function RepublicForm({ draft, setDraft }: { draft: Draft; setDraft: (d: Draft) => void }) {
  return (
    <section className="identity-fields">
      <label htmlFor="republic-name">
        Republic name <span>{draft.name.length}/28</span>
      </label>
      <input
        id="republic-name"
        autoFocus
        required
        minLength={2}
        maxLength={28}
        placeholder="e.g. Solara"
        value={draft.name}
        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        autoComplete="off"
      />
      <label htmlFor="leader-name">Leader name</label>
      <input
        id="leader-name"
        required
        minLength={2}
        maxLength={28}
        placeholder="Your name"
        value={draft.leader}
        onChange={(e) => setDraft({ ...draft, leader: e.target.value })}
        autoComplete="off"
      />
      <h3>CHOOSE YOUR FLAG</h3>
      <div className="flag-deck">
        {FLAGS.map((flag) => (
          <button
            type="button"
            key={flag}
            aria-label={`${FLAG_STYLES[flag].name} flag`}
            aria-pressed={draft.flag === flag}
            className={draft.flag === flag ? 'chosen' : ''}
            onClick={() => setDraft({ ...draft, flag })}
          >
            <FlagBanner flag={flag} />
            <span>{FLAG_STYLES[flag].name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
