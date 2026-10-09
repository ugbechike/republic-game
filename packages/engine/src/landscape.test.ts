import { expect, it } from 'vitest';
import { pressureWorld } from './pressure-fixture';
import { act } from './actions';
import { tick } from './tick';
import { makeBriefing, gameDirector } from './game-director';
import { view } from './view';
it('retains damaged regions across views and persistence, then progressively reconstructs after funding', () => {
  let room = pressureWorld();
  const r = room.republics[0],
    brief = makeBriefing(room, r, 'flood');
  const region = r.regions.find((s) => s.id === brief.region)!;
  const plots = structuredClone(region.plots);
  expect(region.flood?.severity).toBe(1);
  expect(view(room, 'b', false).republics[0].landscape?.regions.find((s) => s.id === region.id)?.flood).toEqual(
    region.flood,
  );
  expect(view(room, 'b', false).republics[0]).not.toHaveProperty('briefings');
  r.stocks.iron = 10;
  r.metrics.treasury = 10;
  act(room, 'a', { type: 'briefing', id: brief.id, choice: 'resolve' });
  expect(region.flood?.recovering).toBe(true);
  room = JSON.parse(JSON.stringify(room));
  const saved = room.republics[0].regions.find((s) => s.id === region.id)!;
  expect(saved.plots).toEqual(plots);
  tick(room);
  expect(saved.flood!.severity).toBeCloseTo(5 / 6);
  for (let i = 0; i < 5; i++) tick(room);
  expect(saved.flood).toBeUndefined();
  expect(saved.plots.map((p) => [p.id, p.x, p.z])).toEqual(plots.map((p) => [p.id, p.x, p.z]));
});
it('does not erase a disaster when its briefing expires', () => {
  const room = pressureWorld(),
    r = room.republics[0],
    b = makeBriefing(room, r, 'flood');
  room.activeMs = b.dueAt;
  gameDirector(room);
  expect(b.status).toBe('expired');
  expect(r.regions.find((s) => s.id === b.region)!.flood?.severity).toBe(1);
});
