// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Component, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta } from '@angular/platform-browser';
import { EXPENSE_CATEGORY_OPTIONS } from '../../../enums/expense-category';

@Component({
  selector: 'app-expense-top5',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expense-top5.component.html',
  styleUrls: ['./expense-top5.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseTop5Component implements OnChanges {
  @Input() topExpenses: { category: string; amount: number }[] = [];
  shouldPulse = false;
  private categoryColors: Record<string, string> = {};

  constructor( private meta: Meta) {
    this.meta.addTags([
      { name: 'description', content: 'Top 5 expense categories ranked by amount in Alpha Vault.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['topExpenses'] && !changes['topExpenses'].firstChange) {
      this.shouldPulse = true;
      setTimeout(() => (this.shouldPulse = false), 1000);
    }

    if (this.topExpenses?.length > 0) {
      this.topExpenses = [...this.topExpenses].sort((a, b) => b.amount - a.amount);
      this.assignDynamicColors();
    }
  }

  getCategoryLabel(category: string): string {
    return EXPENSE_CATEGORY_OPTIONS.find(opt => opt.value === category)?.label || category;
  }

  getCategoryColor(category: string): string {
    return this.categoryColors[category] || '#999999';
  }

  private assignDynamicColors(): void {
    const palette = ['#3f51b5', '#f44336', '#4caf50', '#ff9800', '#9c27b0'];
    this.categoryColors = {};

    this.topExpenses.forEach((item, i) => {
      if (!this.categoryColors[item.category]) {
        this.categoryColors[item.category] = palette[i % palette.length];
      }
    });
  }

  trackByIndex(index: number): number {
    return index;
  }
}
