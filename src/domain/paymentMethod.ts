import type { PaymentMethod } from '@/domain/match';

export const PAYMENT_SERVICE_PRESETS = [
  { value: 'paypal', label: 'PayPal' },
  { value: 'venmo', label: 'Venmo' },
  { value: 'zelle', label: 'Zelle' },
  { value: 'stripe', label: 'Stripe' },
  { value: 'cashapp', label: 'Cash App' },
  { value: 'other', label: 'Other' },
] as const;

export type PaymentServicePreset =
  (typeof PAYMENT_SERVICE_PRESETS)[number]['value'];

export function formatPaymentMethodLabel(
  method: PaymentMethod,
  detail?: string,
): string {
  if (method === 'cash') return 'Cash';
  if (method === 'electronic') {
    const preset = PAYMENT_SERVICE_PRESETS.find((item) => item.value === detail);
    if (preset && preset.value !== 'other') return preset.label;
    return detail?.trim() || 'Electronic';
  }
  if (method === 'other') {
    const preset = PAYMENT_SERVICE_PRESETS.find((item) => item.value === detail);
    if (preset && preset.value !== 'other') return preset.label;
    return detail?.trim() || 'Other';
  }
  return method;
}

export function parsePaymentMethodDetail(detail?: string): {
  preset: PaymentServicePreset | '';
  custom: string;
} {
  if (!detail?.trim()) {
    return { preset: '', custom: '' };
  }

  const preset = PAYMENT_SERVICE_PRESETS.find((item) => item.value === detail);
  if (preset) {
    return { preset: preset.value, custom: '' };
  }

  return { preset: 'other', custom: detail };
}

export function serializePaymentMethodDetail(
  preset: PaymentServicePreset | '',
  custom: string,
): string | undefined {
  if (!preset) return undefined;
  if (preset === 'other') {
    const trimmed = custom.trim();
    return trimmed || undefined;
  }
  return preset;
}
