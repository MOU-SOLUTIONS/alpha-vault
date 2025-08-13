// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Component, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-income-top5',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './income-top5.component.html',
  styleUrls: ['./income-top5.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomeTop5Component implements OnChanges {
  @Input() topIncomes: { category: string; amount: number }[] = [];
  shouldPulse = false;
  private categoryColors: Record<string, string> = {};

  constructor( private meta: Meta) {
    this.meta.addTags([
      { name: 'description', content: 'Top 5 income categories ranked by amount in Alpha Vault.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['topIncomes'] && !changes['topIncomes'].firstChange) {
      this.shouldPulse = true;
      setTimeout(() => (this.shouldPulse = false), 1000);
    }

    if (this.topIncomes?.length > 0) {
      this.topIncomes = [...this.topIncomes].sort((a, b) => b.amount - a.amount);
      this.assignDynamicColors();
    }
  }

  getCategoryLabel(category: string): string {
    return category;
  }

  getCategoryColor(category: string): string {
    return this.categoryColors[category] || '#999999';
  }

  private assignDynamicColors(): void {
    const palette = ['#6366f1', '#8b5cf6', '#34d399', '#f59e0b', '#ec4899'];
    this.categoryColors = {};

    this.topIncomes.forEach((item, i) => {
      if (!this.categoryColors[item.category]) {
        this.categoryColors[item.category] = palette[i % palette.length];
      }
    });
  }

  trackByIndex(index: number): number {
    return index;
  }
}
