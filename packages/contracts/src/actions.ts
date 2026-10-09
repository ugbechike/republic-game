import { z } from 'zod';
import { RESOURCES, RESOURCE_COST, RESOURCE_POINTS, TRADE_RESOURCES } from './model';
const id = z.string().min(1).max(80);
export const draftSchema = z.object({
  name: z.string().trim().min(2).max(28),
  leader: z.string().trim().min(2).max(28),
  flag: z.enum(['🌅', '🌊', '🌲', '☀️', '🏔️', '🌙', '⚡', '🦅']),
  resources: z
    .array(z.enum(RESOURCES))
    .min(0)
    .max(5)
    .refine(
      (r) => new Set(r).size === r.length && r.reduce((n, k) => n + RESOURCE_COST[k], 0) <= RESOURCE_POINTS,
      'Choose unique resources costing at most five points',
    ),
});
export const optionsSchema = z.object({
  duration: z.union([z.literal(45), z.literal(60), z.literal(90)]),
  maxPlayers: z.number().int().min(2).max(8),
  difficulty: z.enum(['developing', 'struggling']).optional(),
});
const bundle = z.object({
  money: z.number().min(0).max(30),
  resource: z.enum(TRADE_RESOURCES),
  amount: z.number().min(0).max(60),
  moneyTiming: z.enum(['now', 'annual']).optional(),
  items: z
    .array(
      z.object({
        resource: z.enum(TRADE_RESOURCES),
        amount: z.number().min(0).max(60),
        timing: z.enum(['now', 'annual']),
      }),
    )
    .max(8)
    .optional(),
});
export const actionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('meetingRequest'),
    to: id,
    agenda: z.enum(['Trade', 'Emergency Aid', 'Alliance', 'Security', 'General Discussion']),
  }),
  z.object({ type: z.literal('meetingResponse'), id, response: z.enum(['join', 'delay', 'decline', 'close']) }),
  z.object({ type: z.literal('meetingChat'), id, text: z.string().trim().min(1).max(500) }),
  z.object({
    type: z.literal('meetingTerms'),
    id,
    revision: z.number().int().min(0),
    offer: bundle,
    want: bundle,
    years: z.number().int().min(1).max(10),
    startInMonths: z.number().int().min(0).max(12),
  }),
  z.object({
    type: z.literal('meetingProposal'),
    id,
    revision: z.number().int().min(0),
    response: z.enum(['propose', 'accept', 'reject', 'counter', 'sign']),
  }),
  z.object({ type: z.literal('draftClaim'), deposit: id }),
  z.object({ type: z.literal('draftReady') }),
  z.object({
    type: z.literal('officeDecision'),
    id,
    choice: z.enum(['fund', 'partial', 'refuse', 'support', 'incentive']),
  }),
  z.object({
    type: z.literal('briefing'),
    id,
    choice: z.enum(['resolve', 'assistance', 'delay', 'alternative', 'mediation']),
  }),
  z.object({ type: z.literal('requestHelp'), war: id }),
  z.object({ type: z.literal('neutral'), war: id }),
  z.object({ type: z.literal('resolution'), to: id }),
  z.object({
    type: z.literal('directorDebug'),
    kind: z.enum([
      'shortage',
      'treasury',
      'flood',
      'energy',
      'world',
      'reserves',
      'advance',
      'surplus',
      'dependency',
      'tension',
    ]),
    target: id.optional(),
    resource: z.enum(TRADE_RESOURCES).optional(),
    amount: z.number().min(0).max(240).optional(),
    crisis: z.enum(['energy', 'food', 'commodities', 'recession']).optional(),
  }),
  z.object({ type: z.literal('start') }),
  z.object({ type: z.literal('rematch') }),
  z.object({
    type: z.literal('policy'),
    key: z.enum([
      'corporateTax',
      'incomeTax',
      'education',
      'healthcare',
      'infrastructure',
      'defence',
      'energy',
      'social',
    ]),
    value: z.number().int().min(0).max(40),
  }),
  z.object({
    type: z.literal('trade'),
    to: id,
    offer: bundle,
    want: bundle,
    years: z.number().int().min(1).max(10),
    startInMonths: z.number().int().min(0).max(12).optional(),
    reason: z.string().trim().max(160).optional(),
    counter: id.optional(),
  }),
  z.object({ type: z.literal('dealResponse'), id, accept: z.boolean() }),
  z.object({ type: z.literal('breakDeal'), id }),
  z.object({ type: z.literal('alliance'), to: id, kind: z.enum(['trade', 'defence']) }),
  z.object({ type: z.literal('allianceResponse'), id, accept: z.boolean() }),
  z.object({ type: z.literal('leaveAlliance'), id }),
  z.object({
    type: z.literal('loan'),
    to: id,
    amount: z.number().min(1).max(20),
    repayment: z.number().min(1).max(40).optional(),
    term: z.number().int().min(12).max(120).optional(),
    mode: z.enum(['installments', 'bullet']).optional(),
  }),
  z.object({ type: z.literal('loanResponse'), id, accept: z.boolean() }),
  z.object({
    type: z.literal('sanction'),
    to: id,
    kind: z.enum(['trade', 'resource', 'financial', 'condemnation']).optional(),
    resource: z.enum(TRADE_RESOURCES).optional(),
  }),
  z.object({ type: z.literal('threat'), to: id }),
  z.object({ type: z.literal('war'), to: id }),
  z.object({ type: z.literal('assist'), id, side: id, kind: z.enum(['military', 'financial']) }),
  z.object({ type: z.literal('institution'), kind: z.enum(['development', 'emergency', 'dispute']) }),
  z.object({ type: z.literal('vote'), support: z.boolean().nullable() }),
  z.object({ type: z.literal('crisis'), choice: z.enum(['intervene', 'appeal', 'market']) }),
  z.object({
    type: z.literal('debug'),
    kind: z.enum(['speed', 'event', 'money', 'approval', 'election', 'recession', 'bot', 'end']),
  }),
]);
export const envelopeSchema = z.object({ requestId: z.string().uuid(), action: actionSchema });
export type Action = z.infer<typeof actionSchema>;
export type Draft = z.infer<typeof draftSchema>;
