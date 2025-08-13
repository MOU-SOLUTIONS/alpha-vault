// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta} from '@angular/platform-browser';

type ExpenseKey = 'dayExpense' | 'weekExpense' | 'monthExpense' | 'yearExpense';

@Component({
  selector: 'app-expense-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expense-widget.component.html',
  styleUrls: ['./expense-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpenseWidgetComponent {
  @Input() dayExpense: number = 0;
  @Input() weekExpense: number = 0;
  @Input() monthExpense: number = 0;
  @Input() yearExpense: number = 0;

  @Input() seoDescription?: string;

  readonly cards: { label: string; icon: string; key: ExpenseKey; class: string }[] = [
    { label: 'Today', icon: 'fa-calendar-day', key: 'dayExpense', class: 'today' },
    { label: 'This Week', icon: 'fa-calendar-week', key: 'weekExpense', class: 'week' },
    { label: 'This Month', icon: 'fa-calendar-alt', key: 'monthExpense', class: 'month' },
    { label: 'This Year', icon: 'fa-calendar', key: 'yearExpense', class: 'year' },
  ];

  constructor(private meta: Meta) {
    this.meta.addTags([
      { name: 'description', content: this.seoDescription || 'Expense widget displaying daily, weekly, monthly, and yearly expenses.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]);
  }

  getExpenseValue(key: ExpenseKey): number {
    return this[key];
  }

  trackByKey(index: number, item: { key: ExpenseKey }): ExpenseKey {
    return item.key;
  }
}
