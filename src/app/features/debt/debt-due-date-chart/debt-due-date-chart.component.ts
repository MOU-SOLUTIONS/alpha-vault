/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component DebtDueDateChartComponent
  @description Main debt dashboard component for managing debt payment deadlines
*/

import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { META_FRAGMENT } from '../../../core/seo/page-meta.model';

interface Debt {
  creditorName: string;
  dueDate: string;
  remainingAmount: number;
}

interface DebtStatus {
  class: 'overdue' | 'urgent' | 'warning' | 'normal';
  text: string;
  iconType: 'overdue' | 'urgent' | 'warning' | 'normal';
  daysRemaining: string;
}

@Component({
  selector: 'app-debt-due-date-chart',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './debt-due-date-chart.component.html',
  styleUrls: ['./debt-due-date-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: META_FRAGMENT,
      useValue: {
        description: 'Track your debt due dates with visual indicators for overdue, urgent, and upcoming payments. Monitor payment deadlines effectively in Alpha Vault.'
      }
    }
  ],
  animations: [
    trigger('slideInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class DebtDueDateChartComponent implements OnInit, OnChanges {

  @Input() debts: Debt[] = [];

  private _cachedSortedDebts?: Debt[];
  private _cachedDebtStatuses = new Map<string, DebtStatus>();
  private _cachedOverdueCount?: number;
  private _cachedUrgentCount?: number;
  private _cachedUpcomingCount?: number;
  private _cachedHasData?: boolean;
  private _lastDebtsArray?: Debt[];

  ngOnInit(): void {
    this.invalidateCache();
    this.computeValues();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['debts']) {
      this.invalidateCache();
      this.computeValues();
    }
  }

  private invalidateCache(): void {
    this._cachedSortedDebts = undefined;
    this._cachedDebtStatuses.clear();
    this._cachedOverdueCount = undefined;
    this._cachedUrgentCount = undefined;
    this._cachedUpcomingCount = undefined;
    this._cachedHasData = undefined;
    this._lastDebtsArray = undefined;
  }

  private computeValues(): void {
    this.sortedDebts;
    this.hasDebtData;
    this.overdueCount;
    this.urgentCount;
    this.upcomingCount;
  }

  private isDebtsArrayEqual(a: Debt[] | undefined, b: Debt[]): boolean {
    if (!a || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i].creditorName !== b[i].creditorName || 
          a[i].dueDate !== b[i].dueDate || 
          a[i].remainingAmount !== b[i].remainingAmount) {
        return false;
      }
    }
    return true;
  }

  get sortedDebts(): Debt[] {
    if (this.isDebtsArrayEqual(this._lastDebtsArray, this.debts) && this._cachedSortedDebts !== undefined) {
      return this._cachedSortedDebts;
    }
    
    this._lastDebtsArray = [...this.debts];
    
    if (!this.debts || this.debts.length === 0) {
      this._cachedSortedDebts = [];
      return [];
    }
    
    this._cachedSortedDebts = [...this.debts].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    return this._cachedSortedDebts;
  }

  getDebtStatus(dueDate: string): DebtStatus {
    if (this._cachedDebtStatuses.has(dueDate)) {
      return this._cachedDebtStatuses.get(dueDate)!;
    }

    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let status: DebtStatus;
    
    if (diffDays < 0) {
      status = {
        class: 'overdue',
        text: 'Overdue',
        iconType: 'overdue',
        daysRemaining: `${Math.abs(diffDays)} days overdue`
      };
    } else if (diffDays >= 0 && diffDays <= 7) {
      status = {
        class: 'urgent',
        text: 'Due Soon',
        iconType: 'urgent',
        daysRemaining: diffDays === 0 ? 'Due today' : diffDays === 1 ? 'Due tomorrow' : `${diffDays} days`
      };
    } else if (diffDays > 7 && diffDays <= 30) {
      const weeks = Math.ceil(diffDays / 7);
      status = {
        class: 'warning',
        text: 'Upcoming',
        iconType: 'warning',
        daysRemaining: `${weeks} week${weeks > 1 ? 's' : ''}`
      };
    } else {
      const months = Math.ceil(diffDays / 30);
      status = {
        class: 'normal',
        text: 'Future',
        iconType: 'normal',
        daysRemaining: `${months} month${months > 1 ? 's' : ''}`
      };
    }
    
    this._cachedDebtStatuses.set(dueDate, status);
    return status;
  }

  get overdueCount(): number {
    if (this._cachedOverdueCount !== undefined && this.isDebtsArrayEqual(this._lastDebtsArray, this.debts)) {
      return this._cachedOverdueCount;
    }
    
    this._lastDebtsArray = [...this.debts];
    
    if (!this.debts) {
      this._cachedOverdueCount = 0;
      return 0;
    }
    
    const today = new Date();
    this._cachedOverdueCount = this.debts.filter(debt => new Date(debt.dueDate) < today).length;
    return this._cachedOverdueCount;
  }

  get urgentCount(): number {
    if (this._cachedUrgentCount !== undefined && this.isDebtsArrayEqual(this._lastDebtsArray, this.debts)) {
      return this._cachedUrgentCount;
    }
    
    this._lastDebtsArray = [...this.debts];
    
    if (!this.debts) {
      this._cachedUrgentCount = 0;
      return 0;
    }
    
    const today = new Date();
    this._cachedUrgentCount = this.debts.filter(debt => {
      const due = new Date(debt.dueDate);
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    }).length;
    return this._cachedUrgentCount;
  }

  get upcomingCount(): number {
    if (this._cachedUpcomingCount !== undefined && this.isDebtsArrayEqual(this._lastDebtsArray, this.debts)) {
      return this._cachedUpcomingCount;
    }
    
    this._lastDebtsArray = [...this.debts];
    
    if (!this.debts) {
      this._cachedUpcomingCount = 0;
      return 0;
    }
    
    const today = new Date();
    this._cachedUpcomingCount = this.debts.filter(debt => {
      const due = new Date(debt.dueDate);
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 7 && diffDays <= 30;
    }).length;
    return this._cachedUpcomingCount;
  }

  trackByDebt(index: number, debt: Debt): string {
    return debt.creditorName;
  }

  get hasDebtData(): boolean {
    if (this._cachedHasData !== undefined && this.isDebtsArrayEqual(this._lastDebtsArray, this.debts)) {
      return this._cachedHasData;
    }
    
    this._lastDebtsArray = [...this.debts];
    this._cachedHasData = this.debts && this.debts.length > 0;
    return this._cachedHasData;
  }
}
