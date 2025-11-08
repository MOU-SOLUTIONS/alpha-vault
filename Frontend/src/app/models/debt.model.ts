/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Frontend Models: Debt System
 *  Matches Backend DTOs and Enums
 * ================================================================
 */

// ========== Enums ==========

/** Debt status enum - matches backend DebtStatus */
export enum DebtStatus {
  ACTIVE = 'ACTIVE',
  PAID_OFF = 'PAID_OFF',
  DELINQUENT = 'DELINQUENT',
  DEFAULTED = 'DEFAULTED',
  SETTLED = 'SETTLED'
}

/** Recurrence type enum - matches backend RecurrenceType */
export enum RecurrenceType {
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
  ONE_TIME = 'ONE_TIME'
}

/** Payment method enum - matches backend PaymentMethod */
export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  CASH = 'CASH',
  CHECK = 'CHECK',
  AUTOMATIC = 'AUTOMATIC',
  OTHER = 'OTHER'
}

// ========== Request DTOs ==========

/** Matches backend DebtRequestDTO - for create/update operations */
export interface DebtRequest {
  userId: number;
  creditorName: string;
  accountRef?: string | null;
  currency?: string | null; // ISO 4217 (3 characters)
  principalAmount: number; // Changed from totalAmount
  remainingAmount?: number | null;
  interestRateApr: number; // Changed from interestRate, BigDecimal precision
  billingCycle: RecurrenceType;
  dueDate: string; // LocalDate formatted as "MM/dd/yyyy"
  minPayment: number;
  notes?: string | null;
  status?: DebtStatus | null;
}

/** Matches backend DebtPaymentRequestDTO - for recording payments */
export interface DebtPaymentRequest {
  debtId: number;
  paymentAmount: number;
  paymentMethod: PaymentMethod;
  paymentDate?: string | null; // LocalDate formatted as "MM/dd/yyyy", optional (defaults to today)
  note?: string | null;
}

// ========== Response DTOs ==========

/** Matches backend DebtResponseDTO - complete debt information */
export interface Debt {
  id: number;
  userId: number;
  version?: number | null; // Optimistic locking version
  creditorName: string;
  accountRef?: string | null;
  currency?: string | null;
  principalAmount: number; // Changed from totalAmount
  remainingAmount: number;
  interestRateApr: number; // Changed from interestRate
  billingCycle: RecurrenceType;
  dueDate: string; // LocalDate
  minPayment: number;
  status: DebtStatus;
  notes?: string | null;
  overdue: boolean; // Computed by backend
  daysPastDue?: number | null; // Computed by backend
  createdAt: string; // LocalDateTime
  updatedAt: string; // LocalDateTime
}

/** Matches backend DebtPaymentResponseDTO - payment history entry */
export interface DebtPaymentResponse {
  id: number;
  debtId: number;
  version?: number | null;
  paymentDate: string; // LocalDate
  paymentMethod: PaymentMethod;
  paymentAmount: number;
  remainingAfterPayment: number;
  note?: string | null;
  createdAt: string; // LocalDateTime
}

// ========== Legacy/Helper Interfaces ==========

/** Legacy interface - kept for backward compatibility during migration */
export interface DebtHistoryItem {
  paymentDate: string;
  paymentAmount: number;
  remainingAmount: number;
  note?: string;
}
