/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component BudgetProgressComponent
  @description Premium budget progress tracking with advanced analytics and stunning visualizations
*/

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, DestroyRef, inject, Input, OnChanges, OnInit, PLATFORM_ID, signal } from '@angular/core';

import { META_FRAGMENT } from '../../../core/seo/page-meta.model';
import { MetricCardComponent } from './components/metric-card';

interface BudgetMetrics {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  dailyAverage: number;
  daysRemaining: number;
  projectedOverspend: number;
}

interface BudgetStatus {
  level: 'excellent' | 'good' | 'warning' | 'danger' | 'critical';
  score: number;
  color: string;
  icon: string;
  message: string;
  recommendation: string;
  gradient: string;
  glowColor: string;
}

interface SpendingTrend {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
  period: string;
}

@Component({
  selector: 'app-budget-progress',
  standalone: true,
  imports: [CommonModule, MetricCardComponent],
  templateUrl: './budget-progress.component.html',
  styleUrls: ['./budget-progress.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: META_FRAGMENT,
      useValue: {
        description: 'Advanced budget progress tracking dashboard with real-time analytics, spending trends, daily averages, and intelligent recommendations. Monitor your budget performance with visual indicators, status scores, and actionable insights in Alpha Vault.'
      }
    }
  ],
})
export class BudgetProgressComponent implements OnInit, OnChanges {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  @Input() totalBudget = 0;
  @Input() totalSpent = 0;
  @Input() totalRemaining = 0;
  @Input() month = new Date().getMonth() + 1;
  @Input() year = new Date().getFullYear();

  private readonly totalBudgetSignal = signal(0);
  private readonly totalSpentSignal = signal(0);
  private readonly totalRemainingSignal = signal(0);
  private readonly monthSignal = signal(new Date().getMonth() + 1);
  private readonly yearSignal = signal(new Date().getFullYear());

  private readonly isVisibleSignal = signal(false);
  private readonly isInteractiveSignal = signal(false);
  private readonly hoveredCardSignal = signal<string | null>(null);

  readonly isVisible = this.isVisibleSignal.asReadonly();
  readonly isInteractive = this.isInteractiveSignal.asReadonly();
  readonly hoveredCard = this.hoveredCardSignal.asReadonly();

  readonly budgetMetrics = computed((): BudgetMetrics => {
    const spent = this.totalSpentSignal();
    const remaining = this.totalRemainingSignal();
    const budget = this.totalBudgetSignal();
    
    const daysInMonth = this.getDaysInMonth(this.yearSignal(), this.monthSignal());
    const currentDay = this.getCurrentDay();
    const daysRemaining = Math.max(0, daysInMonth - currentDay);
    
    const dailyAverage = currentDay > 0 ? spent / currentDay : 0;
    const projectedOverspend = dailyAverage * daysInMonth - budget;
    
    return {
      totalBudget: budget,
      totalSpent: spent,
      totalRemaining: remaining,
      dailyAverage,
      daysRemaining,
      projectedOverspend
    };
  });

  readonly progressPercentage = computed(() => {
    const metrics = this.budgetMetrics();
    return metrics.totalBudget > 0 ? (metrics.totalSpent / metrics.totalBudget) * 100 : 0;
  });

  readonly budgetStatus = computed((): BudgetStatus => {
    const percentage = this.progressPercentage();
    const metrics = this.budgetMetrics();
    
    if (percentage >= 100) {
      return {
        level: 'critical',
        score: 0,
        color: '#ef4444',
        icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z',
        message: 'Budget Exceeded',
        recommendation: 'Immediate action required. Consider emergency budget adjustments.',
        gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
        glowColor: 'rgba(239, 68, 68, 0.3)'
      };
    } else if (percentage >= 90) {
      return {
        level: 'danger',
        score: 20,
        color: '#f97316',
        icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        message: 'Critical Zone',
        recommendation: 'Reduce spending immediately to avoid overspending.',
        gradient: 'linear-gradient(135deg, #f97316, #ea580c)',
        glowColor: 'rgba(249, 115, 22, 0.3)'
      };
    } else if (percentage >= 75) {
      return {
        level: 'warning',
        score: 40,
        color: '#eab308',
        icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z',
        message: 'Caution Zone',
        recommendation: 'Monitor spending closely. Consider reducing non-essential expenses.',
        gradient: 'linear-gradient(135deg, #eab308, #ca8a04)',
        glowColor: 'rgba(234, 179, 8, 0.3)'
      };
    } else if (percentage >= 50) {
      return {
        level: 'good',
        score: 70,
        color: '#22c55e',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        message: 'On Track',
        recommendation: 'Good progress! Continue monitoring to maintain healthy spending.',
        gradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
        glowColor: 'rgba(34, 197, 94, 0.3)'
      };
    } else {
      return {
        level: 'excellent',
        score: 95,
        color: '#06b6d4',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        message: 'Excellent Control',
        recommendation: 'Outstanding budget management! You\'re well within your limits.',
        gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
        glowColor: 'rgba(6, 182, 212, 0.3)'
      };
    }
  });

