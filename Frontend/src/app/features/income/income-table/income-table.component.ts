// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Component, Input, OnInit, OnChanges, AfterViewInit, OnDestroy, SimpleChanges, ViewChild, HostListener, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Meta } from '@angular/platform-browser';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { trigger, state, style, transition, animate, query, stagger } from '@angular/animations';
import { Income } from '../../../models/income.model';
import { PAYMENT_METHOD_OPTIONS } from '../../../enums/payment-method';
import { IncomeApiService, IncomeFilterParams, IncomeApiResponse } from './services/income-api.service';
import { TotalIncomePipe } from './pipes/total-income.pipe';
import { IncomeFilterPipe } from './pipes/income-filter.pipe';

@Component({
  selector: 'app-income-table',
  standalone: false,
  templateUrl: './income-table.component.html',
  styleUrls: ['./income-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-in', style({ opacity: 1 })),
      ]),
    ]),
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(15px)' }),
          stagger(80, [
            animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
    trigger('tableRowAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class IncomeTableComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() public incomes: Income[] = [];
  @Input() public onModify!: (income: Income, event?: MouseEvent) => void;
  @Input() public onDelete!: (id: number, event?: MouseEvent) => void;
  @Input() public onAdd!: () => void;

  public readonly displayedColumns: string[] = [
    'select', 'source', 'amount', 'date', 'method', 'description', 'actions'
  ];
  public readonly mobileDisplayColumns: string[] = [
    'select', 'source', 'amount'
  ];
  public activeColumns: string[] = this.displayedColumns;
  public dataSource = new MatTableDataSource<Income>();
  public readonly paymentMethods = PAYMENT_METHOD_OPTIONS;
  public isLoading = false;
  public isMobile = false;
  public isFilterExpanded = false;
  public expandedElement: Income | null = null;
  public totalAmount = 0;
  public filteredCount = 0;
  public totalCount = 0;
  public currentPage = 0;
  public pageSize = 10;
  public pageSizeOptions = [5, 10, 25, 50];
  public get itemSize(): number {
    return this.isMobile ? 180 : 80;
  }
  public get viewportHeight(): number {
    return this.isMobile ? 600 : 400;
  }
  public filterForm!: FormGroup;
  @ViewChild(MatPaginator) public paginator!: MatPaginator;
  @ViewChild('tableContainer') private tableContainer!: ElementRef;
  private destroy$ = new Subject<void>();
  private resizeObserver: ResizeObserver | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
    private readonly meta: Meta,
    private readonly incomeApiService: IncomeApiService
  ) {
    this.meta.addTags([
      { name: 'description', content: 'Income management table with filtering, sorting, and responsive design' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]);
    this.checkScreenSize();
  }

  public ngOnInit(): void {
    this.cdr.detach();
    this.initFilterForm();
    this.initDataSource();
    this.setupResizeObserver();
    this.cdr.reattach();
    this.cdr.markForCheck();
  }

  public ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
      this.paginator.page
        .pipe(takeUntil(this.destroy$))
        .subscribe((event: PageEvent) => {
          this.currentPage = event.pageIndex;
          this.pageSize = event.pageSize;
          this.loadIncomes();
        });
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['incomes'] && this.incomes) {
      this.handleIncomesChange();
    }
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.checkScreenSize();
        this.cdr.markForCheck();
      });
      if (this.tableContainer?.nativeElement) {
        this.resizeObserver.observe(this.tableContainer.nativeElement);
      }
    }
  }

  @HostListener('window:resize')
  public checkScreenSize(): void {
    this.isMobile = window.innerWidth < 768;
    this.activeColumns = this.isMobile ? this.mobileDisplayColumns : this.displayedColumns;
    this.cdr.markForCheck();
  }

  public applyFilters(): void {
    if (!this.filterForm) return;
    this.currentPage = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.loadIncomes();
  }

  public resetFilters(): void {
    this.filterForm.reset({
      search: '',
      fromDate: '',
      toDate: '',
      method: '',
      received: '',
    });
    this.currentPage = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.loadIncomes();
  }

  public getPaymentLabel(value: string): string {
    const match = PAYMENT_METHOD_OPTIONS.find(option => option.value === value);
    return match ? match.label : value;
  }

  public getPaymentMethodClass(value: string): string {
    const methodMap: { [key: string]: string } = {
      'CASH': 'cash',
      'CARD': 'credit-card',
      'CHECK': 'check',
      'TRANSFER': 'bank-transfer',
      'CRYPTO': 'crypto',
      'PAYPAL': 'paypal'
    };
    return methodMap[value] || 'other';
  }

  public getAmountClass(amount: number): string {
    return amount >= 10000 ? 'high-amount' :
           amount >= 5000 ? 'medium-amount' : 'regular-amount';
  }

  public toggleRowExpand(element: Income): void {
    this.cdr.detach();
    this.expandedElement = this.expandedElement === element ? null : element;
    setTimeout(() => {
      this.cdr.reattach();
      this.cdr.markForCheck();
    }, 225);
  }

  public toggleFilterSection(): void {
    this.isFilterExpanded = !this.isFilterExpanded;
  }

  public hasActiveFilters(): boolean {
    const { search, fromDate, toDate, method, received } = this.filterForm?.value || {};
    return !!search || !!fromDate || !!toDate || !!method || received !== '';
  }

  public formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  public trackByIncome(index: number, item: Income): number {
    return item.id;
  }

  public trackByPaymentMethod(index: number, method: { value: string; label: string }): string {
    return method.value;
  }

  private initFilterForm(): void {
    this.filterForm = this.fb.group({
      search: [''],
      fromDate: [''],
      toDate: [''],
      method: [''],
      received: [''],
    });
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.isLoading = true;
        this.cdr.markForCheck();
        this.loadIncomes();
      });
  }

  private initDataSource(): void {
    this.loadIncomes();
  }

  private handleIncomesChange(): void {
    this.dataSource.data = this.incomes;
    this.totalCount = this.incomes.length;
    this.filteredCount = this.totalCount;
    this.calculateTotalAmount(this.incomes);
    this.cdr.markForCheck();
  }

  private loadIncomes(): void {
    const filters: IncomeFilterParams = this.filterForm?.value || {};
    this.incomeApiService.getIncomes(this.currentPage, this.pageSize, filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: IncomeApiResponse) => {
          this.dataSource.data = response.data;
          this.totalCount = response.total;
          this.filteredCount = response.data.length;
          this.calculateTotalAmount(response.data);
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading incomes:', error);
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  private calculateTotalAmount(incomes: Income[]): void {
    this.totalAmount = incomes.reduce((sum, income) => sum + income.amount, 0);
  }

  public onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadIncomes();
  }
}