/* ========== INCOME MODELS ========== */

/** Generic API response wrapper from backend */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  path: string;
  timestamp?: string;
}

// ============================================================
// == INCOME DTOs
// ============================================================

/** Income request payload for create/update operations */
export interface IncomeRequestDTO {
  userId: number;
  source: string;
  amount: number;
  currency?: string;
  date: string; // MM/dd/yyyy format
  paymentMethod: PaymentMethod;
  received: boolean;
  description?: string;
}

/** Income response payload from backend */
export interface IncomeResponseDTO {
  id: number;
  userId: number;
  source: string;
  amount: number;
  currency?: string;
  date: string; // MM/dd/yyyy format
  paymentMethod: PaymentMethod;
  received: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}



// ============================================================
// == LEGACY SUPPORT (for existing components)
// ============================================================

/** Legacy Income interface for backward compatibility */
export interface Income {
  id: number;
  userId: number;
  source: string;
  amount: number;
  date: string;
  recurrenceType?: string;
  description?: string;
  paymentMethod: PaymentMethod;
  isReceived: boolean;
  // Add missing fields for compatibility
  received: boolean; // Required field that maps to isReceived
  currency?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================
// == ENUMS
// ============================================================

/** Payment method enumeration */
export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  CHECK = 'CHECK',
  TRANSFER = 'TRANSFER',
  CRYPTO = 'CRYPTO',
  PAYPAL = 'PAYPAL'
}

// ============================================================
// == ANALYTICS RESPONSES
// ============================================================

/** Paginated income list response */
export interface IncomePageResponse {
  content: IncomeResponseDTO[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

/** Payment method summary response */
export type PaymentMethodSummary = Record<string, number>;

/** Source summary response */
export type SourceSummary = Record<string, number>;

/** Top 5 incomes response */
export type Top5Incomes = Record<string, number>;

/** Weekly incomes response */
export type WeeklyIncomes = Record<string, number>;

/** Yearly incomes response */
export type YearlyIncomes = Record<string, number>;

// ============================================================
// == FORM MODELS
// ============================================================

/** Income form data for UI */
export interface IncomeFormData {
  source: string;
  amount: number;
  currency?: string;
  date: string;
  paymentMethod: PaymentMethod;
  received: boolean;
  description?: string;
}

/** Income filter options */
export interface IncomeFilterOptions {
  startDate?: string;
  endDate?: string;
  paymentMethod?: PaymentMethod;
  source?: string;
  received?: boolean;
}

// ============================================================
// == UTILITY TYPES
// ============================================================

/** Income statistics for dashboard */
export interface IncomeStats {
  today: number;
  currentWeek: number;
  currentMonth: number;
  currentYear: number;
  previousWeek: number;
  previousMonth: number;
  previousYear: number;
  weeklyEvolution: number;
  monthlyEvolution: number;
  yearlyEvolution: number;
}

/** Income chart data */
export interface IncomeChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
  }[];
}