  readonly spendingTrend = computed((): SpendingTrend => {
    const metrics = this.budgetMetrics();
    const dailyAverage = metrics.dailyAverage;
    const projectedTotal = dailyAverage * this.getDaysInMonth(this.yearSignal(), this.monthSignal());
    const difference = projectedTotal - metrics.totalBudget;
    const percentage = metrics.totalBudget > 0 ? (difference / metrics.totalBudget) * 100 : 0;
    
    if (percentage > 5) {
      return { direction: 'up', percentage: Math.abs(percentage), period: 'monthly' };
    } else if (percentage < -5) {
      return { direction: 'down', percentage: Math.abs(percentage), period: 'monthly' };
    } else {
      return { direction: 'stable', percentage: 0, period: 'monthly' };
    }
  });

  readonly isOverBudget = computed(() => this.progressPercentage() >= 100);
  readonly isNearLimit = computed(() => this.progressPercentage() >= 90);
  readonly isHealthy = computed(() => this.progressPercentage() < 75);

  readonly progressDashOffset = computed(() => {
    const percentage = this.progressPercentage();
    return 314 - (314 * percentage / 100);
  });

  readonly dailyBudgetRecommendation = computed(() => {
    const metrics = this.budgetMetrics();
    return metrics.daysRemaining > 0 ? metrics.totalRemaining / metrics.daysRemaining : 0;
  });

  readonly trendIndicator = computed(() => {
    const trend = this.spendingTrend();
    switch (trend.direction) {
      case 'up': return 'Increasing';
      case 'down': return 'Decreasing';
      default: return 'Stable';
    }
  });

  readonly trendVisual = computed(() => {
    const trend = this.spendingTrend();
    switch (trend.direction) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  });

  readonly formattedCurrency = computed(() => ({
    totalBudget: this.getFormattedCurrency(this.budgetMetrics().totalBudget),
    totalSpent: this.getFormattedCurrency(this.budgetMetrics().totalSpent),
    totalRemaining: this.getFormattedCurrency(this.budgetMetrics().totalRemaining),
    dailyAverage: this.getFormattedCurrency(this.budgetMetrics().dailyAverage),
    dailyBudget: this.getFormattedCurrency(this.dailyBudgetRecommendation())
  }));

  readonly progressRingData = computed(() => ({
    percentage: this.progressPercentage(),
    color: this.budgetStatus().color,
    glowColor: this.budgetStatus().glowColor,
    level: this.budgetStatus().level,
    totalSpent: this.budgetMetrics().totalSpent
  }));

  readonly metricCardsData = computed(() => [
    {
      id: 'budget',
      title: 'Total Budget',
      value: this.budgetMetrics().totalBudget,
      trend: {
        direction: 'stable' as const,
        percentage: 0,
        text: 'Monthly Allocation'
      },
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
    },
    {
      id: 'spending',
      title: 'Total Spent',
      value: this.budgetMetrics().totalSpent,
      trend: {
        direction: this.budgetStatus().level as 'excellent' | 'good' | 'warning' | 'danger' | 'critical',
        percentage: this.progressPercentage(),
        text: `${this.getFormattedPercentage(this.progressPercentage())} of budget`
      },
      icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'
    },
    {
      id: 'remaining',
      title: 'Remaining',
      value: this.budgetMetrics().totalRemaining,
      trend: {
        direction: this.budgetMetrics().totalRemaining >= 0 ? 'positive' as const : 'negative' as const,
        percentage: 100 - this.progressPercentage(),
        text: `${this.getFormattedPercentage(100 - this.progressPercentage())} left`
      },
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      isNegative: this.budgetMetrics().totalRemaining < 0
    },
    {
      id: 'daily',
      title: 'Daily Average',
      value: this.budgetMetrics().dailyAverage,
      trend: {
        direction: this.spendingTrend().direction,
        percentage: this.spendingTrend().percentage,
        text: this.spendingTrend().direction !== 'stable' ? this.getFormattedPercentage(this.spendingTrend().percentage) : 'Stable'
      },
      icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
    }
  ]);

  constructor() {
    // SEO fragment provided via META_FRAGMENT token
    // Parent component (BudgetComponent) aggregates all fragments via SeoService
  }

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnChanges(): void {
    this.totalBudgetSignal.set(this.totalBudget);
    this.totalSpentSignal.set(this.totalSpent);
    this.totalRemainingSignal.set(this.totalRemaining);
    this.monthSignal.set(this.month);
    this.yearSignal.set(this.year);
    
    this.cdr.detectChanges();
  }

  getMonthSignal = () => this.monthSignal();
  getYearSignal = () => this.yearSignal();
  
  trackByCardId = (_: number, card: any) => card.id;
  onCardHover(cardId: string | null): void {
    this.hoveredCardSignal.set(cardId);
  }

  onCardKeydown(event: Event, cardId: string): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
      keyboardEvent.preventDefault();
      this.onCardHover(cardId);
    }
  }

  getFormattedCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  getFormattedPercentage(value: number): string {
    return `${Math.round(value)}%`;
  }

  private initializeComponent(): void {
    this.isVisibleSignal.set(true);
    this.isInteractiveSignal.set(true);
  }

  private getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }

  private getCurrentDay(): number {
    return new Date().getDate();
  }
}