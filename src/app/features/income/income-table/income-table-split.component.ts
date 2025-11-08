/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component IncomeTableSplitComponent
  @description Smart container component for income table with filtering, pagination, and responsive design
*/

/* ===== IMPORTS ===== */
import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, ElementRef, HostListener, inject, Input, OnChanges, OnInit, PLATFORM_ID, SimpleChanges, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { PAYMENT_METHOD_OPTIONS } from '../../../enums/payment-method';
import { Income } from '../../../models/income.model';
import { IncomeTableContainerComponent } from './components/income-table-container/income-table-container.component';

/* ===== COMPONENT DECORATOR ===== */
@Component({
  selector: 'app-income-table-split',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    IncomeTableContainerComponent
  ],
  template: `
    <app-income-table-container
      [dataSource]="dataSource"
      [filterForm]="filterForm"
      [paymentMethods]="paymentMethods"
      [filteredCount]="filteredCount"
      [totalCount]="totalCount"
      [isFilterExpanded]="isFilterExpanded"
      [isMobile]="isMobile"
      [activeColumns]="activeColumns"
      [expandedElement]="expandedElement"
      [pageSize]="pageSize"
      [pageSizeOptions]="pageSizeOptions"
      (toggleFilters)="toggleFilterSection()"
      (addIncome)="handleAdd()"
      (resetFilters)="resetFilters()"
      (modify)="handleModify($event)"
      (delete)="handleDelete($event)"
      (toggleRowExpand)="toggleRowExpand($event)"
      (pageChange)="onPageChange($event)"
      role="region"
      aria-label="Income table with filtering and pagination">
    </app-income-table-container>
  `,
  styleUrls: ['./income-table-split.component.scss']
})
export class IncomeTableSplitComponent implements OnInit, OnChanges, AfterViewInit {
  /* ===== INPUTS ===== */
  @Input() public incomes: Income[] = [];
  @Input() public onModify!: (income: Income, event?: MouseEvent) => void;
  @Input() public onDelete!: (id: number, event?: MouseEvent) => void;
  @Input() public onAdd!: () => void;

  /* ===== COMPONENT STATE ===== */
  public readonly displayedColumns: string[] = [
    'select', 'method', 'source', 'amount', 'date', 'description', 'actions'
  ];
  public readonly mobileDisplayColumns: string[] = [
    'select', 'method', 'source', 'amount'
  ];
  public activeColumns: string[] = this.displayedColumns;
  public dataSource = new MatTableDataSource<Income>();
  public readonly paymentMethods = PAYMENT_METHOD_OPTIONS;

  public isMobile = false;
  public isFilterExpanded = false;
  public filterForm!: FormGroup;
  public totalCount = 0;
  public filteredCount = 0;
  public pageSize = 10;
  public pageSizeOptions: number[] = [5, 10, 25, 50];
  public currentPage = 0;
  public expandedElement: Income | null = null;
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
    this.handleIncomesChange();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['incomes'] && changes['incomes'].currentValue) {
      this.handleIncomesChange();
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
      received: ['']
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

  private handleIncomesChange(): void {
    if (this.incomes && Array.isArray(this.incomes)) {
      // Apply initial pagination
      const startIndex = this.currentPage * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      const paginatedData = this.incomes.slice(startIndex, endIndex);
      
      this.dataSource.data = paginatedData;
      this.filteredCount = this.incomes.length;
      this.totalCount = this.incomes.length;
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
    let filteredData = [...this.incomes];

    if (filterValue.search) {
      const searchTerm = filterValue.search.toLowerCase();
      filteredData = filteredData.filter(income =>
        income.source.toLowerCase().includes(searchTerm) ||
        income.description?.toLowerCase().includes(searchTerm) ||
        income.amount.toString().includes(searchTerm)
      );
    }

    if (filterValue.fromDate) {
      filteredData = filteredData.filter(income =>
        new Date(income.date) >= new Date(filterValue.fromDate)
      );
    }

    if (filterValue.toDate) {
      filteredData = filteredData.filter(income =>
        new Date(income.date) <= new Date(filterValue.toDate)
      );
    }

    if (filterValue.method) {
      filteredData = filteredData.filter(income =>
        income.paymentMethod.toLowerCase() === filterValue.method.toLowerCase()
      );
    }

    if (filterValue.received !== '') {
      const isReceived = filterValue.received === 'true';
      filteredData = filteredData.filter(income =>
        income.isReceived === isReceived
      );
    }

    // Apply pagination to filtered data
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    this.dataSource.data = paginatedData;
    this.filteredCount = filteredData.length;
    this.totalCount = this.incomes.length;
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
      received: ''
    });
    
    // Reset data to show all incomes with pagination
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const paginatedData = this.incomes.slice(startIndex, endIndex);
    
    this.dataSource.data = paginatedData;
    this.filteredCount = this.incomes.length;
    this.totalCount = this.incomes.length;
    
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

  public toggleRowExpand(income: Income): void {
    this.expandedElement = this.expandedElement === income ? null : income;
    this.cdr.markForCheck();
  }

  public onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    
    // Re-apply filters with new pagination
    this.applyFilters();
  }

  public trackByIncome(index: number, income: Income): number {
    return income.id;
  }

  public trackByPaymentMethod(index: number, option: { value: string; label: string }): string {
    return option.value;
  }

  /* ===== EVENT HANDLERS ===== */
  public handleAdd(): void {
    this.onAdd();
  }

  public handleModify(income: Income): void {
    this.onModify(income);
  }

  public handleDelete(id: number): void {
    this.onDelete(id);
  }
}
