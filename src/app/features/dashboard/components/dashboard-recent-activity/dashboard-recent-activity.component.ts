/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component DashboardRecentActivityComponent
  @description Recent transactions activity widget component for dashboard
*/

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { META_FRAGMENT } from '../../../../core/seo/page-meta.model';
import { AuthService } from '../../../../core/services/auth.service';
import { ExpenseService } from '../../../../core/services/expense.service';
import { IncomeService } from '../../../../core/services/income.service';

export interface ActivityItem {
  id: number;
  type: 'income' | 'expense';
  title: string;
  amount: number;
  formattedAmount: string;
  date: string;
  formattedDate: string;
  icon: string;
  color: string;
}

@Component({
  standalone: true,
  selector: 'app-dashboard-recent-activity',
  templateUrl: './dashboard-recent-activity.component.html',
  styleUrls: ['./dashboard-recent-activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
  ],
  providers: [
    {
      provide: META_FRAGMENT,
      useValue: {
        description: 'Recent financial activity feed displaying the latest income and expense transactions with formatted amounts, relative dates, and visual indicators. Track your recent financial activity with real-time updates and keyboard-accessible navigation in Alpha Vault dashboard.'
      }
    }
  ],
})
export class DashboardRecentActivityComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly incomeService = inject(IncomeService);
  private readonly expenseService = inject(ExpenseService);

  userId: number | null = null;
  isLoading = true;
  activities: ActivityItem[] = [];

  ngOnInit(): void {
    this.loadRecentActivity();
  }

  private loadRecentActivity(): void {
    this.userId = this.authService.getUserId();
    
    if (!this.userId) {
      this.isLoading = false;
      this.cdr.markForCheck();
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    forkJoin({
      recentIncomes: this.incomeService.getIncomesByUser(this.userId, 0, 5).pipe(
        catchError(() => of({ content: [] }))
      ),
      recentExpenses: this.expenseService.getExpensesPaginated(0, 5).pipe(
        catchError(() => of({ content: [] }))
      ),
    }).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data) => {
        const incomes = (data.recentIncomes as any).content || [];
        const expenses = (data.recentExpenses as any).content || [];

        const incomeActivities: ActivityItem[] = incomes.map((income: any) => {
          const amount = income.amount || 0;
          return {
            id: income.id,
            type: 'income' as const,
            title: income.source || 'Income',
            amount,
            formattedAmount: this.formatCurrency(amount),
            date: income.date || new Date().toISOString(),
            formattedDate: this.formatDate(income.date || new Date().toISOString()),
            icon: 'fa-dollar-sign',
            color: '#6366f1',
          };
        });

        const expenseActivities: ActivityItem[] = expenses.map((expense: any) => {
          const amount = expense.amount || 0;
          return {
            id: expense.id,
            type: 'expense' as const,
            title: expense.category || expense.description || 'Expense',
            amount,
            formattedAmount: this.formatCurrency(amount),
            date: expense.expenseDate || new Date().toISOString(),
            formattedDate: this.formatDate(expense.expenseDate || new Date().toISOString()),
            icon: 'fa-chart-line',
            color: '#ef4444',
          };
        });

        this.activities = [...incomeActivities, ...expenseActivities]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 8);

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  trackByActivity(_: number, item: ActivityItem): number {
    return item.id;
  }
}

