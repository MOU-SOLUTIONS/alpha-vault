/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component DebtCreditorChartComponent
  @description Main debt dashboard component for managing debt by creditor distribution
*/

import { CommonModule, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { META_FRAGMENT } from '../../../core/seo/page-meta.model';

@Component({
  selector: 'app-debt-creditor-chart',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './debt-creditor-chart.component.html',
  styleUrls: ['./debt-creditor-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: META_FRAGMENT,
      useValue: {
        description: 'Visualize your debt distribution across different creditors with interactive charts and detailed breakdowns. Track your financial obligations by source in Alpha Vault.'
      }
    }
  ]
})
export class DebtCreditorChartComponent implements OnInit, OnChanges {

  
  @Input() creditorData: Record<string, number> = {};

  private _cachedCreditorEntries?: { key: string; value: number }[];
  private _cachedTotalDebt?: number;
  private _cachedHasData?: boolean;
  private _cachedCreditorCount?: number;
  private _cachedTopCreditor?: { key: string; value: number } | null;
  private _lastCreditorData?: Record<string, number>;

  ngOnInit(): void {
    this.invalidateCache();
    this.computeValues();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['creditorData']) {
      this.invalidateCache();
      this.computeValues();
    }
  }

  private invalidateCache(): void {
    this._cachedCreditorEntries = undefined;
    this._cachedTotalDebt = undefined;
    this._cachedHasData = undefined;
    this._cachedCreditorCount = undefined;
    this._cachedTopCreditor = undefined;
    this._lastCreditorData = undefined;
  }

  private computeValues(): void {
    this.creditorEntries;
    this.totalDebt;
    this.hasCreditorData;
    this.creditorCount;
    this.topCreditor;
  }

  private isDataEqual(a: Record<string, number> | undefined, b: Record<string, number>): boolean {
    if (!a) return false;
    const keysA = Object.keys(a).sort();
    const keysB = Object.keys(b).sort();
    if (keysA.length !== keysB.length) return false;
    for (let i = 0; i < keysA.length; i++) {
      if (keysA[i] !== keysB[i] || a[keysA[i]] !== b[keysA[i]]) return false;
    }
    return true;
  }

  get creditorEntries(): { key: string; value: number }[] {
    if (this.isDataEqual(this._lastCreditorData, this.creditorData) && 
        this._cachedCreditorEntries !== undefined) {
      return this._cachedCreditorEntries;
    }
    
    this._lastCreditorData = { ...this.creditorData };
    
    if (!this.creditorData || Object.keys(this.creditorData).length === 0) {
      this._cachedCreditorEntries = [];
      return [];
    }
    
    this._cachedCreditorEntries = Object.entries(this.creditorData)
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => b.value - a.value);
    return this._cachedCreditorEntries;
  }

  get totalDebt(): number {
    if (this.isDataEqual(this._lastCreditorData, this.creditorData) && 
        this._cachedTotalDebt !== undefined) {
      return this._cachedTotalDebt;
    }
    
    this._lastCreditorData = { ...this.creditorData };
    
    if (!this.creditorData) {
      this._cachedTotalDebt = 0;
      return 0;
    }
    
    this._cachedTotalDebt = Object.values(this.creditorData).reduce((sum, value) => sum + value, 0);
    return this._cachedTotalDebt;
  }

  getCreditorPercentage(amount: number): number {
    const total = this.totalDebt;
    if (total === 0) return 0;
    return (amount / total) * 100;
  }

  get hasCreditorData(): boolean {
    if (this.isDataEqual(this._lastCreditorData, this.creditorData) && 
        this._cachedHasData !== undefined) {
      return this._cachedHasData;
    }
    
    this._lastCreditorData = { ...this.creditorData };
    this._cachedHasData = this.creditorData && Object.keys(this.creditorData).length > 0;
    return this._cachedHasData;
  }

  get topCreditor(): { key: string; value: number } | null {
    if (this.isDataEqual(this._lastCreditorData, this.creditorData) && 
        this._cachedTopCreditor !== undefined) {
      return this._cachedTopCreditor;
    }
    
    const entries = this.creditorEntries;
    this._cachedTopCreditor = entries.length > 0 ? entries[0] : null;
    return this._cachedTopCreditor;
  }

  get creditorCount(): number {
    if (this.isDataEqual(this._lastCreditorData, this.creditorData) && 
        this._cachedCreditorCount !== undefined) {
      return this._cachedCreditorCount;
    }
    
    this._lastCreditorData = { ...this.creditorData };
    this._cachedCreditorCount = Object.keys(this.creditorData || {}).length;
    return this._cachedCreditorCount;
  }

  trackByCreditor(index: number, creditor: { key: string; value: number }): string {
    return creditor.key;
  }
}
