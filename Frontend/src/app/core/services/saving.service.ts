/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Service: SavingGoalService - Complete CRUD + Money Ops + Filters
 *  Matches backend controller with all endpoints and functionality
 * ================================================================
 */

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { SavingGoalCategory, SavingGoalCategoryUtils, SavingGoalPriority, SavingGoalPriorityUtils, SavingGoalStatus } from '../../enums/saving-goal';
import {
    SavingGoalListResponse,
    SavingGoalRequestDTO,
    SavingGoalResponseDTO,
    SavingGoalStatsResponse,
} from '../../models/saving.model';
import { AuthService } from './auth.service';
import { LoggingService } from './logging.service';

// API Response wrapper to match backend ApiResponse<T>
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  path: string;
  timestamp: string;
}

// Pagination parameters
export interface PageableParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
}

@Injectable({ providedIn: 'root' })
export class SavingGoalService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly loggingService = inject(LoggingService);
  private readonly BASE_URL = '/api/saving-goals';
  
  // User management
  private userId: number | null = null;
  
  // State management
  private savingGoalUpdatedSource = new Subject<void>();
  savingGoalUpdated$ = this.savingGoalUpdatedSource.asObservable();
  
  // Cache for user's goals
  private goalsCache = new BehaviorSubject<SavingGoalResponseDTO[]>([]);
  goalsCache$ = this.goalsCache.asObservable();

  constructor() {
    // Service-level subscription to userId$ is safe:
    // - Service is providedIn: 'root' (singleton, lives for app lifetime)
    // - userId$ is a BehaviorSubject from singleton AuthService
    // - Subscription persists for app lifetime, no cleanup needed
    this.authService.userId$.subscribe((id) => {
      this.userId = id;
      if (id) {
        this.refreshGoalsCache();
      }
    });
  }

  // ================= CRUD Operations =========================

  /**
   * Create a new saving goal
   */
  create(goal: SavingGoalRequestDTO): Observable<SavingGoalResponseDTO> {
    if (!this.userId) {
      throw new Error('User ID not available');
    }
    
    const requestData = { ...goal, userId: this.userId };
    
    return this.http.post<ApiResponse<SavingGoalResponseDTO>>(this.BASE_URL, requestData)
      .pipe(
        map(response => this.calculateProgress(response.data)),
        tap(() => this.notifySavingGoalUpdated())
      );
  }

  /**
   * Update an existing saving goal
   */
  update(id: number, goal: SavingGoalRequestDTO): Observable<SavingGoalResponseDTO> {
    if (!this.userId) {
      throw new Error('User ID not available');
    }
    
    const requestData = { ...goal, userId: this.userId };
    
    return this.http.put<ApiResponse<SavingGoalResponseDTO>>(`${this.BASE_URL}/${id}`, requestData)
      .pipe(
        map(response => this.calculateProgress(response.data)),
        tap(() => this.notifySavingGoalUpdated())
      );
  }

  /**
   * Get a specific saving goal by ID
   */
  getById(id: number): Observable<SavingGoalResponseDTO> {
    return this.http.get<ApiResponse<SavingGoalResponseDTO>>(`${this.BASE_URL}/${id}`)
      .pipe(map(response => response.data));
  }

  /**
   * Get paginated list of user's saving goals
   */
  getAll(params?: PageableParams): Observable<SavingGoalListResponse> {
    if (!this.userId) {
      throw new Error('User ID not available');
    }

    let httpParams = new HttpParams();
    if (params) {
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
      if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
      if (params.sort) httpParams = httpParams.set('sort', params.sort);
      if (params.direction) httpParams = httpParams.set('direction', params.direction);
    }

    return this.http.get<ApiResponse<SavingGoalListResponse>>(`${this.BASE_URL}/user/${this.userId}`, { params: httpParams })
      .pipe(
        map(response => {
          // Transform categories and priorities from backend format to frontend format
          // and calculate progress for each goal
          const transformedResponse = {
            ...response.data,
            content: response.data.content.map(goal => {
              const transformedGoal = {
                ...goal,
                category: SavingGoalCategoryUtils.fromJson(goal.category as any),
                priority: SavingGoalPriorityUtils.fromJson(goal.priority as any)
              };
              return this.calculateProgress(transformedGoal);
            })
          };
          return transformedResponse;
        })
      );
  }

  /**
   * Soft delete a saving goal
   */
  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.BASE_URL}/${id}`)
      .pipe(
        map(response => response.data),
        tap(() => this.notifySavingGoalUpdated())
      );
  }

  /**
   * Restore a soft-deleted saving goal
   */
  restore(id: number): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.BASE_URL}/${id}/restore`, {})
      .pipe(
        map(response => response.data),
        tap(() => this.notifySavingGoalUpdated())
      );
  }

  // ================= Money Operations =========================

  /**
   * Add money to a saving goal
   */
  contribute(id: number, amount: number): Observable<SavingGoalResponseDTO> {
    return this.http.post<ApiResponse<SavingGoalResponseDTO>>(`${this.BASE_URL}/${id}/contribute`, null, {
      params: { amount: amount.toString() }
    }).pipe(
      map(response => response.data),
      tap(() => this.notifySavingGoalUpdated())
    );
  }

  /**
   * Withdraw money from a saving goal
   */
  withdraw(id: number, amount: number): Observable<SavingGoalResponseDTO> {
    return this.http.post<ApiResponse<SavingGoalResponseDTO>>(`${this.BASE_URL}/${id}/withdraw`, null, {
      params: { amount: amount.toString() }
    }).pipe(
      map(response => response.data),
      tap(() => this.notifySavingGoalUpdated())
    );
  }

  // ================= Status & Attribute Updates ==============

  /**
   * Update saving goal status
   */
  setStatus(id: number, status: SavingGoalStatus): Observable<SavingGoalResponseDTO> {
    return this.http.patch<ApiResponse<SavingGoalResponseDTO>>(`${this.BASE_URL}/${id}/status`, null, {
      params: { value: status }
    }).pipe(
      map(response => response.data),
      tap(() => this.notifySavingGoalUpdated())
    );
  }

  /**
   * Move saving goal deadline
   */
  moveDeadline(id: number, deadline: string): Observable<SavingGoalResponseDTO> {
    return this.http.patch<ApiResponse<SavingGoalResponseDTO>>(`${this.BASE_URL}/${id}/deadline`, null, {
      params: { date: deadline }
    }).pipe(
      map(response => response.data),
      tap(() => this.notifySavingGoalUpdated())
    );
  }

  /**
   * Rename a saving goal
   */
  rename(id: number, name: string): Observable<SavingGoalResponseDTO> {
    return this.http.patch<ApiResponse<SavingGoalResponseDTO>>(`${this.BASE_URL}/${id}/rename`, null, {
      params: { name: name }
    }).pipe(
      map(response => response.data),
      tap(() => this.notifySavingGoalUpdated())
    );
  }

  // ================= Filter Operations =========================

  /**
   * Get goals by status
   */
  getByStatus(status: SavingGoalStatus): Observable<SavingGoalResponseDTO[]> {
    if (!this.userId) {
      throw new Error('User ID not available');
    }

    return this.http.get<ApiResponse<SavingGoalResponseDTO[]>>(`${this.BASE_URL}/user/${this.userId}/status/${status}`)
      .pipe(map(response => response.data));
  }

  /**
   * Get goals by category
   */
  getByCategory(category: SavingGoalCategory): Observable<SavingGoalResponseDTO[]> {
    if (!this.userId) {
      throw new Error('User ID not available');
    }

    return this.http.get<ApiResponse<SavingGoalResponseDTO[]>>(`${this.BASE_URL}/user/${this.userId}/category/${category}`)
      .pipe(map(response => response.data));
  }

  /**
   * Get goals by priority
   */
  getByPriority(priority: SavingGoalPriority): Observable<SavingGoalResponseDTO[]> {
    if (!this.userId) {
      throw new Error('User ID not available');
    }

    return this.http.get<ApiResponse<SavingGoalResponseDTO[]>>(`${this.BASE_URL}/user/${this.userId}/priority/${priority}`)
      .pipe(map(response => response.data));
  }

  /**
   * Get overdue goals
   */
  getOverdue(): Observable<SavingGoalResponseDTO[]> {
    if (!this.userId) {
      throw new Error('User ID not available');
    }

    return this.http.get<ApiResponse<SavingGoalResponseDTO[]>>(`${this.BASE_URL}/user/${this.userId}/overdue`)
      .pipe(map(response => response.data));
  }

  /**
   * Get goals due within specified days
   */
  getDueWithin(days: number): Observable<SavingGoalResponseDTO[]> {
    if (!this.userId) {
      throw new Error('User ID not available');
    }

    return this.http.get<ApiResponse<SavingGoalResponseDTO[]>>(`${this.BASE_URL}/user/${this.userId}/due-in`, {
      params: { days: days.toString() }
    }).pipe(map(response => response.data));
  }

  // ================= Aggregate Operations =====================

  /**
   * Get saving goals totals and statistics
   */
  getTotals(): Observable<SavingGoalStatsResponse> {
    if (!this.userId) {
      throw new Error('User ID not available');
    }

    return this.http.get<ApiResponse<SavingGoalStatsResponse>>(`${this.BASE_URL}/user/${this.userId}/totals`)
      .pipe(map(response => response.data));
  }

  // ================= Utility Methods ===========================

  /**
   * Refresh the goals cache
   */
  private refreshGoalsCache(): void {
    if (this.userId) {
      this.getAll({ size: 1000 }).subscribe({
        next: (response) => {
          this.goalsCache.next(response.content);
        },
        error: (error) => {
          this.loggingService.error('Failed to refresh goals cache:', error);
        }
      });
    }
  }

  /**
   * Notify subscribers that saving goals have been updated
   */
  notifySavingGoalUpdated(): void {
    this.savingGoalUpdatedSource.next();
    this.refreshGoalsCache();
  }

  /**
   * Get cached goals (for immediate UI updates)
   */
  getCachedGoals(): SavingGoalResponseDTO[] {
    return this.goalsCache.value;
  }

  /**
   * Filter goals by multiple criteria
   */
  filterGoals(
    goals: SavingGoalResponseDTO[],
    filters: {
      category?: SavingGoalCategory;
      priority?: SavingGoalPriority;
      status?: SavingGoalStatus;
      searchTerm?: string;
    }
  ): SavingGoalResponseDTO[] {
    return goals.filter(goal => {
      if (filters.category && goal.category !== filters.category) return false;
      if (filters.priority && goal.priority !== filters.priority) return false;
      if (filters.status && goal.status !== filters.status) return false;
      if (filters.searchTerm && !goal.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
      return true;
    });
  }

  /**
   * Compute goal statistics from a list of goals
   */
  computeStats(goals: SavingGoalResponseDTO[]): {
    totalGoals: number;
    activeGoals: number;
    completedGoals: number;
    totalTargetAmount: number;
    totalCurrentAmount: number;
    totalRemainingAmount: number;
    averageProgress: number;
  } {
    const totalGoals = goals.length;
    const activeGoals = goals.filter(g => g.status === 'ACTIVE').length;
    const completedGoals = goals.filter(g => g.status === 'COMPLETED').length;
    const totalTargetAmount = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalCurrentAmount = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const totalRemainingAmount = goals.reduce((sum, g) => sum + g.remainingAmount, 0);
    const averageProgress = totalGoals > 0 ? goals.reduce((sum, g) => sum + g.progressPercent, 0) / totalGoals : 0;

    return {
      totalGoals,
      activeGoals,
      completedGoals,
      totalTargetAmount,
      totalCurrentAmount,
      totalRemainingAmount,
      averageProgress
    };
  }

  /**
   * Calculate progress percentage for a saving goal
   */
  private calculateProgress(goal: SavingGoalResponseDTO): SavingGoalResponseDTO {
    const progressPercent = goal.targetAmount > 0 
      ? Math.round((goal.currentAmount / goal.targetAmount) * 100)
      : 0;
    
    const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
    
    return {
      ...goal,
      progressPercent,
      remainingAmount
    };
  }
}
