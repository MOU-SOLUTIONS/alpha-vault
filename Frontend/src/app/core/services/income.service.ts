/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @service IncomeService
  @description Service for managing income operations and analytics
*/

import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  IncomePageResponse,
  IncomeRequestDTO,
  IncomeResponseDTO,
  IncomeStats,
  PaymentMethodSummary,
  SourceSummary,
  Top5Incomes
} from '../../models/income.model';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class IncomeService {
  // Use environment variable for API URL to support different environments
  private baseUrl = `${environment.apiUrl}/incomes`;
  private currentUserIncomesSubject = new BehaviorSubject<IncomeResponseDTO[]>([]);
  currentUserIncomes$ = this.currentUserIncomesSubject.asObservable();
  
  // Pagination cache
  private paginationCache = new Map<string, { data: IncomeResponseDTO[], totalElements: number, lastFetch: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  constructor() {
    // IncomeService initialized
  }

  // ============================================================
  // == AUTHENTICATION CHECK
  // ============================================================

  /**
   * Check if user is authenticated before making requests
   */
  private checkAuthentication(): boolean {
    const token = this.authService.getToken();
    const userId = this.authService.getUserId();
    const hasToken = !!token;
    const hasUserId = !!userId;
    
    return hasToken && hasUserId;
  }

  // ============================================================
  // == CRUD OPERATIONS
  // ============================================================

  /**
   * Create a new income entry
   */
  createIncome(income: IncomeRequestDTO): Observable<IncomeResponseDTO> {
    return this.http.post<ApiResponse<IncomeResponseDTO>>(`${this.baseUrl}`, income)
      .pipe(
        map(response => response.data),
        tap(newIncome => {
          this.addIncomeToCache(newIncome);
          // Add success notification
          this.notificationService.addIncomeCreatedNotification(
            newIncome.amount,
            newIncome.source || 'Unknown Source'
          );
        }),
        catchError(error => {
          // Add error notification
          this.notificationService.addIncomeErrorNotification('create', error.message || 'Unknown error');
          throw error;
        })
      );
  }

  /**
   * Update an existing income entry
   */
  updateIncome(id: number, income: IncomeRequestDTO): Observable<IncomeResponseDTO> {
    return this.http.put<ApiResponse<IncomeResponseDTO>>(`${this.baseUrl}/${id}`, income)
      .pipe(
        map(response => response.data),
        tap(updatedIncome => {
          this.updateIncomeInCache(updatedIncome);
          // Add success notification
          this.notificationService.addIncomeModifiedNotification(
            updatedIncome.amount,
            updatedIncome.source || 'Unknown Source'
          );
        }),
        catchError(error => {
          // Add error notification
          this.notificationService.addIncomeErrorNotification('modify', error.message || 'Unknown error');
          throw error;
        })
      );
  }

  /**
   * Delete an income entry (soft delete)
   */
  deleteIncome(id: number, deletedBy?: string): Observable<void> {
    // Get income data before deletion for notification
    const incomeToDelete = this.currentUserIncomesSubject.value.find(income => income.id === id);
    
    let params = new HttpParams();
    if (deletedBy) {
      params = params.set('deletedBy', deletedBy);
    }
    
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`, { params })
      .pipe(
        map(() => undefined),
        tap(() => {
          this.removeIncomeFromCache(id);
          // Add success notification
          if (incomeToDelete) {
            this.notificationService.addIncomeDeletedNotification(
              incomeToDelete.amount,
              incomeToDelete.source || 'Unknown Source'
            );
          }
        }),
        catchError(error => {
          // Add error notification
          this.notificationService.addIncomeErrorNotification('delete', error.message || 'Unknown error');
          throw error;
        })
      );
  }

  /**
   * Restore a deleted income entry
   */
  restoreIncome(id: number): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/${id}/restore`, {})
      .pipe(map(() => undefined));
  }

  /**
   * Get income by ID
   */
  getIncomeById(id: number): Observable<IncomeResponseDTO> {
    return this.http.get<ApiResponse<IncomeResponseDTO>>(`${this.baseUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  // ============================================================
  // == LIST OPERATIONS
  // ============================================================

  /**
   * Get paginated list of incomes for current user
   */
  getIncomesByUser(userId: number, page = 0, size = 20): Observable<IncomePageResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'incomeDate,desc');

    return this.http.get<ApiResponse<IncomePageResponse>>(`${this.baseUrl}/user/${userId}`, { params })
      .pipe(
        map(response => response.data),
        tap(pageData => this.updateIncomesCache(pageData.content))
      );
  }

  /**
   * Get incomes for current user within date range
   */
  getIncomesByUserInRange(userId: number, startDate: string, endDate: string, page = 0, size = 20): Observable<IncomePageResponse> {
    const params = new HttpParams()
      .set('start', startDate)
      .set('end', endDate)
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'incomeDate,desc');

    return this.http.get<ApiResponse<IncomePageResponse>>(`${this.baseUrl}/user/${userId}/range`, { params })
      .pipe(
        map(response => response.data),
        tap(pageData => this.updateIncomesCache(pageData.content))
      );
  }

  /**
   * Get paginated incomes with caching
   */
  getIncomesPaginated(page = 0, size = 20, sortBy = 'date', sortDir = 'desc'): Observable<IncomePageResponse> {
    const cacheKey = `incomes_${page}_${size}_${sortBy}_${sortDir}`;
    const cached = this.paginationCache.get(cacheKey);
    
    // Return cached data if still valid
    if (cached && (Date.now() - cached.lastFetch) < this.CACHE_DURATION) {
      return of({
        content: cached.data,
        totalElements: cached.totalElements,
        totalPages: Math.ceil(cached.totalElements / size),
        size: size,
        number: page,
        first: page === 0,
        last: page >= Math.ceil(cached.totalElements / size) - 1
      });
    }

    const userId = this.authService.getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', `${sortBy},${sortDir}`);

    return this.http.get<ApiResponse<IncomePageResponse>>(`${this.baseUrl}/user/${userId}`, { params })
      .pipe(
        map(response => response.data),
        tap(pageData => {
          // Cache the data
          this.paginationCache.set(cacheKey, {
            data: pageData.content,
            totalElements: pageData.totalElements,
            lastFetch: Date.now()
          });
          this.updateIncomesCache(pageData.content);
        })
      );
  }

  /**
   * Clear pagination cache
   */
  clearPaginationCache(): void {
    this.paginationCache.clear();
  }

  // ============================================================
  // == TOTALS & STATISTICS
  // ============================================================

  /**
   * Get income sum for a specific period
   */
  getIncomeSumForPeriod(userId: number, startDate: string, endDate: string): Observable<number> {
    const params = new HttpParams()
      .set('start', startDate)
      .set('end', endDate);

    return this.http.get<ApiResponse<number>>(`${this.baseUrl}/user/${userId}/sum`, { params })
      .pipe(map(response => response.data));
  }

  /**
   * Get today's income total
   */
  getTodayIncome(userId: number): Observable<number> {
    if (!this.checkAuthentication()) {
      return of(0);
    }
    
    return this.http.get<ApiResponse<number>>(`${this.baseUrl}/user/${userId}/today`)
      .pipe(
        map(response => response.data || 0),
        tap(() => {
          // Today's income fetched successfully
        }),
        catchError(() => of(0))
      );
  }

  /**
   * Get current week's income for a user
   */
  getCurrentWeekIncome(userId: number): Observable<number> {
    if (!this.checkAuthentication()) {
      return of(0);
    }
    
    return this.http.get<ApiResponse<number>>(`${this.baseUrl}/user/${userId}/week`)
      .pipe(
        map(response => response.data || 0),
        tap(() => {
          // Current week's income fetched successfully
        }),
        catchError(() => of(0))
      );
  }

  /**
   * Get current month income total
   */
  getCurrentMonthIncome(userId: number): Observable<number> {
    return this.http.get<ApiResponse<number>>(`${this.baseUrl}/user/${userId}/month`)
      .pipe(map(response => response.data));
  }

  /**
   * Get current year income total
   */
  getCurrentYearIncome(userId: number): Observable<number> {
    return this.http.get<ApiResponse<number>>(`${this.baseUrl}/user/${userId}/year`)
      .pipe(map(response => response.data));
  }

  /**
   * Get previous week income total
   */
  getPreviousWeekIncome(userId: number): Observable<number> {
    return this.http.get<ApiResponse<number>>(`${this.baseUrl}/user/${userId}/previous-week`)
      .pipe(map(response => response.data));
  }

  /**
   * Get previous month income total
   */
  getPreviousMonthIncome(userId: number): Observable<number> {
    return this.http.get<ApiResponse<number>>(`${this.baseUrl}/user/${userId}/previous-month`)
      .pipe(map(response => response.data));
  }

  /**
   * Get previous year income total
   */
  getPreviousYearIncome(userId: number): Observable<number> {
    return this.http.get<ApiResponse<number>>(`${this.baseUrl}/user/${userId}/previous-year`)
      .pipe(map(response => response.data));
  }

  // ============================================================
  // == ANALYTICS & SUMMARIES
  // ============================================================

  /**
   * Get income summary by payment method
   */
  getPaymentMethodSummary(userId: number): Observable<PaymentMethodSummary> {
    return this.http.get<ApiResponse<PaymentMethodSummary>>(`${this.baseUrl}/summary/payment-method/${userId}`)
      .pipe(map(response => response.data));
  }

  /**
   * Get income summary by payment method for current month
   */
  getCurrentMonthPaymentMethodSummary(userId: number): Observable<PaymentMethodSummary> {
    return this.http.get<ApiResponse<PaymentMethodSummary>>(`${this.baseUrl}/summary/payment-method/${userId}/current-month`)
      .pipe(map(response => response.data));
  }

  /**
   * Get income summary by source
   */
  getSourceSummary(userId: number): Observable<SourceSummary> {
    return this.http.get<ApiResponse<SourceSummary>>(`${this.baseUrl}/summary/source/${userId}`)
      .pipe(map(response => response.data));
  }

  /**
   * Get income summary by source for current month
   */
  getCurrentMonthSourceSummary(userId: number): Observable<SourceSummary> {
    return this.http.get<ApiResponse<SourceSummary>>(`${this.baseUrl}/summary/source/${userId}/current-month`)
      .pipe(map(response => response.data));
  }

  /**
   * Get top 5 highest incomes this month
   */
  getTop5Incomes(userId: number): Observable<Top5Incomes> {
    return this.http.get<ApiResponse<Top5Incomes>>(`${this.baseUrl}/top5/${userId}`)
      .pipe(map(response => response.data));
  }

  /**
   * Get weekly incomes for current month
   */
  getWeeklyIncomes(userId: number): Observable<number[]> {
    return this.http.get<ApiResponse<number[]>>(`${this.baseUrl}/weeks/${userId}`)
      .pipe(map(response => response.data));
  }

  /**
   * Get monthly incomes for current year
   */
  getYearlyIncomes(userId: number): Observable<number[]> {
    return this.http.get<ApiResponse<number[]>>(`${this.baseUrl}/yearly/${userId}`)
      .pipe(map(response => response.data));
  }

  // ============================================================
  // == EVOLUTION CALCULATIONS
  // ============================================================

  /**
   * Get weekly income evolution percentage
   */
  getWeeklyEvolution(userId: number): Observable<number> {
    return this.http.get<ApiResponse<number>>(`${this.baseUrl}/evolution/week/${userId}`)
      .pipe(map(response => response.data));
  }

  /**
   * Get monthly income evolution percentage
   */
  getMonthlyEvolution(userId: number): Observable<number> {
    return this.http.get<ApiResponse<number>>(`${this.baseUrl}/evolution/month/${userId}`)
      .pipe(map(response => response.data));
  }

  /**
   * Get yearly income evolution percentage
   */
  getYearlyEvolution(userId: number): Observable<number> {
    return this.http.get<ApiResponse<number>>(`${this.baseUrl}/evolution/year/${userId}`)
      .pipe(map(response => response.data));
  }

  // ============================================================
  // == METADATA
  // ============================================================

  /**
   * Get distinct income sources for user
   */
  getDistinctSources(userId: number): Observable<string[]> {
    return this.http.get<ApiResponse<string[]>>(`${this.baseUrl}/source/${userId}`)
      .pipe(map(response => response.data));
  }

  // ============================================================
  // == COMPOSITE OPERATIONS
  // ============================================================

  /**
   * Get comprehensive income statistics for dashboard
   */
  getIncomeStats(userId: number): Observable<IncomeStats> {
    return this.http.get<ApiResponse<IncomeStats>>(`${this.baseUrl}/stats/${userId}`)
      .pipe(map(response => response.data));
  }

  // ============================================================
  // == CACHE MANAGEMENT
  // ============================================================

  private addIncomeToCache(income: IncomeResponseDTO): void {
    const currentIncomes = this.currentUserIncomesSubject.value;
    this.currentUserIncomesSubject.next([income, ...currentIncomes]);
  }

  private updateIncomeInCache(updatedIncome: IncomeResponseDTO): void {
    const currentIncomes = this.currentUserIncomesSubject.value;
    const updatedIncomes = currentIncomes.map(income => 
      income.id === updatedIncome.id ? updatedIncome : income
    );
    this.currentUserIncomesSubject.next(updatedIncomes);
  }

  private removeIncomeFromCache(id: number): void {
    const currentIncomes = this.currentUserIncomesSubject.value;
    const filteredIncomes = currentIncomes.filter(income => income.id !== id);
    this.currentUserIncomesSubject.next(filteredIncomes);
  }

  private updateIncomesCache(incomes: IncomeResponseDTO[]): void {
    this.currentUserIncomesSubject.next(incomes);
  }

  // ============================================================
  // == UTILITY METHODS
  // ============================================================

  /**
   * Get current user ID from auth service
   */
  private getCurrentUserId(): number | null {
    return this.authService.getUserId();
  }

  /**
   * Format amount for display
   */
  formatAmount(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Legacy method: Get income for period
   */
  getIncomeForPeriodLegacy(userId: number, start: string, end: string): Observable<number> {
    return this.getIncomeSumForPeriod(userId, start, end);
  }

  /**
   * Legacy method: Get all incomes for current user
   */
  getAllIncomes(): Observable<IncomeResponseDTO[]> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      return of([]);
    }
    return this.getIncomesByUser(userId, 0, 1000).pipe(
      map(page => page.content)
    );
  }

  /**
   * Legacy method: Save income (create new)
   */
  saveIncome(income: IncomeRequestDTO): Observable<IncomeResponseDTO> {
    return this.createIncome(income);
  }

  /**
   * Legacy method: Get week income (no userId parameter)
   */
  getWeekIncome(): Observable<number> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      return of(0);
    }
    return this.getCurrentWeekIncome(userId);
  }

  /**
   * Legacy method: Get month income (no userId parameter)
   */
  getMonthIncome(): Observable<number> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      return of(0);
    }
    return this.getCurrentMonthIncome(userId);
  }

  /**
   * Legacy method: Get year income (no userId parameter)
   */
  getYearIncome(): Observable<number> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      return of(0);
    }
    return this.getCurrentYearIncome(userId);
  }

  /**
   * Legacy method: Get income for weeks of current month
   */
  getIncomeForWeeksOfCurrentMonth(): Observable<number[]> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      return of([]);
    }
    return this.getWeeklyIncomes(userId);
  }

  /**
   * Legacy method: Get income for months of current year
   */
  getIncomeForMonthsOfCurrentYear(): Observable<number[]> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      return of([]);
    }
    return this.getYearlyIncomes(userId);
  }

  /**
   * Legacy method: Get top 5 incomes this month
   */
  getTop5IncomeThisMonth(): Observable<Top5Incomes> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      return of({});
    }
    return this.getTop5Incomes(userId);
  }

  /**
   * Legacy method: Get income source summary
   */
  getIncomeSourceSummary(): Observable<SourceSummary> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      return of({});
    }
    return this.getSourceSummary(userId);
  }
}
