/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component DashboardInvestmentSummaryComponent
  @description Investment portfolio summary widget component for dashboard
*/

import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { META_FRAGMENT } from '../../../../core/seo/page-meta.model';
import { InvestmentResponse } from '../../../../models/investment.model';
import { InvestmentService } from '../../../../core/services/investment.service';

@Component({
  standalone: true,
  selector: 'app-dashboard-investment-summary',
  templateUrl: './dashboard-investment-summary.component.html',
  styleUrls: ['./dashboard-investment-summary.component.scss'],
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
        description: 'Investment portfolio summary widget displaying total portfolio value, total invested amount, active investments count, and gain/loss metrics with percentage calculations. Track your investment performance with real-time portfolio updates in Alpha Vault dashboard.'
      }
    }
  ],
})
export class DashboardInvestmentSummaryComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly investmentService = inject(InvestmentService);

  isLoading = true;
  
  totalValue = 0;
  totalInvested = 0;
  totalGain = 0;
  gainPercentage = 0;
  activeInvestments = 0;

  /**
   * Cached formatted gain percentage string
   * Updated when gainPercentage changes
   */
  get formattedGainPercentage(): string {
    return this.gainPercentage >= 0 
      ? `+${this.gainPercentage.toFixed(2)}%` 
      : `${this.gainPercentage.toFixed(2)}%`;
  }


  /**
   * Cached boolean indicating if gain is positive
   * Updated when totalGain changes
   */
  get isGainPositive(): boolean {
    return this.totalGain >= 0;
  }

  ngOnInit(): void {
    this.loadInvestmentSummary();
  }

  private loadInvestmentSummary(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.investmentService.getAll().pipe(
      catchError(() => of([])),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (investments: InvestmentResponse[]) => {
        // Filter active investments (not closed)
        this.activeInvestments = investments.filter(inv => inv.status !== 'CLOSED' && !inv.soldDate).length;
        
        // Calculate total invested (amountInvested field)
        this.totalInvested = investments.reduce((sum, inv) => {
          return sum + (inv.amountInvested || 0);
        }, 0);
        
        // Calculate total current value
        this.totalValue = investments.reduce((sum, inv) => {
          // Use currentValue if available, otherwise use amountInvested for closed investments
          if (inv.status === 'CLOSED' && inv.soldValue) {
            return sum + (inv.soldValue || 0);
          }
          return sum + (inv.currentValue || inv.amountInvested || 0);
        }, 0);
        
        this.totalGain = this.totalValue - this.totalInvested;
        this.gainPercentage = this.totalInvested > 0 ? (this.totalGain / this.totalInvested) * 100 : 0;

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

