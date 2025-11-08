/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component IncomeWeekChartComponent
  @description Income week chart component for displaying income data
*/  

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, Input, OnChanges, OnDestroy, OnInit, signal, SimpleChanges } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { IncomeService } from '../../../core/services/income.service';

@Component({
  selector: 'app-income-week-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './income-week-chart.component.html',
  styleUrls: ['./income-week-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomeWeekChartComponent implements OnChanges, OnInit, OnDestroy {
  @Input() weeklyData: number[] = [];
  @Input() lazyLoad = false;

  private readonly isLineChartSignal = signal<boolean>(false);
  private readonly weeklyDataSignal = signal<number[]>([]);

  readonly isLineChart = this.isLineChartSignal.asReadonly();
  readonly chartType = computed(() => this.isLineChart() ? 'line' : 'bar');
  readonly weekLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];

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
    const backgroundColors = values.map(value => `rgba(99, 102, 241, ${Math.min(0.2 + (value / max) * 0.3, 0.5)}`);

    return this.isLineChart()
      ? {
          labels: this.weekLabels,
          datasets: [{
            label: 'Weekly Income',
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
          labels: this.weekLabels,
          datasets: [{
            label: 'Weekly Income',
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
  chartOptions: ChartOptions = {
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
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    this.meta.addTags([
      { name: 'description', content: 'Chart representing weekly income distribution on Alpha Vault.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]);
  }

  ngOnInit(): void {
    if (this.lazyLoad) {
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

    setTimeout(() => {
      const chartElement = document.querySelector('app-income-week-chart');
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
    this.incomeService.getWeeklyIncomes(userId).pipe(
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
