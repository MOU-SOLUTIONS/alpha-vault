// expense.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { Expense, ExpenseRequest } from '../../models/expense.model';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private base = '/api/expense';
  private userId: number | null = null;
  private expenseUpdatedSource = new Subject<void>();
  expenseUpdated$ = this.expenseUpdatedSource.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    this.authService.userId$.subscribe((id) => {
      this.userId = id;
    });
  }

  saveExpense(dto: ExpenseRequest): Observable<Expense> {
    if (this.userId !== null) {
      dto.userId = this.userId;
      return this.http.post<Expense>(this.base, dto);
    } else {
      return throwError(() => new Error('User ID is not available'));
    }
  }

  updateExpense(expenseId: number, dto: ExpenseRequest): Observable<Expense> {
    if (this.userId !== null) {
      dto.userId = this.userId;
      return this.http.put<Expense>(`${this.base}/${expenseId}`, dto);
    } else {
      return throwError(() => new Error('User ID is not available'));
    }
  }

  deleteExpense(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  getExpenseById(id: number): Observable<Expense> {
    return this.http.get<Expense>(`${this.base}/${id}`);
  }

  getAllExpenses(): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${this.base}/user/${this.userId}`);
  }

  getExpenseForPeriod(start: string, end: string): Observable<number> {
    const params = new HttpParams().set('start', start).set('end', end);
    return this.http.get<number>(`${this.base}/custom/${this.userId}`, {
      params,
    });
  }

  getTodayExpense(): Observable<number> {
    return this.http.get<number>(`${this.base}/today/${this.userId}`);
  }

  getWeekExpense(): Observable<number> {
    return this.http.get<number>(`${this.base}/week/${this.userId}`);
  }

  getMonthExpense(): Observable<number> {
    return this.http.get<number>(`${this.base}/month/${this.userId}`);
  }

  getYearExpense(): Observable<number> {
    return this.http.get<number>(`${this.base}/year/${this.userId}`);
  }

  getPreviousWeekExpense(): Observable<number> {
    return this.http.get<number>(`${this.base}/previous-week/${this.userId}`);
  }

  getPreviousMonthExpense(): Observable<number> {
    return this.http.get<number>(`${this.base}/previous-month/${this.userId}`);
  }

  getPreviousYearExpense(): Observable<number> {
    return this.http.get<number>(`${this.base}/previous-year/${this.userId}`);
  }

  getPaymentMethodSummary(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(
      `${this.base}/summary/payment-method/${this.userId}`
    );
  }

  getExpenseCategorySummary(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(
      `${this.base}/summary/category/${this.userId}`
    );
  }

  getTop5ExpensesThisMonth(): Observable<
    { category: string; amount: number }[]
  > {
    return this.http.get<{ category: string; amount: number }[]>(
      `${this.base}/top5/${this.userId}`
    );
  }

  getExpenseForWeeksOfCurrentMonth(): Observable<number[]> {
    return this.http.get<number[]>(`${this.base}/weeks/${this.userId}`);
  }

  getExpenseForTwelveMonthsOfCurrentYear(): Observable<number[]> {
    return this.http.get<number[]>(`${this.base}/yearly/${this.userId}`);
  }

  notifyExpenseUpdated(): void {
    this.expenseUpdatedSource.next();
  }

  getWeeklyEvolution(): Observable<number> {
    return this.http.get<number>(`/api/expense/evolution/week/${this.userId}`);
  }

  getMonthlyEvolution(): Observable<number> {
    return this.http.get<number>(`/api/expense/evolution/month/${this.userId}`);
  }

  getYearlyEvolution(): Observable<number> {
    return this.http.get<number>(`/api/expense/evolution/year/${this.userId}`);
  }
}
