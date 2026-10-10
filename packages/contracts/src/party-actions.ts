import { z } from 'zod';
import { ASSETS } from './party';
const id = z.string().min(1).max(100);
const inventory = z.object(
  Object.fromEntries(ASSETS.map((a) => [a, z.number().int().min(0).max(50)])) as Record<
    (typeof ASSETS)[number],
    z.ZodNumber
  >,
);
export const partyIntent = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('ready') }),
  z.object({ kind: z.literal('start') }),
  z.object({ kind: z.literal('rematch') }),
  z.object({ kind: z.literal('fulfill'), need: id }),
  z.object({ kind: z.literal('fallback'), need: id }),
  z.object({ kind: z.literal('call'), to: id }),
  z.object({ kind: z.literal('respond'), meeting: id, response: z.enum(['join', 'decline', 'leave']) }),
  z.object({ kind: z.literal('chat'), meeting: id, text: z.string().trim().min(1).max(300) }),
  z.object({
    kind: z.literal('terms'),
    meeting: id,
    revision: z.number().int().min(0),
    terms: z.object({
      offer: inventory,
      want: inventory,
      delay: z.union([z.literal(0), z.literal(15), z.literal(30)]),
    }),
  }),
  z.object({
    kind: z.literal('proposal'),
    meeting: id,
    revision: z.number().int().min(0),
    response: z.enum(['propose', 'counter', 'accept', 'reject', 'sign']),
  }),
  z.object({
    kind: z.literal('debug'),
    command: z.enum(['advance', 'twist', 'inventory', 'need', 'end']),
    asset: z.enum(ASSETS).optional(),
    amount: z.number().int().min(0).max(300).optional(),
  }),
]);
export const partyActionSchema = z.object({ type: z.literal('party'), match: id, intent: partyIntent });
export type PartyIntent = z.infer<typeof partyIntent>;
