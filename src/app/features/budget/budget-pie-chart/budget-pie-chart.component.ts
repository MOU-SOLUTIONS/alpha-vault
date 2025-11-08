/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component BudgetPieChartComponent
  @description Budget pie chart component for displaying budget data visualization
*/

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

import { META_FRAGMENT } from '../../../core/seo/page-meta.model';

interface BudgetCategory {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  gradient: string;
  icon: string;
}

@Component({
  selector: 'app-budget-pie-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './budget-pie-chart.component.html',
  styleUrls: ['./budget-pie-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: META_FRAGMENT,
      useValue: {
        description: 'Interactive pie chart visualization of budget allocations by category. Visual breakdown with percentage distributions, color-coded categories, and real-time budget analytics in Alpha Vault.'
      }
    }
  ],
})
export class BudgetPieChartComponent implements OnInit, OnChanges {
  @Input() chartData: Record<string, number> = {};
  @Output() addBudget = new EventEmitter<void>();
  @Input() title = 'This Month Budget Allocation';
  @Input() showLegend = true;

  isVisible = false;
  hasData = false;
  totalBudget = 0;
  categories: BudgetCategory[] = [];
  
  pieChartLabels: string[] = [];
  pieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#065f46',
        '#047857',
        '#059669',
        '#10b981',
        '#34d399',
        '#6ee7b7',
        '#a7f3d0',
        '#d1fae5',
        '#ecfdf5',
        '#f0fdf4',
        '#065f46',
        '#047857',
        '#059669',
        '#10b981',
        '#34d399',
      ],
      borderColor: '#ffffff',
      borderWidth: 3,
      hoverBorderWidth: 4,
      hoverBorderColor: '#ffffff',
      hoverOffset: 12,
    }],
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: true,
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
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: $${value.toLocaleString()} (${percentage}%)`;
          },
        },
      },
      legend: {
        display: false,
        position: 'bottom',
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
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverBorderWidth: 3,
        hoverBorderColor: '#ffffff',
        hoverOffset: 8,
      },
    },
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
      },
    },
    animation: {
      animateRotate: false,
      animateScale: false,
      duration: 0,
      easing: 'linear',
    },
  };

  constructor(
    private cdr: ChangeDetectorRef,
  ) {
    // SEO fragment provided via META_FRAGMENT token
    // Parent component (BudgetComponent) aggregates all fragments via SeoService
  }

  ngOnInit(): void {
    this.isVisible = true;
    this.cdr.markForCheck();
  }

  ngOnChanges(): void {
    this.processData();
    this.cdr.markForCheck();
  }

  getTopCategories(count = 3): BudgetCategory[] {
    return this.categories.slice(0, count);
  }

  getTotalFormatted(): string {
    return this.totalBudget.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  getCategoryPercentage(category: BudgetCategory): string {
    return category.percentage.toFixed(1);
  }

  getCategoryAmount(category: BudgetCategory): string {
    return category.amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  trackByCategory(index: number, category: BudgetCategory): string {
    return category.category;
  }

  get topCategoriesCount(): number {
    return this.getTopCategories(5).length;
  }

  get topCategories(): BudgetCategory[] {
    return this.getTopCategories(5);
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
    if (!this.chartData || Object.keys(this.chartData).length === 0) {
      this.hasData = false;
      this.categories = [];
      this.pieChartLabels = [];
      this.pieChartData.datasets[0].data = [];
      this.totalBudget = 0;
      return;
    }

    this.hasData = true;
    this.totalBudget = Object.values(this.chartData).reduce((sum, value) => sum + value, 0);
    
    this.categories = Object.entries(this.chartData)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: this.totalBudget > 0 ? (amount / this.totalBudget) * 100 : 0,
        color: '',
        gradient: '',
        icon: '',
      }))
      .sort((a, b) => b.amount - a.amount);

    const colors = [
      '#065f46', '#047857', '#059669', '#10b981', '#34d399',
      '#6ee7b7', '#a7f3d0', '#d1fae5', '#ecfdf5', '#f0fdf4',
      '#065f46', '#047857', '#059669', '#10b981', '#34d399',
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
      'linear-gradient(135deg, #ecfdf5, #f0fdf4)',
      'linear-gradient(135deg, #f0fdf4, #ffffff)',
    ];

    const icons = [
      'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
      'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z',
      'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
    ];

    this.categories.forEach((category, index) => {
      category.color = colors[index % colors.length];
      category.gradient = gradients[index % gradients.length];
      category.icon = icons[index % icons.length];
    });

    this.pieChartLabels = this.categories.map(cat => cat.category);
    this.pieChartData.datasets[0].data = this.categories.map(cat => cat.amount);
    this.pieChartData.datasets[0].backgroundColor = this.categories.map(cat => cat.color);
  }

}
