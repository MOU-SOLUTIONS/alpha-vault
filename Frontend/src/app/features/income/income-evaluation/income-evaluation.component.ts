/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component IncomeEvaluationComponent
  @description Income evaluation component for displaying income data
*/  

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, DestroyRef, EventEmitter, inject, Input, OnChanges, OnInit, Output, signal, SimpleChanges } from '@angular/core';
import { Meta } from '@angular/platform-browser';

import { IncomeService } from '../../../core/services/income.service';
import { Income } from '../../../models/income.model';
import { IncomeEvaluationHeaderComponent } from './components/income-evaluation-header/income-evaluation-header.component';
import { IncomeEvaluationInsightsComponent, Insight } from './components/income-evaluation-insights/income-evaluation-insights.component';
import { IncomeEvaluationMetricsComponent } from './components/income-evaluation-metrics/income-evaluation-metrics.component';
import { IncomeEvaluationTrendsComponent } from './components/income-evaluation-trends/income-evaluation-trends.component';

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

@Component({
  standalone: true,
  selector: 'app-income-evaluation',
  templateUrl: './income-evaluation.component.html',
  styleUrls: ['./income-evaluation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IncomeEvaluationHeaderComponent,
    IncomeEvaluationTrendsComponent,
    IncomeEvaluationMetricsComponent,
    IncomeEvaluationInsightsComponent
  ],
})
export class IncomeEvaluationComponent implements OnInit, OnChanges {
  /* ===== INPUTS ===== */
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
  @Input() topIncomes: { category: string; amount: number }[] = [];

  /* ===== OUTPUTS ===== */
  @Output() addIncome = new EventEmitter<void>();

  /* ===== SIGNALS ===== */
  private readonly incomesSignal = signal<Income[]>([]);
  private readonly weekEvolutionSignal = signal<number>(0);
  private readonly monthEvolutionSignal = signal<number>(0);
  private readonly yearEvolutionSignal = signal<number>(0);
  private readonly dayIncomeSignal = signal<number>(0);
  private readonly weekIncomeSignal = signal<number>(0);
  private readonly monthIncomeSignal = signal<number>(0);
  private readonly yearIncomeSignal = signal<number>(0);
  private readonly incomeSourceDataSignal = signal<Record<string, number>>({});
  private readonly currentPeriodSignal = signal<string>('month');

  /* ===== COMPUTED PROPERTIES ===== */
  readonly evolutionMetrics = computed(() => this.calculateEvolutionMetrics());
  readonly performanceMetrics = computed(() => this.calculatePerformanceMetrics());
  readonly insights = computed(() => this.generateInsights());
  readonly hasData = computed(() => this.checkHasData());
  
  // Convert getters to computed signals for better performance
  readonly totalIncome = computed(() => this.evolutionMetrics().totalIncome);
  readonly growthRate = computed(() => this.evolutionMetrics().growthRate);
  readonly achievementRate = computed(() => this.evolutionMetrics().achievementRate);
  readonly trend = computed(() => this.evolutionMetrics().trend);
  readonly monthlyGrowth = computed(() => this.evolutionMetrics().monthlyGrowth);
  readonly weeklyGrowth = computed(() => this.evolutionMetrics().weeklyGrowth);
  readonly yearlyGrowth = computed(() => this.evolutionMetrics().yearlyGrowth);
  readonly consistencyScore = computed(() => this.evolutionMetrics().consistencyScore);
  readonly diversificationScore = computed(() => this.evolutionMetrics().diversificationScore);
  readonly todayIncome = computed(() => this.evolutionMetrics().todayIncome);
  readonly efficiency = computed(() => this.performanceMetrics().efficiency);
  readonly growthPotential = computed(() => this.performanceMetrics().growthPotential);
  readonly goalAlignment = computed(() => this.performanceMetrics().goalAlignment);
  readonly stabilityIndex = computed(() => this.performanceMetrics().stabilityIndex);
  readonly insightsList = computed(() => this.insights());

  /* ===== COMPONENT STATE ===== */
  currentPeriod = 'month';

