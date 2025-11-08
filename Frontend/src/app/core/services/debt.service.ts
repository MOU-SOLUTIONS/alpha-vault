/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Service: DebtService - Complete CRUD + Payments + Analytics
 *  Matches backend DebtController with all endpoints
 * ================================================================
 */

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { Debt, DebtRequest, DebtPaymentRequest, DebtPaymentResponse, DebtStatus } from '../../models/debt.model';
import { AuthService } from './auth.service';

// API Response wrapper to match backend ApiResponse<T>
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  path: string;
  timestamp?: string;
}

// Pagination response
interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Pagination parameters
export interface PageableParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
}

@Injectable({ providedIn: 'root' })
export class DebtService {
  private base = '/api/debts'; // Changed to plural
  private userId: number | null = null;
  private debtUpdatedSource = new Subject<void>();
  debtUpdated$ = this.debtUpdatedSource.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    // Service-level subscription to userId$ is safe:
    // - Service is providedIn: 'root' (singleton, lives for app lifetime)
    // - userId$ is a BehaviorSubject from singleton AuthService
    // - Subscription persists for app lifetime, no cleanup needed
    this.authService.userId$.subscribe((id) => (this.userId = id));
  }

  // ===================== CRUD Operations =====================

  /** CREATE debt */
  saveDebt(dto: DebtRequest): Observable<Debt> {
    if (this.userId !== null) {
      dto.userId = this.userId;
      return this.http
        .post<ApiResponse<Debt>>(this.base, dto)
        .pipe(
          map((response) => response.data),
          tap(() => this.notifyDebtUpdated())
        );
    }
    return throwError(() => new Error('User ID is not available'));
  }

  /** UPDATE debt */
  updateDebt(debtId: number, dto: DebtRequest): Observable<Debt> {
    if (this.userId !== null) {
      dto.userId = this.userId;
      return this.http
        .put<ApiResponse<Debt>>(`${this.base}/${debtId}`, dto)
        .pipe(
          map((response) => response.data),
          tap(() => this.notifyDebtUpdated())
        );
    }
    return throwError(() => new Error('User ID is not available'));
  }

  /** DELETE debt (soft delete) */
  deleteDebt(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.base}/${id}`)
      .pipe(
        map(() => void 0),
        tap(() => this.notifyDebtUpdated())
      );
  }

  /** RESTORE soft-deleted debt */
  restoreDebt(id: number): Observable<void> {
    return this.http
      .post<ApiResponse<void>>(`${this.base}/${id}/restore`, {})
      .pipe(map(() => void 0));
  }

  /** GET debt by ID */
  getDebtById(id: number): Observable<Debt> {
    return this.http
      .get<ApiResponse<Debt>>(`${this.base}/${id}`)
      .pipe(map((response) => response.data));
  }

  /** GET all debts for the logged-in user (with pagination) */
  getAllDebts(params?: PageableParams): Observable<Debt[]> {
    if (this.userId === null) {
      return throwError(() => new Error('User ID is not available'));
    }

    let httpParams = new HttpParams();
    if (params) {
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
      if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
      if (params.sort) {
        const sortParam = params.direction === 'DESC' ? `${params.sort},desc` : params.sort;
        httpParams = httpParams.set('sort', sortParam);
      }
    }

    return this.http
      .get<ApiResponse<Page<Debt>>>(`${this.base}/user/${this.userId}`, { params: httpParams })
      .pipe(map((response) => response.data.content));
  }

  // ===================== Payments =====================

  /** ADD payment to a debt */
  addPayment(debtId: number, paymentRequest: DebtPaymentRequest): Observable<DebtPaymentResponse> {
    // Ensure debtId is set in the request
    const dto: DebtPaymentRequest = {
      ...paymentRequest,
      debtId: debtId,
    };

    return this.http
      .post<ApiResponse<DebtPaymentResponse>>(`${this.base}/${debtId}/payments`, dto)
      .pipe(map((response) => response.data));
  }

  /** GET debt payment history */
  getDebtPaymentHistory(debtId: number): Observable<DebtPaymentResponse[]> {
    return this.http
      .get<ApiResponse<DebtPaymentResponse[]>>(`${this.base}/${debtId}/payments`)
      .pipe(map((response) => response.data));
  }

  // ===================== Status / Windows =====================

  /** SET debt status */
  setDebtStatus(id: number, status: DebtStatus): Observable<void> {
    return this.http
      .patch<ApiResponse<void>>(`${this.base}/${id}/status`, null, {
        params: { value: status },
      })
      .pipe(map(() => void 0));
  }

  /** GET overdue debts for the logged-in user */
  getOverdueDebts(): Observable<Debt[]> {
    if (this.userId === null) {
      return throwError(() => new Error('User ID is not available'));
    }
    return this.http
      .get<ApiResponse<Debt[]>>(`${this.base}/user/${this.userId}/overdue`)
      .pipe(map((response) => response.data));
  }

  /** GET debts due within X days */
  getDebtsDueWithin(userId: number, days: number): Observable<Debt[]> {
    return this.http
      .get<ApiResponse<Debt[]>>(`${this.base}/user/${userId}/due-in`, {
        params: { days: days.toString() },
      })
      .pipe(map((response) => response.data));
  }

  // ===================== Aggregates / Analytics =====================

  /** GET debt totals (total debt, total paid, total min payments, etc.) */
  getDebtTotals(): Observable<Map<string, any>> {
    if (this.userId === null) {
      return throwError(() => new Error('User ID is not available'));
    }
    return this.http
      .get<ApiResponse<Map<string, any>>>(`${this.base}/user/${this.userId}/totals`)
      .pipe(map((response) => response.data));
  }

  /** GET total debt for the logged-in user (legacy method - uses totals endpoint) */
  getTotalDebt(): Observable<number> {
    return this.getDebtTotals().pipe(
      map((totals) => {
        // Handle both Map and plain object (JSON deserialization converts Map to object)
        if (totals instanceof Map) {
          return (totals.get('totalDebt') as number) || 0;
        } else {
          return (totals['totalDebt'] as number) || (totals as any)?.totalDebt || 0;
        }
      })
    );
  }

  /** GET total minimum payments for the logged-in user (legacy method - uses totals endpoint) */
  getTotalMinPayments(): Observable<number> {
    return this.getDebtTotals().pipe(
      map((totals) => {
        // Handle both Map and plain object (JSON deserialization converts Map to object)
        if (totals instanceof Map) {
          return (totals.get('totalMinPayments') as number) || 0;
        } else {
          return (totals['totalMinPayments'] as number) || (totals as any)?.totalMinPayments || 0;
        }
      })
    );
  }

  /** GET debts summarized by creditor */
  getDebtCreditorSummary(): Observable<Record<string, number>> {
    if (this.userId === null) {
      return throwError(() => new Error('User ID is not available'));
    }
    return this.http
      .get<ApiResponse<Record<string, number>>>(`${this.base}/user/${this.userId}/creditor-summary`)
      .pipe(map((response) => response.data));
  }

  /** GET top 5 largest debts */
  getTop5LargestDebts(): Observable<{ creditor: string; remainingAmount: number; dueDate: string }[]> {
    if (this.userId === null) {
      return throwError(() => new Error('User ID is not available'));
    }
    return this.http
      .get<ApiResponse<any[]>>(`${this.base}/user/${this.userId}/top5`)
      .pipe(
        map((response) =>
          response.data.map((item: any) => ({
            creditor: item.creditor || item.creditorName,
            remainingAmount: item.remainingAmount || 0,
            dueDate: item.dueDate || '',
          }))
        )
      );
  }

  // ===================== Legacy Methods (for backward compatibility) =====================

  /** Legacy method - use addPayment instead */
  addPaymentToDebt(debtId: number, paymentAmount: number, note?: string): Observable<DebtPaymentResponse> {
    return this.addPayment(debtId, {
      debtId: debtId,
      paymentAmount: paymentAmount,
      paymentMethod: 'BANK_TRANSFER' as any, // Default payment method
      note: note || null,
    });
  }

  /** Notify listeners that debt data changed */
  notifyDebtUpdated(): void {
    this.debtUpdatedSource.next();
  }
}
