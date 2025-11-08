/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component IncomeTableContainerComponent
  @description Income table container component for displaying income data
*/

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';

/* ===== IMPORTS ===== */
import { Income } from '../../../../../models/income.model';
import { IncomeTableDesktopComponent } from '../income-table-desktop/income-table-desktop.component';
import { IncomeTableEmptyComponent } from '../income-table-empty/income-table-empty.component';
import { IncomeTableFiltersComponent } from '../income-table-filters/income-table-filters.component';
import { IncomeTableHeaderComponent } from '../income-table-header/income-table-header.component';
import { IncomeTableMobileComponent } from '../income-table-mobile/income-table-mobile.component';
import { IncomeTablePaginatorComponent } from '../income-table-paginator/income-table-paginator.component';
import { IncomeTableSummaryComponent } from '../income-table-summary/income-table-summary.component';

/* ===== INTERFACES ===== */
interface PaymentMethodOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-income-table-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IncomeTableHeaderComponent,
    IncomeTableFiltersComponent,
    IncomeTableSummaryComponent,
    IncomeTableDesktopComponent,
    IncomeTableMobileComponent,
    IncomeTablePaginatorComponent,
    IncomeTableEmptyComponent
  ],
  template: `
    <section class="income-table-section">
      <div class="container">
        <div class="row justify-content-center g-2">
          <div class="col-12">
            <div class="table-card" role="region" aria-labelledby="incomeBreakdownTitle">
              
              <!-- Header -->
              <app-income-table-header
                [hasActiveFilters]="hasActiveFilters"
                [isFilterExpanded]="isFilterExpanded"
                (toggleFilters)="onToggleFilters()"
                (addIncome)="onAddIncome()">
              </app-income-table-header>

              <!-- Filters -->
              <app-income-table-filters
                [isExpanded]="isFilterExpanded"
                [filterForm]="filterForm"
                [paymentMethods]="paymentMethods"
                [filteredCount]="filteredCount"
                [totalCount]="totalCount"
                [hasActiveFilters]="hasActiveFilters"
                (resetFilters)="onResetFilters()">
              </app-income-table-filters>

              <!-- Summary -->
              <app-income-table-summary
                [dataSource]="dataSource"
                [filteredCount]="filteredCount"
                [totalCount]="totalCount">
              </app-income-table-summary>

              <!-- Empty State -->
              <app-income-table-empty *ngIf="filteredCount === 0"></app-income-table-empty>

              <!-- Table Content -->
              <div *ngIf="filteredCount > 0" class="table-content">
                <!-- Desktop Table -->
                <app-income-table-desktop
                  *ngIf="!isMobile"
                  [dataSource]="dataSource"
                  [activeColumns]="activeColumns"
                  [expandedElement]="expandedElement"
                  (modify)="onModify($event)"
                  (delete)="onDelete($event)">
                </app-income-table-desktop>

                <!-- Mobile Table -->
                <app-income-table-mobile
                  *ngIf="isMobile"
                  [dataSource]="dataSource"
                  [expandedElement]="expandedElement"
                  (toggleRowExpand)="onToggleRowExpand($event)"
                  (modify)="onModify($event)"
                  (delete)="onDelete($event)">
                </app-income-table-mobile>

                <!-- Paginator -->
                <app-income-table-paginator
                  [totalCount]="totalCount"
                  [pageSize]="pageSize"
                  [pageSizeOptions]="pageSizeOptions"
                  (pageChange)="onPageChange($event)">
                </app-income-table-paginator>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./income-table-container.component.scss']
})

/* ===== COMPONENT CLASS ===== */
export class IncomeTableContainerComponent implements OnChanges {
  /* ===== INPUTS ===== */
  @Input() dataSource!: MatTableDataSource<Income>;
  @Input() filterForm!: FormGroup;
  @Input() paymentMethods: PaymentMethodOption[] = [];
  @Input() filteredCount = 0;
  @Input() totalCount = 0;
  @Input() isFilterExpanded = false;
  @Input() isMobile = false;
  @Input() activeColumns: string[] = [];
  @Input() expandedElement: Income | null = null;
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 25, 50];
  
  /* ===== OUTPUTS ===== */
  @Output() toggleFilters = new EventEmitter<void>();
  @Output() addIncome = new EventEmitter<void>();
  @Output() resetFilters = new EventEmitter<void>();
  @Output() modify = new EventEmitter<Income>();
  @Output() delete = new EventEmitter<number>();
  @Output() toggleRowExpand = new EventEmitter<Income>();
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
      formValue.received
    );
  }

  /* ===== EVENT HANDLERS ===== */
  onToggleFilters(): void {
    this.toggleFilters.emit();
  }

  onAddIncome(): void {
    this.addIncome.emit();
  }

  onResetFilters(): void {
    this.resetFilters.emit();
  }

  onModify(income: Income): void {
    this.modify.emit(income);
  }

  onDelete(id: number): void {
    this.delete.emit(id);
  }

  onToggleRowExpand(income: Income): void {
    this.toggleRowExpand.emit(income);
  }

  onPageChange(event: { pageIndex: number; pageSize: number; length: number }): void {
    this.pageChange.emit(event);
  }
}
