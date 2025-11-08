/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseEvaluationComponent
  @description Expense evaluation component for displaying expense data
*/  

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, DestroyRef, EventEmitter, inject, Input, OnChanges, OnInit, Output, signal, SimpleChanges } from '@angular/core';
import { Meta } from '@angular/platform-browser';

import { ExpenseService } from '../../../core/services/expense.service';
import { Expense } from '../../../models/expense.model';
import { ExpenseEvaluationHeaderComponent } from './components/expense-evaluation-header/expense-evaluation-header.component';
import { ExpenseEvaluationInsightsComponent, Insight } from './components/expense-evaluation-insights/expense-evaluation-insights.component';
import { ExpenseEvaluationMetricsComponent } from './components/expense-evaluation-metrics/expense-evaluation-metrics.component';
import { ExpenseEvaluationTrendsComponent } from './components/expense-evaluation-trends/expense-evaluation-trends.component';

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

@Component({
  standalone: true,
  selector: 'app-expense-evaluation',
  templateUrl: './expense-evaluation.component.html',
  styleUrls: ['./expense-evaluation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [
        CommonModule,
        ExpenseEvaluationHeaderComponent,
        ExpenseEvaluationTrendsComponent,
        ExpenseEvaluationMetricsComponent,
        ExpenseEvaluationInsightsComponent
      ],
})
export class ExpenseEvaluationComponent implements OnInit, OnChanges {
  /* ===== INPUTS ===== */
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
  @Input() topExpenses: { category: string; amount: number }[] = [];

  /* ===== OUTPUTS ===== */
  @Output() addExpense = new EventEmitter<void>();

  /* ===== SIGNALS ===== */
  private readonly expensesSignal = signal<Expense[]>([]);
  private readonly weekEvolutionSignal = signal<number>(0);
  private readonly monthEvolutionSignal = signal<number>(0);
  private readonly yearEvolutionSignal = signal<number>(0);
  private readonly dayExpenseSignal = signal<number>(0);
  private readonly weekExpenseSignal = signal<number>(0);
  private readonly monthExpenseSignal = signal<number>(0);
  private readonly yearExpenseSignal = signal<number>(0);
  private readonly expenseCategoryDataSignal = signal<Record<string, number>>({});
  private readonly currentPeriodSignal = signal<string>('month');

  /* ===== COMPUTED PROPERTIES ===== */
  readonly evolutionMetrics = computed(() => this.calculateEvolutionMetrics());
  readonly performanceMetrics = computed(() => this.calculatePerformanceMetrics());
  readonly insights = computed(() => this.generateInsights());
  readonly hasData = computed(() => this.checkHasData());
  
  // Convert getters to computed signals for better performance
  readonly totalExpense = computed(() => this.evolutionMetrics().totalExpense);
  readonly growthRate = computed(() => this.evolutionMetrics().growthRate);
  readonly achievementRate = computed(() => this.evolutionMetrics().achievementRate);
  readonly trend = computed(() => this.evolutionMetrics().trend);
  readonly monthlyGrowth = computed(() => this.evolutionMetrics().monthlyGrowth);
  readonly weeklyGrowth = computed(() => this.evolutionMetrics().weeklyGrowth);
  readonly yearlyGrowth = computed(() => this.evolutionMetrics().yearlyGrowth);
  readonly consistencyScore = computed(() => this.evolutionMetrics().consistencyScore);
  readonly diversificationScore = computed(() => this.evolutionMetrics().diversificationScore);
  readonly todayExpense = computed(() => this.evolutionMetrics().todayExpense);
  readonly efficiency = computed(() => this.performanceMetrics().efficiency);
  readonly growthPotential = computed(() => this.performanceMetrics().growthPotential);
  readonly goalAlignment = computed(() => this.performanceMetrics().goalAlignment);
  readonly stabilityIndex = computed(() => this.performanceMetrics().stabilityIndex);
  readonly insightsList = computed(() => this.insights());

  /* ===== COMPONENT STATE ===== */
  currentPeriod = 'month';

