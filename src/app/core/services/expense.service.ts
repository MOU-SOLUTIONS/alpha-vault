/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @service ExpenseService
  @description Service for expense management with CRUD operations and analytics
*/

import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  CategorySummary,
  ExpensePageResponse,
  ExpenseRequestDTO,
  ExpenseResponseDTO,
  PaymentMethodSummary,
  Top5Expenses
} from '../../models/expense.model';
import { AuthService } from './auth.service';
import { LoggingService } from './logging.service';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private baseUrl = `${environment.apiUrl}/expenses`;
  private currentUserExpensesSubject = new BehaviorSubject<ExpenseResponseDTO[]>([]);
  currentUserExpenses$ = this.currentUserExpensesSubject.asObservable();
  
  // Pagination cache
  private paginationCache = new Map<string, { data: ExpenseResponseDTO[], totalElements: number, lastFetch: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly loggingService = inject(LoggingService);
  private readonly notificationService = inject(NotificationService);

  constructor() {
    // ExpenseService initialized
  }

  // ===== CRUD OPERATIONS =====
  saveExpense(expense: ExpenseRequestDTO): Observable<ExpenseResponseDTO> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    const dto = { ...expense, userId };
    return this.http.post<ApiResponse<ExpenseResponseDTO>>(`${this.baseUrl}`, dto)
      .pipe(
        map(response => response.data),
        tap(expense => {
          this.updateExpensesCache(expense);
          this.notificationService.addExpenseCreatedNotification(expense.amount, expense.category);
        })
      );
  }

  updateExpense(id: number, expense: ExpenseRequestDTO): Observable<ExpenseResponseDTO> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    const dto = { ...expense, userId };
    return this.http.put<ApiResponse<ExpenseResponseDTO>>(`${this.baseUrl}/${id}`, dto)
      .pipe(
        map(response => response.data),
        tap(expense => {
          this.updateExpensesCache(expense);
          this.notificationService.addExpenseModifiedNotification(expense.amount, expense.category);
        })
      );
  }

  deleteExpense(id: number): Observable<void> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    // Try the standard endpoint first
    const url = `${this.baseUrl}/${id}`;
    this.loggingService.log('Deleting expense with ID:', id);
    this.loggingService.log('Delete URL:', url);
    this.loggingService.log('User ID:', userId);
    
    return this.http.delete<ApiResponse<void>>(url)
      .pipe(
        tap(response => this.loggingService.log('Delete response:', response)),
        map(() => {
          this.loggingService.log('Expense deleted successfully, updating cache...');
          this.removeFromExpensesCache(id);
          this.notificationService.addExpenseDeletedNotification();
          return void 0;
        }),
        catchError(error => {
          this.loggingService.error('Error deleting expense:', error);
          this.loggingService.error('Error details:', { status: error.status, message: error.message });
          
          // If the standard endpoint fails, try with user ID
          if (error.status === 404 || error.status === 403) {
            this.loggingService.log('Trying alternative endpoint with user ID...');
            const altUrl = `${this.baseUrl}/user/${userId}/${id}`;
            this.loggingService.log('Alternative delete URL:', altUrl);
            
            return this.http.delete<ApiResponse<void>>(altUrl).pipe(
              tap(response => this.loggingService.log('Alternative delete response:', response)),
              map(() => {
                this.loggingService.log('Expense deleted successfully via alternative endpoint, updating cache...');
                this.removeFromExpensesCache(id);
                this.notificationService.addExpenseDeletedNotification();
                return void 0;
              })
            );
          }
          
          throw error;
        })
      );
  }

  getExpenseById(id: number): Observable<ExpenseResponseDTO> {
    return this.http.get<ApiResponse<ExpenseResponseDTO>>(`${this.baseUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  getAllExpenses(): Observable<ExpenseResponseDTO[]> {
    const userId = this.authService.getUserId();
    this.loggingService.log('Getting expenses for userId:', userId);
    
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    // Use a large page size to get all expenses at once
    // Note: If user has more than 1000 expenses, we'll need to implement proper pagination
    const params = new HttpParams()
      .set('page', '0')
      .set('size', '1000') // Large size to get all expenses
      .set('sort', 'expenseDate,desc');

    const url = `${this.baseUrl}/user/${userId}`;
    this.loggingService.log('Making request to:', { url, params: params.toString() });

    return this.http.get<any>(url, { params })
      .pipe(
        tap(response => this.loggingService.log('Expense API Response:', response)),
        map(response => {
          // Handle both ApiResponse<ExpensePageResponse> and direct ExpensePageResponse
          let expenses: ExpenseResponseDTO[] = [];
          let paginationInfo = null;
          
          if (response.data && response.data.content) {
            // Wrapped in ApiResponse
            expenses = response.data.content;
            paginationInfo = {
              totalElements: response.data.totalElements,
              totalPages: response.data.totalPages,
              size: response.data.size,
              number: response.data.number,
              first: response.data.first,
              last: response.data.last
            };
          } else if (response.content) {
            // Direct ExpensePageResponse
            expenses = response.content;
            paginationInfo = {
              totalElements: response.totalElements,
              totalPages: response.totalPages,
              size: response.size,
              number: response.number,
              first: response.first,
              last: response.last
            };
          } else {
            // Fallback - assume it's an array
            expenses = Array.isArray(response) ? response : [];
          }
          
          this.loggingService.log('Pagination Info:', paginationInfo);
          this.loggingService.log('Total expenses available:', { totalElements: paginationInfo?.totalElements || 'unknown' });
          this.loggingService.log('Current page expenses:', expenses.length);
          
          return expenses;
        }),
        tap(expenses => {
          this.loggingService.log('Expenses loaded:', { count: expenses.length, unit: 'items' });
          this.currentUserExpensesSubject.next(expenses);
        })
      );
  }

  // ===== ANALYTICS METHODS =====
  getExpenseForPeriod(start: string, end: string): Observable<number> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    const params = new HttpParams()
      .set('start', start)
      .set('end', end);

    return this.http.get<ApiResponse<number>>(`${this.baseUrl}/user/${userId}/sum`, { params })
      .pipe(map(response => response.data));
  }

  getTodayExpense(): Observable<number> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get<ApiResponse<number>>(`${this.baseUrl}/user/${userId}/today`)
      .pipe(map(response => response.data));
  }

  getWeekExpense(): Observable<number> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get<ApiResponse<number>>(`${this.baseUrl}/user/${userId}/week`)
      .pipe(map(response => response.data));
  }

  getMonthExpense(): Observable<number> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get<ApiResponse<number>>(`${this.baseUrl}/user/${userId}/month`)
      .pipe(map(response => response.data));
  }

  getYearExpense(): Observable<number> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get<ApiResponse<number>>(`${this.baseUrl}/user/${userId}/year`)
      .pipe(map(response => response.data));
  }

  getPreviousWeekExpense(): Observable<number> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get<ApiResponse<number>>(`${this.baseUrl}/user/${userId}/previous-week`)
      .pipe(map(response => response.data));
  }

  getPreviousMonthExpense(): Observable<number> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get<ApiResponse<number>>(`${this.baseUrl}/user/${userId}/previous-month`)
      .pipe(map(response => response.data));
  }

  getPreviousYearExpense(): Observable<number> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get<ApiResponse<number>>(`${this.baseUrl}/user/${userId}/previous-year`)
      .pipe(map(response => response.data));
  }

  getExpenseForWeeksOfCurrentMonth(): Observable<number[]> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get<ApiResponse<number[]>>(`${this.baseUrl}/weeks/${userId}`)
      .pipe(map(response => response.data));
  }

  getExpenseForMonthsOfCurrentYear(): Observable<number[]> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get<ApiResponse<number[]>>(`${this.baseUrl}/yearly/${userId}`)
      .pipe(map(response => response.data));
  }

  getCurrentMonthPaymentMethodSummary(): Observable<PaymentMethodSummary> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get<ApiResponse<PaymentMethodSummary>>(`${this.baseUrl}/summary/payment-method/${userId}`)
      .pipe(map(response => response.data));
  }

  getCurrentMonthCategorySummary(): Observable<CategorySummary> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get<ApiResponse<CategorySummary>>(`${this.baseUrl}/summary/category/${userId}`)
      .pipe(map(response => response.data));
  }

  getTop5ExpensesThisMonth(): Observable<Top5Expenses> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get<ApiResponse<Top5Expenses>>(`${this.baseUrl}/top5/${userId}`)
      .pipe(map(response => response.data));
  }

  getWeeklyEvolution(): Observable<number> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get<ApiResponse<number>>(`${this.baseUrl}/evolution/week/${userId}`)
      .pipe(map(response => response.data));
  }

  getMonthlyEvolution(): Observable<number> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get<ApiResponse<number>>(`${this.baseUrl}/evolution/month/${userId}`)
      .pipe(map(response => response.data));
  }

  getYearlyEvolution(): Observable<number> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get<ApiResponse<number>>(`${this.baseUrl}/evolution/year/${userId}`)
      .pipe(map(response => response.data));
  }

  // ===== PAGINATION METHODS =====
  getExpensesPaginated(page = 0, size = 20, sortBy = 'expenseDate', sortDir = 'desc'): Observable<ExpensePageResponse> {
    const cacheKey = `expenses_${page}_${size}_${sortBy}_${sortDir}`;
    const cached = this.paginationCache.get(cacheKey);
    
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
      return throwError(() => new Error('User not authenticated'));
    }

    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', `${sortBy},${sortDir}`);

    return this.http.get<ApiResponse<ExpensePageResponse>>(`${this.baseUrl}/user/${userId}`, { params })
      .pipe(
        map(response => response.data),
        tap(pageData => {
          this.paginationCache.set(cacheKey, {
            data: pageData.content,
            totalElements: pageData.totalElements,
            lastFetch: Date.now()
          });
          this.updateExpensesCacheList(pageData.content);
        })
      );
  }

  clearPaginationCache(): void {
    this.paginationCache.clear();
  }

  // ===== UTILITY METHODS =====
  formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  private updateExpensesCache(expense: ExpenseResponseDTO): void {
    const current = this.currentUserExpensesSubject.value;
    const existingIndex = current.findIndex(e => e.id === expense.id);
    
    if (existingIndex >= 0) {
      current[existingIndex] = expense;
    } else {
      current.unshift(expense);
    }
    
    this.currentUserExpensesSubject.next([...current]);
  }

  private removeFromExpensesCache(id: number): void {
    const current = this.currentUserExpensesSubject.value;
    const filtered = current.filter(e => e.id !== id);
    this.currentUserExpensesSubject.next(filtered);
  }

  private updateExpensesCacheList(expenses: ExpenseResponseDTO[]): void {
    this.currentUserExpensesSubject.next(expenses);
  }
}