/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component IncomeTableSummaryComponent
  @description Income table summary component for displaying income data
*/

/* ===== IMPORTS ===== */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { Income } from '../../../../../models/income.model';

/* ===== COMPONENT DECORATOR ===== */
@Component({
  selector: 'app-income-table-summary',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule
  ],
  template: `
    <div class="total-summary" role="region" aria-label="Income summary">
      <div class="total-badge" role="img" aria-label="Total income amount">
        <span class="total-label">Total Income:</span>
        <span class="total-amount" aria-live="polite">{{ getTotalIncomeAmount() | currency }}</span>
      </div>
      <div class="entries-info" *ngIf="filteredCount !== totalCount" role="status" aria-live="polite">
        <span>Filtered: {{ filteredCount }} of {{ totalCount }}</span>
      </div>
    </div>
  `,
  styleUrls: ['./income-table-summary.component.scss']
})
export class IncomeTableSummaryComponent implements OnChanges {
  /* ===== INPUTS ===== */
  @Input() dataSource!: MatTableDataSource<Income>;
  @Input() filteredCount = 0;
  @Input() totalCount = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  /* ===== LIFECYCLE METHODS ===== */
  ngOnChanges(changes: SimpleChanges): void {
    // Force change detection when inputs change
    this.cdr.markForCheck();
  }

  /* ===== UTILITY METHODS ===== */
  getTotalIncomeAmount(): number {
    if (!this.dataSource?.filteredData || this.dataSource.filteredData.length === 0) {
      return 0;
    }
    const total = this.dataSource.filteredData.reduce((sum: number, income: Income) => sum + income.amount, 0);
    return total;
  }
}