  /* ===== DEPENDENCIES ===== */
  private readonly destroyRef = inject(DestroyRef);
  private readonly incomeService = inject(IncomeService);
  private readonly meta = inject(Meta);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    this.meta.addTags([
      { name: 'description', content: 'Comprehensive income evaluation dashboard with trends and performance metrics for Alpha Vault financial management.' },
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
    this.incomesSignal.set(this.incomes || []);
    this.weekEvolutionSignal.set(this.weekEvolution || 0);
    this.monthEvolutionSignal.set(this.monthEvolution || 0);
    this.yearEvolutionSignal.set(this.yearEvolution || 0);
    this.dayIncomeSignal.set(this.dayIncome || 0);
    this.weekIncomeSignal.set(this.weekIncome || 0);
    this.monthIncomeSignal.set(this.monthIncome || 0);
    this.yearIncomeSignal.set(this.yearIncome || 0);
    this.incomeSourceDataSignal.set(this.incomeSourceData || {});
  }

  private updateSignalsFromChanges(changes: SimpleChanges): void {
    if (changes['incomes']) {
      this.incomesSignal.set(changes['incomes'].currentValue || []);
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
    if (changes['dayIncome']) {
      this.dayIncomeSignal.set(changes['dayIncome'].currentValue || 0);
    }
    if (changes['weekIncome']) {
      this.weekIncomeSignal.set(changes['weekIncome'].currentValue || 0);
    }
    if (changes['monthIncome']) {
      this.monthIncomeSignal.set(changes['monthIncome'].currentValue || 0);
    }
    if (changes['yearIncome']) {
      this.yearIncomeSignal.set(changes['yearIncome'].currentValue || 0);
    }
    if (changes['incomeSourceData']) {
      this.incomeSourceDataSignal.set(changes['incomeSourceData'].currentValue || {});
    }
  }

  /* ===== PUBLIC METHODS ===== */
  onAddIncome(): void {
    this.addIncome.emit();
  }


  private calculateEvolutionMetrics(): EvolutionMetrics {
    const incomes = this.incomesSignal();
    const monthIncome = this.monthIncomeSignal();
    const weekEvolution = this.weekEvolutionSignal();
    const monthEvolution = this.monthEvolutionSignal();
    const yearEvolution = this.yearEvolutionSignal();
    const dayIncome = this.dayIncomeSignal();
    const weekIncome = this.weekIncomeSignal();
    const yearIncome = this.yearIncomeSignal();

    const calculatedTotalIncome = incomes?.length > 0 
      ? incomes.reduce((sum, income) => sum + income.amount, 0)
      : monthIncome || 0;

    const realGrowthRate = this.calculateRealGrowthRate();

    return {
      totalIncome: calculatedTotalIncome,
      growthRate: realGrowthRate,
      achievementRate: this.calculateAchievementRate(),
      trend: realGrowthRate,
      monthlyGrowth: monthEvolution || 0,
      weeklyGrowth: weekEvolution || 0,
      yearlyGrowth: yearEvolution || 0,
      consistencyScore: this.calculateConsistencyScore(),
      diversificationScore: this.calculateDiversificationScore(),
      todayIncome: dayIncome || 0,
      weekIncome: weekIncome || 0,
      monthIncome: monthIncome || 0,
      yearIncome: yearIncome || 0,
    };
  }

  private calculateRealGrowthRate(): number {
    const incomes = this.incomesSignal();
    const monthEvolution = this.monthEvolutionSignal();

    if (!incomes?.length) {
      return monthEvolution || 0;
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthIncomes = incomes.filter(income => {
      const incomeDate = new Date(income.date);
      return incomeDate.getMonth() === currentMonth && incomeDate.getFullYear() === currentYear;
    });

    const previousMonthIncomes = incomes.filter(income => {
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


  private calculateConsistencyScore(): number {
    const incomes = this.incomesSignal();
    if (!incomes?.length) return 0;
    
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
    const incomes = this.incomesSignal();
    if (!incomes?.length) return 0;
    
    const sourceCount = new Set(incomes.map(income => income.source)).size;
    const totalAmount = incomes.reduce((sum, income) => sum + income.amount, 0);
    
    if (totalAmount === 0) return 0;
    
    const sourceScore = Math.min(100, sourceCount * 25);
    
    return sourceScore;
  }


  private calculateEfficiencyScore(): number {
    const incomes = this.incomesSignal();
    if (!incomes?.length) return 0;
    
    const receivedIncomes = incomes.filter(income => income.isReceived);
    const totalIncomes = incomes.length;
    
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
    const incomes = this.incomesSignal();
    if (!incomes) return {};
    
    return incomes.reduce((acc, income) => {
      const date = new Date(income.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[monthKey] = (acc[monthKey] || 0) + income.amount;
      return acc;
    }, {} as Record<string, number>);
  }

  private generateInsights(): Insight[] {
    const insights: Insight[] = [];
    
    // Only generate insights if there's actual data
    const incomes = this.incomesSignal();
    const hasIncomes = incomes && incomes.length > 0;
    const hasIncomeData = this.dayIncomeSignal() > 0 || this.weekIncomeSignal() > 0 || this.monthIncomeSignal() > 0 || this.yearIncomeSignal() > 0;
    
    if (!hasIncomes && !hasIncomeData) {
      return insights; // Return empty array if no data
    }
    
    const monthlyGrowth = this.monthEvolutionSignal();
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
    const incomes = this.incomesSignal();
    const hasIncomes = incomes && incomes.length > 0;
    const hasIncomeData = this.dayIncomeSignal() > 0 || this.weekIncomeSignal() > 0 || this.monthIncomeSignal() > 0 || this.yearIncomeSignal() > 0;

    return hasIncomes || hasIncomeData;
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
