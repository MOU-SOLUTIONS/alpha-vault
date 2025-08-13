// ====================================================================
//      Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Component, Input, OnChanges, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, interval } from 'rxjs';
import { trigger, state, style, transition, animate, query, stagger } from '@angular/animations';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Investment } from '../../../../models/investment.model';

type Timeframe = '7d' | '30d' | '90d' | '1y';

@Component({
  standalone: true,
  selector: 'app-crypto-value-chart',
  templateUrl: './crypto-value-chart.component.html',
  styleUrls: ['./crypto-value-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NgChartsModule, MatIconModule, MatTooltipModule],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerCards', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('pulse', [
      transition(':increment', [
        animate('300ms ease-out', style({ transform: 'scale(1.05)' })),
        animate('300ms ease-out', style({ transform: 'scale(1)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class CryptoValueChartComponent implements OnChanges, OnInit, OnDestroy {
  @Input() investments: readonly Investment[] = [];

  totalInvested = 0;
  currentValue = 0;
  profitLoss = 0;
  profitLossPercentage = 0;
  isPositive = false;
  portfolioGrowth = 0;
  bestPerformer = '';
  worstPerformer = '';

  readonly isLoading = false;
  selectedTimeframe: Timeframe = '7d';
  readonly showDetails = false;
  readonly chartType: ChartType = 'line';

  lineData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Portfolio Value',
        fill: true,
        tension: 0.4,
        borderColor: '#7E57C2',
        backgroundColor: 'rgba(126, 87, 194, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#7E57C2',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 10,
        pointHoverBackgroundColor: '#7E57C2',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3
      }
    ]
  };

  lineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: true,
          color: 'rgba(126, 87, 194, 0.1)'
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            weight: 500
          },
          padding: 8
        },
        border: {
          display: false
        }
      },
      y: {
        display: true,
        grid: {
          display: true,
          color: 'rgba(126, 87, 194, 0.1)'
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            weight: 500
          },
          padding: 8,
          callback: function(value) {
            return '$' + Number(value).toLocaleString();
          }
        },
        border: {
          display: false
        },
        beginAtZero: false
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(126, 87, 194, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#7E57C2',
        borderWidth: 2,
        cornerRadius: 12,
        displayColors: false,
        padding: 12,
        titleFont: {
          size: 14,
          weight: 600
        },
        bodyFont: {
          size: 13,
          weight: 500
        },
        callbacks: {
          title: (context) => `📈 Portfolio Value`,
          label: (context) => {
            const value = context.parsed.y;
            return `💰 $${value.toLocaleString()}`;
          }
        }
      }
    },
    elements: {
      point: {
        hoverRadius: 10,
        radius: 6
      },
      line: {
        tension: 0.4
      }
    }
  };

  readonly timeframes: readonly Timeframe[] = ['7d', '30d', '90d', '1y'];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly meta: Meta
  ) {
    this.meta.addTags([
      { name: 'description', content: 'Track your cryptocurrency portfolio value over time with interactive charts and performance analytics.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]);
  }

  ngOnInit(): void {
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(): void {
    this.computePortfolioMetrics();
    this.generateChartData();
  }

  changeTimeframe(timeframe: Timeframe): void {
    this.selectedTimeframe = timeframe;
    this.generateChartData();
  }

  getTimeframeLabel(): string {
    const labels: Record<Timeframe, string> = {
      '7d': '7 Days',
      '30d': '30 Days',
      '90d': '90 Days',
      '1y': '1 Year'
    };
    return labels[this.selectedTimeframe];
  }

  getTimeframes(): readonly Timeframe[] {
    return this.timeframes;
  }

  trackByTimeframe(index: number, timeframe: Timeframe): string {
    return timeframe;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  formatPercentage(value: number): string {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  }

  getProfitLossColor(isPositive: boolean): string {
    return isPositive ? '#10b981' : '#ef4444';
  }

  getProfitLossIcon(isPositive: boolean): string {
    return isPositive ? 'trending_up' : 'trending_down';
  }

  private startAutoRefresh(): void {
    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.computePortfolioMetrics();
        this.generateChartData();
      });
  }

  computePortfolioMetrics(): void {
    if (this.investments.length === 0) {
      this.setEmptyState();
      return;
    }

    this.totalInvested = this.investments.reduce((sum, inv) => sum + Number(inv.amountInvested), 0);
    this.currentValue = this.investments.reduce((sum, inv) => sum + Number(inv.currentValue), 0);
    this.profitLoss = this.currentValue - this.totalInvested;
    this.profitLossPercentage = this.totalInvested > 0 ? (this.profitLoss / this.totalInvested) * 100 : 0;
    this.isPositive = this.profitLoss >= 0;

    this.calculatePortfolioGrowth();
    this.findBestAndWorstPerformers();
  }

  private calculatePortfolioGrowth(): void {
    if (this.investments.length === 0) {
      this.portfolioGrowth = 0;
      return;
    }

    const totalGrowth = this.investments.reduce((sum, inv) => {
      const growth = Number(inv.currentValue) - Number(inv.amountInvested);
      return sum + growth;
    }, 0);

    this.portfolioGrowth = this.totalInvested > 0 ? (totalGrowth / this.totalInvested) * 100 : 0;
  }

  private findBestAndWorstPerformers(): void {
    if (this.investments.length === 0) {
      this.bestPerformer = '';
      this.worstPerformer = '';
      return;
    }

    const performers = this.investments.map(inv => ({
      name: inv.name,
      growth: Number(inv.currentValue) - Number(inv.amountInvested),
      growthPercentage: Number(inv.amountInvested) > 0 
        ? ((Number(inv.currentValue) - Number(inv.amountInvested)) / Number(inv.amountInvested)) * 100 
        : 0
    }));

    const sortedByGrowth = performers.sort((a, b) => b.growthPercentage - a.growthPercentage);
    
    this.bestPerformer = sortedByGrowth[0]?.name || '';
    this.worstPerformer = sortedByGrowth[sortedByGrowth.length - 1]?.name || '';
  }

  private generateChartData(): void {
    const days = this.getDaysForTimeframe();
    const baseValue = this.totalInvested;
    const volatility = 0.15;
    const points = days;
    const currentPoint = Math.random() * baseValue * volatility;

    const data = [];
    const labels = [];

    for (let i = 0; i < points; i++) {
      const randomFactor = 1 + (Math.random() - 0.5) * volatility;
      const value = baseValue * randomFactor + (i / points) * currentPoint;
      data.push(Math.max(0, value));
      labels.push(this.generateLabels(i, days));
    }

    this.lineData = {
      labels,
      datasets: [
        {
          data,
          label: 'Portfolio Value',
          fill: true,
          tension: 0.4,
          borderColor: '#7E57C2',
          backgroundColor: 'rgba(126, 87, 194, 0.1)',
          borderWidth: 3,
          pointBackgroundColor: '#7E57C2',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 10,
          pointHoverBackgroundColor: '#7E57C2',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 3
        }
      ]
    };
  }

  private getDaysForTimeframe(): number {
    const daysMap: Record<Timeframe, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };
    return daysMap[this.selectedTimeframe];
  }

  private generateLabels(index: number, totalDays: number): string {
    const date = new Date();
    date.setDate(date.getDate() - (totalDays - index));
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  private setEmptyState(): void {
    this.totalInvested = 0;
    this.currentValue = 0;
    this.profitLoss = 0;
    this.profitLossPercentage = 0;
    this.isPositive = false;
    this.portfolioGrowth = 0;
    this.bestPerformer = '';
    this.worstPerformer = '';
    
    this.lineData = {
      labels: [],
      datasets: [
        {
          data: [],
          label: 'Portfolio Value',
          fill: true,
          tension: 0.4,
          borderColor: '#7E57C2',
          backgroundColor: 'rgba(126, 87, 194, 0.1)',
          borderWidth: 3,
          pointBackgroundColor: '#7E57C2',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 10,
          pointHoverBackgroundColor: '#7E57C2',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 3
        }
      ]
    };
  }
}
