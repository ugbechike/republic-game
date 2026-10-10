import { FLAGS, emptyInventory, type Room, type PartyIntent, type Inventory } from '@republic/contracts';
import { createRoom, createRepublic } from '../create';
import { newParty } from './scenario';
import { partyAction } from './actions';
export const START = 1800000000000;
export function fixture(count = 2, seed = 42): Room {
  const r = createRoom(
    'PARTY',
    'p0',
    'hash',
    { name: 'Republic 0', leader: 'Leader 0', flag: FLAGS[0], resources: [] },
    { duration: 5, maxPlayers: 6 },
  );
  for (let i = 1; i < count; i++) {
    const id = `p${i}`;
    r.players.push({ id, tokenHash: 'hash', requests: [] });
    r.republics.push(
      createRepublic(id, { name: `Republic ${i}`, leader: `Leader ${i}`, flag: FLAGS[i], resources: [] }),
    );
  }
  r.seed = seed;
  r.party = newParty(r);
  return r;
}
export function command(r: Room, id: string, intent: PartyIntent, now = START) {
  partyAction(r, id, r.party!.id, intent, true, now, new Set(r.players.map((p) => p.id)));
}
export function begin(r: Room) {
  command(r, 'p0', { kind: 'start' });
  for (const p of r.players) command(r, p.id, { kind: 'ready' });
  return r.party!;
}
export const bundle = (items: Partial<Inventory>): Inventory => ({ ...emptyInventory(), ...items });
export function openTable(r: Room, a: string, b: string) {
  command(r, a, { kind: 'call', to: b });
  const id = r.party!.meetings.at(-1)!.id;
  command(r, b, { kind: 'respond', meeting: id, response: 'join' });
  return id;
}
export function trade(
  r: Room,
  a: string,
  b: string,
  offer: Partial<Inventory>,
  want: Partial<Inventory>,
  delay: 0 | 15 | 30 = 0,
  now = START,
) {
  const id = openTable(r, a, b);
  command(
    r,
    a,
    { kind: 'terms', meeting: id, revision: 0, terms: { offer: bundle(offer), want: bundle(want), delay } },
    now,
  );
  command(r, a, { kind: 'proposal', meeting: id, revision: 1, response: 'propose' }, now);
  command(r, b, { kind: 'proposal', meeting: id, revision: 1, response: 'accept' }, now);
  command(r, a, { kind: 'proposal', meeting: id, revision: 1, response: 'sign' }, now);
  command(r, b, { kind: 'proposal', meeting: id, revision: 1, response: 'sign' }, now);
  return id;
}
