/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseMethodChartComponent
  @description Expense method chart component for displaying expense data
*/  

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, Input, OnChanges, OnInit, signal, SimpleChanges } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-expense-method-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './expense-method-chart.component.html',
  styleUrls: ['./expense-method-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseMethodChartComponent implements OnInit, OnChanges {
  @Input() methodData: Record<string, number> = {};

  private readonly methodDataSignal = signal<Record<string, number>>({});
  
  readonly rawData = computed(() => this.methodDataSignal());
  readonly hasData = computed(() => {
    const data = this.rawData();
    const labels = Object.keys(data);
    const values = Object.values(data);
    return labels.length > 0 && values.some(v => v > 0);
  });
  
  readonly pieChartLabels = computed(() => {
    const data = this.rawData();
    const labels = Object.keys(data);
    const values = Object.values(data);
    
    if (labels.length === 0 || !values.some(v => v > 0)) {
      return [];
    }
    
    const sorted = labels.map((label, i) => ({ label, value: values[i] }))
                         .sort((a, b) => b.value - a.value);
    return sorted.map(d => d.label);
  });

  readonly pieChartData = computed(() => {
    const data = this.rawData();
    const labels = Object.keys(data);
    const values = Object.values(data);
    
    if (labels.length === 0 || !values.some(v => v > 0)) {
      return { labels: [], datasets: [] };
    }
    
    const sorted = labels.map((label, i) => ({ label, value: values[i] }))
                         .sort((a, b) => b.value - a.value);
    const newLabels = sorted.map(d => d.label);
    const newData = sorted.map(d => d.value);

    return {
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
  });

  readonly colorPalette = ['#3f51b5', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#93c5fd', '#bfdbfe'];

  readonly pieChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 1,
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

  private meta = inject(Meta);

  constructor() {
    this.meta.addTags([
      { name: 'description', content: 'Visual breakdown of current month expenses categorized by payment method in Alpha Vault.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]);
  }

  ngOnInit(): void {
    this.methodDataSignal.set(this.methodData || {});
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['methodData']) {
      this.methodDataSignal.set(this.methodData || {});
    }
  }

  trackByLabel = (index: number, label: string): string => label;

  getBackgroundColor(i: number): string {
    return this.colorPalette[i % this.colorPalette.length];
  }

  getValueForLabel(label: string): number {
    return this.rawData()[label] || 0;
  }

  onLegendItemActivate(event: Event, label: string): void {
    if (event instanceof KeyboardEvent) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        // Handle legend item activation if needed
      }
    } else {
      // Handle click event
    }
  }

  private adjustBrightness(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + percent);
    const g = Math.min(255, ((num >> 8) & 0x00FF) + percent);
    const b = Math.min(255, (num & 0x0000FF) + percent);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}
