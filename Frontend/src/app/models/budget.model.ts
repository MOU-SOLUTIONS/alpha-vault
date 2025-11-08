/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @models Budget Models
  @description TypeScript interfaces matching backend Budget entities and DTOs
*/

// ===== ENUMS =====
export enum ExpenseCategory {
  HOUSING = 'HOUSING',
  FOOD = 'FOOD',
  TRANSPORT = 'TRANSPORT',
  HEALTHCARE = 'HEALTHCARE',
  ENTERTAINMENT = 'ENTERTAINMENT',
  EDUCATION = 'EDUCATION',
  UTILITIES = 'UTILITIES',
  INSURANCE = 'INSURANCE',
  PERSONAL_CARE = 'PERSONAL_CARE',
  CLOTHING = 'CLOTHING',
  TRAVEL = 'TRAVEL',
  SAVINGS = 'SAVINGS',
  INVESTMENTS = 'INVESTMENTS',
  DEBT_PAYMENT = 'DEBT_PAYMENT',
  GIFTS = 'GIFTS',
  CHARITY = 'CHARITY',
  BUSINESS = 'BUSINESS',
  OTHER = 'OTHER'
}

// ===== MAIN BUDGET MODELS =====
export interface Budget {
  id: number;
  version: number;
  userId: number;
  month: number;
  year: number;
  totalBudget: number;
  totalSpent: number;
  currency: string;
  rolloverEnabled: boolean;
  carryOverAmount?: number;
  alertThresholdPercent: number;
  notes?: string;
  categories: BudgetCategory[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  deletedBy?: string;
  totalRemaining?: number;
}

export interface BudgetCategory {
  id: number;
  budgetId: number;
  category: ExpenseCategory;
  allocated: number;
  spentAmount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  remaining?: number;
}

// ===== REQUEST DTOS =====
export interface BudgetRequestDTO {
  userId: number;
  month: number;
  year: number;
  totalBudget: number;
  currency?: string;
  notes?: string;
  rolloverEnabled?: boolean;
  alertThresholdPercent?: number;
  categories?: BudgetCategoryItemDTO[];
}

export interface BudgetCategoryItemDTO {
  category: ExpenseCategory;
  allocated: number;
}

// ===== RESPONSE DTOS =====
export interface BudgetResponseDTO {
  id: number;
  userId: number;
  month: number;
  year: number;
  currency: string;
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  rolloverEnabled: boolean;
  alertThresholdPercent: number;
  notes?: string;
  categories: BudgetCategoryResponseDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCategoryResponseDTO {
  id: number;
  category: ExpenseCategory;
  allocated: number;
  spentAmount: number;
  remaining: number;
}

// ===== API RESPONSE WRAPPER =====
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  path: string;
  timestamp?: string;
}

// ===== SUMMARY AND ANALYTICS MODELS =====
export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  month: number;
  year: number;
  currency: string;
  categoriesCount: number;
  alertThresholdReached: boolean;
}

export interface BudgetPeriod {
  month: number;
  year: number;
}

export type MonthlyBudgetAggregate = Record<number, number>;

// ===== PAGE RESPONSE =====
export interface BudgetPageResponse {
  content: BudgetResponseDTO[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}