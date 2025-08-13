// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-debt-top5',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './debt-top5.component.html',
  styleUrls: ['./debt-top5.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DebtTop5Component implements OnInit {
  @Input() topDebts: { creditor: string; remainingAmount: number; dueDate: string }[] = [];

  constructor(
    private meta: Meta,
  ) {}

  ngOnInit(): void {
    this.setSEOMeta();
  }

  getTop5Debts(): { creditor: string; remainingAmount: number; dueDate: string }[] {
    if (!this.topDebts) return [];
    return this.topDebts
      .sort((a, b) => b.remainingAmount - a.remainingAmount)
      .slice(0, 5);
  }

  getDebtPercentage(amount: number): number {
    const total = this.getTotalTop5Debt();
    if (total === 0) return 0;
    return (amount / total) * 100;
  }

  getTopDebt(): { creditor: string; remainingAmount: number; dueDate: string } | null {
    const topDebts = this.getTop5Debts();
    return topDebts.length > 0 ? topDebts[0] : null;
  }

  getStatusClass(dueDate: string): string {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 7) return 'urgent';
    if (diffDays <= 30) return 'warning';
    return 'normal';
  }

  getStatusText(dueDate: string): string {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays <= 7) return 'Urgent';
    if (diffDays <= 30) return 'Due Soon';
    return 'On Track';
  }

  getTotalTop5Debt(): number {
    return this.topDebts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
  }

  hasDebtData(): boolean {
    return this.topDebts && this.topDebts.length > 0;
  }

  trackByDebt(index: number, debt: { creditor: string; remainingAmount: number; dueDate: string }): string {
    return debt.creditor;
  }

  private setSEOMeta(): void {
    this.meta.addTags([
      { name: 'description', content: 'Track your top 5 largest debts with priority rankings, due dates, and status indicators. Monitor your highest remaining balances effectively.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ]);
  }
}
