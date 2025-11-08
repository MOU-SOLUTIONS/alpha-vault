/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ProgressRingComponent
  @description Optimized progress ring visualization with smooth animations
*/

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

interface ProgressRingData {
  percentage: number;
  color: string;
  glowColor: string;
  level: string;
  totalSpent: number;
}

@Component({
  selector: 'app-progress-ring',
  standalone: true,
  template: `
    <div class="progress-ring">
      <svg 
        class="progress-svg" 
        viewBox="0 0 120 120" 
        aria-label="Budget progress visualization"
        role="img"
        [attr.aria-valuenow]="data().percentage"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-live="polite"
      >
        <circle 
          class="progress-bg" 
          cx="60" 
          cy="60" 
          r="50" 
          fill="none" 
          stroke="#e5e7eb" 
          stroke-width="8"
        />
        <circle 
          class="progress-fill" 
          [class]="data().level"
          cx="60" 
          cy="60" 
          r="50" 
          fill="none" 
          [style.stroke-dasharray]="314"
          [style.stroke-dashoffset]="dashOffset()"
          stroke-width="8"
          stroke-linecap="round"
          [style.stroke]="data().color"
        />
        <circle 
          class="progress-glow" 
          cx="60" 
          cy="60" 
          r="50" 
          fill="none" 
          [style.stroke-dasharray]="314"
          [style.stroke-dashoffset]="dashOffset()"
          stroke-width="12"
          stroke-linecap="round"
          [style.stroke]="data().glowColor"
          opacity="0.3"
        />
      </svg>
      <div class="progress-center">
        <div class="center-content">
          <span class="center-value">{{ formattedCurrency() }}</span>
          <span class="center-label">spent</span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./progress-ring.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressRingComponent {
  readonly data = input.required<ProgressRingData>();

  readonly dashOffset = computed(() => {
    const percentage = this.data().percentage;
    return 314 - (314 * percentage / 100);
  });

  readonly formattedCurrency = computed(() => 
    this.getFormattedCurrency(this.data().totalSpent)
  );

  private getFormattedCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
}
