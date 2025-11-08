/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component IncomeSourceChartComponent
  @description Income source chart component for displaying income data
*/    

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-income-source-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './income-source-chart.component.html',
  styleUrls: ['./income-source-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomeSourceChartComponent implements OnChanges {
  @Input() sourceData: Record<string, number> = {};

  rawData: Record<string, number> = {};
  hasData = false;

  pieChartLabels: string[] = [];
  colorPalette = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#93c5fd', '#bfdbfe'];

  pieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: []
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 1,
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
            return `${context.label}: ${new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(value)} (${percentage}%)`;
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
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    this.meta.addTags([
      { name: 'description', content: 'Visual breakdown of current month income categorized by source in Alpha Vault.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sourceData']) {
      this.updateChart();
    }
    this.cdr.markForCheck();
  }

  updateChart(): void {
    this.rawData = this.sourceData || {};

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

    this.cdr.markForCheck();
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
