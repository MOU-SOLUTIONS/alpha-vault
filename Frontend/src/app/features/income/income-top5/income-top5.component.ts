/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component IncomeTop5Component
  @description Income top 5 component for displaying income data
*/  

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, Input, OnChanges, signal, SimpleChanges } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Subject } from 'rxjs';

interface IncomeItem {
  category: string;
  amount: number;
}

@Component({
  selector: 'app-income-top5',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './income-top5.component.html',
  styleUrls: ['./income-top5.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomeTop5Component implements OnChanges {
  @Input() topIncomes: IncomeItem[] = [];

  private readonly topIncomesSignal = signal<IncomeItem[]>([]);
  private readonly shouldPulseSignal = signal<boolean>(false);
  private readonly destroy$ = new Subject<void>();

  readonly sortedIncomes = computed(() => {
    const incomes = this.topIncomesSignal();
    return [...incomes].sort((a, b) => b.amount - a.amount);
  });

  readonly shouldPulse = this.shouldPulseSignal.asReadonly();

  readonly categoryColors = computed(() => {
    const palette = ['#6366f1', '#8b5cf6', '#34d399', '#f59e0b', '#ec4899'];
    const colors: Record<string, string> = {};
    const incomes = this.sortedIncomes();

    incomes.forEach((item, i) => {
      if (!colors[item.category]) {
        colors[item.category] = palette[i % palette.length];
      }
    });

    return colors;
  });

  private readonly meta = inject(Meta);

  constructor() {
    this.meta.addTags([
      { name: 'description', content: 'Top 5 income categories ranked by amount in Alpha Vault.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['topIncomes'] && !changes['topIncomes'].firstChange) {
      this.shouldPulseSignal.set(true);
      const timeoutId = setTimeout(() => this.shouldPulseSignal.set(false), 1000);
      
      // Clean up timeout on destroy
      this.destroy$.subscribe(() => {
        clearTimeout(timeoutId);
      });
    }

    if (this.topIncomes?.length > 0) {
      this.topIncomesSignal.set(this.topIncomes);
    } else {
      this.topIncomesSignal.set([]);
    }
  }

  getCategoryLabel(category: string): string {
    return category;
  }

  getCategoryColor(category: string): string {
    return this.categoryColors()[category] || '#999999';
  }

  trackByCategory(index: number, item: IncomeItem): string {
    return item.category;
  }

  onRowKeydown(event: KeyboardEvent, income: IncomeItem): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      // Handle row activation if needed
    }
  }
}

