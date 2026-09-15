import type { ReimbursementStatus } from '@/domain/match';

export const REIMBURSEMENT_STATUS_LABELS: Record<ReimbursementStatus, string> = {
  not_expected: 'Self expense',
  pending: 'Waiting for reimbursement',
  reimbursed: 'Reimbursed',
};

export function normalizeReimbursementStatus(
  status?: ReimbursementStatus,
): ReimbursementStatus {
  if (status === 'reimbursed') return 'reimbursed';
  if (status === 'pending') return 'pending';
  return 'not_expected';
}
