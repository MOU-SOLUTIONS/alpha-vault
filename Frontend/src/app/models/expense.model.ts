/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @model Expense
  @description Expense model interfaces matching backend DTOs
*/

import { ExpenseCategory } from '../enums/expense-category';
import { PaymentMethod } from '../enums/payment-method';

// ===== API RESPONSE =====
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  path: string;
  timestamp?: string;
}

// ===== REQUEST DTO =====
export interface ExpenseRequestDTO {
  userId: number;
  category: ExpenseCategory;
  amount: number;
  currency?: string;
  date: string;
  paymentMethod: PaymentMethod;
  description?: string;
}

// ===== RESPONSE DTO =====
export interface ExpenseResponseDTO {
  id: number;
  userId: number;
  category: ExpenseCategory;
  amount: number;
  currency?: string;
  date: string;
  paymentMethod: PaymentMethod;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// ===== PAGE RESPONSE =====
export interface ExpensePageResponse {
  content: ExpenseResponseDTO[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// ===== SUMMARY INTERFACES =====
export type PaymentMethodSummary = Record<string, number>;

export type CategorySummary = Record<string, number>;

export type Top5Expenses = Record<string, number>;

// ===== LEGACY INTERFACES (for backward compatibility) =====
export interface ExpenseRequest extends ExpenseRequestDTO {}
export interface Expense extends ExpenseResponseDTO {}
