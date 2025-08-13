import { InvestmentType } from '../enums/investment-type';
import { RiskLevel } from '../enums/risk-level';

export interface Investment {
  id: number;
  userId: number;
  investmentType: InvestmentType;
  name: string;
  amountInvested: number;
  currentValue: number;
  startDate: string;
  notes?: string;
  riskLevel?: RiskLevel;
  isSold?: boolean;
  soldValue?: number;
  soldDate?: string;
}

export interface InvestmentRequest {
  userId: number;
  investmentType: InvestmentType;
  name: string;
  amountInvested: number;
  currentValue: number;
  startDate: string;
  notes?: string;
  riskLevel?: RiskLevel;
  isSold?: boolean;
  soldValue?: number;
  soldDate?: string;
}

export interface InvestmentResponse extends Investment {}
