// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta } from '@angular/platform-browser';

type IncomeKey = 'dayIncome' | 'weekIncome' | 'monthIncome' | 'yearIncome';

@Component({
  selector: 'app-income-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './income-widget.component.html',
  styleUrls: ['./income-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncomeWidgetComponent {
  @Input() dayIncome: number = 0;
  @Input() weekIncome: number = 0;
  @Input() monthIncome: number = 0;
  @Input() yearIncome: number = 0;

  @Input() seoDescription?: string;

  readonly cards: { label: string; icon: string; key: IncomeKey; class: string }[] = [
    { label: 'Today', icon: 'fa-calendar-day', key: 'dayIncome', class: 'today' },
    { label: 'This Week', icon: 'fa-calendar-week', key: 'weekIncome', class: 'week' },
    { label: 'This Month', icon: 'fa-calendar-alt', key: 'monthIncome', class: 'month' },
    { label: 'This Year', icon: 'fa-calendar', key: 'yearIncome', class: 'year' },
  ];

  constructor(private meta: Meta) {
    this.meta.addTags([
      { name: 'description', content: this.seoDescription || 'Income widget displaying daily, weekly, monthly, and yearly income.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]);
  }

  getExpenseValue(key: IncomeKey): number {
    return this[key];
  }

  trackByKey(index: number, item: { key: IncomeKey }): IncomeKey {
    return item.key;
  }
}
