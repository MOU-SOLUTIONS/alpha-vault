/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component DashboardSavingsSummaryComponent
  @description Savings goals summary widget component for dashboard
*/

import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { merge, of } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';

import { META_FRAGMENT } from '../../../../core/seo/page-meta.model';
import { AuthService } from '../../../../core/services/auth.service';
import { SavingGoalService } from '../../../../core/services/saving.service';

@Component({
  standalone: true,
  selector: 'app-dashboard-savings-summary',
  templateUrl: './dashboard-savings-summary.component.html',
  styleUrls: ['./dashboard-savings-summary.component.scss'],
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
        description: 'Savings goals overview widget displaying total saved amount, target amount, active goals count, and overall progress percentage with visual progress bar. Track your savings performance with real-time updates and goal completion tracking in Alpha Vault dashboard.'
      }
    }
  ],
})
export class DashboardSavingsSummaryComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly savingService = inject(SavingGoalService);

  isLoading = true;
  
  totalSaved = 0;
  totalTarget = 0;
  activeGoals = 0;
  completionRate = 0;

  get progressWidth(): number {
    return Math.min(this.completionRate, 100);
  }

  get formattedPercentage(): string {
    return this.progressWidth.toFixed(1);
  }

  get progressGradient(): string {
    return 'linear-gradient(90deg, #f59e0b 0%, #f97316 100%)';
  }

  ngOnInit(): void {
    merge(
      of(null),
      this.savingService.savingGoalUpdated$
    ).pipe(
      switchMap(() => {
        this.isLoading = true;
        this.cdr.markForCheck();

        return this.authService.userId$.pipe(
          filter(userId => userId !== null && userId !== undefined),
          take(1),
          switchMap(() => {
            try {
              return this.savingService.getTotals();
            } catch (error) {
              return of({ totalCurrent: 0, totalTarget: 0, goalsCount: 0, totalRemaining: 0 });
            }
          }),
          catchError(() => {
            return of({ totalCurrent: 0, totalTarget: 0, goalsCount: 0, totalRemaining: 0 });
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (stats) => {
        const statsData = stats as any;
        this.totalSaved = statsData.totalCurrent || statsData.totalCurrentAmount || 0;
        this.totalTarget = statsData.totalTarget || statsData.totalTargetAmount || 0;
        this.activeGoals = statsData.goalsCount || statsData.activeGoals || 0;
        this.completionRate = this.totalTarget > 0 ? (this.totalSaved / this.totalTarget) * 100 : 0;

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

