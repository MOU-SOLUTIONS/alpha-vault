/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component IncomeWidgetNewComponent
  @description New income widget component to bypass cache issues
*/

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject,Input, OnChanges, OnInit } from '@angular/core';

interface IncomeCard {
  label: string;
  icon: string;
  key: string;
  class: string;
}

/**
 * IncomeWidgetNewComponent - Displays income statistics (new version)
 * Uses OnPush change detection for optimal performance
 */
@Component({
  selector: 'app-income-widget-new',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './income-widget-new.component.html',
  styleUrls: ['./income-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncomeWidgetNewComponent implements OnInit, OnChanges {
  @Input() seoDescription?: string;
  @Input() dayIncome = 0;
  @Input() weekIncome = 0;
  @Input() monthIncome = 0;
  @Input() yearIncome = 0;

  readonly currency = 'USD';

  readonly cards: IncomeCard[] = [
    { label: 'Today', icon: 'fa-calendar-day', key: 'dayIncome', class: 'today' },
    { label: 'This Week', icon: 'fa-calendar-week', key: 'weekIncome', class: 'week' },
    { label: 'This Month', icon: 'fa-calendar-alt', key: 'monthIncome', class: 'month' },
    { label: 'This Year', icon: 'fa-calendar', key: 'yearIncome', class: 'year' },
  ];

  private readonly cdr = inject(ChangeDetectorRef);
  
  ngOnInit(): void {
  }

  ngOnChanges(): void {
    // OnPush: markForCheck is more efficient than detectChanges
    this.cdr.markForCheck();
  }

  getIncomeValue(key: string): number {
    switch (key) {
      case 'dayIncome': return this.dayIncome;
      case 'weekIncome': return this.weekIncome;
      case 'monthIncome': return this.monthIncome;
      case 'yearIncome': return this.yearIncome;
      default: return 0;
    }
  }

  trackByKey(index: number, item: IncomeCard): string {
    return item.key;
  }

  onCardClick(card: IncomeCard): void {
  }
}
