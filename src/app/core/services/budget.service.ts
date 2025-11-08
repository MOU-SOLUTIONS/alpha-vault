/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @service BudgetService
  @description Service for budget management matching backend BudgetController
*/

// ===== IMPORTS =====
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import {
    ApiResponse,
    BudgetPageResponse,
    BudgetPeriod,
    BudgetRequestDTO,
    BudgetResponseDTO,
    BudgetSummary,
    ExpenseCategory,
    MonthlyBudgetAggregate
} from '../../models/budget.model';
import { LoggingService } from './logging.service';
import { NotificationService } from './notification.service';

// ===== SERVICE =====
@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  // ===== INJECTED SERVICES =====
  private readonly http = inject(HttpClient);
  private readonly loggingService = inject(LoggingService);
  private readonly notificationService = inject(NotificationService);

  // ===== PRIVATE PROPERTIES =====
  private readonly baseUrl = `${environment.apiUrl}/budgets`;
  private readonly currentUserBudgetsSubject = new BehaviorSubject<BudgetResponseDTO[]>([]);
  private readonly paginationCache = new Map<string, BudgetPageResponse>();

  // ===== PUBLIC OBSERVABLES =====
  readonly currentUserBudgets$ = this.currentUserBudgetsSubject.asObservable();

  // ===== CRUD OPERATIONS =====
  createBudget(budget: BudgetRequestDTO): Observable<BudgetResponseDTO> {
    this.loggingService.log('Creating budget:', budget);
    
    return this.http.post<ApiResponse<BudgetResponseDTO>>(this.baseUrl, budget)
      .pipe(
        map(response => response.data),
        tap(newBudget => {
          this.loggingService.log('Budget created successfully:', newBudget);
          this.refreshUserBudgets(newBudget.userId);
        }),
        catchError(error => {
          this.loggingService.error('Error creating budget:', error);
          throw error;
        })
      );
  }

  updateBudget(id: number, budget: BudgetRequestDTO): Observable<BudgetResponseDTO> {
    this.loggingService.log(`Updating budget ${id}:`, budget);
    
    return this.http.put<ApiResponse<BudgetResponseDTO>>(`${this.baseUrl}/${id}`, budget)
      .pipe(
        map(response => response.data),
        tap(updatedBudget => {
          this.loggingService.log('Budget updated successfully:', updatedBudget);
          this.refreshUserBudgets(updatedBudget.userId);
        }),
        catchError(error => {
          this.loggingService.error(`Error updating budget ${id}:`, error);
          throw error;
        })
      );
  }

  deleteBudget(id: number, deletedBy?: string): Observable<void> {
    this.loggingService.log(`Deleting budget ${id}`, deletedBy ? `by ${deletedBy}` : '');
    
    const params = deletedBy ? new HttpParams().set('deletedBy', deletedBy) : new HttpParams();
    
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`, { params })
      .pipe(
        map(() => {
          this.loggingService.log(`Budget ${id} deleted successfully`);
          return void 0;
        }),
        catchError(error => {
          this.loggingService.error(`Error deleting budget ${id}:`, error);
          throw error;
        })
      );
  }

  restoreBudget(id: number): Observable<void> {
    this.loggingService.log(`Restoring budget ${id}`);
    
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/${id}/restore`, {})
      .pipe(
        map(() => {
          this.loggingService.log(`Budget ${id} restored successfully`);
          return void 0;
        }),
        catchError(error => {
          this.loggingService.error(`Error restoring budget ${id}:`, error);
          throw error;
        })
      );
  }

  getBudget(id: number): Observable<BudgetResponseDTO> {
    this.loggingService.log(`Fetching budget ${id}`);
    
    return this.http.get<ApiResponse<BudgetResponseDTO>>(`${this.baseUrl}/${id}`)
      .pipe(
        map(response => response.data),
        tap(budget => this.loggingService.log('Budget fetched:', budget)),
        catchError(error => {
          this.loggingService.error(`Error fetching budget ${id}:`, error);
          throw error;
        })
      );
  }

  getBudgetByUserMonth(userId: number, year: number, month: number): Observable<BudgetResponseDTO | null> {
    return this.http.get<ApiResponse<BudgetResponseDTO>>(`${this.baseUrl}/user/${userId}/${year}/${month}`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          // Don't log 404 errors - they're expected when a budget doesn't exist yet for a new month
          // Return null instead of throwing to prevent console errors
          if (error.status === 404) {
            return of(null as any);
          }
          // Only log non-404 errors
          this.loggingService.error(`Error fetching budget for user ${userId}, ${year}-${month}:`, error);
          throw error;
        })
      );
  }

  getUserBudgets(userId: number, page = 0, size = 20, sort = 'year,month'): Observable<BudgetPageResponse> {
    this.loggingService.log(`Fetching budgets for user ${userId}, page ${page}, size ${size}`);
    
    const cacheKey = `${userId}-${page}-${size}-${sort}`;
    const cached = this.paginationCache.get(cacheKey);
    if (cached) {
      this.loggingService.log('Returning cached budget page');
      return of(cached);
    }

    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<ApiResponse<BudgetPageResponse>>(`${this.baseUrl}/user/${userId}`, { params })
      .pipe(
        map(response => response.data),
        tap(pageData => {
          this.loggingService.log('Budgets fetched:', pageData);
          this.paginationCache.set(cacheKey, pageData);
          this.currentUserBudgetsSubject.next(pageData.content);
        }),
        catchError(error => {
          this.loggingService.error(`Error fetching budgets for user ${userId}:`, error);
          throw error;
        })
      );
  }

  // ===== CATEGORY OPERATIONS =====
  addCategory(userId: number, year: number, month: number, category: ExpenseCategory, allocated: number): Observable<BudgetResponseDTO> {
    this.loggingService.log(`Adding new category ${category} for user ${userId}, ${year}-${month}`);
    
    // First check if category already exists
    return this.getBudgetByUserMonth(userId, year, month).pipe(
      switchMap(budget => {
        // If budget is null (404), proceed with creating the category (which will create the budget)
        if (budget === null) {
          // Budget doesn't exist yet, proceed with category creation
          const params = new HttpParams()
            .set('category', category)
            .set('allocated', allocated.toString());

          return this.http.post<ApiResponse<BudgetResponseDTO>>(
            `${this.baseUrl}/user/${userId}/${year}/${month}/category`, 
            {}, 
            { params }
          ).pipe(
            map(response => response.data),
            tap(newBudget => {
              this.loggingService.log('Category created:', newBudget);
              this.refreshUserBudgets(userId);
              this.notificationService.addBudgetCreatedNotification(allocated, category);
            }),
            catchError(error => {
              this.loggingService.error(`Error creating category ${category}:`, error);
              
              // Extract user-friendly error message
              let errorMessage = 'Unknown error';
              if (error.status === 500) {
                errorMessage = `Category '${category}' already exists for this month`;
              } else if (error.status === 400) {
                errorMessage = 'Invalid budget data provided';
              } else if (error.error?.message) {
                errorMessage = error.error.message;
              } else if (error.message) {
                errorMessage = error.message;
              }
              
              this.notificationService.addBudgetErrorNotification('create', errorMessage);
              throw error;
            })
          );
        }
        
        // Budget exists, check if category already exists
        const existingCategory = budget.categories?.find(cat => cat.category === category);
        if (existingCategory) {
          const error = new Error(`Category '${category}' already exists for this month`);
          this.notificationService.addBudgetErrorNotification('create', `Category '${category}' already exists for this month`);
          return throwError(() => error);
        }
        
        // Category doesn't exist, proceed with creation
        const params = new HttpParams()
          .set('category', category)
          .set('allocated', allocated.toString());

        return this.http.post<ApiResponse<BudgetResponseDTO>>(
          `${this.baseUrl}/user/${userId}/${year}/${month}/category`, 
          {}, 
          { params }
        ).pipe(
          map(response => response.data),
          tap(newBudget => {
            this.loggingService.log('Category created:', newBudget);
            this.refreshUserBudgets(userId);
            this.notificationService.addBudgetCreatedNotification(allocated, category);
          }),
          catchError(error => {
            this.loggingService.error(`Error creating category ${category}:`, error);
            
            // Extract user-friendly error message
            let errorMessage = 'Unknown error';
            if (error.status === 500) {
              errorMessage = `Category '${category}' already exists for this month`;
            } else if (error.status === 400) {
              errorMessage = 'Invalid budget data provided';
            } else if (error.status === 404) {
              errorMessage = 'Budget not found';
            } else if (error.error?.message) {
              errorMessage = error.error.message;
            } else if (error.message) {
              errorMessage = error.message;
            }
            
            this.notificationService.addBudgetErrorNotification('create', errorMessage);
            throw error;
          })
        );
      })
    );
  }

  updateCategory(userId: number, year: number, month: number, category: ExpenseCategory, allocated: number): Observable<BudgetResponseDTO> {
    this.loggingService.log(`Updating category ${category} for user ${userId}, ${year}-${month}`);
    
    const params = new HttpParams()
      .set('category', category)
      .set('allocated', allocated.toString());

    return this.http.put<ApiResponse<BudgetResponseDTO>>(
      `${this.baseUrl}/user/${userId}/${year}/${month}/category`, 
      {}, 
      { params }
    ).pipe(
      map(response => response.data),
      tap(budget => {
        this.loggingService.log('Category updated:', budget);
        this.refreshUserBudgets(userId);
        this.notificationService.addBudgetModifiedNotification(allocated, category);
      }),
      catchError(error => {
        this.loggingService.error(`Error updating category ${category}:`, error);
        
        // Extract user-friendly error message
        let errorMessage = 'Unknown error';
        if (error.status === 400) {
          errorMessage = 'Invalid budget data provided';
        } else if (error.status === 404) {
          errorMessage = 'Budget category not found';
        } else if (error.status === 500) {
          errorMessage = 'Server error occurred while updating budget';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.notificationService.addBudgetErrorNotification('update', errorMessage);
        throw error;
      })
    );
  }

  upsertCategory(userId: number, year: number, month: number, category: ExpenseCategory, allocated: number, isModify: boolean = false): Observable<BudgetResponseDTO> {
    this.loggingService.log(`Upserting category ${category} for user ${userId}, ${year}-${month}`);
    
    const params = new HttpParams()
      .set('category', category)
      .set('allocated', allocated.toString());

    // Use POST for add, PUT for update
    const httpMethod = isModify ? this.http.put : this.http.post;
    
    return httpMethod<ApiResponse<BudgetResponseDTO>>(
      `${this.baseUrl}/user/${userId}/${year}/${month}/category`, 
      {}, 
      { params }
    ).pipe(
      map(response => response.data),
      tap(budget => {
        this.loggingService.log('Category upserted:', budget);
        this.refreshUserBudgets(userId);
        
        // Add appropriate notification
        if (isModify) {
          this.notificationService.addBudgetModifiedNotification(allocated, category);
        } else {
          this.notificationService.addBudgetCreatedNotification(allocated, category);
        }
      }),
      catchError(error => {
        this.loggingService.error(`Error upserting category ${category}:`, error);
        this.notificationService.addBudgetErrorNotification(isModify ? 'modify' : 'create', error.message || 'Unknown error');
        throw error;
      })
    );
  }

  deleteCategory(userId: number, year: number, month: number, category: ExpenseCategory): Observable<BudgetResponseDTO> {
    this.loggingService.log(`Deleting category ${category} for user ${userId}, ${year}-${month}`);
    
    const params = new HttpParams().set('category', category);

    return this.http.delete<ApiResponse<BudgetResponseDTO>>(
      `${this.baseUrl}/user/${userId}/${year}/${month}/category`, 
      { params }
    ).pipe(
      map(response => response.data),
      tap(budget => {
        this.loggingService.log('Category deleted:', budget);
        this.refreshUserBudgets(userId);
        this.notificationService.addBudgetDeletedNotification(category);
      }),
      catchError(error => {
        this.loggingService.error(`Error deleting category ${category}:`, error);
        
        // Extract user-friendly error message
        let errorMessage = 'Unknown error';
        if (error.status === 400) {
          errorMessage = 'Cannot delete budget category';
        } else if (error.status === 404) {
          errorMessage = 'Budget category not found';
        } else if (error.status === 500) {
          errorMessage = 'Server error occurred while deleting budget';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.notificationService.addBudgetErrorNotification('delete', errorMessage);
        throw error;
      })
    );
  }

  // ===== SYNC OPERATIONS =====
  syncBudgetTotals(id: number): Observable<void> {
    this.loggingService.log(`Syncing budget totals for ${id}`);
    
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/${id}/sync`, {})
      .pipe(
        map(() => {
          this.loggingService.log(`Budget ${id} totals synced successfully`);
          return void 0;
        }),
        catchError(error => {
          this.loggingService.error(`Error syncing budget ${id}:`, error);
          throw error;
        })
      );
  }

  // ===== SUMMARY AND ANALYTICS =====
  getCurrentMonthBudgetSummary(userId: number): Observable<BudgetSummary> {
    this.loggingService.log(`Fetching current month budget summary for user ${userId}`);
    
    return this.http.get<ApiResponse<BudgetSummary>>(`${this.baseUrl}/user/${userId}/summary/current`)
      .pipe(
        map(response => response.data),
        tap(summary => this.loggingService.log('Current month summary:', summary)),
        catchError(error => {
          this.loggingService.error(`Error fetching current month summary for user ${userId}:`, error);
          throw error;
        })
      );
  }

  getPreviousMonthBudgetSummary(userId: number): Observable<BudgetSummary> {
    this.loggingService.log(`Fetching previous month budget summary for user ${userId}`);
    
    return this.http.get<ApiResponse<BudgetSummary>>(`${this.baseUrl}/user/${userId}/summary/previous`)
      .pipe(
        map(response => response.data),
        tap(summary => this.loggingService.log('Previous month summary:', summary)),
        catchError(error => {
          this.loggingService.error(`Error fetching previous month summary for user ${userId}:`, error);
          throw error;
        })
      );
  }

  getAvailableBudgetPeriods(userId: number): Observable<BudgetPeriod[]> {
    return this.http.get<ApiResponse<BudgetPeriod[]>>(`${this.baseUrl}/user/${userId}/periods`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          this.loggingService.error(`Error fetching periods for user ${userId}:`, error);
          throw error; // Re-throw the error to let the component handle it
        })
      );
  }

  getAnnualBudget(userId: number, year: number): Observable<number> {
    this.loggingService.log(`Fetching annual budget for user ${userId}, year ${year}`);
    
    return this.http.get<ApiResponse<number>>(`${this.baseUrl}/user/${userId}/annual/${year}`)
      .pipe(
        map(response => response.data),
        tap(annualBudget => this.loggingService.log('Annual budget:', annualBudget)),
        catchError(error => {
          this.loggingService.error(`Error fetching annual budget for user ${userId}, year ${year}:`, error);
          throw error;
        })
      );
  }

  getMonthlyBudgetAggregate(userId: number, year: number): Observable<MonthlyBudgetAggregate> {
    this.loggingService.log(`Fetching monthly budget aggregate for user ${userId}, year ${year}`);
    
    return this.http.get<ApiResponse<MonthlyBudgetAggregate>>(`${this.baseUrl}/user/${userId}/aggregate/${year}`)
      .pipe(
        map(response => response.data),
        tap(aggregate => this.loggingService.log('Monthly aggregate:', aggregate)),
        catchError(error => {
          this.loggingService.error(`Error fetching monthly aggregate for user ${userId}, year ${year}:`, error);
          throw error;
        })
      );
  }

  // ===== LEGACY METHODS (for backward compatibility) =====
  addOrUpdateCategory(userId: number, month: number, year: number, category: ExpenseCategory, allocated: number, isModify: boolean = false): Observable<BudgetResponseDTO> {
    this.loggingService.log(`Legacy: Adding/updating category ${category} for user ${userId}, ${year}-${month}`);
    if (isModify) {
      return this.updateCategory(userId, year, month, category, allocated);
    } else {
      return this.addCategory(userId, year, month, category, allocated);
    }
  }

  getBudgetForMonth(month: number, year: number, userId = 1): Observable<BudgetResponseDTO | null> {
    return this.getBudgetByUserMonth(userId, year, month);
  }

  // ===== UTILITY METHODS =====
  private refreshUserBudgets(userId: number): void {
    // Clear cache and refresh current user budgets
    this.paginationCache.clear();
    this.getUserBudgets(userId).subscribe();
  }

  clearCache(): void {
    this.paginationCache.clear();
    this.currentUserBudgetsSubject.next([]);
    this.loggingService.log('Budget service cache cleared');
  }

  // ===== MOCK DATA METHODS (for development) =====
  private getMockBudgetData(userId: number, year: number, month: number): BudgetResponseDTO {
    return {
      id: 1,
      userId: userId,
      year: year,
      month: month,
      currency: 'USD',
      totalBudget: 5000,
      totalSpent: 3200,
      totalRemaining: 1800,
      rolloverEnabled: true,
      alertThresholdPercent: 80,
      notes: 'Mock budget data for development',
      categories: [
        { id: 1, category: ExpenseCategory.FOOD, allocated: 800, spentAmount: 650, remaining: 150 },
        { id: 2, category: ExpenseCategory.UTILITIES, allocated: 300, spentAmount: 280, remaining: 20 },
        { id: 3, category: ExpenseCategory.ENTERTAINMENT, allocated: 500, spentAmount: 420, remaining: 80 },
        { id: 4, category: ExpenseCategory.TRANSPORT, allocated: 400, spentAmount: 380, remaining: 20 },
        { id: 5, category: ExpenseCategory.HEALTHCARE, allocated: 200, spentAmount: 150, remaining: 50 },
        { id: 6, category: ExpenseCategory.HOUSING, allocated: 1200, spentAmount: 1200, remaining: 0 },
        { id: 7, category: ExpenseCategory.PERSONAL_CARE, allocated: 600, spentAmount: 520, remaining: 80 }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  private getMockBudgetPeriods(): BudgetPeriod[] {
    const currentDate = new Date();
    const periods: BudgetPeriod[] = [];
    
    // Generate periods for the last 12 months
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      periods.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1
      });
    }
    
    return periods.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  }
}