// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Component, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-income-week-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './income-week-chart.component.html',
  styleUrls: ['./income-week-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomeWeekChartComponent implements OnChanges {
  @Input() weeklyData: number[] = [];
  @Input() isLoading: boolean = false;

  isLineChart: boolean = false;
  chartType: ChartType = 'bar';

  weekLabels: string[] = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
  weeklyTotal: number = 0;
  weeklyAverage: number = 0;

  chartData!: ChartData;
  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(99, 102, 241, 0.9)',
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        callbacks: {
          label: (ctx) => `$${ctx.raw}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          font: { size: 11 },
          callback: (value) => '$' + value,
        },
      },
    },
    hover: {
      mode: 'index',
      intersect: false,
    },
  };

  constructor( private meta: Meta) {
    this.meta.addTags([
      { name: 'description', content: 'Chart representing weekly income distribution on Alpha Vault.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['weeklyData'] && !changes['weeklyData'].firstChange) {
      this.updateChartData(this.weeklyData);
    }
  }

  updateChartData(values: number[]): void {
    const data = values.length < 5 ? [...values, ...Array(5 - values.length).fill(0)] : values.slice(0, 5);
    this.weeklyTotal = data.reduce((sum, val) => sum + val, 0);
    this.weeklyAverage = this.weeklyTotal / (data.filter(v => v > 0).length || 1);

    const max = Math.max(...data, 1);
    const backgroundColors = data.map(value => `rgba(99, 102, 241, ${Math.min(0.2 + (value / max) * 0.3, 0.5)}`);

    this.chartData = this.isLineChart
      ? {
          labels: this.weekLabels,
          datasets: [{
            label: 'Weekly Income',
            data,
            fill: true,
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            borderColor: 'rgba(99, 102, 241, 1)',
            pointBackgroundColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 2,
            pointRadius: 4,
            tension: 0.4,
          }],
        }
      : {
          labels: this.weekLabels,
          datasets: [{
            label: 'Weekly Income',
            data,
            backgroundColor: backgroundColors,
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 2,
            borderRadius: 4,
            hoverBackgroundColor: 'rgba(99, 102, 241, 0.6)',
            barThickness: 'flex',
            maxBarThickness: 35,
          }],
        };
  }

  toggleChartType(): void {
    this.isLineChart = !this.isLineChart;
    this.chartType = this.isLineChart ? 'line' : 'bar';
    this.updateChartData(this.weeklyData);
  }

  refreshData(): void {
    this.isLoading = true;
    setTimeout(() => {
      const newData = this.weeklyData.map(v => Math.max(v * (0.8 + Math.random() * 0.4), 0));
      this.updateChartData(newData);
      this.isLoading = false;
    }, 800);
  }
}
