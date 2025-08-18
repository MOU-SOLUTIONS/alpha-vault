// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta } from '@angular/platform-browser';

import { Debt } from '../../../models/debt.model';

@Component({
  standalone: true,
  selector: 'app-debt-evaluation',
  templateUrl: './debt-evaluation.component.html',
  styleUrls: ['./debt-evaluation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class DebtEvaluationComponent implements OnInit {
  @Input() totalDebt: number = 0;
  @Input() totalPaid: number = 0;
  @Input() overdueDebts: Debt[] = [];
  @Input() creditorSummary: Record<string, number> = {};
  @Input() top5LargestDebts: Array<{ creditor: string; remainingAmount: number; dueDate: string }> = [];
  @Input() debts: Debt[] = [];

  // Internal properties (used when no inputs provided)
  private _debts: Debt[] = [];
  private _totalDebt: number = 0;
  private _totalPaid: number = 0;
  private _overdueDebts: Debt[] = [];
  private _creditorSummary: Record<string, number> = {};
  private _top5LargestDebts: Array<{ creditor: string; remainingAmount: number; dueDate: string }> = [];

  paidAmount = 0;
  remainingAmount = 0;
  healthScore = 0;
  healthStatus = '';

  constructor(
    private meta: Meta,
  ) {
    this.meta.addTags([
      { name: 'description', content: 'Comprehensive debt evaluation and financial health assessment with actionable recommendations for debt management.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ]);
  }

  ngOnInit(): void {
    this.loadDebtData();
    this.calculateHealthScore();
  }

  private loadDebtData(): void {
    // Use input data if provided, otherwise use mock data
    if (this.debts && this.debts.length > 0) {
      this._debts = this.debts;
      this._totalDebt = this.totalDebt || 0;
      this._totalPaid = this.totalPaid || 0;
      this._overdueDebts = this.overdueDebts || [];
      this._creditorSummary = this.creditorSummary || {};
      this._top5LargestDebts = this.top5LargestDebts || [];
    } else {
      // Mock data for development
      this._debts = [
        { id: 1, userId: 1, creditorName: 'Credit Card', totalAmount: 5000, remainingAmount: 3000, dueDate: '2024-06-15', interestRate: 18.99, minPayment: 150 },
        { id: 2, userId: 1, creditorName: 'Student Loan', totalAmount: 25000, remainingAmount: 20000, dueDate: '2024-08-20', interestRate: 5.5, minPayment: 200 },
        { id: 3, userId: 1, creditorName: 'Car Loan', totalAmount: 15000, remainingAmount: 8000, dueDate: '2024-07-10', interestRate: 4.25, minPayment: 300 },
      ];
      this._totalDebt = 45000;
      this._totalPaid = 12000;
      this._overdueDebts = [
        { id: 4, userId: 1, creditorName: 'Overdue Credit Card', totalAmount: 2000, remainingAmount: 2000, dueDate: '2024-01-15', interestRate: 22.99, minPayment: 50 }
      ];
      this._creditorSummary = {
        'Credit Card': 3000,
        'Student Loan': 20000,
        'Car Loan': 8000,
        'Overdue Credit Card': 2000
      };
      this._top5LargestDebts = [
        { creditor: 'Student Loan', remainingAmount: 20000, dueDate: '2024-08-20' },
        { creditor: 'Car Loan', remainingAmount: 8000, dueDate: '2024-07-10' },
        { creditor: 'Credit Card', remainingAmount: 3000, dueDate: '2024-06-15' },
        { creditor: 'Overdue Credit Card', remainingAmount: 2000, dueDate: '2024-01-15' }
      ];
    }

    this.calculateTotals();
  }

  private calculateTotals(): void {
    this._totalDebt = this._debts.reduce((sum, debt) => sum + debt.totalAmount, 0);
    this._totalPaid = this._debts.reduce((sum, debt) => sum + (debt.totalAmount - debt.remainingAmount), 0);
    this.remainingAmount = this._debts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
    
    // Update the public properties
    this.totalDebt = this._totalDebt;
    this.totalPaid = this._totalPaid;
  }

  private calculateHealthScore(): void {
    const debtToIncomeRatio = this.remainingAmount / 50000;
    const paymentProgress = this._totalPaid / this._totalDebt;
    const highInterestDebt = this._debts.filter(debt => debt.interestRate > 15).length;

    let score = 100;
    score -= debtToIncomeRatio * 30;
    score += paymentProgress * 20;
    score -= highInterestDebt * 10;

    this.healthScore = Math.max(0, Math.min(100, Math.round(score)));
    this.healthStatus = this.getHealthStatus(this.healthScore);
  }

  private getHealthStatus(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  getProgressPercentage(): number {
    return this._totalDebt > 0 ? (this._totalPaid / this._totalDebt) * 100 : 0;
  }

  getHighInterestDebtCount(): number {
    return this._debts.filter(debt => debt.interestRate > 15).length;
  }

  getLowInterestDebtCount(): number {
    return this._debts.filter(debt => debt.interestRate <= 5).length;
  }

  getRiskLevel(): string {
    if (this.healthScore >= 70) return 'low-risk';
    if (this.healthScore >= 40) return 'medium-risk';
    return 'high-risk';
  }

  getRecommendations(): Array<{ text: string; priority: 'high' | 'medium' | 'low' }> {
    const recommendations: Array<{ text: string; priority: 'high' | 'medium' | 'low' }> = [];

    if (this.getHighInterestDebtCount() > 0) {
      recommendations.push({
        text: 'Prioritize paying off high-interest debt first to reduce overall interest costs',
        priority: 'high'
      });
    }

    if (this.healthScore < 60) {
      recommendations.push({
        text: 'Consider debt consolidation to lower interest rates and simplify payments',
        priority: 'high'
      });
    }

    if (this.remainingAmount > 30000) {
      recommendations.push({
        text: 'Create a strict budget to allocate more funds toward debt repayment',
        priority: 'medium'
      });
    }

    if (this.getLowInterestDebtCount() > 0) {
      recommendations.push({
        text: 'Continue making minimum payments on low-interest debt while focusing on high-interest debt',
        priority: 'low'
      });
    }

    return recommendations;
  }

  trackByRecommendation(index: number, recommendation: { text: string; priority: 'high' | 'medium' | 'low' }): string {
    return recommendation.text;
  }
}
