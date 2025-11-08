/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component IncomeEvaluationInsightsComponent
  @description Income evaluation insights component for displaying income data
*/

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/* ===== INTERFACES ===== */
export interface Insight {
  id: number;
  icon: string;
  title: string;
  description: string;
}

/* ===== COMPONENT ===== */
@Component({
  selector: 'app-income-evaluation-insights',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="insights-section" role="region" aria-labelledby="insights-title">
      <header class="section-header">
        <h2 id="insights-title" class="section-title">
          <span class="title-icon" aria-hidden="true">💡</span>
          Smart Insights
        </h2>
      </header>
      <div class="insights-grid" role="list" aria-label="Smart insights and recommendations">
        <article 
          *ngFor="let insight of insights; trackBy: trackByInsight" 
          class="insight-card"
          role="listitem"
          tabindex="0"
          [attr.aria-label]="insight.title + ': ' + insight.description"
          (click)="onInsightClick(insight)"
          (keydown.enter)="onInsightClick(insight)"
          (keydown.space)="onInsightClick(insight)">
          <div class="insight-icon" aria-hidden="true">{{ insight.icon || '💡' }}</div>
          <div class="insight-content">
            <h3>{{ insight.title }}</h3>
            <p>{{ insight.description }}</p>
          </div>
        </article>
      </div>
    </section>
  `,
  styleUrls: ['./income-evaluation-insights.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomeEvaluationInsightsComponent {
  @Input() insights: Insight[] = [];

  /* ===== METHODS ===== */
  trackByInsight(index: number, insight: Insight): number {
    return insight.id;
  }

  onInsightClick(insight: Insight): void {
    /* Handle insight click - could emit event or perform action */
  }
}
