/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseTableSummaryComponent
  @description Expense table summary component for displaying expense data
*/

/* ===== IMPORTS ===== */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { Expense } from '../../../../../models/expense.model';

/* ===== COMPONENT DECORATOR ===== */
@Component({
  selector: 'app-expense-table-summary',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule
  ],
  template: `
    <div class="total-summary" role="region" aria-label="Expense summary">
      <div class="total-badge" role="img" aria-label="Total expense amount">
        <span class="total-label">Total Expense:</span>
        <span class="total-amount" aria-live="polite">{{ getTotalExpenseAmount() | currency }}</span>
      </div>
      <div class="entries-info" *ngIf="filteredCount !== totalCount" role="status" aria-live="polite">
        <span>Filtered: {{ filteredCount }} of {{ totalCount }}</span>
      </div>
    </div>
  `,
  styleUrls: ['./expense-table-summary.component.scss']
})
export class ExpenseTableSummaryComponent implements OnChanges {
  /* ===== INPUTS ===== */
  @Input() dataSource!: MatTableDataSource<Expense>;
  @Input() filteredCount = 0;
  @Input() totalCount = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  /* ===== LIFECYCLE METHODS ===== */
  ngOnChanges(changes: SimpleChanges): void {
    // Force change detection when inputs change
    this.cdr.markForCheck();
  }

  /* ===== UTILITY METHODS ===== */
  getTotalExpenseAmount(): number {
    if (!this.dataSource?.filteredData || this.dataSource.filteredData.length === 0) {
      return 0;
    }
    const total = this.dataSource.filteredData.reduce((sum: number, expense: Expense) => sum + expense.amount, 0);
    return total;
  }
}