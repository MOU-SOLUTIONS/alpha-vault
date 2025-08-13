// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';

import { Expense } from '../../../models/expense.model';
import { ExpenseService } from '../../../core/services/expense.service';

interface EvolutionMetrics {
  totalExpense: number;
  growthRate: number;
  achievementRate: number;
  trend: number;
  monthlyGrowth: number;
  weeklyGrowth: number;
  yearlyGrowth: number;
  consistencyScore: number;
  diversificationScore: number;
  todayExpense: number;
  weekExpense: number;
  monthExpense: number;
  yearExpense: number;
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
  selector: 'app-expense-evaluation',
  templateUrl: './expense-evaluation.component.html',
  styleUrls: ['./expense-evaluation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CurrencyPipe, DecimalPipe],
})
export class ExpenseEvaluationComponent implements OnInit, OnDestroy, OnChanges {
  @Input() weekEvolution = 0;
  @Input() monthEvolution = 0;
  @Input() yearEvolution = 0;
  @Input() dayExpense = 0;
  @Input() weekExpense = 0;
  @Input() monthExpense = 0;
  @Input() yearExpense = 0;
  @Input() expenses: Expense[] = [];
  @Input() expenseCategoryData: Record<string, number> = {};
  @Input() paymentMethodData: Record<string, number> = {};
  @Input() weeklyExpenseData: number[] = [];
  @Input() monthlyExpenseData: number[] = [];
  @Input() topExpenses: Array<{ category: string; amount: number }> = [];

  loading = true;
  hasData = false;
  currentPeriod = 'month';
  evolutionMetrics: EvolutionMetrics = {
    totalExpense: 0,
    growthRate: 0,
    achievementRate: 0,
    trend: 0,
    monthlyGrowth: 0,
    weeklyGrowth: 0,
    yearlyGrowth: 0,
    consistencyScore: 0,
    diversificationScore: 0,
    todayExpense: 0,
    weekExpense: 0,
    monthExpense: 0,
    yearExpense: 0,
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
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly cdr: ChangeDetectorRef,
    private readonly expenseService?: ExpenseService,
  ) {
    this.title.setTitle('Expense Evaluation | Alpha Vault');
    this.meta.addTags([
      { name: 'description', content: 'Comprehensive expense evaluation dashboard with trends, distribution analysis, and performance metrics for Alpha Vault financial management.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ]);
  }

  ngOnInit(): void {
    // Add a small delay to ensure all inputs are properly bound
    setTimeout(() => {
      this.processData();
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['expenses'] || changes['monthExpense'] || changes['monthEvolution'] || 
        changes['expenseCategoryData'] || changes['dayExpense'] || changes['weekExpense'] || 
        changes['yearExpense'] || changes['weekEvolution'] || changes['yearEvolution']) {
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
    const calculatedTotalExpense = this.expenses?.length > 0 
      ? this.expenses.reduce((sum, expense) => sum + expense.amount, 0)
      : this.monthExpense || 0;

    const realGrowthRate = this.calculateRealGrowthRate();

    return {
      totalExpense: calculatedTotalExpense,
      growthRate: realGrowthRate,
      achievementRate: this.calculateAchievementRate(),
      trend: realGrowthRate,
      monthlyGrowth: this.monthEvolution || 0,
      weeklyGrowth: this.weekEvolution || 0,
      yearlyGrowth: this.yearEvolution || 0,
      consistencyScore: this.calculateConsistencyScore(),
      diversificationScore: this.calculateDiversificationScore(),
      todayExpense: this.dayExpense || 0,
      weekExpense: this.weekExpense || 0,
      monthExpense: this.monthExpense || 0,
      yearExpense: this.yearExpense || 0,
    };
  }

  private calculateRealGrowthRate(): number {
    if (!this.expenses?.length) {
      return this.monthEvolution || 0;
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthExpenses = this.expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    const previousMonthExpenses = this.expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === previousMonth && expenseDate.getFullYear() === previousYear;
    });

    const currentTotal = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const previousTotal = previousMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    if (previousTotal === 0) {
      return currentTotal > 0 ? 100 : 0;
    }

    return ((currentTotal - previousTotal) / previousTotal) * 100;
  }

  private calculatePerformanceMetrics(): PerformanceMetrics {
    const efficiency = this.calculateEfficiencyScore();
    const growthPotential = Math.max(0, 100 - this.evolutionMetrics.growthRate);
    const goalAlignment = this.calculateAchievementRate();
    const stabilityIndex = this.calculateStabilityIndex();

    return {
      efficiency,
      growthPotential,
      goalAlignment,
      stabilityIndex,
    };
  }

  private loadDistributionData(): void {
    if (!this.expenses?.length) {
      // If no expenses array, use the provided category data
      this.distributionData = this.expenseCategoryData || {};
      return;
    }

    const currentDate = new Date();
    let filteredExpenses: Expense[] = [];

    switch (this.currentPeriod) {
      case 'week':
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        filteredExpenses = this.expenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= weekStart && expenseDate <= weekEnd;
        });
        break;

      case 'month':
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        
        filteredExpenses = this.expenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= monthStart && expenseDate <= monthEnd;
        });
        break;

      case 'year':
        const yearStart = new Date(currentDate.getFullYear(), 0, 1);
        const yearEnd = new Date(currentDate.getFullYear(), 11, 31);
        yearEnd.setHours(23, 59, 59, 999);
        
        filteredExpenses = this.expenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= yearStart && expenseDate <= yearEnd;
        });
        break;

