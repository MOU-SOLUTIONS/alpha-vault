// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Component, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-expense-method-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './expense-method-chart.component.html',
  styleUrls: ['./expense-method-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseMethodChartComponent implements OnChanges {
  @Input() methodData: { [key: string]: number } = {};

  rawData: { [key: string]: number } = {};
  isLoading = true;
  hasData = false;

  pieChartLabels: string[] = [];
  colorPalette = ['#3f51b5','#5c6bc0','#7986cb', '#9fa8da','#c5cae9','#e8eaf6', '#536dfe'];

  pieChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: []
  };

  pieChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        bodyColor: '#fff',
        callbacks: {
          label: (context) => {
            const value = context.raw as number;
            const total = context.chart.data.datasets[0].data.reduce((a, b) => (a as number) + (b as number), 0) as number;
            const percentage = Math.round((value / total) * 100);
            return `${context.label}: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)} (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1200,
      easing: 'easeOutQuart',
    },
  };

  constructor( private meta: Meta) {
    this.meta.addTags([
      { name: 'description', content: 'Visual breakdown of this month’s expenses categorized by payment method in Alpha Vault.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['methodData']) {
      this.updateChart();
    }
  }

  updateChart(): void {
    this.isLoading = true;
    this.rawData = this.methodData || {};

    const labels = Object.keys(this.rawData);
    const values = Object.values(this.rawData);
    this.hasData = labels.length > 0 && values.some(v => v > 0);

    if (this.hasData) {
      const sorted = labels.map((label, i) => ({ label, value: values[i] }))
                           .sort((a, b) => b.value - a.value);
      const newLabels = sorted.map(d => d.label);
      const newData = sorted.map(d => d.value);

      this.pieChartLabels = newLabels;
      this.pieChartData = {
        labels: newLabels,
        datasets: [
          {
            data: newData,
            backgroundColor: this.colorPalette,
            hoverBackgroundColor: this.colorPalette.map(color =>
              this.adjustBrightness(color, 20)
            ),
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverBorderColor: '#ffffff',
            hoverOffset: 7,
          }
        ]
      };
    } else {
      this.pieChartData = {
        labels: [],
        datasets: []
      };
    }

    this.isLoading = false;
  }

  getBackgroundColor(i: number): string {
    return this.colorPalette[i % this.colorPalette.length];
  }

  getValueForLabel(label: string): number {
    return this.rawData[label] || 0;
  }

  private adjustBrightness(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + percent);
    const g = Math.min(255, ((num >> 8) & 0x00FF) + percent);
    const b = Math.min(255, (num & 0x0000FF) + percent);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}
