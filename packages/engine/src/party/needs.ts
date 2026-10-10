import { rewardReliability } from './reliability';
import { PARTY_RULES, BASE_VALUES, emptyInventory, type PartyMatch, type PartyPlayer } from '@republic/contracts';
import { requireThat } from '../helpers';
import { subtract, takeLots, requirementBundle } from './inventory';
import { score, reconcileBargaining } from './scoring';
export function fulfill(m: PartyMatch, p: PartyPlayer, id: string, fallback: boolean, now: number) {
  const need = p.needs.find((n) => n.id === id);
  requireThat(need && ['open', 'late'].includes(need.status), 'That national decision is already resolved.');
  if (fallback) {
    requireThat(
      !need.optional && !p.fallbackUsed,
      'The neutral fallback is available once for your national objective.',
    );
    const cost = emptyInventory();
    cost.credits = PARTY_RULES.fallbackCredits;
    subtract(p, cost);
    takeLots(p, cost);
    p.fallbackUsed = true;
    score(
      p,
      `${id}-fulfilled`,
      now,
      PARTY_RULES.fallbackReward,
      0,
      'Costly neutral relief: partial national recovery, no diplomatic influence.',
    );
  } else {
    const bundle = requirementBundle(p, need.requirements);
    requireThat(
      bundle,
      'Secure the required assets first, or use neutral relief. Reserved treaty assets cannot be consumed.',
    );
    subtract(p, bundle);
    const lots = takeLots(p, bundle);
    rewardReliability(m, p, lots, id, now);
    const late = need.status === 'late';
    for (const lot of lots)
      if (lot.origin !== p.id && lot.asset !== 'credits') {
        p.strategicCredit += lot.amount * Math.min(PARTY_RULES.strategicUnit, BASE_VALUES[lot.asset]);
      }
    score(
      p,
      `${id}-fulfilled`,
      now,
      need.optional ? PARTY_RULES.twistReward : late ? PARTY_RULES.lateReward : PARTY_RULES.needReward,
      need.optional ? PARTY_RULES.twistInfluence : 0,
      `${late ? 'Late recovery' : 'National promise kept'}: ${need.title}.`,
    );
    reconcileBargaining(p, `${id}-strategy`, now);
  }
  need.status = 'fulfilled';
  m.news.unshift({
    id: `${id}-news`,
    at: now,
    text: `${p.name} ${fallback ? 'uses costly neutral relief' : 'fulfills its national promise'}: ${need.title}.`,
  });
}
