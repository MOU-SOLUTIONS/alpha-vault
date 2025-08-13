// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Component, Input, OnInit, OnChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ChartData, ChartOptions } from 'chart.js';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';

interface BudgetCategory {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

@Component({
  selector: 'app-budget-pie-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './budget-pie-chart.component.html',
  styleUrls: ['./budget-pie-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetPieChartComponent implements OnInit, OnChanges {
  @Input() chartData: Record<string, number> = {};
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
        '#009688',
        '#26a69a',
        '#4db6ac',
        '#80cbc4',
        '#b2dfdb',
        '#e0f2f1',
        '#00695c',
        '#004d40',
        '#00796b',
        '#00897b',
        '#009688',
        '#26a69a',
        '#4db6ac',
        '#80cbc4',
        '#b2dfdb',
      ],
      borderColor: '#ffffff',
      borderWidth: 2,
      hoverBorderWidth: 3,
      hoverBorderColor: '#ffffff',
      hoverOffset: 8,
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
        borderColor: '#009688',
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
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeOutQuart',
    },
  };

  constructor(
    private metaService: Meta,
    private cdr: ChangeDetectorRef,
  ) {
    this.metaService.addTags([
      { name: 'description', content: 'Interactive budget allocation pie chart with real-time data visualization and category breakdown' },
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

  getTopCategories(count: number = 3): BudgetCategory[] {
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
        color: '', // Will be assigned based on size
      }))
      .sort((a, b) => b.amount - a.amount);

    // Assign colors: biggest slice gets main color, others get gradients
    const colors = [
      '#009688', '#26a69a', '#4db6ac', '#80cbc4', '#b2dfdb',
      '#e0f2f1', '#00695c', '#004d40', '#00796b', '#00897b',
      '#009688', '#26a69a', '#4db6ac', '#80cbc4', '#b2dfdb',
    ];

    this.categories.forEach((category, index) => {
      category.color = colors[index % colors.length];
    });

    this.pieChartLabels = this.categories.map(cat => cat.category);
    this.pieChartData.datasets[0].data = this.categories.map(cat => cat.amount);
    this.pieChartData.datasets[0].backgroundColor = this.categories.map(cat => cat.color);
  }

  private getCategoryColor(category: string): string {
    const colors = [
      '#009688', '#26a69a', '#4db6ac', '#80cbc4', '#b2dfdb',
      '#e0f2f1', '#00695c', '#004d40', '#00796b', '#00897b',
      '#009688', '#26a69a', '#4db6ac', '#80cbc4', '#b2dfdb',
    ];
    
    const index = category.charCodeAt(0) % colors.length;
    return colors[index];
  }
}
