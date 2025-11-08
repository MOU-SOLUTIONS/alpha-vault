/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component DebtProgressComponent
  @description Main debt dashboard component for managing debt repayment progress
*/

import { CommonModule, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { META_FRAGMENT } from '../../../core/seo/page-meta.model';

@Component({
  selector: 'app-debt-progress',
  standalone: true,
  imports: [DecimalPipe, CommonModule],
  templateUrl: './debt-progress.component.html',
  styleUrls: ['./debt-progress.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: META_FRAGMENT,
      useValue: {
        description: 'Track your debt repayment progress with visual progress bars, detailed statistics, and motivational insights. Monitor your journey to financial freedom in Alpha Vault.'
      }
    }
  ],
})
export class DebtProgressComponent implements OnInit, OnChanges {

  
  @Input() totalDebt = 0;
  
  @Input() totalPaid = 0;

  private _cachedProgressPercentage?: number;
  private _cachedRemainingAmount?: number;
  private _cachedProgressStatus?: string;
  private _cachedProgressColor?: string;
  private _cachedProgressMessage?: string;
  private _lastDebt = 0;
  private _lastPaid = 0;

  ngOnInit(): void {
    this.invalidateCache();
    this.computeValues();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalDebt'] || changes['totalPaid']) {
      this.invalidateCache();
      this.computeValues();
    }
  }

  private invalidateCache(): void {
    this._cachedProgressPercentage = undefined;
    this._cachedRemainingAmount = undefined;
    this._cachedProgressStatus = undefined;
    this._cachedProgressColor = undefined;
    this._cachedProgressMessage = undefined;
  }

  private computeValues(): void {
    this.progressPercentage;
    this.remainingAmount;
    this.progressStatus;
    this.progressColor;
    this.progressMessage;
  }

  get progressPercentage(): number {
    if (this._lastDebt === this.totalDebt && 
        this._lastPaid === this.totalPaid && 
        this._cachedProgressPercentage !== undefined) {
      return this._cachedProgressPercentage;
    }
    
    this._lastDebt = this.totalDebt;
    this._lastPaid = this.totalPaid;
    
    if (this.totalDebt === 0) {
      this._cachedProgressPercentage = 0;
      return 0;
    }
    
    this._cachedProgressPercentage = Math.min(100, (this.totalPaid / this.totalDebt) * 100);
    return this._cachedProgressPercentage;
  }

  get remainingAmount(): number {
    if (this._lastDebt === this.totalDebt && 
        this._lastPaid === this.totalPaid && 
        this._cachedRemainingAmount !== undefined) {
      return this._cachedRemainingAmount;
    }
    
    this._lastDebt = this.totalDebt;
    this._lastPaid = this.totalPaid;
    
    this._cachedRemainingAmount = Math.max(0, this.totalDebt - this.totalPaid);
    return this._cachedRemainingAmount;
  }

  get progressStatus(): string {
    if (this._lastDebt === this.totalDebt && 
        this._lastPaid === this.totalPaid && 
        this._cachedProgressStatus !== undefined) {
      return this._cachedProgressStatus;
    }
    
    const percentage = this.progressPercentage;
    if (percentage === 0) {
      this._cachedProgressStatus = 'Not Started';
      return this._cachedProgressStatus;
    }
    if (percentage < 50) {
      this._cachedProgressStatus = 'Making Progress';
      return this._cachedProgressStatus;
    }
    if (percentage < 75) {
      this._cachedProgressStatus = 'Halfway There';
      return this._cachedProgressStatus;
    }
    if (percentage < 100) {
      this._cachedProgressStatus = 'Almost Done';
      return this._cachedProgressStatus;
    }
    this._cachedProgressStatus = 'Debt Free!';
    return this._cachedProgressStatus;
  }

  get progressColor(): string {
    if (this._lastDebt === this.totalDebt && 
        this._lastPaid === this.totalPaid && 
        this._cachedProgressColor !== undefined) {
      return this._cachedProgressColor;
    }
    
    const percentage = this.progressPercentage;
    if (percentage === 0) {
      this._cachedProgressColor = 'var(--gray-400)';
      return this._cachedProgressColor;
    }
    if (percentage < 50) {
      this._cachedProgressColor = 'var(--warning-color)';
      return this._cachedProgressColor;
    }
    if (percentage < 75) {
      this._cachedProgressColor = 'var(--accent-color)';
      return this._cachedProgressColor;
    }
    this._cachedProgressColor = 'var(--success-color)';
    return this._cachedProgressColor;
  }

  get progressMessage(): string {
    if (this._lastDebt === this.totalDebt && 
        this._lastPaid === this.totalPaid && 
        this._cachedProgressMessage !== undefined) {
      return this._cachedProgressMessage;
    }
    
    const percentage = this.progressPercentage;
    if (percentage === 0) {
      this._cachedProgressMessage = 'Start your debt-free journey today!';
      return this._cachedProgressMessage;
    }
    if (percentage > 0 && percentage < 50) {
      this._cachedProgressMessage = 'You\'re building momentum! Keep up the great work.';
      return this._cachedProgressMessage;
    }
    if (percentage >= 50 && percentage < 75) {
      this._cachedProgressMessage = 'Halfway there! You\'re doing amazing.';
      return this._cachedProgressMessage;
    }
    if (percentage >= 75 && percentage < 100) {
      this._cachedProgressMessage = 'Almost there! The finish line is in sight.';
      return this._cachedProgressMessage;
    }
    this._cachedProgressMessage = 'Congratulations! You\'ve achieved debt freedom!';
    return this._cachedProgressMessage;
  }
}
