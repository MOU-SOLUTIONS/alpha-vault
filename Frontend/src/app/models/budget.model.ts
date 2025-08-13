// ─────────────────────────────────────────────────────────────
// Angular Models for Budget
// ─────────────────────────────────────────────────────────────

export interface BudgetCategory {
  category: string;
  allocated: number;
  remaining: number;
}

export interface BudgetRequest {
  userId: number;
  month: number;
  year: number;
  totalBudget: number;
  totalRemaining: number;
  categories: BudgetCategory[];
}

export interface BudgetResponse {
  id: number;
  userId: number;
  month: number;
  year: number;
  totalBudget: number;
  totalRemaining: number;
  categories: BudgetCategory[];
}

export interface Budget {
  id: number;
  userId: number;
  month: number;
  year: number;
  totalBudget: number;
  totalRemaining: number;
  categories: BudgetCategory[];
}
