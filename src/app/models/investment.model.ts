import { InvestmentStatus } from '../enums/investment-status';
import { InvestmentType } from '../enums/investment-type';
import { RiskLevel } from '../enums/risk-level';

/**
 * Investment model matching backend InvestmentResponseDTO
 */
export interface Investment {
  id: number;
  userId: number;
  investmentType: InvestmentType;
  name: string;
  symbol?: string;
  currency?: string;
  quantity?: number;
  amountInvested: number;
  fees?: number;
  currentPrice?: number;
  currentValue?: number;
  startDate: string; // MM/dd/yyyy format from backend
  riskLevel?: RiskLevel;
  platform?: string;
  status: InvestmentStatus;
  soldValue?: number;
  soldDate?: string; // MM/dd/yyyy format from backend
  notes?: string;
  version?: number;
  createdAt?: string; // yyyy-MM-dd'T'HH:mm:ss format from backend
  updatedAt?: string; // yyyy-MM-dd'T'HH:mm:ss format from backend
  
  // Derived metrics (computed by backend)
  unrealizedPnl?: number;
  realizedPnl?: number;
  roiPercent?: number;
}

/**
 * InvestmentRequestDTO - for creating/updating investments
 */
export interface InvestmentRequest {
  userId: number;
  investmentType: InvestmentType;
  name: string;
  symbol?: string;
  currency?: string;
  amountInvested: number;
  fees?: number;
  quantity?: number;
  currentPrice?: number;
  startDate: string; // MM/dd/yyyy format
  riskLevel?: RiskLevel;
  platform?: string;
  notes?: string;
}

/**
 * InvestmentResponseDTO - matches backend response
 */
export interface InvestmentResponse extends Investment {}

/**
 * InvestmentPriceUpdateDTO - for updating current price
 */
export interface InvestmentPriceUpdate {
  currentPrice: number;
}

/**
 * InvestmentCloseRequestDTO - for closing an investment
 */
export interface InvestmentCloseRequest {
  soldValue: number;
  soldDate: string; // MM/dd/yyyy format
  note?: string;
}
