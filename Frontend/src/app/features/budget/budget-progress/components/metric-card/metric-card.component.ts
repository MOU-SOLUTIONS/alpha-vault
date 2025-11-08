/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component MetricCardComponent
  @description Optimized metric card with keyboard accessibility
*/

import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

interface MetricCardData {
  id: string;
  title: string;
  value: number;
  trend: {
    direction: 'up' | 'down' | 'stable' | 'excellent' | 'good' | 'warning' | 'danger' | 'critical' | 'positive' | 'negative';
    percentage: number;
    text: string;
  };
  icon: string;
  isNegative?: boolean;
}

@Component({
  selector: 'app-metric-card',
  standalone: true,
  template: `
    <div 
      class="metric-card"
      [class.hovered]="isHovered()"
      [class.negative]="data().isNegative"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
      (keydown)="onKeydown($event)"
      role="button"
      tabindex="0"
      [attr.aria-label]="data().title + ' - ' + formattedValue()"
      [attr.aria-describedby]="'trend-' + data().id"
    >
      <div class="card-header">
        <div class="card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="data().icon"/>
          </svg>
        </div>
        <h3 class="card-title">{{ data().title }}</h3>
      </div>
      <div class="card-content">
        <div class="card-value" [class.negative]="data().isNegative">
          {{ formattedValue() }}
        </div>
        <div class="card-trend">
          <span 
            class="trend-indicator" 
            [class]="data().trend.direction"
            [id]="'trend-' + data().id"
          >
            <span class="sr-only">{{ getTrendDescription(data().trend.direction) }}</span>
            <span aria-hidden="true">{{ getTrendVisual(data().trend.direction) }}</span>
            {{ data().trend.text }}
          </span>
        </div>
      </div>
      <div class="card-glow"></div>
    </div>
  `,
  styleUrls: ['./metric-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricCardComponent {
  readonly data = input.required<MetricCardData>();
  readonly isHovered = input(false);

  readonly hoverChange = output<string | null>();

  readonly formattedValue = computed(() => 
    this.getFormattedCurrency(this.data().value)
  );

  onMouseEnter(): void {
    this.hoverChange.emit(this.data().id);
  }

  onMouseLeave(): void {
    this.hoverChange.emit(null);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.hoverChange.emit(this.data().id);
    }
  }

  private getFormattedCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  getTrendDescription(direction: string): string {
    switch (direction) {
      case 'up': return 'Increasing';
      case 'down': return 'Decreasing';
      default: return 'Stable';
    }
  }

  getTrendVisual(direction: string): string {
    switch (direction) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  }
}
