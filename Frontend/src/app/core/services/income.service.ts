import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { Income, IncomeRequest } from '../../models/income.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class IncomeService {
  private base = '/api/income';
  private userId: number | null = null;
  private incomeUpdatedSource = new Subject<void>();
  incomeUpdated$ = this.incomeUpdatedSource.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    this.authService.userId$.subscribe((id) => {
      console.log(id)
      this.userId = id;
    });
  }

  saveIncome(dto: IncomeRequest): Observable<Income> {
    if (this.userId !== null) {
      console.log(this.userId)
      dto.userId = this.userId;
      console.log(dto);
      return this.http.post<Income>(this.base, dto);
    } else {
      console.log('User ID is not available');
      return throwError(() => new Error('User ID is not available'));
    }
  }

  updateIncome(incomeId: number, dto: IncomeRequest): Observable<Income> {
    if (this.userId !== null) {
      dto.userId = this.userId;
      return this.http.put<Income>(`${this.base}/${incomeId}`, dto); // 👈 correct ID here
    } else {
      return throwError(() => new Error('User ID is not available'));
    }
  }

  /** DELETE */
  deleteIncome(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  /** GET by ID */
  getIncomeById(): Observable<Income> {
    return this.http.get<Income>(`${this.base}/${this.base}`);
  }

  /** GET all incomes for a user */
  getAllIncomes(): Observable<Income[]> {
    return this.http.get<Income[]>(`${this.base}/user/${this.userId}`);
  }

  /** GET income for a custom period */
  getIncomeForPeriod(
    userId: number,
    start: string,
    end: string
  ): Observable<number> {
    const params = new HttpParams().set('start', start).set('end', end);
    return this.http.get<number>(`${this.base}/custom/${userId}`, { params });
  }

  /** GET today/week/month/year & previous periods */
  getTodayIncome(): Observable<number> {
    return this.http.get<number>(`${this.base}/today/${this.userId}`);
  }

  getWeekIncome(): Observable<number> {
    return this.http.get<number>(`${this.base}/week/${this.userId}`);
  }

  getMonthIncome(): Observable<number> {
    return this.http.get<number>(`${this.base}/month/${this.userId}`);
  }

  getYearIncome(): Observable<number> {
    return this.http.get<number>(`${this.base}/year/${this.userId}`);
  }

  getPreviousWeekIncome(userId: number): Observable<number> {
    return this.http.get<number>(`${this.base}/previous-week/${userId}`);
  }

  getPreviousMonthIncome(userId: number): Observable<number> {
    return this.http.get<number>(`${this.base}/previous-month/${userId}`);
  }

  getPreviousYearIncome(userId: number): Observable<number> {
    return this.http.get<number>(`${this.base}/previous-year/${userId}`);
  }

  /** SUMMARY by payment method */
  getPaymentMethodSummary(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(
      `${this.base}/summary/payment-method/${this.userId}`
    );
  }

  /** Top 5 incomes this month */
  getTop5IncomeThisMonth(): Observable<{ [category: string]: number }> {
    return this.http.get<{ [category: string]: number }>(
      `${this.base}/top5/${this.userId}`
    );
  }

  getIncomeForWeeksOfCurrentMonth(): Observable<number[]> {
    return this.http.get<number[]>(`${this.base}/weeks/${this.userId}`);
  }

  getIncomeForMonthsOfCurrentYear(): Observable<number[]> {
    return this.http.get<number[]>(`${this.base}/yearly/${this.userId}`);
  }

  // Get weekly income evolution
  getWeeklyEvolution(): Observable<number> {
    return this.http.get<number>(`${this.base}/evolution/week/${this.userId}`);
  }

  // Get monthly income evolution
  getMonthlyEvolution(): Observable<number> {
    return this.http.get<number>(`${this.base}/evolution/month/${this.userId}`);
  }

  // Get yearly income evolution
  getYearlyEvolution(): Observable<number> {
    return this.http.get<number>(`${this.base}/evolution/year/${this.userId}`);
  }

  getIncomeSourceSummary(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(
      `${this.base}/summary/income-source/${this.userId}`
    );
  }

  getSourcesByUser(): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/source/${this.userId}`);
  }

  notifyIncomeUpdated(): void {
    this.incomeUpdatedSource.next();
  }
}
