import type { Action, Republic, Room } from '@republic/contracts';
import { observed } from './economic-history';
import { clamp, notice, requireThat, spend, uid } from './helpers';
export function officeDirector(room: Room) {
  const now = room.activeMs ?? 0;
  for (const r of room.republics) {
    r.officeMatters ??= [];
    for (const matter of r.officeMatters.filter((m) => m.status === 'open' && now >= m.dueAt)) {
      matter.status = 'expired';
      matter.outcome =
        matter.kind === 'business' ? 'Investors moved on.' : 'Reimbursement missed; regional confidence fell.';
      if (matter.kind === 'governor')
        observed(r, matter.outcome, () => {
          r.metrics.approval = clamp(r.metrics.approval - 1);
          const region = r.regions.find((s) => s.id === matter.region)!;
          region.stability = clamp(region.stability - 4);
        });
      notice(room, matter.outcome, [r.id]);
    }
    if (now < (r.nextOfficeAt ?? 60000) || r.officeMatters.some((m) => m.status === 'open') || r.id.startsWith('bot-'))
      continue;
    const region = [...r.regions].sort((a, b) => a.infrastructure - b.infrastructure)[0];
    const business = r.metrics.energy >= 45 && r.metrics.treasury >= 2 && r.officeMatters.at(-1)?.kind !== 'business';
    r.officeMatters.push({
      id: uid(room),
      kind: business ? 'business' : 'governor',
      source: business ? 'Business Council' : `Governor · ${region.name}`,
      region: region.id,
      title: business ? 'A new factory, if we act.' : 'The state has carried the cost.',
      summary: business
        ? `Manufacturers are considering ${region.name}. Reliable power and road access will decide it.`
        : `${region.name} has repaired a federal road. The Governor requests $0.62B reimbursement.`,
      priority: business ? 'normal' : 'important',
      createdAt: now,
      dueAt: now + 240000,
      status: 'open',
    });
    r.officeMatters = r.officeMatters.slice(-16);
    r.nextOfficeAt = now + 300000;
    notice(room, `${r.officeMatters.at(-1)!.source}: ${r.officeMatters.at(-1)!.title}`, [r.id]);
  }
}
export function officeDecision(room: Room, r: Republic, a: Action) {
  if (a.type !== 'officeDecision') return false;
  const m = r.officeMatters?.find((m) => m.id === a.id && m.status === 'open');
  requireThat(m && (room.activeMs ?? 0) < m.dueAt, 'This matter has closed');
  const region = r.regions.find((s) => s.id === m.region)!;
  observed(r, `${m.source}: ${a.choice}`, () => {
    if (m.kind === 'governor') {
      requireThat(['fund', 'partial', 'refuse'].includes(a.choice), 'Choose a reimbursement response');
      const scale = a.choice === 'fund' ? 1 : a.choice === 'partial' ? 0.5 : 0;
      spend(r, 0.62 * scale);
      region.stability = clamp(region.stability + (scale ? 4 * scale : -4));
      region.development = clamp(region.development + scale);
      if (scale && region.flood) region.flood.recovering = true;
      r.metrics.approval = clamp(r.metrics.approval + (scale ? scale : -1));
      m.outcome = scale
        ? `Reimbursement approved: $${(0.62 * scale).toFixed(2)}B. Regional confidence improves.`
        : 'Reimbursement refused. Regional confidence falls.';
    } else {
      requireThat(['support', 'incentive', 'refuse'].includes(a.choice), 'Choose a business response');
      if (a.choice !== 'refuse') {
        requireThat(
          !r.bankFacility || a.choice !== 'support',
          'Infrastructure programmes are suspended under the emergency facility',
        );
        spend(r, a.choice === 'support' ? 1.2 : 0.6);
        r.effects.push({ month: room.month + 6, metric: 'gdp', amount: a.choice === 'support' ? 1.8 : 1 });
        r.effects.push({ month: room.month + 6, metric: 'unemployment', amount: -0.4 });
        const plot = region.plots.find((p) => p.stage === 0) ?? region.plots.find((p) => p.kind === 'factory');
        if (plot) {
          plot.kind = 'factory';
          plot.stage = 1;
        }
        region.development = clamp(region.development + 2);
        m.outcome = 'Factory approved. Construction begins; output and jobs arrive in six months.';
      } else m.outcome = 'No support offered. The investors will look elsewhere.';
    }
    m.status = 'resolved';
  });
  notice(room, m.outcome!, [r.id]);
  return true;
}
