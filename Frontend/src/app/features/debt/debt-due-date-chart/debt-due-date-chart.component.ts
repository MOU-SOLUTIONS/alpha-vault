// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { CommonModule, DecimalPipe } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

interface Debt {
  creditorName: string;
  dueDate: string;
  remainingAmount: number;
}

@Component({
  selector: 'app-debt-due-date-chart',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './debt-due-date-chart.component.html',
  styleUrls: ['./debt-due-date-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
export class DebtDueDateChartComponent implements OnInit {
  @Input() debts: Debt[] = [];

  constructor(
    private meta: Meta
  ) {}

  ngOnInit(): void {
    this.setSEOMeta();
  }

  getSortedDebts(): Debt[] {
    if (!this.debts) return [];
    return [...this.debts].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  isOverdue(dueDate: string): boolean {
    return new Date(dueDate) < new Date();
  }

  isUrgent(dueDate: string): boolean {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  }

  isWarning(dueDate: string): boolean {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 7 && diffDays <= 30;
  }

  getStatusClass(dueDate: string): string {
    if (this.isOverdue(dueDate)) return 'overdue';
    if (this.isUrgent(dueDate)) return 'urgent';
    if (this.isWarning(dueDate)) return 'warning';
    return 'normal';
  }

  getStatusText(dueDate: string): string {
    if (this.isOverdue(dueDate)) return 'Overdue';
    if (this.isUrgent(dueDate)) return 'Due Soon';
    if (this.isWarning(dueDate)) return 'Upcoming';
    return 'Future';
  }

  getStatusIcon(dueDate: string): string {
    if (this.isOverdue(dueDate)) return '⏰';
    if (this.isUrgent(dueDate)) return '🔥';
    if (this.isWarning(dueDate)) return '⚠️';
    return '📅';
  }

  getDaysRemaining(dueDate: string): string {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays <= 7) {
      return `${diffDays} days`;
    } else if (diffDays <= 30) {
      const weeks = Math.ceil(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''}`;
    } else {
      const months = Math.ceil(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    }
  }

  getOverdueCount(): number {
    return this.debts?.filter(debt => this.isOverdue(debt.dueDate)).length || 0;
  }

  getUrgentCount(): number {
    return this.debts?.filter(debt => this.isUrgent(debt.dueDate)).length || 0;
  }

  getUpcomingCount(): number {
    return this.debts?.filter(debt => this.isWarning(debt.dueDate)).length || 0;
  }

  trackByDebt(index: number, debt: Debt): string {
    return debt.creditorName;
  }

  hasDebtData(): boolean {
    return this.debts && this.debts.length > 0;
  }

  private setSEOMeta(): void {
    this.meta.addTags([
      { name: 'description', content: 'Track your debt due dates with visual indicators for overdue, urgent, and upcoming payments. Monitor payment deadlines effectively.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ]);
  }
}
