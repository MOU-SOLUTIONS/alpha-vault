import { PaymentMethod } from '../enums/payment-method';

/** Matches IncomeRequestDTO */
export interface IncomeRequest {
  userId: number;
  source: string;
  amount: number;
  date: string;
  recurrenceType?: string;
  description?: string;
  paymentMethod: PaymentMethod;
  isReceived: boolean; // NEW
}

/** Matches IncomeResponseDTO */
export interface Income {
  id: number;
  userId: number;
  source: string;
  amount: number;
  date: string;
  description?: string;
  paymentMethod: PaymentMethod;
  recurrenceType?: string;
  isReceived: boolean; // NEW
}
