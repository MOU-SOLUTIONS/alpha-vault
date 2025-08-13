import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = '/api/auth';
  private userIdSubject = new BehaviorSubject<number | null>(this.getUserId()); // BehaviorSubject initialized with stored userId
  userId$ = this.userIdSubject.asObservable(); // Observable for components to subscribe to

  constructor(private http: HttpClient) {}

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /** Returns the saved user-ID, or `null` if none */
  getUserId(): number | null {
    const id = localStorage.getItem('userId');
    return id ? parseInt(id, 10) : 0; // or some sentinel like -1
  }

  /** Clears all auth information */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    // maybe navigate to /auth here
  }

  login(dto: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/login`, dto);
  }

  register(dto: RegisterRequest): Observable<void> {
    return this.http.post<void>(`${this.base}/register`, dto);
  }

  requestPasswordReset(email: string): Observable<void> {
    return this.http.post<void>(`${this.base}/register`, email);
  }
}
