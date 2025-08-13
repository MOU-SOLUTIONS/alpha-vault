import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { InvestmentType } from '../../enums/investment-type';
import { RiskLevel } from '../../enums/risk-level';
import {
  Investment,
  InvestmentRequest,
  InvestmentResponse,
} from '../../models/investment.model';

@Injectable({ providedIn: 'root' })
export class InvestmentService {
  private readonly baseUrl = '/api/investment';
  private userId: number | null = null;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.authService.userId$.subscribe((id) => {
      this.userId = id;
    });
  }

  getAll(): Observable<InvestmentResponse[]> {
    return this.http.get<InvestmentResponse[]>(
      `${this.baseUrl}/user/${this.userId}`
    );
  }

  getById(id: number): Observable<InvestmentResponse> {
    return this.http.get<InvestmentResponse>(`${this.baseUrl}/${id}`);
  }

  create(goal: InvestmentRequest): Observable<InvestmentResponse> {
    if (this.userId !== null) {
      goal.userId = this.userId;
      return this.http.post<InvestmentResponse>(this.baseUrl, goal);
    }
    return throwError(() => new Error('User ID not available'));
  }

  update(id: number, goal: InvestmentRequest): Observable<InvestmentResponse> {
    if (this.userId !== null) {
      goal.userId = this.userId;
      return this.http.put<InvestmentResponse>(`${this.baseUrl}/${id}`, goal);
    }
    return throwError(() => new Error('User ID not available'));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getTop5(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(
      `${this.baseUrl}/top5/${this.userId}`
    );
  }

  getTypeSummary(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(
      `${this.baseUrl}/summary/type/${this.userId}`
    );
  }

  getRiskSummary(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(
      `${this.baseUrl}/summary/risk/${this.userId}`
    );
  }

  getEvolution(): Observable<number[]> {
    return this.http.get<number[]>(`${this.baseUrl}/evolution/${this.userId}`);
  }

  getByType(type: InvestmentType): Observable<InvestmentResponse[]> {
    return this.http.get<InvestmentResponse[]>(
      `${this.baseUrl}/user/${this.userId}/type?type=${type}`
    );
  }

  getByRisk(risk: RiskLevel): Observable<InvestmentResponse[]> {
    return this.http.get<InvestmentResponse[]>(
      `${this.baseUrl}/user/${this.userId}/risk?risk=${risk}`
    );
  }
}
