/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Frontend Models: Saving Goal Types
 *  Matches backend entity and DTOs with proper typing
 * ================================================================
 */

import { SavingGoalCategory, SavingGoalPriority, SavingGoalStatus } from '../enums/saving-goal';

// ================= Request DTOs ================================

export interface SavingGoalRequestDTO {
  userId: number;
  name: string;
  category: SavingGoalCategory;
  priority: SavingGoalPriority;
  targetAmount: number;
  currentAmount?: number; // Optional, defaults to 0
  currency?: string; // Optional ISO 4217 currency code
  deadline: string; // ISO date string (YYYY-MM-DD)
  notes?: string; // Optional free text notes
  status?: SavingGoalStatus; // Optional status for pause/cancel/reactivate
}

// ================= Response DTOs ================================

export interface SavingGoalResponseDTO {
  id: number;
  userId: number;
  version: number; // For optimistic concurrency control
  name: string;
  category: SavingGoalCategory;
  priority: SavingGoalPriority;
  status: SavingGoalStatus;
  currency?: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number; // Computed field from backend
  progressPercent: number; // Computed field from backend (0-100)
  deadline: string; // ISO date string (YYYY-MM-DD)
  achievedAt?: string; // ISO datetime string, set when goal is completed
  notes?: string;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

// ================= Legacy Compatibility ========================

/** @deprecated Use SavingGoalResponseDTO instead */
export interface SavingGoal extends SavingGoalResponseDTO {}

/** @deprecated Use SavingGoalRequestDTO instead */
export interface SavingGoalRequest extends SavingGoalRequestDTO {}

/** @deprecated Use SavingGoalResponseDTO instead */
export interface SavingGoalResponse extends SavingGoalResponseDTO {}

// ================= Utility Types ================================

export interface SavingGoalFormData {
  name: string;
  category: SavingGoalCategory;
  priority: SavingGoalPriority;
  targetAmount: number;
  currentAmount: number;
  currency?: string;
  deadline: string;
  notes?: string;
}

export interface SavingGoalUpdateData {
  name?: string;
  category?: SavingGoalCategory;
  priority?: SavingGoalPriority;
  targetAmount?: number;
  currentAmount?: number;
  currency?: string;
  deadline?: string;
  notes?: string;
  status?: SavingGoalStatus;
}

// ================= Computed Properties ==========================

export interface SavingGoalComputed {
  isCompleted: boolean;
  isOverdue: boolean;
  daysRemaining: number;
  isNearDeadline: boolean; // Within 30 days
  progressStatus: 'on-track' | 'behind' | 'ahead' | 'completed';
}

// ================= API Response Types ==========================

export interface SavingGoalListResponse {
  content: SavingGoalResponseDTO[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

export interface SavingGoalStatsResponse {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  totalTargetAmount: number;
  totalCurrentAmount: number;
  totalRemainingAmount: number;
  averageProgress: number;
  goalsByCategory: Record<SavingGoalCategory, number>;
  goalsByPriority: Record<SavingGoalPriority, number>;
  goalsByStatus: Record<SavingGoalStatus, number>;
}
