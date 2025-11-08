/* ========== USER MODELS ========== */

/** User request payload for creation/update */
export interface UserRequestDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  preferredLanguage?: string;
  preferredCurrency?: string;
  profileImageUrl?: string;
}

/** User response payload from API */
export interface UserResponseDTO {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  preferredLanguage?: string;
  preferredCurrency?: string;
  profileImageUrl?: string;
  twoFactorEnabled: boolean;
  isVerified: boolean;
  isActive: boolean;
  accountType: string; // AccountType enum from backend
  lastLoginAt?: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/** Complete user model matching backend entity */
export interface User {
  // ============================================================
  // == Identification & Credentials
  // ============================================================
  id: number;
  email: string;
  password?: string; // Optional in frontend, only for updates

  // ============================================================
  // == Personal Information
  // ============================================================
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  preferredLanguage?: string;
  preferredCurrency?: string;

  // ============================================================
  // == Security & Access Control
  // ============================================================
  twoFactorEnabled: boolean;
  isVerified: boolean;
  emailVerifiedAt?: Date;
  isActive: boolean;
  failedLoginAttempts?: number;
  accountLockedUntil?: Date;
  
  // Password reset fields
  passwordResetToken?: string;
  passwordResetTokenExpiry?: Date;
  accountType: string; // AccountType enum from backend

  // ============================================================
  // == Legal & User Activity
  // ============================================================
  lastLoginAt?: Date;
  termsAcceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // ============================================================
  // == Relationships (optional, may not always be loaded)
  // ============================================================
  incomes?: any[]; // Income[]
  expenses?: any[]; // Expense[]
  savingGoals?: any[]; // SavingGoal[]
  debts?: any[]; // Debt[]
  investments?: any[]; // Investment[]
}
