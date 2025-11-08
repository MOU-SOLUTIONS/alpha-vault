/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component IncomeWidgetComponent
  @description Income widget component for displaying income statistics across different time periods
*/

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta } from '@angular/platform-browser';
import { forkJoin, Subject } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { IncomeService } from '../../../core/services/income.service';
import { LoggingService } from '../../../core/services/logging.service';


interface IncomeCard {
  label: string;
  icon: string;
  key: string;
  class: string;
}

/**
 * IncomeWidgetComponent - Displays income statistics
 * Uses OnPush change detection for optimal performance
 */
@Component({
  selector: 'app-income-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './income-widget.component.html',
  styleUrls: ['./income-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncomeWidgetComponent implements OnInit, OnDestroy, OnChanges {
  @Input() seoDescription?: string;
  @Input() dayIncome = 0;
  @Input() weekIncome = 0;
  @Input() monthIncome = 0;
  @Input() yearIncome = 0;

  readonly currency = 'USD';
  private readonly refreshInterval = 60000;
  private readonly destroy$ = new Subject<void>();

  readonly cards: IncomeCard[] = [
    { label: 'Today', icon: 'fa-calendar-day', key: 'dayIncome', class: 'today' },
    { label: 'This Week', icon: 'fa-calendar-week', key: 'weekIncome', class: 'week' },
    { label: 'This Month', icon: 'fa-calendar-alt', key: 'monthIncome', class: 'month' },
    { label: 'This Year', icon: 'fa-calendar', key: 'yearIncome', class: 'year' },
  ];

  private readonly meta = inject(Meta);
  private readonly incomeService = inject(IncomeService);
  private readonly authService = inject(AuthService);
  private readonly loggingService = inject(LoggingService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  
  ngOnInit(): void {
    this.loadIncomeData();
  }

  private loadIncomeData(): void {
    const userId = this.authService.getUserId();
    if (userId && userId > 0) {
      forkJoin({
        dayIncome: this.incomeService.getTodayIncome(userId),
        weekIncome: this.incomeService.getCurrentWeekIncome(userId),
        monthIncome: this.incomeService.getCurrentMonthIncome(userId),
        yearIncome: this.incomeService.getCurrentYearIncome(userId)
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.dayIncome = data.dayIncome;
          this.weekIncome = data.weekIncome;
          this.monthIncome = data.monthIncome;
          this.yearIncome = data.yearIncome;
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.loggingService.error('Error loading income data:', error);
          this.resetIncomeValues();
        }
      });
    } else {
      this.resetIncomeValues();
    }
  }

  private resetIncomeValues(): void {
    this.dayIncome = 0;
    this.weekIncome = 0;
    this.monthIncome = 0;
    this.yearIncome = 0;
    this.cdr.markForCheck();
  }

  ngOnChanges(): void {
  }

  // Simple method to get income values
  getIncomeValue(key: string): number {
    switch (key) {
      case 'dayIncome': 
        return this.dayIncome;
      case 'weekIncome': 
        return this.weekIncome;
      case 'monthIncome': 
        return this.monthIncome;
      case 'yearIncome': 
        return this.yearIncome;
      default: 
        return 0;
    }
  }

  trackByKey(index: number, item: IncomeCard): string {
    return item.key;
  }

  onCardClick(card: IncomeCard): void {
    // Handle card click for keyboard navigation
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
