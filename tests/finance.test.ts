import './insights.test';
import './backNav.test';
import assert from 'node:assert/strict';
import { getMatchFinanceTotals, getSettlementPaidTotal } from '../src/features/matches/paySummary';
import { needsSettlementAttention, updateExpenseAmount } from '../src/features/matches/matchClosure';
import { fromDateTimeInputValue, toDateTimeInputValue } from '../src/ui/forms/formDateUtils';
import { tournamentEvent } from '../src/features/tournaments/tournamentEvent';
import { buildMatchFromForm, createEmptyMatchForm } from '../src/features/matches/matchFormUtils';
import type { Match } from '../src/domain/match';

const now = new Date();
const match: Match = {
  ...buildMatchFromForm(createEmptyMatchForm()), id: 'test', createdAt: now, updatedAt: now,
  kickoffAt: new Date(2099, 1, 1), payStatus: 'paid', paidAmount: 100,
  flight: { selfPaid: true, amountPaid: 200, reimbursementStatus: 'reimbursed', reimbursedAmount: 150 },
  expenses: [{ id: 'food', category: 'food', amount: 30, reimbursementStatus: 'not_expected', createdAt: now }],
};
assert.equal(getSettlementPaidTotal(match), 250);
assert.equal(getSettlementPaidTotal({ ...match, paidAmount: 175 }), 325);
assert.equal(getSettlementPaidTotal({ ...match, payStatus: 'unpaid' }), 150);
assert.equal(getSettlementPaidTotal({ ...match, payStatus: 'donated' }), 150);
assert.equal(getSettlementPaidTotal({ ...match, paidAmount: undefined, expectedPay: 100 }), 250);
assert.equal(getSettlementPaidTotal({ ...match, paidAmount: 0, expectedPay: 100 }), 150);
let totals = getMatchFinanceTotals(match);
assert.equal(totals.combinedExpenseTotal, 230);
assert.equal(totals.reimbursedTotal, 150);
assert.equal(100 + totals.reimbursedTotal - totals.combinedExpenseTotal, 20);
assert.equal(needsSettlementAttention(match), false);
assert.equal(needsSettlementAttention({ ...match, payStatus: 'unpaid', settlementClosed: true }), true);
const duplicate: Match = { ...match, expenses: [...match.expenses!, {
  id: 'air', category: 'airfare', amount: 200, reimbursementStatus: 'reimbursed', reimbursedAmount: 150, createdAt: now,
}, { id: 'miles', category: 'miles_driven', miles: 350, amount: 0, reimbursementStatus: 'not_expected', createdAt: now }] };
totals = getMatchFinanceTotals(duplicate);
assert.equal(totals.combinedExpenseTotal, 230);
assert.equal(totals.reimbursedTotal, 150);
assert.equal(needsSettlementAttention({ ...duplicate, flight: { ...match.flight, reimbursementStatus: 'pending' } }), false);
const fullReimbursement: Match = { ...match, expenses: [{ id: 'hotel', category: 'lodging', amount: 100, reimbursedAmount: 100, reimbursementStatus: 'reimbursed', createdAt: now }] };
assert.equal(updateExpenseAmount(fullReimbursement, 'hotel', 120).expenses?.[0].reimbursedAmount, 120);
const date = new Date(2026, 8, 13, 14, 35);
assert.equal(toDateTimeInputValue(date), '2026-09-13T14:35');
assert.equal(fromDateTimeInputValue(toDateTimeInputValue(date))?.getTime(), date.getTime());
assert.equal(toDateTimeInputValue(new Date('invalid')), '');
assert.equal(fromDateTimeInputValue('invalid'), undefined);
const parent = tournamentEvent({ id: 'parent', ownerUid: 'local', title: 'Cup', startDate: '2026-09-13', endDate: '2026-09-15', createdAt: now, updatedAt: now, expenses: match.expenses, settlement: { payStatus: 'paid', paidAmount: 300 } });
assert.equal(parent.paidAmount, 300);
assert.equal(getMatchFinanceTotals(parent).combinedExpenseTotal, 30);
console.log('Finance, settlement, mileage, tournament, and date regression checks passed.');
