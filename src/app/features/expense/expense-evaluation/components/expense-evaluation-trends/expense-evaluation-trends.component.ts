/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseEvaluationTrendsComponent
  @description Expense evaluation trends component for displaying expense data
*/

/* ===== IMPORTS ===== */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/* ===== COMPONENT ===== */
@Component({
  selector: 'app-expense-evaluation-trends',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="trends-section" role="region" aria-labelledby="trends-title">
      <header class="section-header">
        <h2 id="trends-title" class="section-title">
          <span class="title-icon" aria-hidden="true">📊</span>
          Expense Trends
        </h2>
        <div class="trend-indicator" 
             [class]="trendClass" 
             [attr.aria-label]="trendAriaLabel"
             tabindex="0"
             (keydown.enter)="onTrendIndicatorActivate()"
             (keydown.space)="onTrendIndicatorActivate()">
          <span class="trend-arrow" [attr.aria-hidden]="true">{{ trendIcon }}</span>
          {{ trendDisplay }}
        </div>
      </header>
      <div class="trends-grid">
        <article class="trend-card primary" 
                 role="img" 
                 [attr.aria-label]="monthlyGrowthAriaLabel"
                 tabindex="0"
                 (keydown.enter)="onCardActivate('monthly')"
                 (keydown.space)="onCardActivate('monthly')">
          <header class="card-header">
            <h3>Monthly Growth</h3>
            <div class="card-icon" aria-hidden="true">📈</div>
          </header>
          <div class="card-content">
            <div class="metric-display">
              <div class="metric-value">{{ monthlyGrowthDisplay }}</div>
              <div class="metric-change" 
                   [class]="monthlyGrowthClass" 
                   [attr.aria-label]="monthlyGrowthChangeAriaLabel">
                {{ monthlyGrowthChangeDisplay }}
              </div>
            </div>
            <div class="progress-bar" 
                 role="progressbar" 
                 [attr.aria-valuenow]="monthlyGrowth" 
                 aria-valuemin="0" 
                 aria-valuemax="100"
                 [attr.aria-label]="monthlyGrowthProgressAriaLabel">
              <div class="progress-fill" [style.width.%]="monthlyGrowthProgress"></div>
            </div>
          </div>
        </article>

        <article class="trend-card secondary"
                 role="img" 
                 [attr.aria-label]="consistencyAriaLabel"
                 tabindex="0"
                 (keydown.enter)="onCardActivate('consistency')"
                 (keydown.space)="onCardActivate('consistency')">
          <header class="card-header">
            <h3>Consistency Score</h3>
            <div class="card-icon" aria-hidden="true">🎯</div>
          </header>
          <div class="card-content">
            <div class="metric-display">
              <div class="metric-value">{{ consistencyDisplay }}</div>
              <div class="metric-change" 
                   [class]="consistencyClass" 
                   [attr.aria-label]="consistencyChangeAriaLabel">
                {{ consistencyChangeDisplay }}
              </div>
            </div>
            <div class="progress-bar" 
                 role="progressbar" 
                 [attr.aria-valuenow]="consistencyScore" 
                 aria-valuemin="0" 
                 aria-valuemax="100"
                 [attr.aria-label]="consistencyProgressAriaLabel">
              <div class="progress-fill" [style.width.%]="consistencyScore"></div>
            </div>
          </div>
        </article>

        <article class="trend-card accent"
                 role="img" 
                 [attr.aria-label]="diversificationAriaLabel"
                 tabindex="0"
                 (keydown.enter)="onCardActivate('diversification')"
                 (keydown.space)="onCardActivate('diversification')">
          <header class="card-header">
            <h3>Diversification</h3>
            <div class="card-icon" aria-hidden="true">🌐</div>
          </header>
          <div class="card-content">
            <div class="metric-display">
              <div class="metric-value">{{ diversificationDisplay }}</div>
              <div class="metric-change" 
                   [class]="diversificationClass" 
                   [attr.aria-label]="diversificationChangeAriaLabel">
                {{ diversificationChangeDisplay }}
              </div>
            </div>
            <div class="progress-bar" 
                 role="progressbar" 
                 [attr.aria-valuenow]="diversificationScore" 
                 aria-valuemin="0" 
                 aria-valuemax="100"
                 [attr.aria-label]="diversificationProgressAriaLabel">
              <div class="progress-fill" [style.width.%]="diversificationScore"></div>
            </div>
            <div *ngIf="showAchievementBadge" 
                 class="achievement-badge" 
                 role="status" 
                 aria-live="polite">
              Excellent Diversification!
            </div>
          </div>
        </article>
      </div>
    </section>
  `,
  styleUrls: ['./expense-evaluation-trends.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseEvaluationTrendsComponent {
  @Input() trend = 0;
  @Input() monthlyGrowth = 0;
  @Input() consistencyScore = 0;
  @Input() diversificationScore = 0;

  /* ===== GETTERS ===== */
  get trendClass(): string {
    return this.getTrendClass(this.trend);
  }

  get trendIcon(): string {
    return this.getTrendIcon(this.trend);
  }

  get trendDisplay(): string {
    return `${this.trend >= 0 ? '+' : ''}${this.trend.toFixed(2)}%`;
  }

  get trendAriaLabel(): string {
    return `Overall trend: ${this.trendDisplay}`;
  }

  get monthlyGrowthClass(): string {
    return this.getTrendClass(this.monthlyGrowth);
  }

  get monthlyGrowthDisplay(): string {
    return `${this.monthlyGrowth.toFixed(2)}%`;
  }

  get monthlyGrowthChangeDisplay(): string {
    return `${this.monthlyGrowth > 0 ? '+' : ''}${this.monthlyGrowth.toFixed(2)}%`;
  }

  get monthlyGrowthAriaLabel(): string {
    return `Monthly growth: ${this.monthlyGrowthDisplay}`;
  }

  get monthlyGrowthChangeAriaLabel(): string {
    return `Change: ${this.monthlyGrowthChangeDisplay}`;
  }

  get monthlyGrowthProgressAriaLabel(): string {
    return `Progress: ${this.monthlyGrowth}% of maximum`;
  }

  get monthlyGrowthProgress(): number {
    return this.calculateMetricScore(this.monthlyGrowth, 20);
  }

  get consistencyClass(): string {
    return this.getTrendClass(this.consistencyScore);
  }

  get consistencyDisplay(): string {
    return `${this.consistencyScore.toFixed(2)}%`;
  }

  get consistencyChangeDisplay(): string {
    return `${this.consistencyScore > 0 ? '+' : ''}${this.consistencyScore.toFixed(2)}%`;
  }

  get consistencyAriaLabel(): string {
    return `Consistency score: ${this.consistencyDisplay}`;
  }

  get consistencyChangeAriaLabel(): string {
    return `Change: ${this.consistencyChangeDisplay}`;
  }

  get consistencyProgressAriaLabel(): string {
    return `Progress: ${this.consistencyScore}% of maximum`;
  }

  get diversificationClass(): string {
    return this.getTrendClass(this.diversificationScore);
  }

  get diversificationDisplay(): string {
    return `${this.diversificationScore.toFixed(2)}%`;
  }

  get diversificationChangeDisplay(): string {
    return `${this.diversificationScore > 0 ? '+' : ''}${this.diversificationScore.toFixed(2)}%`;
  }

  get diversificationAriaLabel(): string {
    return `Diversification score: ${this.diversificationDisplay}`;
  }

  get diversificationChangeAriaLabel(): string {
    return `Change: ${this.diversificationChangeDisplay}`;
  }

  get diversificationProgressAriaLabel(): string {
    return `Progress: ${this.diversificationScore}% of maximum`;
  }

  get showAchievementBadge(): boolean {
    return this.diversificationScore > 80;
  }

  /* ===== METHODS ===== */
  getTrendClass(value: number): string {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
  }

  getTrendIcon(value: number): string {
    if (value > 0) return '↗';
    if (value < 0) return '↘';
    return '→';
  }

  calculateMetricScore(metric: number, maxValue: number): number {
    return Math.min((metric / maxValue) * 100, 100);
  }

  onTrendIndicatorActivate(): void {
    /* Handle trend indicator activation */
  }

  onCardActivate(cardType: 'monthly' | 'consistency' | 'diversification'): void {
    /* Handle card activation */
  }
}
