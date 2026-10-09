import type { Action, Republic, Room } from '@republic/contracts';
import { clamp, notice, other, requireThat, spend, uid } from './helpers';
import { embargo } from './embargo';
export function loanAction(room: Room, me: Republic, a: Action) {
  if (a.type === 'loan') {
    const target = other(room, me, a.to),
      repayment = a.repayment ?? a.amount * 1.1;
    requireThat(!embargo(room, me.id, target.id, [], true), 'Financial sanctions block lending');
    requireThat(a.amount <= Math.max(1, (target.credit ?? 70) / 5), 'Borrower credit rating limits this principal');
    requireThat(
      repayment >= a.amount && repayment <= a.amount * 2,
      'Repayment must be between principal and twice principal',
    );
    requireThat(
      room.loans.filter((l) => l.from === me.id && l.status === 'pending').length < 4,
      'Resolve pending loan offers first',
    );
    requireThat(me.metrics.treasury >= a.amount, 'Insufficient reserves to offer this loan');
    room.loans.push({
      id: uid(room),
      from: me.id,
      to: a.to,
      amount: a.amount,
      remaining: repayment,
      repayment,
      term: a.term ?? 24,
      months: a.term ?? 24,
      mode: a.mode ?? 'installments',
      status: 'pending',
      arrears: 0,
    });
    notice(
      room,
      `${me.name} offers ${target.name} $${a.amount}B; $${repayment.toFixed(1)}B repayable over ${(a.term ?? 24) / 12} years.`,
      [me.id, a.to],
    );
    return true;
  }
  if (a.type === 'loanResponse') {
    const l = room.loans.find((l) => l.id === a.id);
    requireThat(l && l.to === me.id && l.status === 'pending', 'Loan offer unavailable');
    if (!a.accept) {
      l.status = 'rejected';
      return true;
    }
    requireThat(!embargo(room, l.from, l.to, [], true), 'Financial sanctions block lending');
    requireThat(l.amount <= Math.max(1, (me.credit ?? 70) / 5), 'Borrower credit rating has deteriorated');
    spend(
      room.republics.find((r) => r.id === l.from)!,
      l.amount,
    );
    me.metrics.treasury += l.amount;
    me.metrics.debt += l.remaining;
    l.status = 'active';
    l.due = room.month + (l.term ?? 24);
    notice(room, `${me.name} accepted the bilateral loan.`, [l.from, l.to]);
    return true;
  }
  return false;
}
export function loansTick(room: Room) {
  for (const l of room.loans.filter((l) => l.status === 'active')) {
    const lender = room.republics.find((r) => r.id === l.from)!,
      borrower = room.republics.find((r) => r.id === l.to)!;
    const due =
      l.mode === 'bullet'
        ? room.month >= (l.due ?? Infinity)
          ? l.remaining
          : 0
        : Math.min(l.remaining, (l.repayment ?? l.amount * 1.1) / (l.term ?? 24));
    const paid = embargo(room, l.from, l.to, [], true) ? 0 : Math.min(borrower.metrics.treasury, due);
    borrower.metrics.treasury -= paid;
    borrower.metrics.debt = Math.max(0, borrower.metrics.debt - paid);
    lender.metrics.treasury += paid;
    l.remaining -= paid;
    if (paid + 0.001 < due) {
      l.arrears = (l.arrears ?? 0) + 1;
      borrower.credit = clamp((borrower.credit ?? 70) - 2);
      borrower.reputation = clamp(borrower.reputation - 1);
    }
    l.months = Math.max(0, l.months - 1);
    if (l.remaining < 0.001) {
      l.status = 'paid';
      borrower.credit = clamp((borrower.credit ?? 70) + 3);
      notice(room, `${borrower.name} repaid ${lender.name}.`, [l.from, l.to]);
    } else if ((l.due !== undefined && room.month >= l.due) || (l.arrears ?? 0) >= 6) {
      l.status = 'defaulted';
      borrower.reputation = clamp(borrower.reputation - 12);
      borrower.credit = clamp((borrower.credit ?? 70) - 20);
      borrower.relations ??= {};
      borrower.relations[l.from] = (borrower.relations[l.from] ?? 0) - 15;
      notice(
        room,
        `${borrower.name} defaulted on its loan to ${lender.name}; unpaid debt remains, credit and relations deteriorate.`,
      );
    }
  }
}
