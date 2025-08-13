export type PaymentMethod =
  | 'CASH'
  | 'CARD'
  | 'CHECK'
  | 'TRANSFER'
  | 'CRYPTO'
  | 'PAYPAL';

export const PAYMENT_METHOD_OPTIONS: {
  value: PaymentMethod;
  label: string;
}[] = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'CHECK', label: 'Check' },
  { value: 'TRANSFER', label: 'Bank Transfer' },
  { value: 'CRYPTO', label: 'Crypto' },
  { value: 'PAYPAL', label: 'PayPal' },
];
