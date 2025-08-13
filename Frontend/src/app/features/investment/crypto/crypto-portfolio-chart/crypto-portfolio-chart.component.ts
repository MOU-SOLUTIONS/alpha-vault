// ====================================================================
//      Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Component, Input, OnChanges, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, interval } from 'rxjs';
import { trigger, state, style, transition, animate, query, stagger } from '@angular/animations';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Investment } from '../../../../models/investment.model';

type ChartType = 'pie' | 'doughnut';

interface LegendItem {
  readonly name: string;
  readonly color: string;
  readonly percentage: number;
  readonly invested: number;
  readonly profitLoss: number;
  readonly profitLossPercentage: number;
  readonly isPositive: boolean;
}

@Component({
  standalone: true,
  selector: 'app-crypto-portfolio-chart',
  templateUrl: './crypto-portfolio-chart.component.html',
  styleUrls: ['./crypto-portfolio-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NgChartsModule, MatIconModule, MatTooltipModule],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerItems', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateX(-20px)' }),
          stagger(100, [
            animate('400ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class CryptoPortfolioChartComponent implements OnChanges, OnInit, OnDestroy {
  @Input() investments: readonly Investment[] = [];

  totalInvested = 0;
  totalProfitLoss = 0;
  totalProfitLossPercentage = 0;
  readonly isLoading = false;
  readonly autoRefresh = true;
  selectedChartType: ChartType = 'pie';

  showDetails = false;
  selectedItem: LegendItem | null = null;

  pieData: ChartData<'pie' | 'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      borderColor: '#ffffff',
      borderWidth: 2,
      hoverBorderWidth: 3,
      hoverBorderColor: '#ffffff'
    }]
  };

  readonly pieOptions: ChartConfiguration<'pie' | 'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
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
          title: (context) => `📊 ${context[0].label}`,
          label: (context) => {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `💰 $${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
    elements: {
      arc: {
        borderWidth: 2
      }
    }
  };

  legendItems: LegendItem[] = [];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly meta: Meta,
  ) {
    this.meta.addTags([
      { name: 'description', content: 'View your cryptocurrency portfolio allocation and performance breakdown with interactive charts and detailed analytics.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
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
    this.updateChart();
  }

  toggleChartType(): void {
    this.selectedChartType = this.selectedChartType === 'pie' ? 'doughnut' : 'pie';
    this.updateChart();
  }

  getChartTypeIcon(): string {
    return this.selectedChartType === 'pie' ? 'donut_large' : 'pie_chart';
  }

  getChartTypeLabel(): string {
    return this.selectedChartType === 'pie' ? 'Switch to Doughnut Chart' : 'Switch to Pie Chart';
  }

  toggleAutoRefresh(): void {
    if (this.autoRefresh) {
      this.stopAutoRefresh();
    } else {
      this.startAutoRefresh();
    }
  }

  refreshData(): void {
    this.computePortfolioMetrics();
    this.updateChart();
  }

  selectItem(item: LegendItem): void {
    this.selectedItem = item;
    this.showDetails = true;
  }

  onItemKeyDown(event: KeyboardEvent, item: LegendItem): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectItem(item);
    }
  }

  closeDetails(): void {
    this.showDetails = false;
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
    return `${value.toFixed(1)}%`;
  }

  getProfitLossColor(isPositive: boolean): string {
    return isPositive ? '#10b981' : '#ef4444';
  }

  getProfitLossIcon(isPositive: boolean): string {
    return isPositive ? 'trending_up' : 'trending_down';
  }

  trackByLegendItem(index: number, item: LegendItem): string {
    return item.name;
  }

  private startAutoRefresh(): void {
    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.refreshData();
      });
  }

  private stopAutoRefresh(): void {
    this.destroy$.next();
  }

  private computePortfolioMetrics(): void {
    if (this.investments.length === 0) {
      this.setEmptyState();
      return;
    }

    this.totalInvested = this.investments.reduce((sum, inv) => sum + Number(inv.amountInvested), 0);
    const totalCurrentValue = this.investments.reduce((sum, inv) => sum + Number(inv.currentValue), 0);
    this.totalProfitLoss = totalCurrentValue - this.totalInvested;
    this.totalProfitLossPercentage = this.totalInvested > 0 ? (this.totalProfitLoss / this.totalInvested) * 100 : 0;

    this.calculatePortfolioMetrics();
  }

  private calculatePortfolioMetrics(): void {
    const portfolioData = this.investments.map(inv => ({
      name: inv.name,
      invested: Number(inv.amountInvested),
      currentValue: Number(inv.currentValue),
      profitLoss: Number(inv.currentValue) - Number(inv.amountInvested),
      profitLossPercentage: Number(inv.amountInvested) > 0 
        ? ((Number(inv.currentValue) - Number(inv.amountInvested)) / Number(inv.amountInvested)) * 100 
        : 0
    }));

    const totalInvested = portfolioData.reduce((sum, item) => sum + item.invested, 0);

    this.legendItems = portfolioData.map(item => ({
      name: item.name,
      color: this.getRandomColor(),
      percentage: totalInvested > 0 ? (item.invested / totalInvested) * 100 : 0,
      invested: item.invested,
      profitLoss: item.profitLoss,
      profitLossPercentage: item.profitLossPercentage,
      isPositive: item.profitLoss >= 0
    }));

    this.generateChartData();
  }

  private generateChartData(): void {
    const labels = this.legendItems.map(item => item.name);
    const data = this.legendItems.map(item => item.invested);
    const colors = this.legendItems.map(item => item.color);

    this.pieData = {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverBorderColor: '#ffffff'
      }]
    };
  }

  private updateChart(): void {
    this.generateChartData();
  }

  private setEmptyState(): void {
    this.totalInvested = 0;
    this.totalProfitLoss = 0;
    this.totalProfitLossPercentage = 0;
    this.legendItems = [];
    this.pieData = {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [],
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverBorderColor: '#ffffff'
      }]
    };
  }

  private getRandomColor(): string {
    const colors = [
      '#7E57C2', '#9575CD', '#B39DDB', '#D1C4E9', '#EDE7F6',
      '#5E35B1', '#512DA8', '#4527A0', '#311B92', '#4A148C'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
