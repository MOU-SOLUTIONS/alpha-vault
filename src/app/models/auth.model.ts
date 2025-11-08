/* ========== AUTHENTICATION MODELS ========== */

/** Generic API response wrapper from backend */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  path: string;
  timestamp?: string;
}

// ============================================================
// == AUTHENTICATION DTOs
// ============================================================

/** Login request payload */
export interface LoginRequestDTO {
  email: string;
  password: string;
}

/** Forgot password request payload */
export interface ForgotPasswordRequestDTO {
  email: string;
}

/** Reset password request payload */
export interface ResetPasswordRequestDTO {
  resetToken: string;
  newPassword: string;
}

/** Change password request payload */
export interface ChangePasswordRequestDTO {
  currentPassword: string;
  newPassword: string;
}

// ============================================================
// == AUTHENTICATION RESPONSES
// ============================================================

/** Login response with user data and token */
export interface LoginResponseDTO {
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
  accountType: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  // Authentication fields
  token?: string;
  tokenType?: string;
  expiresIn?: number;
  session?: boolean; // For cookie-based session authentication
}

/** Registration response */
export interface RegisterResponseDTO {
  user: any; // UserResponseDTO from backend
  message: string;
}

/** Password reset response */
export interface PasswordResetResponseDTO {
  message: string;
  email: string;
}

/** Change password response */
export interface ChangePasswordResponseDTO {
  message: string;
  success: boolean;
}
