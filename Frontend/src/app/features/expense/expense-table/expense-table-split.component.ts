/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseTableSplitComponent
  @description Smart container component for expense table with filtering, pagination, and responsive design
*/

/* ===== IMPORTS ===== */
import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, ElementRef, HostListener, inject, Input, OnChanges, OnInit, PLATFORM_ID, SimpleChanges, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { EXPENSE_CATEGORY_OPTIONS } from '../../../enums/expense-category';
import { PAYMENT_METHOD_OPTIONS } from '../../../enums/payment-method';
import { Expense } from '../../../models/expense.model';
import { ExpenseTableContainerComponent } from './components/expense-table-container/expense-table-container.component';

/* ===== COMPONENT DECORATOR ===== */
@Component({
  selector: 'app-expense-table-split',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ExpenseTableContainerComponent
  ],
  template: `
    <app-expense-table-container
      [dataSource]="dataSource"
      [filterForm]="filterForm"
      [paymentMethods]="paymentMethods"
      [categories]="categories"
      [filteredCount]="filteredCount"
      [totalCount]="totalCount"
      [isFilterExpanded]="isFilterExpanded"
      [isMobile]="isMobile"
      [activeColumns]="activeColumns"
      [expandedElement]="expandedElement"
      [pageSize]="pageSize"
      [pageSizeOptions]="pageSizeOptions"
      (toggleFilters)="toggleFilterSection()"
      (addExpense)="handleAdd()"
      (resetFilters)="resetFilters()"
      (modify)="handleModify($event)"
      (delete)="handleDelete($event)"
      (toggleRowExpand)="toggleRowExpand($event)"
      (pageChange)="onPageChange($event)"
      role="region"
      aria-label="Expense table with filtering and pagination">
    </app-expense-table-container>
  `,
  styleUrls: ['./expense-table-split.component.scss']
})
export class ExpenseTableSplitComponent implements OnInit, OnChanges, AfterViewInit {
  /* ===== INPUTS ===== */
  @Input() public expenses: Expense[] = [];
  @Input() public onModify!: (expense: Expense, event?: MouseEvent) => void;
  @Input() public onDelete!: (id: number, event?: MouseEvent) => void;
  @Input() public onAdd!: () => void;

  /* ===== COMPONENT STATE ===== */
  public readonly displayedColumns: string[] = [
    'method', 'category', 'amount', 'date', 'description', 'actions'
  ];
  public readonly mobileDisplayColumns: string[] = [
    'method', 'category', 'amount'
  ];
  public activeColumns: string[] = this.displayedColumns;
  public dataSource = new MatTableDataSource<Expense>();
  public readonly paymentMethods = PAYMENT_METHOD_OPTIONS;
  public readonly categories = EXPENSE_CATEGORY_OPTIONS;

  public isMobile = false;
  public isFilterExpanded = false;
  public filterForm!: FormGroup;
  public totalCount = 0;
  public filteredCount = 0;
  public pageSize = 10;
  public pageSizeOptions: number[] = [5, 10, 25, 50];
  public currentPage = 0;
  public expandedElement: Expense | null = null;
  private isResetting = false;

  /* ===== DEPENDENCIES ===== */
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly elementRef = inject(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  @ViewChild('tableContainer') tableContainer!: ElementRef;

  /* ===== LIFECYCLE HOOKS ===== */
  ngOnInit(): void {
    this.initializeForm();
    this.setupResponsiveDesign();
    this.setupFilterSubscription();
    this.handleExpensesChange();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['expenses'] && changes['expenses'].currentValue) {
      this.handleExpensesChange();
    }
  }

  ngAfterViewInit(): void {
    this.checkScreenSize();
  }

