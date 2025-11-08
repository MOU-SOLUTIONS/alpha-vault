/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseTop5Component
  @description Expense top 5 component for displaying expense data
*/  

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, Input, OnChanges, OnInit, signal, SimpleChanges } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Subject } from 'rxjs';

interface ExpenseItem {
  category: string;
  amount: number;
}

@Component({
  selector: 'app-expense-top5',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expense-top5.component.html',
  styleUrls: ['./expense-top5.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseTop5Component implements OnInit, OnChanges {
  @Input() topExpenses: ExpenseItem[] = [];

  private readonly topExpensesSignal = signal<ExpenseItem[]>([]);
  private readonly shouldPulseSignal = signal<boolean>(false);
  private readonly destroy$ = new Subject<void>();

  readonly sortedExpenses = computed(() => {
    const expenses = this.topExpensesSignal();
    return [...expenses].sort((a, b) => b.amount - a.amount);
  });

  readonly shouldPulse = this.shouldPulseSignal.asReadonly();

  readonly categoryColors = computed(() => {
    const palette = ['#3f51b5', '#8b5cf6', '#34d399', '#f59e0b', '#ec4899'];
    const colors: Record<string, string> = {};
    const expenses = this.sortedExpenses();

    expenses.forEach((item, i) => {
      if (!colors[item.category]) {
        colors[item.category] = palette[i % palette.length];
      }
    });

    return colors;
  });

  private readonly meta = inject(Meta);

  constructor() {
    this.meta.addTags([
      { name: 'description', content: 'Top 5 expense categories ranked by amount in Alpha Vault.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]);
  }

  ngOnInit(): void {
    this.topExpensesSignal.set(this.topExpenses || []);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['topExpenses'] && !changes['topExpenses'].firstChange) {
      this.shouldPulseSignal.set(true);
      const timeoutId = setTimeout(() => this.shouldPulseSignal.set(false), 1000);
      
      // Clean up timeout on destroy
      this.destroy$.subscribe(() => {
        clearTimeout(timeoutId);
      });
    }

    if (this.topExpenses?.length > 0) {
      this.topExpensesSignal.set(this.topExpenses);
    } else {
      this.topExpensesSignal.set([]);
    }
  }

  getCategoryLabel(category: string): string {
    return category;
  }

  getCategoryColor(category: string): string {
    return this.categoryColors()[category] || '#999999';
  }

  trackByCategory(index: number, item: ExpenseItem): string {
    return item.category;
  }

  onRowKeydown(event: KeyboardEvent, expense: ExpenseItem): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      // Handle row activation if needed
    }
  }
}
