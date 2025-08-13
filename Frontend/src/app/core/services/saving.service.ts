import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

import { AuthService } from './auth.service';
import {
  SavingGoalRequest,
  SavingGoalResponse,
} from '../../models/saving.model';

@Injectable({ providedIn: 'root' })
export class SavingGoalService {
  private readonly BASE_URL = '/api/saving-goal';
  private userId: number | null = null;
  private savingGoalUpdatedSource = new Subject<void>();
  savingGoalUpdated$ = this.savingGoalUpdatedSource.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    this.authService.userId$.subscribe((id) => {
      this.userId = id;
    });
  }

  getAll(): Observable<SavingGoalResponse[]> {
    return this.http.get<SavingGoalResponse[]>(
      `${this.BASE_URL}/user/${this.userId}`
    );
  }

  getById(id: number): Observable<SavingGoalResponse> {
    return this.http.get<SavingGoalResponse>(`${this.BASE_URL}/${id}`);
  }

  create(goal: SavingGoalRequest): Observable<SavingGoalResponse> {
    if (this.userId !== null) {
      goal.userId = this.userId;
      return this.http.post<SavingGoalResponse>(this.BASE_URL, goal);
    } else {
      throw new Error('User ID not available');
    }
  }

  update(id: number, goal: SavingGoalRequest): Observable<SavingGoalResponse> {
    if (this.userId !== null) {
      goal.userId = this.userId;
      return this.http.put<SavingGoalResponse>(`${this.BASE_URL}/${id}`, goal);
    } else {
      throw new Error('User ID not available');
    }
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.BASE_URL}/${id}`);
  }

  notifySavingGoalUpdated(): void {
    this.savingGoalUpdatedSource.next();
  }
}
