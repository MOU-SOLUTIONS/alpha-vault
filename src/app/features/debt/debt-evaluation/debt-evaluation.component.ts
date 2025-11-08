/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component DebtEvaluationComponent
  @description Main debt dashboard component for managing debt health score and recommendations
*/

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { META_FRAGMENT } from '../../../core/seo/page-meta.model';

import { Debt } from '../../../models/debt.model';

@Component({
  standalone: true,
  selector: 'app-debt-evaluation',
  templateUrl: './debt-evaluation.component.html',
  styleUrls: ['./debt-evaluation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  providers: [
    {
      provide: META_FRAGMENT,
      useValue: {
        description: 'Comprehensive debt evaluation and financial health assessment with actionable recommendations for debt management in Alpha Vault.'
      }
    }
  ],
})
export class DebtEvaluationComponent implements OnInit, OnChanges {

  @Input() totalDebt = 0;
  
  @Input() totalPaid = 0;
  
  @Input() overdueDebts: Debt[] = [];
 
  @Input() creditorSummary: Record<string, number> = {};
  
  @Input() top5LargestDebts: { creditor: string; remainingAmount: number; dueDate: string }[] = [];

  @Input() debts: Debt[] = [];

  private _debts: Debt[] = [];
  private _totalDebt = 0;
  private _totalPaid = 0;
  private _overdueDebts: Debt[] = [];
  private _creditorSummary: Record<string, number> = {};
  private _top5LargestDebts: { creditor: string; remainingAmount: number; dueDate: string }[] = [];

  remainingAmount = 0;
  healthScore = 0;
  healthStatus = '';

  private _cachedProgressPercentage?: number;
  private _cachedHighInterestCount?: number;
  private _cachedLowInterestCount?: number;
  private _cachedRiskLevel?: string;
  private _cachedRecommendations?: { text: string; priority: 'high' | 'medium' | 'low' }[];

  get paidAmount(): number {
    return this._totalPaid;
  }

  get displayTotalDebt(): number {
    return this.totalDebt > 0 ? this.totalDebt : this._totalDebt;
  }

  constructor(
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadDebtData();
    this.calculateHealthScore();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalDebt'] || changes['totalPaid'] || changes['debts'] || 
        changes['overdueDebts'] || changes['creditorSummary'] || changes['top5LargestDebts']) {
      this.invalidateCache();
      this.loadDebtData();
      this.calculateHealthScore();
      this.cdr.markForCheck();
    }
  }

  private invalidateCache(): void {
    this._cachedProgressPercentage = undefined;
    this._cachedHighInterestCount = undefined;
    this._cachedLowInterestCount = undefined;
    this._cachedRiskLevel = undefined;
    this._cachedRecommendations = undefined;
  }

  private loadDebtData(): void {
    this._debts = this.debts || [];
    this._overdueDebts = this.overdueDebts || [];
    this._creditorSummary = this.creditorSummary || {};
    this._top5LargestDebts = this.top5LargestDebts || [];

    const hasDebtsArray = this._debts && this._debts.length > 0;
    
    if (this.totalDebt > 0 || this.totalPaid > 0) {
      this._totalDebt = this.totalDebt;
      this._totalPaid = this.totalPaid;
      
      this.remainingAmount = this._totalDebt - this._totalPaid;
    } else if (hasDebtsArray) {
      this._totalDebt = this._debts.reduce((sum, debt) => sum + debt.principalAmount, 0);
      this._totalPaid = this._debts.reduce((sum, debt) => sum + (debt.principalAmount - debt.remainingAmount), 0);
      this.remainingAmount = this._debts.reduce((sum, debt) => sum + (debt.remainingAmount || 0), 0);
    } else {
      this._totalDebt = 0;
      this._totalPaid = 0;
      this.remainingAmount = 0;
    }
  }

  private calculateHealthScore(): void {
    if (!this._debts || this._debts.length === 0 || this._totalDebt === 0) {
      this.healthScore = 100;
      this.healthStatus = 'excellent';
      return;
    }

    const debtToIncomeRatio = this.remainingAmount / 50000;
    const paymentProgress = this._totalDebt > 0 ? (this._totalPaid / this._totalDebt) : 0;
    const highInterestDebt = this._debts.filter(debt => debt.interestRateApr > 15).length;

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

  get progressPercentage(): number {
    if (this._cachedProgressPercentage !== undefined) {
      return this._cachedProgressPercentage;
    }
    this._cachedProgressPercentage = this._totalDebt > 0 ? (this._totalPaid / this._totalDebt) * 100 : 0;
    return this._cachedProgressPercentage;
  }

  get highInterestDebtCount(): number {
    if (this._cachedHighInterestCount !== undefined) {
      return this._cachedHighInterestCount;
    }
    this._cachedHighInterestCount = this._debts.filter(debt => debt.interestRateApr > 15).length;
    return this._cachedHighInterestCount;
  }

  get lowInterestDebtCount(): number {
    if (this._cachedLowInterestCount !== undefined) {
      return this._cachedLowInterestCount;
    }
    this._cachedLowInterestCount = this._debts.filter(debt => debt.interestRateApr <= 5).length;
    return this._cachedLowInterestCount;
  }

  get riskLevel(): string {
    if (this._cachedRiskLevel !== undefined) {
      return this._cachedRiskLevel;
    }
    if (this.healthScore >= 70) {
      this._cachedRiskLevel = 'low-risk';
    } else if (this.healthScore >= 40) {
      this._cachedRiskLevel = 'medium-risk';
    } else {
      this._cachedRiskLevel = 'high-risk';
    }
    return this._cachedRiskLevel;
  }

  get recommendations(): { text: string; priority: 'high' | 'medium' | 'low' }[] {
    if (this._cachedRecommendations !== undefined) {
      return this._cachedRecommendations;
    }
    
    const recommendations: { text: string; priority: 'high' | 'medium' | 'low' }[] = [];

    if (!this._debts || this._debts.length === 0 || this._totalDebt === 0) {
      this._cachedRecommendations = recommendations;
      return recommendations;
    }

    if (this.highInterestDebtCount > 0) {
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

    if (this.lowInterestDebtCount > 0) {
      recommendations.push({
        text: 'Continue making minimum payments on low-interest debt while focusing on high-interest debt',
        priority: 'low'
      });
    }

    this._cachedRecommendations = recommendations;
    return recommendations;
  }

  trackByRecommendation(index: number, recommendation: { text: string; priority: 'high' | 'medium' | 'low' }): string {
    return recommendation.text;
  }
}
