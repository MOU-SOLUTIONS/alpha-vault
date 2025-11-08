/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseTableHeaderComponent
  @description Expense table header component for displaying expense data
*/

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

/* ===== COMPONENT DECORATOR ===== */
@Component({
  selector: 'app-expense-table-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatBadgeModule
  ],
  template: `
    <header class="table-header">
      <h2 id="expenseBreakdownTitle" class="table-title">
        <mat-icon aria-hidden="true">account_balance_wallet</mat-icon>
        Expense Breakdown
      </h2>
      <div class="header-actions">
        <button 
          class="filter-toggle-button" 
          mat-flat-button 
          [ngClass]="{'active': hasActiveFilters}"
          type="button" 
          (click)="onToggleFilters()"
          (keydown.enter)="onToggleFilters()"
          (keydown.space)="onToggleFilters()"
          [matBadge]="hasActiveFilters ? '!' : null"
          matBadgeColor="warn"
          matTooltip="Toggle filter panel"
          aria-label="Toggle filter panel"
          [attr.aria-expanded]="isFilterExpanded"
          aria-controls="filterPanel">
          <mat-icon>filter_list</mat-icon>
          <span class="button-text">Filters</span>
        </button>
        <button 
          id="addExpenseButton"
          class="add-button" 
          mat-flat-button 
          type="button" 
          (click)="onAddExpense()"
          (keydown.enter)="onAddExpense()"
          (keydown.space)="onAddExpense()"
          matTooltip="Add new expense"
          aria-label="Add new expense">
          <mat-icon>add</mat-icon>
          <span class="button-text">Add Expense</span>
        </button>
      </div>
    </header>
  `,
  styleUrls: ['./expense-table-header.component.scss']
})
export class ExpenseTableHeaderComponent {
  /* ===== INPUTS ===== */
  @Input() hasActiveFilters = false;
  @Input() isFilterExpanded = false;
  
  /* ===== OUTPUTS ===== */
  @Output() toggleFilters = new EventEmitter<void>();
  @Output() addExpense = new EventEmitter<void>();

  /* ===== EVENT HANDLERS ===== */
  onToggleFilters(): void {
    this.toggleFilters.emit();
  }

  onAddExpense(): void {
    this.addExpense.emit();
  }
}