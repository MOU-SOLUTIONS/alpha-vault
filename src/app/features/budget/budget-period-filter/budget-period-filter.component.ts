/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component BudgetPeriodFilterComponent
  @description Elite budget period navigation component with responsive design
*/

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, DestroyRef, ElementRef, EventEmitter, HostListener, inject, OnDestroy, OnInit, Output, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

import { LoggingService } from '../../../core/services/logging.service';
import { META_FRAGMENT } from '../../../core/seo/page-meta.model';
import { BudgetService } from '../../../core/services/budget.service';
import { BudgetPeriod } from '../../../models/budget.model';

interface BudgetPeriodDisplay extends BudgetPeriod {
  label: string;
  isCurrent: boolean;
  isFuture: boolean;
}

@Component({
  selector: 'app-budget-period-filter',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: META_FRAGMENT,
      useValue: {
        description: 'Navigate between budget periods with month-by-month filtering. Interactive timeline with keyboard navigation for efficient budget period selection in Alpha Vault.'
      }
    }
  ],
  template: `
    <section 
      class="elite-budget-filter"
      [class.interactive]="isInteractive()"
      role="region"
      aria-label="Budget Period Navigation"
    >
      <div class="filter-container">
        <button
          #prevButton
          class="nav-button prev-button"
          [class.disabled]="isMinPeriod()"
          [class.hover-effect]="!isMinPeriod()"
          (click)="onPreviousMonth()"
          (keydown.enter)="onPreviousMonth()"
          (keydown.space)="onPreviousMonth()"
          [attr.aria-label]="'Previous month: ' + getPreviousMonthLabel()"
          [attr.aria-disabled]="isMinPeriod()"
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

        <div class="period-display">
          <div class="period-content">
            <div class="period-label">
              <span class="month-text">{{ currentMonthLabel() }}</span>
              <div class="period-indicator" [class.current]="isCurrentPeriod()">
                <span class="indicator-dot"></span>
                <span class="indicator-text">{{ isCurrentPeriod() ? 'Current' : 'Selected' }}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          #nextButton
          class="nav-button next-button"
          [class.disabled]="isMaxPeriod()"
          [class.hover-effect]="!isMaxPeriod()"
          (click)="onNextMonth()"
          (keydown.enter)="onNextMonth()"
          (keydown.space)="onNextMonth()"
          [attr.aria-label]="'Next month: ' + getNextMonthLabel()"
          [attr.aria-disabled]="isMaxPeriod()"
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

      <section class="period-timeline" *ngIf="showTimeline()" role="list" aria-label="Period selection timeline">
        <div class="timeline-track">
          <button 
            class="timeline-marker"
            *ngFor="let period of timelinePeriods(); trackBy: trackByPeriod"
            [class.active]="period.month === currentMonth() && period.year === currentYear()"
            [class.current]="period.isCurrent"
            [class.future]="period.isFuture"
            (click)="selectPeriod(period)"
            (keydown.enter)="selectPeriod(period)"
            (keydown.space)="selectPeriod(period)"
            [attr.aria-label]="'Select ' + period.label"
            [attr.aria-current]="period.month === currentMonth() && period.year === currentYear() ? 'true' : 'false'"
            role="listitem"
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

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly elementRef = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly budgetService = inject(BudgetService);
  private readonly loggingService = inject(LoggingService);

  private readonly destroy$ = new Subject<void>();
  private readonly changeSubject$ = new Subject<{ month: number; year: number }>();
  private readonly isBrowser = typeof window !== 'undefined';

  private readonly currentMonthSignal = signal(new Date().getMonth() + 1);
  private readonly currentYearSignal = signal(new Date().getFullYear());
  private readonly isVisibleSignal = signal(false);
  private readonly isInteractiveSignal = signal(false);
  private readonly showTimelineSignal = signal(false);
  private readonly timelinePeriodsSignal = signal<BudgetPeriodDisplay[]>([]);

  readonly currentMonth = this.currentMonthSignal.asReadonly();
  readonly currentYear = this.currentYearSignal.asReadonly();
  readonly isVisible = this.isVisibleSignal.asReadonly();
  readonly isInteractive = this.isInteractiveSignal.asReadonly();
  readonly showTimeline = this.showTimelineSignal.asReadonly();
  readonly timelinePeriods = this.timelinePeriodsSignal.asReadonly();

  readonly currentMonthLabel = computed(() => {
    return new Date(this.currentYear(), this.currentMonth() - 1).toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });
  });

  readonly isCurrentPeriod = computed(() => {
    const now = new Date();
    return this.currentMonth() === now.getMonth() + 1 && this.currentYear() === now.getFullYear();
  });

  readonly isMinPeriod = computed(() => {
    return this.currentYear() <= 2020 && this.currentMonth() <= 1;
  });

  readonly isMaxPeriod = computed(() => {
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 2);
    return this.currentYear() >= maxDate.getFullYear() && this.currentMonth() >= maxDate.getMonth() + 1;
  });

  constructor() {
    // SEO fragment provided via META_FRAGMENT token
    // Parent component (BudgetComponent) aggregates all fragments via SeoService
  }

  ngOnInit(): void {
    this.initializeComponent();
    this.setupChangeDetection();
    this.loadAvailablePeriods();
    this.emitDate();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardNavigation(event: KeyboardEvent): void {
    if (!this.isInteractive()) return;

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
      case 'Escape':
        if (this.showTimeline()) {
          this.toggleTimeline();
        }
        break;
    }
  }

  onPreviousMonth(): void {
    if (this.isMinPeriod()) return;
    
    if (this.currentMonth() === 1) {
      this.currentMonthSignal.set(12);
      this.currentYearSignal.set(this.currentYear() - 1);
    } else {
      this.currentMonthSignal.set(this.currentMonth() - 1);
    }
    this.emitDate();
  }

  onNextMonth(): void {
    if (this.isMaxPeriod()) return;
    
    if (this.currentMonth() === 12) {
      this.currentMonthSignal.set(1);
      this.currentYearSignal.set(this.currentYear() + 1);
    } else {
      this.currentMonthSignal.set(this.currentMonth() + 1);
    }
    this.emitDate();
  }

  goToCurrentPeriod(): void {
    const now = new Date();
    const targetMonth = now.getMonth() + 1;
    const targetYear = now.getFullYear();
    
    if (this.currentMonth() !== targetMonth || this.currentYear() !== targetYear) {
      this.currentMonthSignal.set(targetMonth);
      this.currentYearSignal.set(targetYear);
      this.emitDate();
    }
  }

  selectPeriod(period: BudgetPeriodDisplay): void {
    this.currentMonthSignal.set(period.month);
    this.currentYearSignal.set(period.year);
    this.emitDate();
  }

  toggleTimeline(): void {
    this.showTimelineSignal.set(!this.showTimeline());
  }

  getPreviousMonthLabel(): string {
    const prevMonth = this.currentMonth() === 1 ? 12 : this.currentMonth() - 1;
    const prevYear = this.currentMonth() === 1 ? this.currentYear() - 1 : this.currentYear();
    return new Date(prevYear, prevMonth - 1).toLocaleString('default', { month: 'long' });
  }

  getNextMonthLabel(): string {
    const nextMonth = this.currentMonth() === 12 ? 1 : this.currentMonth() + 1;
    const nextYear = this.currentMonth() === 12 ? this.currentYear() + 1 : this.currentYear();
    return new Date(nextYear, nextMonth - 1).toLocaleString('default', { month: 'long' });
  }

  trackByPeriod(index: number, period: BudgetPeriodDisplay): string {
    return `${period.year}-${period.month}`;
  }

  private initializeComponent(): void {
    this.isVisibleSignal.set(true);
    this.isInteractiveSignal.set(true);
  }

  private setupChangeDetection(): void {
    this.changeSubject$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(100),
        distinctUntilChanged((prev, curr) => 
          prev.month === curr.month && prev.year === curr.year
        )
      )
      .subscribe(({ month, year }) => {
        this.dateChanged.emit({ month, year });
      });
  }

  loadAvailablePeriods(): void {
    const userId = 1;
    
    this.budgetService.getAvailableBudgetPeriods(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (periods) => {
          this.generateTimelinePeriodsFromData(periods);
        },
        error: (error) => {
          this.loggingService.error('Error loading available periods:', error);
          this.generateTimelinePeriods();
        }
      });
  }

  private generateTimelinePeriodsFromData(periods: BudgetPeriod[]): void {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const displayPeriods: BudgetPeriodDisplay[] = periods.map(period => {
      const date = new Date(period.year, period.month - 1);
      const isCurrent = period.year === currentYear && period.month === currentMonth;
      const isFuture = period.year > currentYear || (period.year === currentYear && period.month > currentMonth);

      return {
        ...period,
        label: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        isCurrent,
        isFuture
      };
    });

    this.timelinePeriodsSignal.set(displayPeriods);
  }

  private generateTimelinePeriods(): void {
    const periods: BudgetPeriodDisplay[] = [];
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
    
    this.timelinePeriodsSignal.set(periods);
  }


  private emitDate(): void {
    this.dateChanged.emit({ month: this.currentMonth(), year: this.currentYear() });
    this.changeSubject$.next({ month: this.currentMonth(), year: this.currentYear() });
  }
}
