import { z } from 'zod';
import { RESOURCES, RESOURCE_COST } from './model';
const id = z.string().min(1).max(80);
export const draftSchema = z.object({
  name: z.string().trim().min(2).max(28), leader: z.string().trim().min(2).max(28),
  flag: z.enum(['🌅', '🌊', '🌲', '☀️', '🏔️', '🌙', '⚡', '🦅']),
  resources: z.array(z.enum(RESOURCES)).min(1).max(4).refine(r => new Set(r).size === r.length && r.reduce((n, k) => n + RESOURCE_COST[k], 0) <= 4, 'Choose unique resources costing at most four points'),
});
export const optionsSchema = z.object({ duration: z.union([z.literal(45), z.literal(60), z.literal(90)]), maxPlayers: z.number().int().min(4).max(8), difficulty: z.enum(['developing', 'struggling']) });
const bundle = z.object({ money: z.number().min(0).max(30), resource: z.enum(RESOURCES), amount: z.number().min(0).max(60) });
export const actionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('start') }), z.object({ type: z.literal('rematch') }),
  z.object({ type: z.literal('policy'), key: z.enum(['corporateTax', 'incomeTax', 'education', 'healthcare', 'infrastructure', 'defence', 'energy', 'social']), value: z.number().int().min(0).max(40) }),
  z.object({ type: z.literal('trade'), to: id, offer: bundle, want: bundle, years: z.union([z.literal(2), z.literal(5), z.literal(10)]), counter: id.optional() }),
  z.object({ type: z.literal('dealResponse'), id, accept: z.boolean() }), z.object({ type: z.literal('breakDeal'), id }),
  z.object({ type: z.literal('alliance'), to: id, kind: z.enum(['trade', 'defence']) }),
  z.object({ type: z.literal('allianceResponse'), id, accept: z.boolean() }), z.object({ type: z.literal('leaveAlliance'), id }),
  z.object({ type: z.literal('loan'), to: id, amount: z.number().min(1).max(20) }),
  z.object({ type: z.literal('loanResponse'), id, accept: z.boolean() }),
  z.object({ type: z.literal('sanction'), to: id }), z.object({ type: z.literal('threat'), to: id }),
  z.object({ type: z.literal('war'), to: id }),
  z.object({ type: z.literal('assist'), id, side: id, kind: z.enum(['military', 'financial']) }),
  z.object({ type: z.literal('institution'), kind: z.enum(['development', 'emergency', 'dispute']) }),
  z.object({ type: z.literal('vote'), support: z.boolean() }),
  z.object({ type: z.literal('crisis'), choice: z.enum(['intervene', 'appeal', 'market']) }),
  z.object({ type: z.literal('debug'), kind: z.enum(['speed', 'event', 'money', 'approval', 'election', 'recession', 'bot', 'end']) }),
]);
export const envelopeSchema = z.object({ requestId: z.string().uuid(), action: actionSchema });
export type Action = z.infer<typeof actionSchema>;
export type Draft = z.infer<typeof draftSchema>;
