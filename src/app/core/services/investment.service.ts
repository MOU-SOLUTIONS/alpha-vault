/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Service: InvestmentService - Complete CRUD, MTM, close/reopen
 *  Matches backend InvestmentController with all endpoints
 * ================================================================
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

import { InvestmentType } from '../../enums/investment-type';
import { ApiResponse } from '../../models/auth.model';
import {
    InvestmentCloseRequest,
    InvestmentPriceUpdate,
    InvestmentRequest,
    InvestmentResponse,
} from '../../models/investment.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class InvestmentService {
  private readonly baseUrl = '/api/investments';
  private userId: number | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Service-level subscription to userId$ is safe:
    // - Service is providedIn: 'root' (singleton, lives for app lifetime)
    // - userId$ is a BehaviorSubject from singleton AuthService
    // - Subscription persists for app lifetime, no cleanup needed
    this.authService.userId$.subscribe((id) => {
      this.userId = id;
    });
  }

  // ==================== Helper to unwrap ApiResponse ====================
  private unwrap<T>(obs: Observable<ApiResponse<T>>): Observable<T> {
    return obs.pipe(map((response) => response.data));
  }

  private unwrapList<T>(obs: Observable<ApiResponse<T[]>>): Observable<T[]> {
    return obs.pipe(map((response) => response.data));
  }

  // ==================== Create / Update / Delete ====================

  create(request: InvestmentRequest): Observable<InvestmentResponse> {
    if (this.userId === null) {
      return throwError(() => new Error('User ID not available'));
    }
    request.userId = this.userId;
    return this.unwrap(
      this.http.post<ApiResponse<InvestmentResponse>>(
        this.baseUrl,
        request
      )
    );
  }

  update(id: number, request: InvestmentRequest): Observable<InvestmentResponse> {
    if (this.userId === null) {
      return throwError(() => new Error('User ID not available'));
    }
    request.userId = this.userId;
    return this.unwrap(
      this.http.put<ApiResponse<InvestmentResponse>>(
        `${this.baseUrl}/${id}`,
        request
      )
    );
  }

  delete(id: number): Observable<void> {
    return this.unwrap(
      this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`)
    );
  }

  // ==================== Reads ====================

  getById(id: number): Observable<InvestmentResponse> {
    return this.unwrap(
      this.http.get<ApiResponse<InvestmentResponse>>(`${this.baseUrl}/${id}`)
    );
  }

  getAll(): Observable<InvestmentResponse[]> {
    if (this.userId === null) {
      return throwError(() => new Error('User ID not available'));
    }
    return this.unwrapList(
      this.http.get<ApiResponse<InvestmentResponse[]>>(
        `${this.baseUrl}/user/${this.userId}`
      )
    );
  }

  getByType(type: InvestmentType): Observable<InvestmentResponse[]> {
    if (this.userId === null) {
      return throwError(() => new Error('User ID not available'));
    }
    // Convert enum value to uppercase for backend URL
    // enum value is lowercase (e.g., 'crypto'), but backend expects uppercase (e.g., 'CRYPTO')
    const typeUpper = type.toUpperCase().replace(/[-_]/g, '_');
    return this.unwrapList(
      this.http.get<ApiResponse<InvestmentResponse[]>>(
        `${this.baseUrl}/user/${this.userId}/type/${typeUpper}`
      )
    );
  }

  getOpen(): Observable<InvestmentResponse[]> {
    if (this.userId === null) {
      return throwError(() => new Error('User ID not available'));
    }
    return this.unwrapList(
      this.http.get<ApiResponse<InvestmentResponse[]>>(
        `${this.baseUrl}/user/${this.userId}/open`
      )
    );
  }

  getClosed(): Observable<InvestmentResponse[]> {
    if (this.userId === null) {
      return throwError(() => new Error('User ID not available'));
    }
    return this.unwrapList(
      this.http.get<ApiResponse<InvestmentResponse[]>>(
        `${this.baseUrl}/user/${this.userId}/closed`
      )
    );
  }

  // ==================== Mark-to-Market (MTM) ====================

  /**
   * Manual MTM: Update current price, derive currentValue
   */
  markToMarket(
    id: number,
    priceUpdate: InvestmentPriceUpdate
  ): Observable<InvestmentResponse> {
    return this.unwrap(
      this.http.post<ApiResponse<InvestmentResponse>>(
        `${this.baseUrl}/${id}/mtm`,
        priceUpdate
      )
    );
  }

  /**
   * Refresh current value from MarketDataService for a single investment
   */
  refresh(id: number): Observable<InvestmentResponse> {
    return this.unwrap(
      this.http.post<ApiResponse<InvestmentResponse>>(
        `${this.baseUrl}/${id}/refresh`,
        {}
      )
    );
  }

  /**
   * Refresh all OPEN investments for the current user
   */
  refreshAll(): Observable<InvestmentResponse[]> {
    if (this.userId === null) {
      return throwError(() => new Error('User ID not available'));
    }
    return this.unwrapList(
      this.http.post<ApiResponse<InvestmentResponse[]>>(
        `${this.baseUrl}/user/${this.userId}/refresh`,
        {}
      )
    );
  }

  // ==================== Lifecycle: Close / Reopen ====================

  /**
   * Close an investment position
   */
  close(id: number, closeRequest: InvestmentCloseRequest): Observable<InvestmentResponse> {
    return this.unwrap(
      this.http.post<ApiResponse<InvestmentResponse>>(
        `${this.baseUrl}/${id}/close`,
        closeRequest
      )
    );
  }

  /**
   * Reopen a closed investment
   */
  reopen(id: number): Observable<InvestmentResponse> {
    return this.unwrap(
      this.http.post<ApiResponse<InvestmentResponse>>(
        `${this.baseUrl}/${id}/reopen`,
        {}
      )
    );
  }

  // ==================== Legacy methods (kept for backward compatibility) ====================

  /**
   * @deprecated Use getByType instead
   */
  getTop5(): Observable<Record<string, number>> {
    // This endpoint doesn't exist in new controller - return empty or throw
    return throwError(() => new Error('getTop5 endpoint not available in new API'));
  }

  /**
   * @deprecated This endpoint doesn't exist in new controller
   */
  getTypeSummary(): Observable<Record<string, number>> {
    return throwError(() => new Error('getTypeSummary endpoint not available in new API'));
  }

  /**
   * @deprecated This endpoint doesn't exist in new controller
   */
  getRiskSummary(): Observable<Record<string, number>> {
    return throwError(() => new Error('getRiskSummary endpoint not available in new API'));
  }

  /**
   * @deprecated This endpoint doesn't exist in new controller
   */
  getEvolution(): Observable<number[]> {
    return throwError(() => new Error('getEvolution endpoint not available in new API'));
  }

  /**
   * @deprecated Use getByType instead
   */
  getByRisk(risk: string): Observable<InvestmentResponse[]> {
    return throwError(() => new Error('getByRisk endpoint not available in new API'));
  }
}
