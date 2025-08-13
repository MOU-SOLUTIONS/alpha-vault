import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { BudgetRequest, BudgetResponse } from '../../models/budget.model';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private base = '/api/budget';
  private userId: number | null = null;
  private budgetUpdatedSource = new Subject<void>();
  budgetUpdated$ = this.budgetUpdatedSource.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    this.authService.userId$.subscribe((id) => {
      this.userId = id;
    });
  }

  saveBudget(dto: BudgetRequest): Observable<BudgetResponse> {
    if (this.userId !== null) {
      dto.userId = this.userId;
      return this.http.post<BudgetResponse>(this.base, dto);
    } else {
      return throwError(() => new Error('User ID is not available'));
    }
  }

  updateBudget(
    budgetId: number,
    dto: BudgetRequest
  ): Observable<BudgetResponse> {
    if (this.userId !== null) {
      dto.userId = this.userId;
      return this.http.put<BudgetResponse>(`${this.base}/${budgetId}`, dto);
    } else {
      return throwError(() => new Error('User ID is not available'));
    }
  }

  deleteBudget(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  getBudgetById(id: number): Observable<BudgetResponse> {
    return this.http.get<BudgetResponse>(`${this.base}/${id}`);
  }

  getBudgetsByUser(): Observable<BudgetResponse[]> {
    return this.http.get<BudgetResponse[]>(`${this.base}/user/${this.userId}`);
  }

  getBudgetForMonth(month: number, year: number): Observable<BudgetResponse> {
    return this.http.get<BudgetResponse>(
      `${this.base}/month/${this.userId}?month=${month}&year=${year}`
    );
  }

  getCurrentMonthSummary(): Observable<any> {
    return this.http.get<any>(`${this.base}/summary/current/${this.userId}`);
  }

  getPreviousMonthSummary(): Observable<any> {
    return this.http.get<any>(`${this.base}/summary/previous/${this.userId}`);
  }

  getAvailablePeriods(): Observable<{ month: number; year: number }[]> {
    return this.http.get<{ month: number; year: number }[]>(
      `${this.base}/periods/${this.userId}`
    );
  }

  getAnnualBudget(year: number): Observable<number> {
    return this.http.get<number>(
      `${this.base}/annual/${this.userId}?year=${year}`
    );
  }

  getMonthlyBudgetAggregate(
    year: number
  ): Observable<{ [month: number]: number }> {
    return this.http.get<{ [month: number]: number }>(
      `${this.base}/monthly/${this.userId}?year=${year}`
    );
  }

  notifyBudgetUpdated(): void {
    this.budgetUpdatedSource.next();
  }

  addOrUpdateCategory(
    userId: number,
    month: number,
    year: number,
    category: string,
    allocated: number
  ) {
    return this.http.post<BudgetResponse>(`/api/budget/category`, {
      userId,
      month,
      year,
      category,
      allocated,
    });
  }
}
