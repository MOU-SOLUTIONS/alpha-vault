// coded by modamed
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { Debt, DebtRequest, DebtHistoryItem } from '../../models/debt.model';

@Injectable({ providedIn: 'root' })
export class DebtService {
  private base = '/api/debt';
  private userId: number | null = null;
  private debtUpdatedSource = new Subject<void>();
  debtUpdated$ = this.debtUpdatedSource.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    this.authService.userId$.subscribe((id) => (this.userId = id));
  }

  /** CREATE debt */
  saveDebt(dto: DebtRequest): Observable<Debt> {
    if (this.userId !== null) {
      dto.userId = this.userId;
      return this.http.post<Debt>(this.base, dto);
    }
    return throwError(() => new Error('User ID is not available'));
  }

  /** UPDATE debt */
  updateDebt(debtId: number, dto: DebtRequest): Observable<Debt> {
    if (this.userId !== null) {
      dto.userId = this.userId;
      return this.http.put<Debt>(`${this.base}/${debtId}`, dto);
    }
    return throwError(() => new Error('User ID is not available'));
  }

  /** DELETE debt */
  deleteDebt(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  /** GET debt by ID */
  getDebtById(id: number): Observable<Debt> {
    return this.http.get<Debt>(`${this.base}/${id}`);
  }

  /** GET all debts for the logged-in user */
  getAllDebts(): Observable<Debt[]> {
    return this.http.get<Debt[]>(`${this.base}/user/${this.userId}`);
  }

  /** GET total debt for the logged-in user */
  getTotalDebt(): Observable<number> {
    return this.http.get<number>(`${this.base}/total/${this.userId}`);
  }

  /** GET overdue debts for the logged-in user */
  getOverdueDebts(): Observable<Debt[]> {
    return this.http.get<Debt[]>(`${this.base}/overdue/${this.userId}`);
  }

  /** GET debt payment history */
  getDebtPaymentHistory(debtId: number): Observable<DebtHistoryItem[]> {
    return this.http.get<DebtHistoryItem[]>(`${this.base}/payment-history/${debtId}`);
  }

  /** GET total minimum payments for the logged-in user */
  getTotalMinPayments(): Observable<number> {
    return this.http.get<number>(`${this.base}/total-min-payments/${this.userId}`);
  }

  /** GET debts summarized by creditor */
  getDebtCreditorSummary(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`${this.base}/creditor-summary/${this.userId}`);
  }

  /** GET top 5 largest debts */
  getTop5LargestDebts(): Observable<{ creditor: string; remainingAmount: number; dueDate: string }[]> {
    return this.http.get<{ creditor: string; remainingAmount: number; dueDate: string }[]>(
      `${this.base}/top5/${this.userId}`
    );
  }

  /** ADD payment to a debt */
  addPaymentToDebt(debtId: number, paymentAmount: number, note?: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/add-payment/${debtId}`, { paymentAmount, note });
  }

  /** Notify listeners that debt data changed */
  notifyDebtUpdated(): void {
    this.debtUpdatedSource.next();
  }
}
