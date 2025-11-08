/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui  
  @component IncomeMonthChartComponent
  @description Income month chart component for displaying income data
*/    

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, Input, OnChanges, OnDestroy, OnInit, signal, SimpleChanges } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { IncomeService } from '../../../core/services/income.service';

@Component({
  selector: 'app-income-month-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './income-month-chart.component.html',
  styleUrls: ['./income-month-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomeMonthChartComponent implements OnChanges, OnInit, OnDestroy {
  @Input() monthlyData: number[] = [];
  @Input() lazyLoad = false; // Add lazy loading option

  private readonly isLineChartSignal = signal<boolean>(true);
  private readonly monthlyDataSignal = signal<number[]>([]);

  readonly isLineChart = this.isLineChartSignal.asReadonly();
  readonly chartType = computed(() => this.isLineChart() ? 'line' : 'bar');

  readonly monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  readonly monthlyTotal = computed(() => {
    const data = this.monthlyDataSignal();
    const values = data.length < 12 ? [...data, ...Array(12 - data.length).fill(0)] : data.slice(0, 12);
    return values.reduce((sum, val) => sum + val, 0);
  });

  readonly monthlyAverage = computed(() => {
    const data = this.monthlyDataSignal();
    const values = data.length < 12 ? [...data, ...Array(12 - data.length).fill(0)] : data.slice(0, 12);
    const total = this.monthlyTotal();
    const positiveValues = values.filter(v => v > 0);
    return positiveValues.length > 0 ? total / positiveValues.length : 0;
  });

  readonly chartData = computed(() => {
    const data = this.monthlyDataSignal();
    const values = data.length < 12 ? [...data, ...Array(12 - data.length).fill(0)] : data.slice(0, 12);
    const max = Math.max(...values, 1);
    const backgroundColors = values.map(value => `rgba(99, 102, 241, ${Math.min(0.2 + (value / max) * 0.3, 0.5)}`);

    return this.isLineChart()
      ? {
          labels: this.monthLabels,
          datasets: [{
            label: 'Monthly Income',
            data: values,
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
          labels: this.monthLabels,
          datasets: [{
            label: 'Monthly Income',
            data: values,
            backgroundColor: backgroundColors,
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 2,
            borderRadius: 4,
            hoverBackgroundColor: 'rgba(99, 102, 241, 0.6)',
            barThickness: 'flex',
            maxBarThickness: 35,
          }],
        };
  });
  readonly chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 0,
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

  private readonly destroy$ = new Subject<void>();
  private readonly meta = inject(Meta);
  private readonly incomeService = inject(IncomeService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.meta.addTags([
      { name: 'description', content: 'Chart representing monthly income distribution on Alpha Vault.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]);
  }

  ngOnInit(): void {
    if (this.lazyLoad) {
      // Use Intersection Observer for lazy loading
      this.setupLazyLoading();
    } else {
      this.loadData();
    }
  }

  private setupLazyLoading(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadData();
          observer.unobserve(entry.target);
        }
      });
    });

    // Observe the chart container
    setTimeout(() => {
      const chartElement = document.querySelector('app-income-month-chart');
      if (chartElement) {
        observer.observe(chartElement);
      }
    }, 100);
  }

  private loadData(): void {
    this.authService.userId$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(userId => {
      if (userId && userId > 0) {
        this.loadMonthlyData(userId);
      } else {
        this.monthlyDataSignal.set([]);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['monthlyData'] && !changes['monthlyData'].firstChange) {
      this.monthlyDataSignal.set(this.monthlyData);
    }
  }

  private loadMonthlyData(userId: number): void {
    this.incomeService.getYearlyIncomes(userId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data: number[]) => {
        this.monthlyDataSignal.set(data || []);
      },
      error: () => {
        this.monthlyDataSignal.set([]);
      }
    });
  }

  toggleChartType(): void {
    this.isLineChartSignal.set(!this.isLineChart());
  }

  onToggleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleChartType();
    }
  }
}
