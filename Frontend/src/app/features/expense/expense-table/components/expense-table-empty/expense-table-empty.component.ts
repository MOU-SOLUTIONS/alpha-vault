/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseTableEmptyComponent
  @description Expense table empty component for displaying expense data
*/

/* ===== IMPORTS ===== */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/* ===== COMPONENT DECORATOR ===== */
@Component({
  selector: 'app-expense-table-empty',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatIconModule
  ],
  template: `
    <div class="empty-state" role="status" aria-live="polite" aria-label="No expense records found">
      <mat-icon class="empty-icon" aria-hidden="true">search_off</mat-icon>
      <h3>No expense records found</h3>
      <p>Try adjusting your filters or add a new expense record.</p>
    </div>
  `,
  styleUrls: ['./expense-table-empty.component.scss']
})
export class ExpenseTableEmptyComponent {}