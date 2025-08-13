// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Component, Input, OnChanges, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta } from '@angular/platform-browser';

interface BudgetStatus {
  type: 'excellent' | 'good' | 'warning' | 'danger' | 'critical';
  color: string;
  icon: string;
  message: string;
  gradient: string;
}

@Component({
  selector: 'app-budget-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './budget-progress.component.html',
  styleUrls: ['./budget-progress.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetProgressComponent implements OnInit, OnChanges {
  @Input() totalBudget = 0;
  @Input() totalRemaining = 0;

  isVisible = false;
  isInteractive = false;
  progressPercent = 0;
  currentStatus!: BudgetStatus;

  private statusConfigs: Record<string, BudgetStatus> = {
    excellent: {
      type: 'excellent',
      color: '#009688',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      message: 'Excellent Budget Control',
      gradient: 'linear-gradient(135deg, #009688, #26a69a)',
    },
    good: {
      type: 'good',
      color: '#4caf50',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      message: 'Good Budget Management',
      gradient: 'linear-gradient(135deg, #4caf50, #66bb6a)',
    },
    warning: {
      type: 'warning',
      color: '#ff9800',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z',
      message: 'Budget Warning - Monitor Spending',
      gradient: 'linear-gradient(135deg, #ff9800, #ffb74d)',
    },
    danger: {
      type: 'danger',
      color: '#f44336',
      icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      message: 'Danger Zone - Reduce Spending',
      gradient: 'linear-gradient(135deg, #f44336, #ef5350)',
    },
    critical: {
      type: 'critical',
      color: '#d32f2f',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z',
      message: 'Critical - Budget Exceeded',
      gradient: 'linear-gradient(135deg, #d32f2f, #e57373)',
    },
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private meta: Meta,
  ) {
    this.meta.addTags([
      { name: 'description', content: 'Elite budget progress tracking with real-time status indicators and visual analytics' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ]);
    
    this.currentStatus = this.getStatusConfig('excellent');
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.isVisible = true;
      this.isInteractive = true;
      this.cdr.markForCheck();
    }, 100);
  }

  ngOnChanges(): void {
    this.calculateProgress();
    this.cdr.markForCheck();
  }

  getSpentAmount(): number {
    return this.totalBudget - this.totalRemaining;
  }

  private calculateProgress(): void {
    if (this.totalBudget > 0) {
      const spent = this.getSpentAmount();
      this.progressPercent = (spent / this.totalBudget) * 100;
      this.updateStatus();
    } else {
      this.progressPercent = 0;
      this.currentStatus = this.getStatusConfig('excellent');
    }
  }

  private updateStatus(): void {
    let statusType: keyof typeof this.statusConfigs = 'excellent';

    if (this.progressPercent >= 100) {
      statusType = 'critical';
    } else if (this.progressPercent >= 90) {
      statusType = 'danger';
    } else if (this.progressPercent >= 75) {
      statusType = 'warning';
    } else if (this.progressPercent >= 50) {
      statusType = 'good';
    }

    this.currentStatus = this.getStatusConfig(statusType);
  }

  private getStatusConfig(type: keyof typeof this.statusConfigs): BudgetStatus {
    return this.statusConfigs[type];
  }
}
