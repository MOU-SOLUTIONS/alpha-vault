/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component BudgetBarChartComponent
  @description Budget bar chart component for displaying budget data visualization
*/

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

import { META_FRAGMENT } from '../../../core/seo/page-meta.model';

interface BudgetBarData {
  category: string;
  allocated: number;
  remaining: number;
  spent: number;
  percentage: number;
  color: string;
  gradient: string;
  icon: string;
}

@Component({
  selector: 'app-budget-bar-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './budget-bar-chart.component.html',
  styleUrls: ['./budget-bar-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: META_FRAGMENT,
      useValue: {
        description: 'Interactive budget allocation bar chart with real-time data visualization and spending analysis. Compare allocated vs remaining budgets across categories.'
      }
    }
  ]
})
export class BudgetBarChartComponent implements OnInit, OnChanges {
  @Input() chartData: { category: string; allocated: number; remaining: number }[] = [];
  @Output() addBudget = new EventEmitter<void>();
  @Input() title = 'Allocation vs Remaining';
  @Input() showLegend = true;
  @Input() maxBars = 10;

  isVisible = false;
  hasData = false;
  totalAllocated = 0;
  totalRemaining = 0;
  totalSpent = 0;
  budgetData: BudgetBarData[] = [];
  
  barChartLabels: string[] = [];
  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      label: 'Allocated',
      data: [],
      backgroundColor: '#065f46',
      borderColor: '#047857',
      borderWidth: 3,
      borderRadius: 8,
      borderSkipped: false,
    }, {
      label: 'Remaining',
      data: [],
      backgroundColor: '#10b981',
      borderColor: '#059669',
      borderWidth: 3,
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#065f46',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (value === null || value === undefined) {
              return `${label}: $0`;
            }
            return `${label}: $${value.toLocaleString()}`;
          },
        },
      },
      legend: {
        display: true,
        position: 'top',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: 'bold',
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
            weight: 'bold',
          },
          color: '#64748b',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(100, 116, 139, 0.1)',
        },
        ticks: {
          font: {
            size: 11,
            weight: 'bold',
          },
          color: '#64748b',
          callback: (value) => `$${value}`,
        },
      },
    },
    animation: {
      duration: 0,
      easing: 'linear',
    },
  };

  constructor(
    private readonly cdr: ChangeDetectorRef,
  ) {
  }

  ngOnInit(): void {
    this.isVisible = true;
    this.cdr.markForCheck();
  }

  ngOnChanges(): void {
    this.processData();
    this.cdr.markForCheck();
  }

  getTopCategories(count = 5): BudgetBarData[] {
    return this.budgetData.slice(0, count);
  }

  getTotalAllocatedFormatted(): string {
    return this.totalAllocated.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  getTotalRemainingFormatted(): string {
    return this.totalRemaining.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  getTotalSpentFormatted(): string {
    return this.totalSpent.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  getCategoryPercentage(category: BudgetBarData): string {
    return category.percentage.toFixed(1);
  }

  getCategoryAllocated(category: BudgetBarData): string {
    return category.allocated.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  getCategoryRemaining(category: BudgetBarData): string {
    return category.remaining.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  trackByCategory(index: number, category: BudgetBarData): string {
    return category.category;
  }

  get topCategoriesCount(): number {
    return this.getTopCategories(8).length;
  }

  get topCategories(): BudgetBarData[] {
    return this.getTopCategories(8);
  }

  onActionButtonKeydown(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
      keyboardEvent.preventDefault();
      this.onActionButtonClick();
    }
  }

  onActionButtonClick(): void {
    this.addBudget.emit();
  }

  private processData(): void {
    if (!this.chartData || this.chartData.length === 0) {
      this.hasData = false;
      this.budgetData = [];
      this.barChartLabels = [];
      this.barChartData.datasets[0].data = [];
      this.barChartData.datasets[1].data = [];
      this.totalAllocated = 0;
      this.totalRemaining = 0;
      this.totalSpent = 0;
      return;
    }

    this.hasData = true;
    const trimmedData = this.chartData.slice(0, this.maxBars);
    
    this.budgetData = trimmedData.map((item, index) => ({
      category: item.category,
      allocated: item.allocated,
      remaining: item.remaining,
      spent: item.allocated - item.remaining,
      percentage: item.allocated > 0 ? ((item.allocated - item.remaining) / item.allocated) * 100 : 0,
      color: '',
      gradient: '',
      icon: '',
    }));

    const colors = [
      '#065f46', '#047857', '#059669', '#10b981', '#34d399',
      '#6ee7b7', '#a7f3d0', '#d1fae5', '#ecfdf5', '#f0fdf4',
    ];

    const gradients = [
      'linear-gradient(135deg, #065f46, #047857)',
      'linear-gradient(135deg, #047857, #059669)',
      'linear-gradient(135deg, #059669, #10b981)',
      'linear-gradient(135deg, #10b981, #34d399)',
      'linear-gradient(135deg, #34d399, #6ee7b7)',
      'linear-gradient(135deg, #6ee7b7, #a7f3d0)',
      'linear-gradient(135deg, #a7f3d0, #d1fae5)',
      'linear-gradient(135deg, #d1fae5, #ecfdf5)',
    ];

    const icons = [
      'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z',
      'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
      'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
      'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    ];

    this.budgetData.forEach((item, index) => {
      item.color = colors[index % colors.length];
      item.gradient = gradients[index % gradients.length];
      item.icon = icons[index % icons.length];
    });

    this.totalAllocated = this.budgetData.reduce((sum, item) => sum + item.allocated, 0);
    this.totalRemaining = this.budgetData.reduce((sum, item) => sum + item.remaining, 0);
    this.totalSpent = this.budgetData.reduce((sum, item) => sum + item.spent, 0);

    this.barChartLabels = this.budgetData.map(item => item.category);
    
    this.barChartData = {
      labels: this.barChartLabels,
      datasets: [{
        label: 'Allocated',
        data: this.budgetData.map(item => item.allocated),
        backgroundColor: '#065f46',
        borderColor: '#047857',
        borderWidth: 3,
        borderRadius: 8,
        borderSkipped: false,
      }, {
        label: 'Remaining',
        data: this.budgetData.map(item => item.remaining),
        backgroundColor: '#10b981',
        borderColor: '#059669',
        borderWidth: 3,
        borderRadius: 8,
        borderSkipped: false,
      }],
    };
  }
}
