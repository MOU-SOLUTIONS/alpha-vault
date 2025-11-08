/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseTableContainerComponent
  @description Expense table container component for displaying expense data
*/

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';

/* ===== IMPORTS ===== */
import { Expense } from '../../../../../models/expense.model';
import { ExpenseTableDesktopComponent } from '../expense-table-desktop/expense-table-desktop.component';
import { ExpenseTableEmptyComponent } from '../expense-table-empty/expense-table-empty.component';
import { ExpenseTableFiltersComponent } from '../expense-table-filters/expense-table-filters.component';
import { ExpenseTableHeaderComponent } from '../expense-table-header/expense-table-header.component';
import { ExpenseTableMobileComponent } from '../expense-table-mobile/expense-table-mobile.component';
import { ExpenseTablePaginatorComponent } from '../expense-table-paginator/expense-table-paginator.component';
import { ExpenseTableSummaryComponent } from '../expense-table-summary/expense-table-summary.component';

/* ===== INTERFACES ===== */
interface PaymentMethodOption {
  value: string;
  label: string;
}

interface CategoryOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-expense-table-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ExpenseTableHeaderComponent,
    ExpenseTableFiltersComponent,
    ExpenseTableSummaryComponent,
    ExpenseTableDesktopComponent,
    ExpenseTableMobileComponent,
    ExpenseTablePaginatorComponent,
    ExpenseTableEmptyComponent
  ],
  template: `
    <section class="expense-table-section">
      <div class="container">
        <div class="row justify-content-center g-2">
          <div class="col-12">
            <div class="table-card" role="region" aria-labelledby="expenseBreakdownTitle">
              
              <!-- Header -->
              <app-expense-table-header
                [hasActiveFilters]="hasActiveFilters"
                [isFilterExpanded]="isFilterExpanded"
                (toggleFilters)="onToggleFilters()"
                (addExpense)="onAddExpense()">
              </app-expense-table-header>

              <!-- Filters -->
              <app-expense-table-filters
                [isExpanded]="isFilterExpanded"
                [filterForm]="filterForm"
                [paymentMethods]="paymentMethods"
                [categories]="categories"
                [filteredCount]="filteredCount"
                [totalCount]="totalCount"
                [hasActiveFilters]="hasActiveFilters"
                (resetFilters)="onResetFilters()">
              </app-expense-table-filters>

              <!-- Summary -->
              <app-expense-table-summary
                [dataSource]="dataSource"
                [filteredCount]="filteredCount"
                [totalCount]="totalCount">
              </app-expense-table-summary>

              <!-- Empty State -->
              <app-expense-table-empty *ngIf="filteredCount === 0"></app-expense-table-empty>

              <!-- Table Content -->
              <div *ngIf="filteredCount > 0" class="table-content">
                <!-- Desktop Table -->
                <app-expense-table-desktop
                  *ngIf="!isMobile"
                  [dataSource]="dataSource"
                  [activeColumns]="activeColumns"
                  [expandedElement]="expandedElement"
                  (modify)="onModify($event)"
                  (delete)="onDelete($event)">
                </app-expense-table-desktop>

                <!-- Mobile Table -->
                <app-expense-table-mobile
                  *ngIf="isMobile"
                  [dataSource]="dataSource"
                  [expandedElement]="expandedElement"
                  (toggleRowExpand)="onToggleRowExpand($event)"
                  (modify)="onModify($event)"
                  (delete)="onDelete($event)">
                </app-expense-table-mobile>

                <!-- Paginator -->
                <app-expense-table-paginator
                  [totalCount]="totalCount"
                  [pageSize]="pageSize"
                  [pageSizeOptions]="pageSizeOptions"
                  (pageChange)="onPageChange($event)">
                </app-expense-table-paginator>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./expense-table-container.component.scss']
})

/* ===== COMPONENT CLASS ===== */
export class ExpenseTableContainerComponent implements OnChanges {
  /* ===== INPUTS ===== */
  @Input() dataSource!: MatTableDataSource<Expense>;
  @Input() filterForm!: FormGroup;
  @Input() paymentMethods: PaymentMethodOption[] = [];
  @Input() categories: CategoryOption[] = [];
  @Input() filteredCount = 0;
  @Input() totalCount = 0;
  @Input() isFilterExpanded = false;
  @Input() isMobile = false;
  @Input() activeColumns: string[] = [];
  @Input() expandedElement: Expense | null = null;
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 25, 50];
  
  /* ===== OUTPUTS ===== */
  @Output() toggleFilters = new EventEmitter<void>();
  @Output() addExpense = new EventEmitter<void>();
  @Output() resetFilters = new EventEmitter<void>();
  @Output() modify = new EventEmitter<Expense>();
  @Output() delete = new EventEmitter<number>();
  @Output() toggleRowExpand = new EventEmitter<Expense>();
  @Output() pageChange = new EventEmitter<{ pageIndex: number; pageSize: number; length: number }>();

  constructor(private cdr: ChangeDetectorRef) {}

  /* ===== LIFECYCLE METHODS ===== */
  ngOnChanges(changes: SimpleChanges): void {
    // Force change detection when inputs change
    this.cdr.markForCheck();
  }

  /* ===== COMPUTED PROPERTIES ===== */
  get hasActiveFilters(): boolean {
    if (!this.filterForm) return false;
    
    const formValue = this.filterForm.value;
    return !!(
      formValue.search ||
      formValue.fromDate ||
      formValue.toDate ||
      formValue.method ||
      formValue.category
    );
  }

  /* ===== EVENT HANDLERS ===== */
  onToggleFilters(): void {
    this.toggleFilters.emit();
  }

  onAddExpense(): void {
    this.addExpense.emit();
  }

  onResetFilters(): void {
    this.resetFilters.emit();
  }

  onModify(expense: Expense): void {
    this.modify.emit(expense);
  }

  onDelete(id: number): void {
    this.delete.emit(id);
  }

  onToggleRowExpand(expense: Expense): void {
    this.toggleRowExpand.emit(expense);
  }

  onPageChange(event: { pageIndex: number; pageSize: number; length: number }): void {
    this.pageChange.emit(event);
  }
}
