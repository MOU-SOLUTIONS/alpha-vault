/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component IncomeTableHeaderComponent
  @description Income table header component for displaying income data
*/

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

/* ===== COMPONENT DECORATOR ===== */
@Component({
  selector: 'app-income-table-header',
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
      <h2 id="incomeBreakdownTitle" class="table-title">
        <mat-icon aria-hidden="true">account_balance_wallet</mat-icon>
        Income Breakdown
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
          id="addIncomeButton"
          class="add-button" 
          mat-flat-button 
          type="button" 
          (click)="onAddIncome()"
          (keydown.enter)="onAddIncome()"
          (keydown.space)="onAddIncome()"
          matTooltip="Add new income"
          aria-label="Add new income">
          <mat-icon>add</mat-icon>
          <span class="button-text">Add Income</span>
        </button>
      </div>
    </header>
  `,
  styleUrls: ['./income-table-header.component.scss']
})
export class IncomeTableHeaderComponent {
  /* ===== INPUTS ===== */
  @Input() hasActiveFilters = false;
  @Input() isFilterExpanded = false;
  
  /* ===== OUTPUTS ===== */
  @Output() toggleFilters = new EventEmitter<void>();
  @Output() addIncome = new EventEmitter<void>();

  /* ===== EVENT HANDLERS ===== */
  onToggleFilters(): void {
    this.toggleFilters.emit();
  }

  onAddIncome(): void {
    this.addIncome.emit();
  }
}
