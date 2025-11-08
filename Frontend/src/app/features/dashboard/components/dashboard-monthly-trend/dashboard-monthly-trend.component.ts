/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component DashboardMonthlyTrendComponent
  @description Monthly trend visualization widget component for dashboard
*/

import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { META_FRAGMENT } from '../../../../core/seo/page-meta.model';
import { AuthService } from '../../../../core/services/auth.service';
import { ExpenseService } from '../../../../core/services/expense.service';
import { IncomeService } from '../../../../core/services/income.service';

export interface MonthlyTrendData {
  month: string;
  income: number;
  expense: number;
  net: number;
  incomePercentage: number;
  expensePercentage: number;
  animationDelay: string;
}

@Component({
  standalone: true,
  selector: 'app-dashboard-monthly-trend',
  templateUrl: './dashboard-monthly-trend.component.html',
  styleUrls: ['./dashboard-monthly-trend.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CurrencyPipe,
  ],
  providers: [
    {
      provide: META_FRAGMENT,
      useValue: {
        description: 'Monthly income and expense trends visualization chart with grouped bars showing year-over-year financial patterns. Interactive tooltips display income, expense, and net values for each month with smooth animations and accessibility features in Alpha Vault dashboard.'
      }
    }
  ],
})
export class DashboardMonthlyTrendComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly incomeService = inject(IncomeService);
  private readonly expenseService = inject(ExpenseService);

  userId: number | null = null;
  isLoading = true;
  
  monthlyData: MonthlyTrendData[] = [];
  maxValue = 0;

  readonly gridLines = [0, 25, 50, 75, 100];

  private readonly months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  ngOnInit(): void {
    this.loadMonthlyTrend();
  }

  private loadMonthlyTrend(): void {
    this.userId = this.authService.getUserId();
    
    if (!this.userId) {
      this.isLoading = false;
      this.cdr.markForCheck();
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    forkJoin({
      yearlyIncome: this.incomeService.getYearlyIncomes(this.userId).pipe(
        catchError(() => of([]))
      ),
      yearlyExpense: this.expenseService.getExpenseForMonthsOfCurrentYear().pipe(
        catchError(() => of([]))
      ),
    }).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data) => {
        const incomeData = data.yearlyIncome as number[];
        const expenseData = data.yearlyExpense as number[];
        
        const rawData = this.months.map((month, index) => {
          const income = incomeData[index] || 0;
          const expense = expenseData[index] || 0;
          const net = income - expense;
          
          return { month, income, expense, net };
        });

        this.maxValue = Math.max(
          ...rawData.map(d => Math.max(d.income, d.expense)),
          1000
        );
        
        this.monthlyData = rawData.map((data, index) => ({
          ...data,
          incomePercentage: this.maxValue > 0 ? (data.income / this.maxValue) * 100 : 0,
          expensePercentage: this.maxValue > 0 ? (data.expense / this.maxValue) * 100 : 0,
          animationDelay: `${index * 0.05}s`
        }));

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  trackByMonth(_: number, item: MonthlyTrendData): string {
    return item.month;
  }

  trackByGridLine(_: number, value: number): number {
    return value;
  }
}

