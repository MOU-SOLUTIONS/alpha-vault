/**
 * Payment Method Enumeration
 * 
 * @author Mohamed Dhaoui
 * @description Payment methods for income and expense transactions
 */

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  CHECK = 'CHECK',
  TRANSFER = 'TRANSFER',
  CRYPTO = 'CRYPTO',
  PAYPAL = 'PAYPAL'
}

/**
 * Payment method display names for UI
 */
export const PaymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'Cash',
  [PaymentMethod.CARD]: 'Card',
  [PaymentMethod.CHECK]: 'Check',
  [PaymentMethod.TRANSFER]: 'Bank Transfer',
  [PaymentMethod.CRYPTO]: 'Cryptocurrency',
  [PaymentMethod.PAYPAL]: 'PayPal'
};

/**
 * Payment method icons for UI
 */
export const PaymentMethodIcons: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'fas fa-money-bill-wave',
  [PaymentMethod.CARD]: 'fas fa-credit-card',
  [PaymentMethod.CHECK]: 'fas fa-money-check',
  [PaymentMethod.TRANSFER]: 'fas fa-university',
  [PaymentMethod.CRYPTO]: 'fab fa-bitcoin',
  [PaymentMethod.PAYPAL]: 'fab fa-paypal'
};

/**
 * Payment method colors for UI
 */
export const PaymentMethodColors: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: '#28a745',
  [PaymentMethod.CARD]: '#dc3545',
  [PaymentMethod.CHECK]: '#17a2b8',
  [PaymentMethod.TRANSFER]: '#17a2b8',
  [PaymentMethod.CRYPTO]: '#fd7e14',
  [PaymentMethod.PAYPAL]: '#0070ba'
};

/**
 * Payment method options for forms (legacy support)
 */
export const PAYMENT_METHOD_OPTIONS: {
  value: PaymentMethod;
  label: string;
}[] = [
  { value: PaymentMethod.CASH, label: 'Cash' },
  { value: PaymentMethod.CARD, label: 'Card' },
  { value: PaymentMethod.CHECK, label: 'Check' },
  { value: PaymentMethod.TRANSFER, label: 'Bank Transfer' },
  { value: PaymentMethod.CRYPTO, label: 'Cryptocurrency' },
  { value: PaymentMethod.PAYPAL, label: 'PayPal' }
];
