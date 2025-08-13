// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { DecimalPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-debt-progress',
  standalone: true,
  imports: [DecimalPipe, CommonModule],
  templateUrl: './debt-progress.component.html',
  styleUrls: ['./debt-progress.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DebtProgressComponent implements OnInit {
  @Input() totalDebt: number = 0;
  @Input() totalPaid: number = 0;

  constructor(private meta: Meta) {}

  ngOnInit(): void {
    this.setSEOMeta();
  }

  getProgressPercentage(): number {
    if (this.totalDebt === 0) return 0;
    return Math.min(100, (this.totalPaid / this.totalDebt) * 100);
  }

  getRemainingAmount(): number {
    return Math.max(0, this.totalDebt - this.totalPaid);
  }

  getProgressStatus(): string {
    const percentage = this.getProgressPercentage();
    if (percentage === 0) return 'Not Started';
    if (percentage < 50) return 'Making Progress';
    if (percentage < 75) return 'Halfway There';
    if (percentage < 100) return 'Almost Done';
    return 'Debt Free!';
  }

  getProgressColor(): string {
    const percentage = this.getProgressPercentage();
    if (percentage === 0) return 'var(--gray-400)';
    if (percentage < 50) return 'var(--warning-color)';
    if (percentage < 75) return 'var(--accent-color)';
    if (percentage < 100) return 'var(--success-color)';
    return 'var(--success-color)';
  }

  getProgressEmoji(): string {
    const percentage = this.getProgressPercentage();
    if (percentage === 0) return '😐';
    if (percentage < 50) return '😅';
    if (percentage < 75) return '😊';
    if (percentage < 100) return '🎉';
    return '🏆';
  }

  private setSEOMeta(): void {
    this.meta.addTags([
      { name: 'description', content: 'Track your debt repayment progress with visual progress bars, detailed statistics, and motivational insights. Monitor your journey to financial freedom.' },
      { name: 'keywords', content: 'debt progress, repayment tracking, financial goals, debt reduction, progress visualization, Alpha Vault' },
      { name: 'robots', content: 'index,follow' },
      { name: 'og:title', content: 'Debt Repayment Progress | Alpha Vault' },
      { name: 'og:description', content: 'Visual debt progress tracking with detailed insights and motivational progress indicators.' }
    ]);
  }
}
