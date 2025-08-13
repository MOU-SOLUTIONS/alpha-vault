/* ========== AUTHENTICATION MODELS ========== */

/** Login request payload */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Registration request payload */
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/** Response returned after successful auth */
export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
}