      default:
        filteredExpenses = this.expenses;
    }

    // Group by category
    this.distributionData = filteredExpenses.reduce((acc, expense) => {
      const category = expense.category || 'Other';
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
  }

  private calculateConsistencyScore(): number {
    if (!this.expenses?.length) return 0;

    const monthlyData = this.groupExpensesByMonth();
    const months = Object.keys(monthlyData);
    if (months.length < 2) return 100;

    const amounts = Object.values(monthlyData);
    const mean = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / amounts.length;
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = standardDeviation / mean;

    return Math.max(0, 100 - (coefficientOfVariation * 100));
  }

  private calculateDiversificationScore(): number {
    if (!this.expenses?.length) return 0;

    const categoryTotals = this.expenses.reduce((acc, expense) => {
      const category = expense.category || 'Other';
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const totalAmount = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    if (totalAmount === 0) return 0;

    const categoryCount = Object.keys(categoryTotals).length;
    const evenness = this.calculateDistributionEvenness(categoryTotals, totalAmount);

    return Math.min(100, (categoryCount * 10) + (evenness * 50));
  }

  private calculateDistributionEvenness(categoryTotals: Record<string, number>, totalAmount: number): number {
    const proportions = Object.values(categoryTotals).map(amount => amount / totalAmount);
    const idealProportion = 1 / proportions.length;
    
    const sumSquaredDifferences = proportions.reduce((sum, proportion) => {
      return sum + Math.pow(proportion - idealProportion, 2);
    }, 0);

    return Math.max(0, 1 - (sumSquaredDifferences / proportions.length));
  }

  private calculateEfficiencyScore(): number {
    if (!this.expenses?.length) return 0;
    
    const totalExpense = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const averageExpense = totalExpense / this.expenses.length;
    const variance = this.expenses.reduce((sum, expense) => sum + Math.pow(expense.amount - averageExpense, 2), 0) / this.expenses.length;
    
    return Math.max(0, 100 - (Math.sqrt(variance) / averageExpense) * 100);
  }

  private calculatePerformanceScore(): number {
    const efficiency = this.calculateEfficiencyScore();
    const consistency = this.calculateConsistencyScore();
    const diversification = this.calculateDiversificationScore();
    
    return (efficiency + consistency + diversification) / 3;
  }

  private calculateAchievementRate(): number {
    if (!this.expenses?.length) return 0;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthExpenses = this.expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });
    
    const totalCurrentMonth = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const averageMonthlyExpense = this.expenses.reduce((sum, expense) => sum + expense.amount, 0) / Math.max(1, this.expenses.length);
    
    return Math.max(0, 100 - (totalCurrentMonth / averageMonthlyExpense) * 100);
  }

  private calculateStabilityIndex(): number {
    if (!this.expenses?.length) return 0;

    const monthlyData = this.groupExpensesByMonth();
    const months = Object.keys(monthlyData);
    if (months.length < 2) return 100;

    const amounts = Object.values(monthlyData);
    const sortedAmounts = amounts.sort((a, b) => a - b);
    const median = sortedAmounts[Math.floor(sortedAmounts.length / 2)];
    const mean = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    
    const medianDeviation = amounts.reduce((sum, amount) => sum + Math.abs(amount - median), 0) / amounts.length;
    const meanDeviation = amounts.reduce((sum, amount) => sum + Math.abs(amount - mean), 0) / amounts.length;
    
    const stabilityScore = Math.max(0, 100 - (medianDeviation / mean) * 100);
    return Math.min(100, stabilityScore);
  }

  private groupExpensesByMonth(): Record<string, number> {
    return this.expenses.reduce((acc, expense) => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[monthKey] = (acc[monthKey] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
  }

  private generateInsights(): Insight[] {
    const insights: Insight[] = [];

    // Expense Growth Insight
    if (this.evolutionMetrics.growthRate > 10) {
      insights.push({
        id: 1,
        icon: '📈',
        title: 'Expense Growth Detected',
        description: `Your expenses have increased by ${this.evolutionMetrics.growthRate.toFixed(1)}% this month. Consider reviewing your spending patterns.`
      });
    } else if (this.evolutionMetrics.growthRate < -5) {
      insights.push({
        id: 2,
        icon: '📉',
        title: 'Expense Reduction',
        description: `Great job! Your expenses have decreased by ${Math.abs(this.evolutionMetrics.growthRate).toFixed(1)}% this month.`
      });
    }

    // Consistency Insight
    if (this.evolutionMetrics.consistencyScore > 80) {
      insights.push({
        id: 3,
        icon: '🎯',
        title: 'Consistent Spending',
        description: 'Your spending patterns are very consistent. This helps with budget planning and financial stability.'
      });
    } else if (this.evolutionMetrics.consistencyScore < 50) {
      insights.push({
        id: 4,
        icon: '⚠️',
        title: 'Inconsistent Spending',
        description: 'Your spending patterns are irregular. Consider creating a budget to improve consistency.'
      });
    }

    // Diversification Insight
    if (this.evolutionMetrics.diversificationScore > 70) {
      insights.push({
        id: 5,
        icon: '🌐',
        title: 'Well-Diversified Expenses',
        description: 'Your expenses are well distributed across different categories. This indicates balanced spending.'
      });
    } else {
      insights.push({
        id: 6,
        icon: '📊',
        title: 'Concentrated Spending',
        description: 'Your expenses are concentrated in few categories. Consider diversifying your spending for better financial health.'
      });
    }

    // Performance Insight
    if (this.performanceMetrics.efficiency > 80) {
      insights.push({
        id: 7,
        icon: '💰',
        title: 'Efficient Spending',
        description: 'Your spending is very efficient with minimal variance. You have good control over your expenses.'
      });
    }

    return insights.slice(0, 4); // Limit to 4 insights
  }

  private checkHasData(): boolean {
    // Check multiple data sources
    const hasExpensesArray = this.expenses?.length > 0;
    const hasExpenseTotals = this.monthExpense > 0 || this.weekExpense > 0 || this.yearExpense > 0;
    const hasCategoryData = Object.keys(this.expenseCategoryData || {}).length > 0;
    const hasTopExpenses = this.topExpenses?.length > 0;
    const hasWeeklyData = this.weeklyExpenseData?.length > 0;
    const hasMonthlyData = this.monthlyExpenseData?.length > 0;

    const hasData = hasExpensesArray || hasExpenseTotals || hasCategoryData || hasTopExpenses || hasWeeklyData || hasMonthlyData;

    return hasData;
  }

  getDistributionKeys(): string[] {
    return Object.keys(this.distributionData);
  }

  hasDistributionData(): boolean {
    return Object.keys(this.distributionData).length > 0;
  }

  getTotalDistribution(): number {
    return Object.values(this.distributionData).reduce((sum, value) => sum + value, 0);
  }

  getDistributionValue(key: string): number {
    return this.distributionData[key] || 0;
  }

  calculateMetricScore(metric: number, maxValue: number): number {
    return Math.min(100, Math.max(0, (metric / maxValue) * 100));
  }

  calculateDistributionPercentage(value: number, total: number): number {
    return total > 0 ? (value / total) * 100 : 0;
  }

  getTrendIcon(trend: number): string {
    return trend > 0 ? '↗️' : trend < 0 ? '↘️' : '→';
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
