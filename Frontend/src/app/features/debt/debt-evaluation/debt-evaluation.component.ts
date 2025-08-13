import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Debt } from '../../../models/debt.model';

@Component({
  selector: 'app-debt-evaluation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './debt-evaluation.component.html',
  styleUrls: ['./debt-evaluation.component.scss']
})
export class DebtEvaluationComponent {
  @Input() totalDebt: number = 0;
  @Input() totalPaid: number = 0;
  @Input() overdueDebts: Debt[] = [];
  @Input() creditorSummary: Record<string, number> = {};
  @Input() top5LargestDebts: { creditor: string; remainingAmount: number; dueDate: string }[] = [];
  @Input() debts: Debt[] = [];

  getRemainingAmount(): number {
    return Math.max(0, this.totalDebt - this.totalPaid);
  }

  getProgressPercentage(): number {
    if (this.totalDebt === 0) return 0;
    return Math.min(100, (this.totalPaid / this.totalDebt) * 100);
  }

  getHealthScore(): number {
    let score = 100;
    
    // Deduct points for overdue debts
    score -= this.overdueDebts.length * 15;
    
    // Deduct points for high interest rates
    const highInterestDebts = this.debts.filter(debt => debt.interestRate > 15);
    score -= highInterestDebts.length * 10;
    
    // Deduct points for low progress
    const progress = this.getProgressPercentage();
    if (progress < 25) score -= 20;
    else if (progress < 50) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }

  getHealthScoreClass(): string {
    const score = this.getHealthScore();
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  getHealthScoreLabel(): string {
    const score = this.getHealthScore();
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  }

  getHighInterestCount(): number {
    return this.debts.filter(debt => debt.interestRate > 15).length;
  }

  getDueSoonCount(): number {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    return this.debts.filter(debt => {
      const dueDate = new Date(debt.dueDate);
      return dueDate <= thirtyDaysFromNow && dueDate >= today;
    }).length;
  }

  getRiskLevel(): string {
    const overdueCount = this.overdueDebts.length;
    const highInterestCount = this.getHighInterestCount();
    const dueSoonCount = this.getDueSoonCount();
    
    if (overdueCount > 0 || highInterestCount > 2) return 'High';
    if (dueSoonCount > 1 || highInterestCount > 1) return 'Medium';
    return 'Low';
  }

  getRiskLevelClass(): string {
    const riskLevel = this.getRiskLevel();
    switch (riskLevel) {
      case 'High': return 'high-risk';
      case 'Medium': return 'medium-risk';
      default: return 'low-risk';
    }
  }

  getLargestDebt(): number {
    if (this.top5LargestDebts.length === 0) return 0;
    return this.top5LargestDebts[0].remainingAmount;
  }

  getAverageInterestRate(): number {
    if (this.debts.length === 0) return 0;
    const totalInterest = this.debts.reduce((sum, debt) => sum + debt.interestRate, 0);
    return totalInterest / this.debts.length;
  }

  getTotalMinPayments(): number {
    return this.debts.reduce((sum, debt) => sum + debt.minPayment, 0);
  }

  getCreditorCount(): number {
    return this.creditorSummary ? Object.keys(this.creditorSummary).length : 0;
  }

  getRecommendations(): Array<{text: string, priority: string}> {
    const recommendations: Array<{text: string, priority: string}> = [];
    
    if (this.overdueDebts.length > 0) {
      recommendations.push({
        text: 'Pay overdue debts immediately to avoid penalties',
        priority: 'high'
      });
    }
    
    if (this.getHighInterestCount() > 0) {
      recommendations.push({
        text: 'Consider consolidating high-interest debts',
        priority: 'high'
      });
    }
    
    if (this.getDueSoonCount() > 0) {
      recommendations.push({
        text: 'Prepare payments for debts due soon',
        priority: 'medium'
      });
    }
    
    if (this.getProgressPercentage() < 25) {
      recommendations.push({
        text: 'Focus on paying down principal amounts',
        priority: 'medium'
      });
    }
    
    if (recommendations.length === 0) {
      recommendations.push({
        text: 'Great job! Keep up with your debt repayment plan',
        priority: 'low'
      });
    }
    
    return recommendations;
  }
}
