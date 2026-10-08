import type { WorldController } from '../room/useWorld';
export function Game({ controller: c }: { controller: WorldController }) { return <main className="lobby"><h1>{c.world!.me.name}</h1><p>Month {c.world!.month} of 240</p><p>The Assembly is in session.</p></main>; }
