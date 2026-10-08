import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';
import type { Room } from '@republic/contracts';
export async function createStore(directory = process.env.DATA_DIR ?? '.data/republic') {
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) throw new Error('DATABASE_URL is required in production');
  const db = process.env.DATABASE_URL ? new pg.Pool({ connectionString: process.env.DATABASE_URL }) : new PGlite(directory);
  const query = (sql: string, params?: unknown[]) => db instanceof PGlite ? db.query(sql, params) : db.query(sql, params);
  await query('CREATE TABLE IF NOT EXISTS rooms (code text PRIMARY KEY, state jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())');
  return {
    async all(): Promise<Room[]> { const result = await query('SELECT state FROM rooms'); return result.rows.map(row => (row as { state: Room }).state); },
    async save(room: Room) { await query('INSERT INTO rooms (code, state) VALUES ($1, $2::jsonb) ON CONFLICT (code) DO UPDATE SET state = EXCLUDED.state, updated_at = now()', [room.code, JSON.stringify(room)]); },
    async close() { if (db instanceof PGlite) await db.close(); else await db.end(); },
  };
}
export type Store = Awaited<ReturnType<typeof createStore>>;
