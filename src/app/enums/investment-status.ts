// src/app/enums/investment-status.ts

export enum InvestmentStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

// For *ngFor and filtering
export const INVESTMENT_STATUS_VALUES: InvestmentStatus[] =
  Object.values(InvestmentStatus);