  /* ===== DEPENDENCIES ===== */
  private readonly destroyRef = inject(DestroyRef);
  private readonly expenseService = inject(ExpenseService);
  private readonly meta = inject(Meta);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    this.meta.addTags([
      { name: 'description', content: 'Comprehensive expense evaluation dashboard with trends and performance metrics for Alpha Vault financial management.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ]);
  }

  /* ===== LIFECYCLE ===== */
  ngOnInit(): void {
    this.updateSignals();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateSignalsFromChanges(changes);
    this.cdr.markForCheck();
  }

  /* ===== PRIVATE METHODS ===== */
  private updateSignals(): void {
    this.expensesSignal.set(this.expenses || []);
    this.weekEvolutionSignal.set(this.weekEvolution || 0);
    this.monthEvolutionSignal.set(this.monthEvolution || 0);
    this.yearEvolutionSignal.set(this.yearEvolution || 0);
    this.dayExpenseSignal.set(this.dayExpense || 0);
    this.weekExpenseSignal.set(this.weekExpense || 0);
    this.monthExpenseSignal.set(this.monthExpense || 0);
    this.yearExpenseSignal.set(this.yearExpense || 0);
    this.expenseCategoryDataSignal.set(this.expenseCategoryData || {});
  }

  private updateSignalsFromChanges(changes: SimpleChanges): void {
    if (changes['expenses']) {
      this.expensesSignal.set(changes['expenses'].currentValue || []);
    }
    if (changes['weekEvolution']) {
      this.weekEvolutionSignal.set(changes['weekEvolution'].currentValue || 0);
    }
    if (changes['monthEvolution']) {
      this.monthEvolutionSignal.set(changes['monthEvolution'].currentValue || 0);
    }
    if (changes['yearEvolution']) {
      this.yearEvolutionSignal.set(changes['yearEvolution'].currentValue || 0);
    }
    if (changes['dayExpense']) {
      this.dayExpenseSignal.set(changes['dayExpense'].currentValue || 0);
    }
    if (changes['weekExpense']) {
      this.weekExpenseSignal.set(changes['weekExpense'].currentValue || 0);
    }
    if (changes['monthExpense']) {
      this.monthExpenseSignal.set(changes['monthExpense'].currentValue || 0);
    }
    if (changes['yearExpense']) {
      this.yearExpenseSignal.set(changes['yearExpense'].currentValue || 0);
    }
    if (changes['expenseCategoryData']) {
      this.expenseCategoryDataSignal.set(changes['expenseCategoryData'].currentValue || {});
    }
  }

  /* ===== PUBLIC METHODS ===== */
  onAddExpense(): void {
    this.addExpense.emit();
  }

  private calculateEvolutionMetrics(): EvolutionMetrics {
    const expenses = this.expensesSignal();
    const monthExpense = this.monthExpenseSignal();
    const weekEvolution = this.weekEvolutionSignal();
    const monthEvolution = this.monthEvolutionSignal();
    const yearEvolution = this.yearEvolutionSignal();
    const dayExpense = this.dayExpenseSignal();
    const weekExpense = this.weekExpenseSignal();
    const yearExpense = this.yearExpenseSignal();

    const calculatedTotalExpense = expenses?.length > 0 
      ? expenses.reduce((sum, expense) => sum + expense.amount, 0)
      : monthExpense || 0;

    const realGrowthRate = this.calculateRealGrowthRate();

    return {
      totalExpense: calculatedTotalExpense,
      growthRate: realGrowthRate,
      achievementRate: this.calculateAchievementRate(),
      trend: realGrowthRate,
      monthlyGrowth: monthEvolution || 0,
      weeklyGrowth: weekEvolution || 0,
      yearlyGrowth: yearEvolution || 0,
      consistencyScore: this.calculateConsistencyScore(),
      diversificationScore: this.calculateDiversificationScore(),
      todayExpense: dayExpense || 0,
      weekExpense: weekExpense || 0,
      monthExpense: monthExpense || 0,
      yearExpense: yearExpense || 0,
    };
  }

  private calculateRealGrowthRate(): number {
    const expenses = this.expensesSignal();
    const monthEvolution = this.monthEvolutionSignal();

    if (!expenses?.length) {
      return monthEvolution || 0;
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    const previousMonthExpenses = expenses.filter(expense => {
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


  private calculateConsistencyScore(): number {
    const expenses = this.expensesSignal();
    if (!expenses?.length) return 0;
    
    const monthlyIncomes = this.groupExpensesByMonth();
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
    const expenses = this.expensesSignal();
    if (!expenses?.length) return 0;
    
    const sourceCount = new Set(expenses.map(expense => expense.category)).size;
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    if (totalAmount === 0) return 0;
    
    const sourceScore = Math.min(100, sourceCount * 25);
    
    return sourceScore;
  }


  private calculateEfficiencyScore(): number {
    const expenses = this.expensesSignal();
    if (!expenses?.length) return 0;
    
    const receivedExpenses = expenses.filter(expense => true); // All expenses are "received" in expense context
    const totalExpenses = expenses.length;
    
    return Math.round((receivedExpenses.length / totalExpenses) * 100);
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
    if (!this.expenses?.length) return 0;
    
    const monthlyIncomes = this.groupExpensesByMonth();
    const months = Object.keys(monthlyIncomes);
    if (months.length < 2) return 100;

    const amounts = months.map(month => monthlyIncomes[month]);
    const avg = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    
    if (avg === 0) return 100;
    
    const maxDeviation = Math.max(...amounts.map(amount => Math.abs(amount - avg)));
    const stabilityScore = Math.max(0, 100 - (maxDeviation / avg * 50));
    
    return Math.round(stabilityScore);
  }

  private groupExpensesByMonth(): Record<string, number> {
    const expenses = this.expensesSignal();
    if (!expenses) return {};
    
    return expenses.reduce((acc, expense) => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[monthKey] = (acc[monthKey] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
  }

  private generateInsights(): Insight[] {
    const insights: Insight[] = [];
    
    // Only generate insights if there's actual data
    const expenses = this.expensesSignal();
    const hasExpenses = expenses && expenses.length > 0;
    const hasExpenseData = this.dayExpenseSignal() > 0 || this.weekExpenseSignal() > 0 || this.monthExpenseSignal() > 0 || this.yearExpenseSignal() > 0;
    
    if (!hasExpenses && !hasExpenseData) {
      return insights; // Return empty array if no data
    }
    
    const monthlyGrowth = this.monthEvolutionSignal();
    if (monthlyGrowth > 0) {
      insights.push({
        id: 1,
        icon: '📈',
        title: 'Expense Growth Trend',
        description: `Your expenses have grown ${monthlyGrowth.toFixed(1)}% this month. Consider reviewing your spending patterns.`,
      });
    } else if (monthlyGrowth < 0) {
      insights.push({
        id: 1,
        icon: '📉',
        title: 'Expense Reduction Detected',
        description: `Your expenses decreased by ${Math.abs(monthlyGrowth).toFixed(1)}% this month. Great job on controlling your spending!`,
      });
    }

    const diversificationScore = this.calculateDiversificationScore();
    if (diversificationScore < 50) {
      insights.push({
        id: 2,
        icon: '🌐',
        title: 'Diversification Opportunity',
        description: 'Consider diversifying your expense categories to better understand your spending patterns.',
      });
    } else if (diversificationScore > 80) {
      insights.push({
        id: 2,
        icon: '🎯',
        title: 'Excellent Diversification',
        description: 'Your expenses are well diversified across multiple categories. This provides great spending visibility.',
      });
    }

    const consistencyScore = this.calculateConsistencyScore();
    if (consistencyScore < 70) {
      insights.push({
        id: 3,
        icon: '📅',
        title: 'Expense Consistency',
        description: 'Your expenses show some variability. Consider setting up recurring budget categories for better planning.',
      });
    } else {
      insights.push({
        id: 3,
        icon: '✅',
        title: 'Stable Expense Pattern',
        description: 'Your expenses show excellent consistency. This predictable pattern helps with budget planning.',
      });
    }

    return insights;
  }

  private checkHasData(): boolean {
    const expenses = this.expensesSignal();
    const hasExpenses = expenses && expenses.length > 0;
    const hasExpenseData = this.dayExpenseSignal() > 0 || this.weekExpenseSignal() > 0 || this.monthExpenseSignal() > 0 || this.yearExpenseSignal() > 0;

    return hasExpenses || hasExpenseData;
  }

  calculateMetricScore(metric: number, maxValue: number): number {
    return Math.min((metric / maxValue) * 100, 100);
  }

  trackByInsight(index: number, insight: Insight): number {
    return insight.id;
  }

  getTrendClass(value: number): string {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
  }

  getTrendIcon(value: number): string {
    if (value > 0) return '↗';
    if (value < 0) return '↘';
    return '→';
  }
}
