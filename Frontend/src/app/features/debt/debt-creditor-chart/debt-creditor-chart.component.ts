// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-debt-creditor-chart',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './debt-creditor-chart.component.html',
  styleUrls: ['./debt-creditor-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DebtCreditorChartComponent implements OnInit {
  @Input() creditorData: Record<string, number> = {};

  constructor(
    private meta: Meta
  ) {}

  ngOnInit(): void {
    this.setSEOMeta();
  }

  getCreditorEntries(): { key: string; value: number }[] {
    if (!this.creditorData) return [];
    return Object.entries(this.creditorData)
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => b.value - a.value);
  }

  getTotalDebt(): number {
    if (!this.creditorData) return 0;
    return Object.values(this.creditorData).reduce((sum, value) => sum + value, 0);
  }

  getCreditorPercentage(amount: number): number {
    const total = this.getTotalDebt();
    if (total === 0) return 0;
    return (amount / total) * 100;
  }

  hasCreditorData(): boolean {
    return this.creditorData && Object.keys(this.creditorData).length > 0;
  }

  getTopCreditor(): { key: string; value: number } | null {
    const entries = this.getCreditorEntries();
    return entries.length > 0 ? entries[0] : null;
  }

  getCreditorCount(): number {
    return Object.keys(this.creditorData || {}).length;
  }

  trackByCreditor(index: number, creditor: { key: string; value: number }): string {
    return creditor.key;
  }

  private setSEOMeta(): void {
    this.meta.addTags([
      { name: 'description', content: 'Visualize your debt distribution across different creditors with interactive charts and detailed breakdowns. Track your financial obligations by source.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]);
  }
}
