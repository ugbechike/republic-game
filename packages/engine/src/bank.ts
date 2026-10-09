import { ensureEconomy } from './economic-history';
import type { Republic, Room } from '@republic/contracts';
import { notice, requireThat } from './helpers';
export function emergencyFacility(room: Room, r: Republic) {
  requireThat(!r.bankFacility, 'An emergency facility is already outstanding');
  requireThat(r.metrics.treasury < 5, 'Emergency facilities require reserves below $5B');
  const caps: Record<string, number> = {};
  for (const key of Object.keys(r.policies) as (keyof typeof r.policies)[])
    if (!key.endsWith('Tax')) {
      caps[key] = Math.floor(r.policies[key] * 0.92);
      r.policies[key] = caps[key];
    }
  r.policies.corporateTax = Math.min(40, r.policies.corporateTax + 3);
  r.pendingPolicies = r.pendingPolicies.filter((p) => p.key === 'incomeTax');
  r.metrics.treasury += 5;
  r.metrics.debt += 5.35;
  r.bankFacility = {
    principal: 5,
    remaining: 5.35,
    ends: room.month + 60,
    spendingCaps: caps,
    taxFloor: r.policies.corporateTax,
    suspensionEnds: room.month + 24,
  };
  notice(
    room,
    `${r.name} accepted $5B at 7% total interest. Spending caps and a corporate-tax floor bind for five years; infrastructure construction is suspended for two years.`,
  );
}
export function bankTick(room: Room, r: Republic) {
  const f = r.bankFacility;
  if (!f) return;
  const paid = Math.min(r.metrics.treasury, Math.min(f.remaining, 5.35 / 60));
  r.metrics.treasury -= paid;
  ensureEconomy(r).expenditure += paid;
  r.metrics.debt = Math.max(0, r.metrics.debt - paid);
  f.remaining -= paid;
  if (f.remaining < 0.001 && room.month >= f.ends) {
    delete r.bankFacility;
    notice(room, `${r.name} has repaid its emergency facility. Conditions are lifted.`, [r.id]);
  }
  if (room.month >= f.ends && f.remaining > 0.001) r.credit = Math.max(0, (r.credit ?? 70) - 1);
}
