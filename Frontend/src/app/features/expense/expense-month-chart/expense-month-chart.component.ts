// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-expense-month-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './expense-month-chart.component.html',
  styleUrls: ['./expense-month-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseMonthChartComponent implements OnInit, OnChanges {
  @Input() monthlyData: number[] = [];
  @Input() isLoading: boolean = false;

  isLineChart: boolean = true;
  chartType: ChartType = 'line';

  monthLabels: string[] = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  monthlyTotal: number = 0;
  monthlyAverage: number = 0;

  chartData!: ChartData;
  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(63, 81, 181, 0.9)',
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

  constructor(private meta: Meta) {}

  ngOnInit(): void {
    this.meta.updateTag({
      name: 'description',
      content: 'Chart representing monthly expense breakdown on Alpha Vault.',
    });
    this.meta.updateTag({
      name: 'keywords',
      content: 'monthly expense, Alpha Vault, finance stats, charts',
    });

    this.updateChartData(this.monthlyData?.length ? this.monthlyData : new Array(12).fill(0));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['monthlyData'] && !changes['monthlyData'].firstChange) {
      this.updateChartData(this.monthlyData);
    }
  }

  updateChartData(values: number[]): void {
    const data = values.length < 12 ? [...values, ...Array(12 - values.length).fill(0)] : values.slice(0, 12);
    this.monthlyTotal = data.reduce((sum, val) => sum + val, 0);
    this.monthlyAverage = this.monthlyTotal / (data.filter(v => v > 0).length || 1);

    const max = Math.max(...data, 1);
    const backgroundColors = data.map(value => `rgba(63, 81, 181, ${Math.min(0.2 + (value / max) * 0.3, 0.5)}`);

    this.chartData = this.isLineChart
      ? {
          labels: this.monthLabels,
          datasets: [{
            label: 'Monthly Expenses',
            data,
            fill: true,
            backgroundColor: 'rgba(63, 81, 181, 0.2)',
            borderColor: 'rgba(63, 81, 181, 1)',
            pointBackgroundColor: 'rgba(63, 81, 181, 1)',
            borderWidth: 2,
            pointRadius: 4,
            tension: 0.4,
          }],
        }
      : {
          labels: this.monthLabels,
          datasets: [{
            label: 'Monthly Expenses',
            data,
            backgroundColor: backgroundColors,
            borderColor: 'rgba(63, 81, 181, 1)',
            borderWidth: 2,
            borderRadius: 4,
            hoverBackgroundColor: 'rgba(63, 81, 181, 0.6)',
            barThickness: 'flex',
            maxBarThickness: 35,
          }],
        };
  }

  toggleChartType(): void {
    this.isLineChart = !this.isLineChart;
    this.chartType = this.isLineChart ? 'line' : 'bar';
    this.updateChartData(this.monthlyData);
  }

  refreshData(): void {
    this.isLoading = true;
    setTimeout(() => {
      const newData = this.monthlyData.map(v => Math.max(v * (0.8 + Math.random() * 0.4), 0));
      this.updateChartData(newData);
      this.isLoading = false;
    }, 800);
  }
}
