/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Frontend Enums: Saving Goal Types
 *  Matches backend enums with proper JSON serialization
 * ================================================================
 */

export type SavingGoalCategory =
  | 'HEALTH'
  | 'MARRIAGE'
  | 'EDUCATION'
  | 'TRAVEL'
  | 'EMERGENCY'
  | 'OTHER';

export type SavingGoalPriority =
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW';

export type SavingGoalStatus =
  | 'ACTIVE'
  | 'COMPLETED'
  | 'PAUSED'
  | 'CANCELLED';

export const SAVING_GOAL_CATEGORY_OPTIONS: {
  value: SavingGoalCategory;
  label: string;
}[] = [
  { value: 'HEALTH', label: 'Health' },
  { value: 'MARRIAGE', label: 'Marriage' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'TRAVEL', label: 'Travel' },
  { value: 'EMERGENCY', label: 'Emergency' },
  { value: 'OTHER', label: 'Other' },
];

export const SAVING_GOAL_PRIORITY_OPTIONS: {
  value: SavingGoalPriority;
  label: string;
}[] = [
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

export const SAVING_GOAL_STATUS_OPTIONS: {
  value: SavingGoalStatus;
  label: string;
}[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

// Helper functions for enum conversion (matches backend JSON serialization)
export const SavingGoalCategoryUtils = {
  fromJson: (value: string): SavingGoalCategory => {
    return value.toUpperCase() as SavingGoalCategory;
  },
  toJson: (value: SavingGoalCategory): string => {
    return value.toLowerCase();
  }
};

export const SavingGoalPriorityUtils = {
  fromJson: (value: string): SavingGoalPriority => {
    return value.toUpperCase() as SavingGoalPriority;
  },
  toJson: (value: SavingGoalPriority): string => {
    return value.toLowerCase();
  }
};

export const SavingGoalStatusUtils = {
  fromJson: (value: string): SavingGoalStatus => {
    return value.toUpperCase() as SavingGoalStatus;
  },
  toJson: (value: SavingGoalStatus): string => {
    return value.toLowerCase();
  }
};
