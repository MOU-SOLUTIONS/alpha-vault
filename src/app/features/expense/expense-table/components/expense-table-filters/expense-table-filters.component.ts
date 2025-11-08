/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseTableFiltersComponent
  @description Expense table filters component for displaying expense data
*/

/* ===== IMPORTS ===== */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

/* ===== INTERFACES ===== */
interface PaymentMethodOption {
  value: string;
  label: string;
}

interface CategoryOption {
  value: string;
  label: string;
}

/* ===== COMPONENT DECORATOR ===== */
@Component({
  selector: 'app-expense-table-filters',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatTooltipModule
  ],
  template: `
    <form
      *ngIf="isExpanded"
      [formGroup]="filterForm"
      class="filter-box"
      role="search"
      aria-labelledby="filterSectionLabel"
      id="filterPanel"
    >
      <div class="filter-header">
        <h3 id="filterSectionLabel" class="filter-title">
          <mat-icon aria-hidden="true">filter_list</mat-icon>
          Filters
          <span class="filter-subtitle" *ngIf="filteredCount !== totalCount">
            (Showing {{ filteredCount }} of {{ totalCount }} entries)
          </span>
        </h3>
        <button
          class="reset-button"
          mat-stroked-button
          color="warn"
          type="button"
          (click)="onResetFilters()"
          (keydown.enter)="onResetFilters()"
          (keydown.space)="onResetFilters()"
          matTooltip="Reset all filters"
          aria-label="Reset all filters"
          [disabled]="!hasActiveFilters">
          <mat-icon>refresh</mat-icon>
          <span class="button-text">Reset</span>
        </button>
      </div>
      <div class="col-12 col-md-12">
          <mat-form-field appearance="outline" class="w-100">
            <mat-label for="searchInput">Search anything</mat-label>
            <input
              matInput
              id="searchInput"
              formControlName="search"
              placeholder="e.g. Food, Transport, 2025"
              aria-label="Search expense records"
            />
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
        </div>
      <div class="row g-1">
        <div class="col-12 col-md-3">
          <div class="date-input-wrapper">
            <label class="date-label" for="fromDate">From Date</label>
            <input 
              type="date" 
              id="fromDate"
              formControlName="fromDate"
              class="date-input"
              aria-label="Filter from date" 
            />
          </div>
        </div>
        <div class="col-12 col-md-3">
          <div class="date-input-wrapper">
            <label class="date-label" for="toDate">To Date</label>
            <input 
              type="date" 
              id="toDate"
              formControlName="toDate"
              class="date-input"
              aria-label="Filter to date" 
            />
          </div>
        </div>
        <div class="col-12 col-md-3">
          <div class="select-input-wrapper">
            <label class="select-label" for="method">Payment Method</label>
            <mat-select 
              id="method"
              formControlName="method"
              class="select-input"
              aria-label="Filter by payment method">
              <mat-option value="">All</mat-option>
              <mat-option *ngFor="let option of paymentMethods; trackBy: trackByPaymentMethod" [value]="option.value">
                {{ option.label }}
              </mat-option>
            </mat-select>
          </div>
        </div>
        <div class="col-12 col-md-3">
          <div class="select-input-wrapper">
            <label class="select-label" for="category">Category</label>
            <mat-select 
              id="category"
              formControlName="category"
              class="select-input"
              aria-label="Filter by expense category">
              <mat-option value="">All</mat-option>
              <mat-option *ngFor="let option of categories; trackBy: trackByCategory" [value]="option.value">
                {{ option.label }}
              </mat-option>
            </mat-select>
          </div>
        </div>
      </div>
    </form>
  `,
  styleUrls: ['./expense-table-filters.component.scss']
})
export class ExpenseTableFiltersComponent {
  /* ===== INPUTS ===== */
  @Input() isExpanded = false;
  @Input() filterForm!: FormGroup;
  @Input() paymentMethods: PaymentMethodOption[] = [];
  @Input() categories: CategoryOption[] = [];
  @Input() filteredCount = 0;
  @Input() totalCount = 0;
  @Input() hasActiveFilters = false;
  
  /* ===== OUTPUTS ===== */
  @Output() resetFilters = new EventEmitter<void>();

  /* ===== UTILITY METHODS ===== */
  trackByPaymentMethod(index: number, option: PaymentMethodOption): string {
    return option.value;
  }

  trackByCategory(index: number, option: CategoryOption): string {
    return option.value;
  }

  /* ===== EVENT HANDLERS ===== */
  onResetFilters(): void {
    this.resetFilters.emit();
  }
}