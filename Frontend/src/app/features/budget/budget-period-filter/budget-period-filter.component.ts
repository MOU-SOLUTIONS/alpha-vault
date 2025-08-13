// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Component, EventEmitter, Output, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta } from '@angular/platform-browser';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

interface BudgetPeriod {
  month: number;
  year: number;
  label: string;
  isCurrent: boolean;
  isFuture: boolean;
}

@Component({
  selector: 'app-budget-period-filter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section 
      class="elite-budget-filter"
      [class.animate-in]="isVisible"
      [class.interactive]="isInteractive"
      role="region"
      aria-label="Budget Period Navigation"
    >
      <div class="filter-container">
        <button
          #prevButton
          class="nav-button prev-button"
          [class.disabled]="isMinPeriod"
          [class.hover-effect]="!isMinPeriod"
          (click)="onPreviousMonth()"
          (keydown.enter)="onPreviousMonth()"
          (keydown.space)="onPreviousMonth()"
          [attr.aria-label]="'Previous month: ' + getPreviousMonthLabel()"
          [attr.aria-disabled]="isMinPeriod"
          tabindex="0"
        >
          <div class="button-content">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            <span class="button-text">Previous</span>
          </div>
          <div class="ripple-effect"></div>
        </button>

        <div class="period-display" [class.animate-change]="isChanging">
          <div class="period-content">
            <div class="period-label">
              <span class="month-text">{{ currentMonthLabel }}</span>
              <div class="period-indicator" [class.current]="isCurrentPeriod">
                <span class="indicator-dot"></span>
                <span class="indicator-text">{{ isCurrentPeriod ? 'Current' : 'Selected' }}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          #nextButton
          class="nav-button next-button"
          [class.disabled]="isMaxPeriod"
          [class.hover-effect]="!isMaxPeriod"
          (click)="onNextMonth()"
          (keydown.enter)="onNextMonth()"
          (keydown.space)="onNextMonth()"
          [attr.aria-label]="'Next month: ' + getNextMonthLabel()"
          [attr.aria-disabled]="isMaxPeriod"
          tabindex="0"
        >
          <div class="button-content">
            <span class="button-text">Next</span>
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </div>
          <div class="ripple-effect"></div>
        </button>
      </div>

      <section class="period-timeline" *ngIf="showTimeline">
        <div class="timeline-track">
          <button 
            class="timeline-marker"
            *ngFor="let period of timelinePeriods; trackBy: trackByPeriod"
            [class.active]="period.month === currentMonth && period.year === currentYear"
            [class.current]="period.isCurrent"
            [class.future]="period.isFuture"
            (click)="selectPeriod(period)"
            [attr.aria-label]="'Select ' + period.label"
            tabindex="0"
          >
            <div class="marker-dot"></div>
            <span class="marker-label">{{ period.label }}</span>
          </button>
        </div>
      </section>
    </section>
  `,
  styleUrls: ['./budget-period-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetPeriodFilterComponent implements OnInit, OnDestroy {
  @ViewChild('prevButton') prevButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('nextButton') nextButton!: ElementRef<HTMLButtonElement>;

  @Output() dateChanged = new EventEmitter<{ month: number; year: number }>();

  private destroy$ = new Subject<void>();
  private changeSubject$ = new Subject<{ month: number; year: number }>();

  currentMonth: number = new Date().getMonth() + 1;
  currentYear: number = new Date().getFullYear();
  
  isVisible = false;
  isInteractive = false;
  isChanging = false;
  showTimeline = false;
  
  timelinePeriods: BudgetPeriod[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef,
    private meta: Meta
  ) {
    this.meta.addTags([
      { name: 'description', content: 'Elite budget period navigation component with smooth transitions and responsive design' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]);
  }

  ngOnInit(): void {
    this.initializeComponent();
    this.setupChangeDetection();
    this.generateTimelinePeriods();
    this.emitDate();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardNavigation(event: KeyboardEvent): void {
    if (!this.isInteractive) return;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.onPreviousMonth();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.onNextMonth();
        break;
      case 'Home':
        event.preventDefault();
        this.goToCurrentPeriod();
        break;
      case 'Enter':
      case ' ':
        if (event.target === this.elementRef.nativeElement) {
          this.toggleTimeline();
        }
        break;
    }
  }

  get currentMonthLabel(): string {
    return new Date(this.currentYear, this.currentMonth - 1).toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });
  }

  get isCurrentPeriod(): boolean {
    const now = new Date();
    return this.currentMonth === now.getMonth() + 1 && this.currentYear === now.getFullYear();
  }

  get isMinPeriod(): boolean {
    return this.currentYear <= 2020 && this.currentMonth <= 1;
  }

  get isMaxPeriod(): boolean {
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 2);
    return this.currentYear >= maxDate.getFullYear() && this.currentMonth >= maxDate.getMonth() + 1;
  }

  onPreviousMonth(): void {
    if (this.isMinPeriod) return;
    
    this.animateChange(() => {
      if (this.currentMonth === 1) {
        this.currentMonth = 12;
        this.currentYear--;
      } else {
        this.currentMonth--;
      }
      this.emitDate();
    });
  }

  onNextMonth(): void {
    if (this.isMaxPeriod) return;
    
    this.animateChange(() => {
      if (this.currentMonth === 12) {
        this.currentMonth = 1;
        this.currentYear++;
      } else {
        this.currentMonth++;
      }
      this.emitDate();
    });
  }

  goToCurrentPeriod(): void {
    const now = new Date();
    const targetMonth = now.getMonth() + 1;
    const targetYear = now.getFullYear();
    
    if (this.currentMonth !== targetMonth || this.currentYear !== targetYear) {
      this.animateChange(() => {
        this.currentMonth = targetMonth;
        this.currentYear = targetYear;
        this.emitDate();
      });
    }
  }

  selectPeriod(period: BudgetPeriod): void {
    this.animateChange(() => {
      this.currentMonth = period.month;
      this.currentYear = period.year;
      this.emitDate();
    });
  }

  toggleTimeline(): void {
    this.showTimeline = !this.showTimeline;
    this.cdr.markForCheck();
  }

  getPreviousMonthLabel(): string {
    const prevMonth = this.currentMonth === 1 ? 12 : this.currentMonth - 1;
    const prevYear = this.currentMonth === 1 ? this.currentYear - 1 : this.currentYear;
    return new Date(prevYear, prevMonth - 1).toLocaleString('default', { month: 'long' });
  }

  getNextMonthLabel(): string {
    const nextMonth = this.currentMonth === 12 ? 1 : this.currentMonth + 1;
    const nextYear = this.currentMonth === 12 ? this.currentYear + 1 : this.currentYear;
    return new Date(nextYear, nextMonth - 1).toLocaleString('default', { month: 'long' });
  }

  trackByPeriod(index: number, period: BudgetPeriod): string {
    return `${period.year}-${period.month}`;
  }

  private initializeComponent(): void {
    setTimeout(() => {
      this.isVisible = true;
      this.isInteractive = true;
      this.cdr.markForCheck();
    }, 100);
  }

  private setupChangeDetection(): void {
    this.changeSubject$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged((prev, curr) => 
          prev.month === curr.month && prev.year === curr.year
        )
      )
      .subscribe(({ month, year }) => {
        this.dateChanged.emit({ month, year });
      });
  }

  private generateTimelinePeriods(): void {
    const periods: BudgetPeriod[] = [];
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    for (let year = currentYear - 2; year <= currentYear + 2; year++) {
      for (let month = 1; month <= 12; month++) {
        const isCurrent = month === currentMonth && year === currentYear;
        const isFuture = year > currentYear || (year === currentYear && month > currentMonth);
        
        periods.push({
          month,
          year,
          label: new Date(year, month - 1).toLocaleString('default', { month: 'short', year: '2-digit' }),
          isCurrent,
          isFuture,
        });
      }
    }
    
    this.timelinePeriods = periods;
  }

  private animateChange(callback: () => void): void {
    this.isChanging = true;
    this.cdr.markForCheck();
    
    setTimeout(() => {
      callback();
      this.cdr.markForCheck();
      
      setTimeout(() => {
        this.isChanging = false;
        this.cdr.markForCheck();
      }, 150);
    }, 75);
  }

  private emitDate(): void {
    this.changeSubject$.next({ month: this.currentMonth, year: this.currentYear });
  }
}
