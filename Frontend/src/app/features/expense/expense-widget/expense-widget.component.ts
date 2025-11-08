/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseWidgetComponent
  @description Expense widget component for displaying expense statistics across different time periods
*/

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta } from '@angular/platform-browser';
import { forkJoin, Subject } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { ExpenseService } from '../../../core/services/expense.service';
import { LoggingService } from '../../../core/services/logging.service';


interface ExpenseCard {
  label: string;
  icon: string;
  key: string;
  class: string;
}

/**
 * ExpenseWidgetComponent - Displays expense statistics
 * Uses OnPush change detection for optimal performance
 */
@Component({
  selector: 'app-expense-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expense-widget.component.html',
  styleUrls: ['./expense-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpenseWidgetComponent implements OnInit, OnDestroy, OnChanges {
  @Input() seoDescription?: string;
  @Input() dayExpense = 0;
  @Input() weekExpense = 0;
  @Input() monthExpense = 0;
  @Input() yearExpense = 0;

  readonly currency = 'USD';
  private readonly refreshInterval = 60000;
  private readonly destroy$ = new Subject<void>();

  readonly cards: ExpenseCard[] = [
    { label: 'Today', icon: 'fa-calendar-day', key: 'dayExpense', class: 'today' },
    { label: 'This Week', icon: 'fa-calendar-week', key: 'weekExpense', class: 'week' },
    { label: 'This Month', icon: 'fa-calendar-alt', key: 'monthExpense', class: 'month' },
    { label: 'This Year', icon: 'fa-calendar', key: 'yearExpense', class: 'year' },
  ];

  private readonly meta = inject(Meta);
  private readonly expenseService = inject(ExpenseService);
  private readonly authService = inject(AuthService);
  private readonly loggingService = inject(LoggingService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadExpenseData();
  }

  private loadExpenseData(): void {
    const userId = this.authService.getUserId();
    if (userId && userId > 0) {
      forkJoin({
        dayExpense: this.expenseService.getTodayExpense(),
        weekExpense: this.expenseService.getWeekExpense(),
        monthExpense: this.expenseService.getMonthExpense(),
        yearExpense: this.expenseService.getYearExpense()
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.dayExpense = data.dayExpense;
          this.weekExpense = data.weekExpense;
          this.monthExpense = data.monthExpense;
          this.yearExpense = data.yearExpense;
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.loggingService.error('Error loading expense data:', error);
          this.resetExpenseValues();
        }
      });
    } else {
      this.resetExpenseValues();
    }
  }

  private resetExpenseValues(): void {
    this.dayExpense = 0;
    this.weekExpense = 0;
    this.monthExpense = 0;
    this.yearExpense = 0;
    this.cdr.markForCheck();
  }

  ngOnChanges(): void {
  }

  // Simple method to get expense values
  getExpenseValue(key: string): number {
    switch (key) {
      case 'dayExpense': 
        return this.dayExpense;
      case 'weekExpense': 
        return this.weekExpense;
      case 'monthExpense': 
        return this.monthExpense;
      case 'yearExpense': 
        return this.yearExpense;
      default: 
        return 0;
    }
  }

  trackByKey(index: number, item: ExpenseCard): string {
    return item.key;
  }

  onCardClick(card: ExpenseCard): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupMetaTags(): void {
    if (this.seoDescription) {
      this.meta.addTag({ name: 'description', content: this.seoDescription });
    }
  }
}