  /* ===== HOST LISTENERS ===== */
  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.checkScreenSize();
  }

  /* ===== PRIVATE METHODS ===== */
  private initializeForm(): void {
    this.filterForm = this.fb.group({
      search: [''],
      fromDate: [''],
      toDate: [''],
      method: [''],
      category: ['']
    });
  }

  private setupResponsiveDesign(): void {
    this.checkScreenSize();
  }

  private setupFilterSubscription(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        if (!this.isResetting) {
          this.applyFilters();
        }
      });
  }

  private handleExpensesChange(): void {
    if (this.expenses && Array.isArray(this.expenses)) {
      // Apply initial pagination
      const startIndex = this.currentPage * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      const paginatedData = this.expenses.slice(startIndex, endIndex);
      
      this.dataSource.data = paginatedData;
      this.filteredCount = this.expenses.length;
      this.totalCount = this.expenses.length;
      this.cdr.markForCheck();
    }
  }

  private checkScreenSize(): void {
    if (!this.isBrowser) return;
    
    this.isMobile = window.innerWidth < 768;
    this.activeColumns = this.isMobile ? this.mobileDisplayColumns : this.displayedColumns;
    this.cdr.markForCheck();
  }

  private applyFilters(): void {
    const filterValue = this.filterForm.value;
    let filteredData = [...this.expenses];

    if (filterValue.search) {
      const searchTerm = filterValue.search.toLowerCase();
      filteredData = filteredData.filter(expense =>
        expense.category.toLowerCase().includes(searchTerm) ||
        expense.description?.toLowerCase().includes(searchTerm) ||
        expense.amount.toString().includes(searchTerm)
      );
    }

    if (filterValue.fromDate) {
      filteredData = filteredData.filter(expense =>
        new Date(expense.date) >= new Date(filterValue.fromDate)
      );
    }

    if (filterValue.toDate) {
      filteredData = filteredData.filter(expense =>
        new Date(expense.date) <= new Date(filterValue.toDate)
      );
    }

    if (filterValue.method) {
      filteredData = filteredData.filter(expense =>
        expense.paymentMethod.toLowerCase() === filterValue.method.toLowerCase()
      );
    }

    if (filterValue.category) {
      filteredData = filteredData.filter(expense =>
        expense.category.toLowerCase() === filterValue.category.toLowerCase()
      );
    }

    // Apply pagination to filtered data
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    this.dataSource.data = paginatedData;
    this.filteredCount = filteredData.length;
    this.totalCount = this.expenses.length;
    this.cdr.markForCheck();
  }

  /* ===== PUBLIC METHODS ===== */
  public toggleFilterSection(): void {
    this.isFilterExpanded = !this.isFilterExpanded;
    this.cdr.markForCheck();
  }

  public resetFilters(): void {
    this.isResetting = true;
    
    // Reset form to default values
    this.filterForm.reset({
      search: '',
      fromDate: '',
      toDate: '',
      method: '',
      category: ''
    });
    
    // Reset data to show all expenses with pagination
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const paginatedData = this.expenses.slice(startIndex, endIndex);
    
    this.dataSource.data = paginatedData;
    this.filteredCount = this.expenses.length;
    this.totalCount = this.expenses.length;
    
    // Re-enable filter subscription after a short delay
    const timeoutId = setTimeout(() => {
      this.isResetting = false;
    }, 100);
    
    // Clean up timeout on destroy
    this.destroyRef.onDestroy(() => {
      clearTimeout(timeoutId);
    });
    
    this.cdr.markForCheck();
  }

  public toggleRowExpand(expense: Expense): void {
    this.expandedElement = this.expandedElement === expense ? null : expense;
    this.cdr.markForCheck();
  }

  public onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    
    // Re-apply filters with new pagination
    this.applyFilters();
  }

  public trackByExpense(index: number, expense: Expense): number {
    return expense.id;
  }

  public trackByPaymentMethod(index: number, option: { value: string; label: string }): string {
    return option.value;
  }

  /* ===== EVENT HANDLERS ===== */
  public handleAdd(): void {
    this.onAdd();
  }

  public handleModify(expense: Expense): void {
    this.onModify(expense);
  }

  public handleDelete(id: number): void {
    this.onDelete(id);
  }
}
