import {
  RESOURCES,
  RESOURCE_LABEL,
  draftPresident,
  type Room,
  type Resource,
  type ResourceQuality,
} from '@republic/contracts';
import { createRepublic } from './create';
import { interval, notice, random, requireThat, uid } from './helpers';
const essential: Resource[] = ['oil', 'gas', 'agriculture', 'iron'];
export function beginDraft(room: Room, now: number) {
  const n = room.republics.length;
  const order = room.republics.map((r) => r.id);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random(room) * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const deposits = RESOURCES.flatMap((resource) => {
    const rare = ['uranium', 'rareEarths', 'gold'].includes(resource);
    const count = rare ? 1 : Math.max(1, Math.min(n - 1, Math.floor(n / 2) + (random(room) > 0.5 ? 1 : 0)));
    return Array.from({ length: count }, () => ({
      id: uid(room),
      resource,
      quality: (['Small', 'Moderate', 'Large', 'Exceptional'] as ResourceQuality[])[Math.floor(random(room) * 4)],
    }));
  });
  requireThat(
    deposits.length >= n * 3 && essential.every((k) => deposits.some((d) => d.resource === k)),
    'World lacks complementary deposits',
  );
  room.republics = room.republics.map((r) =>
    createRepublic(r.id, { name: r.name, leader: r.leader, flag: r.flag as '☀️', resources: [] }),
  );
  room.phase = 'draft';
  room.paused = false;
  room.draft = { deposits, order, turn: 0, rounds: 3, deadline: now + 30000, ready: [], complete: false };
  room.nextTick = now + 30000;
  notice(room, 'The world is being divided. Three claims per President. Every advantage has a cost.');
}
export function claimable(room: Room, player: string) {
  const d = room.draft!,
    r = room.republics.find((r) => r.id === player)!;
  const missing = essential.filter((k) => !d.deposits.some((x) => x.resource === k && x.owner));
  const left = d.rounds * d.order.length - d.turn;
  return d.deposits.filter(
    (x) => !x.owner && !r.resources.includes(x.resource) && (left > missing.length || missing.includes(x.resource)),
  );
}
export function claimDeposit(room: Room, player: string, deposit: string, now: number, automatic = false) {
  const d = room.draft;
  requireThat(room.phase === 'draft' && d && !d.complete && draftPresident(d) === player, 'Wait for your draft turn');
  requireThat(automatic || now < d.deadline, 'The claim window has closed');
  const selected = claimable(room, player).find((x) => x.id === deposit);
  requireThat(selected, 'Deposit claimed, duplicated, or reserved for world supply');
  const r = room.republics.find((r) => r.id === player)!;
  selected.owner = player;
  r.resources.push(selected.resource);
  r.resourceQuality ??= {};
  r.resourceQuality[selected.resource] = selected.quality;
  const total = d.deposits.filter((x) => x.resource === selected.resource).length;
  notice(
    room,
    `${r.name.toUpperCase()} claims ${total === 1 ? "the world's only" : `one of ${total}`} ${RESOURCE_LABEL[selected.resource]} deposit${automatic ? ' · delegated claim' : ''}.`,
  );
  d.turn++;
  d.complete = d.turn === d.rounds * d.order.length;
  d.deadline = now + (d.complete ? 20000 : 30000);
  room.nextTick = d.deadline;
  if (d.complete) {
    room.republics = room.republics.map((old) => {
      const fresh = createRepublic(old.id, {
        name: old.name,
        leader: old.leader,
        flag: old.flag as '☀️',
        resources: old.resources,
      });
      fresh.resourceQuality = old.resourceQuality;
      return fresh;
    });
    notice(room, 'THE WORLD IS FORMED · 2030. Your presidency begins.');
  }
}
export function finishDraft(room: Room, now: number) {
  room.phase = 'playing';
  room.activeMs = 0;
  room.nextTick = now + interval(room);
  notice(room, 'The Assembly is in session. Twenty years. One world.');
}
export function advanceDraft(room: Room, now: number) {
  const d = room.draft;
  if (room.phase !== 'draft' || !d || room.paused || now < d.deadline) return false;
  if (d.complete) finishDraft(room, now);
  else {
    const who = draftPresident(d),
      choices = claimable(room, who);
    // Prefer a globally unclaimed essential; otherwise diversify without revealing quality numbers.
    const pick =
      choices.find(
        (x) => essential.includes(x.resource) && !d.deposits.some((o) => o.owner && o.resource === x.resource),
      ) ?? choices[0];
    requireThat(pick, 'No valid deposit remains');
    claimDeposit(room, who, pick.id, now, true);
  }
  return true;
}
