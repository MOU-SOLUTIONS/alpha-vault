// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { Meta } from '@angular/platform-browser';
import { Subject } from 'rxjs';

import { Income } from '../../../models/income.model';
import { IncomeService } from '../../../core/services/income.service';

interface EvolutionMetrics {
  totalIncome: number;
  growthRate: number;
  achievementRate: number;
  trend: number;
  monthlyGrowth: number;
  weeklyGrowth: number;
  yearlyGrowth: number;
  consistencyScore: number;
  diversificationScore: number;
  todayIncome: number;
  weekIncome: number;
  monthIncome: number;
  yearIncome: number;
}

interface PerformanceMetrics {
  efficiency: number;
  growthPotential: number;
  goalAlignment: number;
  stabilityIndex: number;
}

interface Insight {
  id: number;
  icon: string;
  title: string;
  description: string;
}

@Component({
  standalone: true,
  selector: 'app-income-evaluation',
  templateUrl: './income-evaluation.component.html',
  styleUrls: ['./income-evaluation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CurrencyPipe, DecimalPipe],
})
export class IncomeEvaluationComponent implements OnInit, OnDestroy, OnChanges {
  @Input() weekEvolution = 0;
  @Input() monthEvolution = 0;
  @Input() yearEvolution = 0;
  @Input() dayIncome = 0;
  @Input() weekIncome = 0;
  @Input() monthIncome = 0;
  @Input() yearIncome = 0;
  @Input() incomes: Income[] = [];
  @Input() incomeSourceData: Record<string, number> = {};
  @Input() paymentMethodData: Record<string, number> = {};
  @Input() weeklyIncomeData: number[] = [];
  @Input() monthlyIncomeData: number[] = [];
  @Input() topIncomes: Array<{ category: string; amount: number }> = [];

  loading = true;
  hasData = false;
  currentPeriod = 'month';
  evolutionMetrics: EvolutionMetrics = {
    totalIncome: 0,
    growthRate: 0,
    achievementRate: 0,
    trend: 0,
    monthlyGrowth: 0,
    weeklyGrowth: 0,
    yearlyGrowth: 0,
    consistencyScore: 0,
    diversificationScore: 0,
    todayIncome: 0,
    weekIncome: 0,
    monthIncome: 0,
    yearIncome: 0,
  };
  distributionData: Record<string, number> = {};
  performanceMetrics: PerformanceMetrics = {
    efficiency: 0,
    growthPotential: 0,
    goalAlignment: 0,
    stabilityIndex: 0,
  };
  insights: Insight[] = [];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly incomeService: IncomeService,
    private readonly meta: Meta,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.meta.addTags([
      { name: 'description', content: 'Comprehensive income evaluation dashboard with trends, distribution analysis, and performance metrics for Alpha Vault financial management.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ]);
  }

  ngOnInit(): void {
    this.processData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['incomes'] || changes['monthIncome'] || changes['monthEvolution'] || 
        changes['incomeSourceData'] || changes['dayIncome'] || changes['weekIncome'] || 
        changes['yearIncome'] || changes['weekEvolution'] || changes['yearEvolution']) {
      this.processData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPeriodChange(period: string): void {
    this.currentPeriod = period;
    this.loadDistributionData();
  }

  processData(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.evolutionMetrics = this.calculateEvolutionMetrics();
    this.loadDistributionData();
    this.performanceMetrics = this.calculatePerformanceMetrics();
    this.insights = this.generateInsights();

    this.hasData = this.checkHasData();
    this.loading = false;
    this.cdr.markForCheck();
  }

  private calculateEvolutionMetrics(): EvolutionMetrics {
    const calculatedTotalIncome = this.incomes?.length > 0 
      ? this.incomes.reduce((sum, income) => sum + income.amount, 0)
      : this.monthIncome || 0;

    const realGrowthRate = this.calculateRealGrowthRate();

    return {
      totalIncome: calculatedTotalIncome,
      growthRate: realGrowthRate,
      achievementRate: this.calculateAchievementRate(),
      trend: realGrowthRate,
      monthlyGrowth: this.monthEvolution || 0,
      weeklyGrowth: this.weekEvolution || 0,
      yearlyGrowth: this.yearEvolution || 0,
      consistencyScore: this.calculateConsistencyScore(),
      diversificationScore: this.calculateDiversificationScore(),
      todayIncome: this.dayIncome || 0,
      weekIncome: this.weekIncome || 0,
      monthIncome: this.monthIncome || 0,
      yearIncome: this.yearIncome || 0,
    };
  }

  private calculateRealGrowthRate(): number {
    if (!this.incomes?.length) {
      return this.monthEvolution || 0;
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthIncomes = this.incomes.filter(income => {
      const incomeDate = new Date(income.date);
      return incomeDate.getMonth() === currentMonth && incomeDate.getFullYear() === currentYear;
    });

    const previousMonthIncomes = this.incomes.filter(income => {
      const incomeDate = new Date(income.date);
      return incomeDate.getMonth() === previousMonth && incomeDate.getFullYear() === previousYear;
    });

    const currentTotal = currentMonthIncomes.reduce((sum, income) => sum + income.amount, 0);
    const previousTotal = previousMonthIncomes.reduce((sum, income) => sum + income.amount, 0);

    if (previousTotal === 0) {
      return currentTotal > 0 ? 100 : 0;
    }

    return ((currentTotal - previousTotal) / previousTotal) * 100;
  }

  private calculatePerformanceMetrics(): PerformanceMetrics {
    const efficiency = this.calculateEfficiencyScore();
    const growthPotential = this.calculateRealGrowthRate();
    const performanceScore = this.calculatePerformanceScore();
    const stabilityIndex = this.calculateStabilityIndex();

    return {
      efficiency,
      growthPotential,
      goalAlignment: performanceScore,
      stabilityIndex,
    };
  }

  private loadDistributionData(): void {
    if (!this.incomes?.length) {
      this.distributionData = {};
      this.cdr.markForCheck();
      return;
    }

    const now = new Date();
    let filteredIncomes: Income[] = [];

    switch (this.currentPeriod) {
      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        filteredIncomes = this.incomes.filter(income => {
          const incomeDate = new Date(income.date);
          return incomeDate >= startOfWeek && incomeDate <= endOfWeek;
        });
        break;

      case 'month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        
        filteredIncomes = this.incomes.filter(income => {
          const incomeDate = new Date(income.date);
          return incomeDate >= startOfMonth && incomeDate <= endOfMonth;
        });
        break;

      case 'year':
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31);
        endOfYear.setHours(23, 59, 59, 999);
        
        filteredIncomes = this.incomes.filter(income => {
          const incomeDate = new Date(income.date);
          return incomeDate >= startOfYear && incomeDate <= endOfYear;
        });
        break;

      default:
        filteredIncomes = this.incomes;
    }

    // Group filtered incomes by source
    this.distributionData = filteredIncomes.reduce((acc, income) => {
      acc[income.source] = (acc[income.source] || 0) + income.amount;
      return acc;
    }, {} as Record<string, number>);

    this.cdr.markForCheck();
  }

  private calculateConsistencyScore(): number {
    if (!this.incomes?.length) return 0;
    
    const monthlyIncomes = this.groupIncomesByMonth();
    const months = Object.keys(monthlyIncomes);
    if (months.length < 2) return 100;

    const amounts = months.map(month => monthlyIncomes[month]);
    const avg = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    
    if (avg === 0) return 100;
    
    const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - avg, 2), 0) / amounts.length;
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = standardDeviation / avg;
    
    return Math.max(0, Math.min(100, 100 - (coefficientOfVariation * 100)));
  }

  private calculateDiversificationScore(): number {
    if (!this.incomes?.length) return 0;
    
    const sourceCount = new Set(this.incomes.map(income => income.source)).size;
    const totalAmount = this.incomes.reduce((sum, income) => sum + income.amount, 0);
    
    if (totalAmount === 0) return 0;
    
    const sourceScore = Math.min(100, sourceCount * 25);
    const distributionScore = this.calculateDistributionEvenness();
    
    return Math.round((sourceScore + distributionScore) / 2);
  }

  private calculateDistributionEvenness(): number {
    if (!this.incomeSourceData || !Object.keys(this.incomeSourceData).length) return 0;
    
    const total = Object.values(this.incomeSourceData).reduce((sum, amount) => sum + amount, 0);
    if (total === 0) return 0;

    const proportions = Object.values(this.incomeSourceData).map(amount => amount / total);
    const entropy = -proportions.reduce((sum, p) => sum + (p * Math.log(p)), 0);
    const maxEntropy = Math.log(Object.keys(this.incomeSourceData).length);
    
    return maxEntropy > 0 ? (entropy / maxEntropy) * 100 : 0;
  }

  private calculateEfficiencyScore(): number {
    if (!this.incomes?.length) return 0;
    
    const receivedIncomes = this.incomes.filter(income => income.isReceived);
    const totalIncomes = this.incomes.length;
    
    return Math.round((receivedIncomes.length / totalIncomes) * 100);
  }

  private calculatePerformanceScore(): number {
    const consistencyScore = this.calculateConsistencyScore();
    const growthRate = this.calculateRealGrowthRate();
    const diversificationScore = this.calculateDiversificationScore();
    
    const performanceScore = (consistencyScore * 0.4) + (Math.max(0, growthRate) * 0.3) + (diversificationScore * 0.3);
    
    return Math.min(100, Math.max(0, performanceScore));
  }

  private calculateAchievementRate(): number {
    const consistencyScore = this.calculateConsistencyScore();
    const growthRate = this.calculateRealGrowthRate();
    const diversificationScore = this.calculateDiversificationScore();
    
    const achievementRate = (consistencyScore * 0.4) + (Math.max(0, growthRate) * 0.3) + (diversificationScore * 0.3);
    
    return Math.min(100, Math.max(0, achievementRate));
  }

  private calculateStabilityIndex(): number {
    if (!this.incomes?.length) return 0;
    
    const monthlyIncomes = this.groupIncomesByMonth();
    const months = Object.keys(monthlyIncomes);
    if (months.length < 2) return 100;

    const amounts = months.map(month => monthlyIncomes[month]);
    const avg = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    
    if (avg === 0) return 100;
    
    const maxDeviation = Math.max(...amounts.map(amount => Math.abs(amount - avg)));
    const stabilityScore = Math.max(0, 100 - (maxDeviation / avg * 50));
    
    return Math.round(stabilityScore);
  }

  private groupIncomesByMonth(): Record<string, number> {
    if (!this.incomes) return {};
    
    return this.incomes.reduce((acc, income) => {
      const date = new Date(income.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[monthKey] = (acc[monthKey] || 0) + income.amount;
      return acc;
    }, {} as Record<string, number>);
  }

  private generateInsights(): Insight[] {
    const insights: Insight[] = [];
    
    const monthlyGrowth = this.monthEvolution || 0;
    if (monthlyGrowth > 0) {
      insights.push({
        id: 1,
        icon: '🚀',
        title: 'Positive Growth Trend',
        description: `Your income has grown ${monthlyGrowth.toFixed(1)}% this month. Keep up the excellent work!`,
      });
    } else if (monthlyGrowth < 0) {
      insights.push({
        id: 1,
        icon: '📉',
        title: 'Income Decline Detected',
        description: `Your income decreased by ${Math.abs(monthlyGrowth).toFixed(1)}% this month. Consider reviewing your income sources.`,
      });
    }

    const diversificationScore = this.calculateDiversificationScore();
    if (diversificationScore < 50) {
      insights.push({
        id: 2,
        icon: '🌐',
        title: 'Diversification Opportunity',
        description: 'Consider diversifying your income sources to reduce risk and increase stability.',
      });
    } else if (diversificationScore > 80) {
      insights.push({
        id: 2,
        icon: '🎯',
        title: 'Excellent Diversification',
        description: 'Your income is well diversified across multiple sources. This provides great financial stability.',
      });
    }

    const consistencyScore = this.calculateConsistencyScore();
    if (consistencyScore < 70) {
      insights.push({
        id: 3,
        icon: '📅',
        title: 'Income Consistency',
        description: 'Your income shows some variability. Consider setting up recurring income sources for better stability.',
      });
    } else {
      insights.push({
        id: 3,
        icon: '✅',
        title: 'Stable Income Pattern',
        description: 'Your income shows excellent consistency. This predictable pattern helps with financial planning.',
      });
    }

    return insights;
  }

  private checkHasData(): boolean {
    return (this.incomes && this.incomes.length > 0) ||
           !!(this.evolutionMetrics && Object.keys(this.evolutionMetrics).length > 0) ||
           !!(this.distributionData && Object.keys(this.distributionData).length > 0) ||
           !!(this.performanceMetrics && Object.keys(this.performanceMetrics).length > 0) ||
           !!(this.insights && this.insights.length > 0);
  }

  getDistributionKeys(): string[] {
    return this.distributionData ? Object.keys(this.distributionData) : [];
  }

  hasDistributionData(): boolean {
    return this.distributionData && Object.keys(this.distributionData).length > 0;
  }

  getTotalDistribution(): number {
    if (!this.distributionData) return 0;
    return Object.values(this.distributionData).reduce((sum: number, value: number) => sum + (Number(value) || 0), 0);
  }

  getDistributionValue(key: string): number {
    return Number(this.distributionData?.[key] || 0);
  }

  calculateMetricScore(metric: number, maxValue: number): number {
    return Math.min((metric / maxValue) * 100, 100);
  }

  calculateDistributionPercentage(value: number, total: number): number {
    return total > 0 ? (value / total) * 100 : 0;
  }

  getTrendIcon(trend: number): string {
    return trend > 0 ? 'trending_up' : trend < 0 ? 'trending_down' : 'trending_flat';
  }

  getTrendClass(trend: number): string {
    return trend > 0 ? 'positive' : trend < 0 ? 'negative' : 'neutral';
  }

  trackByInsight(index: number, insight: Insight): string {
    return insight.id.toString();
  }

  trackByDistribution(index: number, item: string): string {
    return item;
  }
}
