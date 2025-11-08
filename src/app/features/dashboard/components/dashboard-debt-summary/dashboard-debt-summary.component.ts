/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component DashboardDebtSummaryComponent
  @description Debt summary widget component for dashboard
*/

import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { merge, of } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';

import { META_FRAGMENT } from '../../../../core/seo/page-meta.model';
import { AuthService } from '../../../../core/services/auth.service';
import { DebtService } from '../../../../core/services/debt.service';

@Component({
  standalone: true,
  selector: 'app-dashboard-debt-summary',
  templateUrl: './dashboard-debt-summary.component.html',
  styleUrls: ['./dashboard-debt-summary.component.scss'],
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
        description: 'Debt overview widget displaying total debt, total paid amount, creditor count, and monthly minimum payments. Monitor your debt management progress with real-time updates and financial health indicators in Alpha Vault dashboard.'
      }
    }
  ],
})
export class DashboardDebtSummaryComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly debtService = inject(DebtService);

  isLoading = true;
  
  totalDebt = 0;
  totalPaid = 0;
  totalMinPayments = 0;
  creditorCount = 0;

  ngOnInit(): void {
    merge(
      of(null),
      this.debtService.debtUpdated$
    ).pipe(
      switchMap(() => {
        this.isLoading = true;
        this.cdr.markForCheck();

        return this.authService.userId$.pipe(
          filter(userId => userId !== null && userId !== undefined),
          take(1),
          switchMap(() => this.debtService.getDebtTotals()),
          catchError(() => {
            return of({ totalDebt: 0, totalPaid: 0, totalMinPayments: 0, creditorCount: 0 });
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (totals) => {
        let totalsData: any;
        if (totals instanceof Map) {
          totalsData = {
            totalRemaining: totals.get('totalRemaining') || 0,
            totalMinPayments: totals.get('totalMinPayments') || 0,
            debtsCount: totals.get('debtsCount') || 0,
            totalDebt: totals.get('totalDebt') || 0,
            totalPaid: totals.get('totalPaid') || 0,
            creditorCount: totals.get('creditorCount') || 0
          };
        } else {
          totalsData = totals || {};
        }
        
        this.totalDebt = totalsData.totalRemaining || totalsData.totalDebt || 0;
        this.totalPaid = totalsData.totalPaid || 0;
        this.totalMinPayments = totalsData.totalMinPayments || 0;
        this.creditorCount = totalsData.debtsCount || totalsData.creditorCount || 0;

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

