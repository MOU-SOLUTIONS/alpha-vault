import { ExpenseCategory } from '../enums/expense-category';
import { PaymentMethod } from '../enums/payment-method';

/** Matches ExpenseRequestDTO */
export interface ExpenseRequest {
  userId: number;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  description?: string;
}

export interface Expense {
  id: number;
  userId: number;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  description?: string;
}
