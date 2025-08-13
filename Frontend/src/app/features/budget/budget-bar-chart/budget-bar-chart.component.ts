// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Component, Input, OnInit, OnChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ChartData, ChartOptions } from 'chart.js';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';

interface BudgetBarData {
  category: string;
  allocated: number;
  remaining: number;
  spent: number;
  percentage: number;
}

@Component({
  selector: 'app-budget-bar-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './budget-bar-chart.component.html',
  styleUrls: ['./budget-bar-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetBarChartComponent implements OnInit, OnChanges {
  @Input() chartData: { category: string; allocated: number; remaining: number }[] = [];
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
      backgroundColor: '#009688',
      borderColor: '#26a69a',
      borderWidth: 2,
      borderRadius: 4,
      borderSkipped: false,
    }, {
      label: 'Remaining',
      data: [],
      backgroundColor: '#4caf50',
      borderColor: '#66bb6a',
      borderWidth: 2,
      borderRadius: 4,
      borderSkipped: false,
    }],
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#009688',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
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
      duration: 1000,
      easing: 'easeOutQuart',
    },
  };

  constructor(
    private metaService: Meta,
    private cdr: ChangeDetectorRef,
  ) {
    this.metaService.addTags([
      { name: 'description', content: 'Interactive budget allocation bar chart with real-time data visualization and spending analysis' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ]);
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.isVisible = true;
      this.cdr.markForCheck();
    }, 200);
  }

  ngOnChanges(): void {
    this.processData();
    this.cdr.markForCheck();
  }

  getTopCategories(count: number = 5): BudgetBarData[] {
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
    
    this.budgetData = trimmedData.map(item => ({
      category: item.category,
      allocated: item.allocated,
      remaining: item.remaining,
      spent: item.allocated - item.remaining,
      percentage: item.allocated > 0 ? ((item.allocated - item.remaining) / item.allocated) * 100 : 0,
    }));

    this.totalAllocated = this.budgetData.reduce((sum, item) => sum + item.allocated, 0);
    this.totalRemaining = this.budgetData.reduce((sum, item) => sum + item.remaining, 0);
    this.totalSpent = this.budgetData.reduce((sum, item) => sum + item.spent, 0);

    this.barChartLabels = this.budgetData.map(item => item.category);
    this.barChartData.datasets[0].data = this.budgetData.map(item => item.allocated);
    this.barChartData.datasets[1].data = this.budgetData.map(item => item.remaining);
  }
}
