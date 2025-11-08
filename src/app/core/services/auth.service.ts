import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
    ApiResponse,
    ChangePasswordRequestDTO,
    ChangePasswordResponseDTO,
    ForgotPasswordRequestDTO,
    LoginRequestDTO,
    LoginResponseDTO,
    PasswordResetResponseDTO,
    RegisterResponseDTO,
    ResetPasswordRequestDTO
} from '../../models/auth.model';
import { UserRequestDTO } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Use environment variable for API URL to support different environments
  private base = `${environment.apiUrl}/auth`;
  private userIdSubject = new BehaviorSubject<number | null>(this.getUserId());
  userId$ = this.userIdSubject.asObservable();

  constructor(private http: HttpClient) {}

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /** Returns the saved user-ID, or `null` if none */
  getUserId(): number | null {
    const id = localStorage.getItem('userId');
    return id ? parseInt(id, 10) : null;
  }

  /** Clears all auth information */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('authType');
    this.userIdSubject.next(0);
  }

  /** Login using AuthController endpoint */
  login(dto: LoginRequestDTO): Observable<ApiResponse<LoginResponseDTO>> {
    return this.http.post<ApiResponse<LoginResponseDTO>>(`${this.base}/login`, dto);
  }

  /** Register using AuthController endpoint */
  register(dto: UserRequestDTO): Observable<ApiResponse<RegisterResponseDTO>> {
    return this.http.post<ApiResponse<RegisterResponseDTO>>(`${this.base}/register`, dto);
  }

  /** Forgot password using AuthController endpoint */
  forgotPassword(dto: ForgotPasswordRequestDTO): Observable<ApiResponse<PasswordResetResponseDTO>> {
    return this.http.post<ApiResponse<PasswordResetResponseDTO>>(`${this.base}/forgot-password`, dto);
  }

  /** Reset password using token via AuthController endpoint */
  resetPassword(dto: ResetPasswordRequestDTO): Observable<ApiResponse<PasswordResetResponseDTO>> {
    return this.http.post<ApiResponse<PasswordResetResponseDTO>>(`${this.base}/reset-password`, dto);
  }

  /** Change password using AuthController endpoint */
  changePassword(id: number, dto: ChangePasswordRequestDTO): Observable<ApiResponse<ChangePasswordResponseDTO>> {
    return this.http.post<ApiResponse<ChangePasswordResponseDTO>>(`${this.base}/change-password/${id}`, dto);
  }

  /** Check if user is authenticated */
  isAuthenticated(): boolean {
    // Check for JWT token-based auth
    const token = this.getToken();
    const hasToken = token !== null;
    const hasUserId = this.getUserId() !== null;
    
    // If we have a token, validate it's not expired
    if (hasToken && token) {
      if (!this.isTokenValid(token)) {
        // Token is expired, clear auth data
        this.logout();
        return false;
      }
    }
    
    // Check for session-based auth
    const isSessionAuth = localStorage.getItem('authType') === 'session';
    const hasUserData = this.getCurrentUser() !== null;
    
    // User is authenticated if they have either:
    // 1. Valid JWT token + user ID, OR
    // 2. Session-based auth + user data
    return (hasToken && hasUserId) || (isSessionAuth && hasUserData);
  }

  /**
   * Validates if a JWT token is expired
   * @param token JWT token string
   * @returns true if token is valid (not expired), false otherwise
   */
  private isTokenValid(token: string): boolean {
    try {
      // JWT tokens have 3 parts separated by dots: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        return false; // Invalid token format
      }

      // Decode the payload (second part)
      const payload = JSON.parse(atob(parts[1]));
      
      // Check if token has expiration claim
      if (!payload.exp) {
        // No expiration claim, assume token is valid (session-based might not have exp)
        return true;
      }

      // Check if token is expired
      // exp is in seconds, Date.now() is in milliseconds
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      
      // Add 5 minute buffer to account for clock skew
      const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
      
      return currentTime < (expirationTime - bufferTime);
    } catch (error) {
      // If we can't parse the token, consider it invalid
      return false;
    }
  }

  /** Store authentication data */
  setAuthData(token: string, userId: number): void {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId.toString());
    this.userIdSubject.next(userId);
  }

  /** Get current user from local storage */
  getCurrentUser(): any {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  /** Store current user in local storage */
  setCurrentUser(user: any): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
}
