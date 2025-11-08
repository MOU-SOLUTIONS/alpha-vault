/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseWeekChartComponent
  @description Expense week chart component for displaying expense data
*/  

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, Input, OnChanges, OnDestroy, OnInit, signal, SimpleChanges } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { ExpenseService } from '../../../core/services/expense.service';

@Component({
  selector: 'app-expense-week-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './expense-week-chart.component.html',
  styleUrls: ['./expense-week-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseWeekChartComponent implements OnChanges, OnInit, OnDestroy {
  @Input() weeklyData: number[] = [];
  @Input() lazyLoad = false; // Add lazy loading option

  // Convert to signals for better performance
  private readonly isLineChartSignal = signal<boolean>(false);
  private readonly weeklyDataSignal = signal<number[]>([]);

  readonly isLineChart = this.isLineChartSignal.asReadonly();
  readonly chartType = computed(() => this.isLineChart() ? 'line' : 'bar');
  readonly weekLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];

  // Computed signals for better performance
  readonly weeklyTotal = computed(() => {
    const data = this.weeklyDataSignal();
    const values = data.length < 5 ? [...data, ...Array(5 - data.length).fill(0)] : data.slice(0, 5);
    return values.reduce((sum, val) => sum + val, 0);
  });

  readonly weeklyAverage = computed(() => {
    const data = this.weeklyDataSignal();
    const values = data.length < 5 ? [...data, ...Array(5 - data.length).fill(0)] : data.slice(0, 5);
    const total = this.weeklyTotal();
    const positiveValues = values.filter(v => v > 0);
    return positiveValues.length > 0 ? total / positiveValues.length : 0;
  });

  readonly chartData = computed(() => {
    const data = this.weeklyDataSignal();
    const values = data.length < 5 ? [...data, ...Array(5 - data.length).fill(0)] : data.slice(0, 5);
    const max = Math.max(...values, 1);
    const backgroundColors = values.map(value => `rgba(63, 81, 181, ${Math.min(0.2 + (value / max) * 0.3, 0.5)}`);

    return this.isLineChart()
      ? {
          labels: this.weekLabels,
          datasets: [{
            label: 'Weekly Expenses',
            data: values,
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
          labels: this.weekLabels,
          datasets: [{
            label: 'Weekly Expenses',
            data: values,
            backgroundColor: backgroundColors,
            borderColor: 'rgba(63, 81, 181, 1)',
            borderWidth: 2,
            borderRadius: 4,
            hoverBackgroundColor: 'rgba(63, 81, 181, 0.6)',
            barThickness: 'flex',
            maxBarThickness: 35,
          }],
        };
  });
  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 0,
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

  private readonly destroy$ = new Subject<void>();
  private readonly meta = inject(Meta);
  private readonly expenseService = inject(ExpenseService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    this.meta.addTags([
      { name: 'description', content: 'Chart representing weekly expense distribution on Alpha Vault.' },
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
      const chartElement = document.querySelector('app-expense-week-chart');
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
        this.loadWeeklyData(userId);
      } else {
        this.weeklyDataSignal.set([]);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['weeklyData'] && !changes['weeklyData'].firstChange) {
      this.weeklyDataSignal.set(this.weeklyData);
    }
  }

  private loadWeeklyData(userId: number): void {
    this.expenseService.getExpenseForWeeksOfCurrentMonth().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data: number[]) => {
        this.weeklyDataSignal.set(data || []);
      },
      error: () => {
        this.weeklyDataSignal.set([]);
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
