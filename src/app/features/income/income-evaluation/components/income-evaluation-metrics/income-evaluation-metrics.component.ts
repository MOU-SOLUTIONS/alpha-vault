/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component IncomeEvaluationMetricsComponent
  @description Income evaluation metrics component for displaying income data
*/

import { CommonModule, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject,Input } from '@angular/core';

/* ===== COMPONENT ===== */
@Component({
  selector: 'app-income-evaluation-metrics',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  template: `
    <section class="metrics-section" role="region" aria-labelledby="metrics-title">
      <header class="section-header">
        <h2 id="metrics-title" class="section-title">
          <span class="title-icon" aria-hidden="true">📊</span>
          Performance Metrics
        </h2>
      </header>
      <div class="metrics-list">
        <article class="metric-row" 
                 tabindex="0" 
                 role="button"
                 [attr.aria-label]="'Income Efficiency: ' + efficiency + '%'"
                 (keydown.enter)="onMetricActivate('efficiency')"
                 (keydown.space)="onMetricActivate('efficiency')">
          <div class="metric-icon" aria-hidden="true">💰</div>
          <div class="metric-info">
            <h3>Income Efficiency</h3>
            <div class="metric-score">
              <div class="score-bar" role="progressbar" [attr.aria-valuenow]="efficiency" aria-valuemin="0" aria-valuemax="100" [attr.aria-label]="'Income Efficiency: ' + efficiency + '%'">
                <div class="score-fill" [style.width.%]="efficiency"></div>
              </div>
              <div class="score-value">{{ efficiency | number:'1.2-2' }}%</div>
            </div>
          </div>
        </article>

        <article class="metric-row" 
                 tabindex="0" 
                 role="button"
                 [attr.aria-label]="'Growth Potential: ' + growthPotential + '%'"
                 (keydown.enter)="onMetricActivate('growthPotential')"
                 (keydown.space)="onMetricActivate('growthPotential')">
          <div class="metric-icon" aria-hidden="true">📈</div>
          <div class="metric-info">
            <h3>Growth Potential</h3>
            <div class="metric-score">
              <div class="score-bar" role="progressbar" [attr.aria-valuenow]="growthPotential" aria-valuemin="0" aria-valuemax="100" [attr.aria-label]="'Growth Potential: ' + growthPotential + '%'">
                <div class="score-fill" [style.width.%]="growthPotential"></div>
              </div>
              <div class="score-value">{{ growthPotential | number:'1.2-2' }}%</div>
            </div>
          </div>
        </article>

        <article class="metric-row" 
                 tabindex="0" 
                 role="button"
                 [attr.aria-label]="'Performance Score: ' + goalAlignment + '%'"
                 (keydown.enter)="onMetricActivate('goalAlignment')"
                 (keydown.space)="onMetricActivate('goalAlignment')">
          <div class="metric-icon" aria-hidden="true">🎯</div>
          <div class="metric-info">
            <h3>Performance Score</h3>
            <div class="metric-score">
              <div class="score-bar" role="progressbar" [attr.aria-valuenow]="goalAlignment" aria-valuemin="0" aria-valuemax="100" [attr.aria-label]="'Performance Score: ' + goalAlignment + '%'">
                <div class="score-fill" [style.width.%]="goalAlignment"></div>
              </div>
              <div class="score-value">{{ goalAlignment | number:'1.2-2' }}%</div>
            </div>
          </div>
        </article>

        <article class="metric-row" 
                 tabindex="0" 
                 role="button"
                 [attr.aria-label]="'Stability Index: ' + stabilityIndex + '%'"
                 (keydown.enter)="onMetricActivate('stabilityIndex')"
                 (keydown.space)="onMetricActivate('stabilityIndex')">
          <div class="metric-icon" aria-hidden="true">⚡</div>
          <div class="metric-info">
            <h3>Stability Index</h3>
            <div class="metric-score">
              <div class="score-bar" role="progressbar" [attr.aria-valuenow]="stabilityIndex" aria-valuemin="0" aria-valuemax="100" [attr.aria-label]="'Stability Index: ' + stabilityIndex + '%'">
                <div class="score-fill" [style.width.%]="stabilityIndex"></div>
              </div>
              <div class="score-value">{{ stabilityIndex | number:'1.2-2' }}%</div>
            </div>
          </div>
        </article>
      </div>
    </section>
  `,
  styleUrls: ['./income-evaluation-metrics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomeEvaluationMetricsComponent {
  /* ===== INPUTS ===== */
  @Input() efficiency = 0;
  @Input() growthPotential = 0;
  @Input() goalAlignment = 0;
  @Input() stabilityIndex = 0;

  /* ===== DEPENDENCIES ===== */
  private readonly cdr = inject(ChangeDetectorRef);

  /* ===== METHODS ===== */   
  onMetricActivate(metricType: string): void {
    /* Future: Add analytics tracking or detailed view navigation */
  }
}
