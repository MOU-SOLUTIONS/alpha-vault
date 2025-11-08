/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component DashboardBudgetSummaryComponent
  @description Budget summary widget component for dashboard
*/

import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { META_FRAGMENT } from '../../../../core/seo/page-meta.model';
import { AuthService } from '../../../../core/services/auth.service';
import { BudgetService } from '../../../../core/services/budget.service';

@Component({
  standalone: true,
  selector: 'app-dashboard-budget-summary',
  templateUrl: './dashboard-budget-summary.component.html',
  styleUrls: ['./dashboard-budget-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CurrencyPipe,
    RouterModule,
  ],
  providers: [
    {
      provide: META_FRAGMENT,
      useValue: {
        description: 'Budget overview widget showing total budget, spent amount, available balance, and budget usage percentage with visual progress indicators. Track your monthly budget performance with real-time updates in Alpha Vault dashboard.'
      }
    }
  ],
})
export class DashboardBudgetSummaryComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly budgetService = inject(BudgetService);

  userId: number | null = null;
  isLoading = true;
  
  totalBudget = 0;
  spent = 0;
  available = 0;
  percentageSpent = 0;

  get progressColor(): string {
    if (this.percentageSpent >= 100) return '#ef4444';
    if (this.percentageSpent >= 80) return '#f59e0b';
    return '#10b981';
  }

  get progressWidth(): number {
    return Math.min(this.percentageSpent, 100);
  }

  get formattedPercentage(): string {
    return this.percentageSpent.toFixed(1);
  }

  ngOnInit(): void {
    this.loadBudgetSummary();
  }

  private loadBudgetSummary(): void {
    this.userId = this.authService.getUserId();
    
    if (!this.userId) {
      this.isLoading = false;
      this.cdr.markForCheck();
      return;
    }

    this.isLoading = true;

    this.budgetService.getCurrentMonthBudgetSummary(this.userId).pipe(
      catchError(() => of(null)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (summary) => {
        if (summary) {
          this.totalBudget = summary.totalBudget || 0;
          this.spent = summary.totalSpent || 0;
          this.available = summary.totalRemaining || (this.totalBudget - this.spent);
          this.percentageSpent = this.totalBudget > 0 ? (this.spent / this.totalBudget) * 100 : 0;
        } else {
          this.totalBudget = 0;
          this.spent = 0;
          this.available = 0;
          this.percentageSpent = 0;
        }

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
}

