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
import { Expense } from '../../../models/expense.model';
import { PAYMENT_METHOD_OPTIONS } from '../../../enums/payment-method';
import { EXPENSE_CATEGORY_OPTIONS } from '../../../enums/expense-category';
import { ExpenseApiService, ExpenseFilterParams, ExpenseApiResponse } from './services/expense-api.service';
import { TotalExpensePipe } from './pipes/total-expense.pipe';
import { ExpenseFilterPipe } from './pipes/expense-filter.pipe';

@Component({
  selector: 'app-expense-table',
  standalone: false,
  templateUrl: './expense-table.component.html',
  styleUrls: ['./expense-table.component.scss'],
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
export class ExpenseTableComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() public expenses: Expense[] = [];
  @Input() public onModify!: (expense: Expense, event?: MouseEvent) => void;
  @Input() public onDelete!: (id: number, event?: MouseEvent) => void;
  @Input() public onAdd!: () => void;

  public readonly displayedColumns: string[] = [
    'select', 'category', 'amount', 'date', 'method', 'description', 'actions'
  ];
  public readonly mobileDisplayColumns: string[] = [
    'select', 'category', 'amount'
  ];
  public activeColumns: string[] = this.displayedColumns;
  public dataSource = new MatTableDataSource<Expense>();
  public readonly categoryOptions = EXPENSE_CATEGORY_OPTIONS;
  public readonly paymentMethods = PAYMENT_METHOD_OPTIONS;
  public isLoading = false;
  public isMobile = false;
  public isFilterExpanded = false;
  public expandedElement: Expense | null = null;
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
    private readonly expenseApiService: ExpenseApiService
  ) {
    this.meta.addTags([
      { name: 'description', content: 'Expense management table with filtering, sorting, and responsive design' },
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
          this.loadExpenses();
        });
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['expenses'] && this.expenses) {
      this.handleExpensesChange();
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
    this.loadExpenses();
  }

  public resetFilters(): void {
    this.filterForm.reset({
      search: '',
      fromDate: '',
      toDate: '',
      category: '',
      method: '',
    });
    this.currentPage = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.loadExpenses();
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

  public getCategoryIcon(category: string): string {
    const iconMap: { [key: string]: string } = {
      // FIXED LIVING EXPENSES
      'RENT': 'home',
      'MORTGAGE': 'account_balance',
      'UTILITIES': 'power',
      'INTERNET_PHONE': 'wifi',
      'HOME_INSURANCE': 'security',
      'PROPERTY_TAX': 'receipt_long',
      'HOME_MAINTENANCE': 'build',

      // FOOD & DINING
      'GROCERIES': 'shopping_cart',
      'RESTAURANTS': 'restaurant',
      'COFFEE_SNACKS': 'local_cafe',
      'FOOD_DELIVERY': 'delivery_dining',

      // TRANSPORTATION
      'FUEL': 'local_gas_station',
      'CAR_PAYMENT': 'directions_car',
      'CAR_INSURANCE': 'car_crash',
      'CAR_REPAIRS': 'build_circle',
      'PARKING_TOLLS': 'local_parking',
      'PUBLIC_TRANSPORT': 'directions_bus',

      // PERSONAL & HEALTH
      'HEALTH_INSURANCE': 'health_and_safety',
      'MEDICAL': 'medical_services',
      'PHARMACY': 'local_pharmacy',
      'FITNESS': 'fitness_center',
      'PERSONAL_CARE': 'spa',

      // SHOPPING & ESSENTIALS
      'CLOTHING': 'checkroom',
      'ELECTRONICS': 'devices',
      'HOME_SUPPLIES': 'cleaning_services',
      'BEAUTY_COSMETICS': 'face',

      // FAMILY & CHILDCARE
      'CHILDCARE': 'child_care',
      'EDUCATION_CHILD': 'school',
      'TOYS_GAMES': 'sports_esports',
      'PET_EXPENSES': 'pets',

      // EDUCATION & SELF-DEVELOPMENT
      'TUITION': 'school',
      'ONLINE_COURSES': 'computer',
      'BOOKS': 'menu_book',
      'WORKSHOPS': 'groups',

      // ENTERTAINMENT & LEISURE
      'STREAMING': 'play_circle',
      'MOVIES_EVENTS': 'movie',
      'TRAVEL': 'flight',
      'HOBBIES': 'sports_soccer',

      // DEBT & SAVINGS
      'LOAN_PAYMENT': 'account_balance_wallet',
      'CREDIT_CARD_PAYMENT': 'credit_card',
      'SAVINGS_CONTRIBUTION': 'savings',
      'INVESTMENT_CONTRIBUTION': 'trending_up',

      // BUSINESS & PROFESSIONAL
      'WORK_TOOLS': 'construction',
      'PROFESSIONAL_SERVICES': 'business_center',
      'PROFESSIONAL_SUBSCRIPTIONS': 'subscriptions',
      'OFFICE_RENT': 'business',

      // GIVING & DONATIONS
      'CHARITY': 'volunteer_activism',
      'GIFTS': 'card_giftcard',
      'RELIGIOUS_OFFERING': 'church',

      // EMERGENCY & UNPLANNED
      'EMERGENCY_EXPENSE': 'emergency',
      'ACCIDENT': 'report_problem',
      'UNPLANNED_TRAVEL': 'flight_takeoff',
      'MEDICAL_EMERGENCY': 'local_hospital',

      // FEES & CHARGES
      'BANK_FEES': 'account_balance',
      'LATE_FEES': 'schedule',
      'SERVICE_CHARGES': 'receipt',
      'FOREIGN_FEES': 'currency_exchange'
    };
    return iconMap[category] || 'category';
  }

  public getCategoryColor(category: string): string {
    const colorMap: { [key: string]: string } = {
      // FIXED LIVING EXPENSES - Blue tones
      'RENT': 'blue',
      'MORTGAGE': 'blue',
      'UTILITIES': 'blue',
      'INTERNET_PHONE': 'blue',
      'HOME_INSURANCE': 'blue',
      'PROPERTY_TAX': 'blue',
      'HOME_MAINTENANCE': 'blue',

      // FOOD & DINING - Orange/Red tones
      'GROCERIES': 'orange',
      'RESTAURANTS': 'orange',
      'COFFEE_SNACKS': 'orange',
      'FOOD_DELIVERY': 'orange',

      // TRANSPORTATION - Green tones
      'FUEL': 'green',
      'CAR_PAYMENT': 'green',
      'CAR_INSURANCE': 'green',
      'CAR_REPAIRS': 'green',
      'PARKING_TOLLS': 'green',
      'PUBLIC_TRANSPORT': 'green',

      // PERSONAL & HEALTH - Red tones
      'HEALTH_INSURANCE': 'red',
      'MEDICAL': 'red',
      'PHARMACY': 'red',
      'FITNESS': 'red',
      'PERSONAL_CARE': 'red',

      // SHOPPING & ESSENTIALS - Purple tones
      'CLOTHING': 'purple',
      'ELECTRONICS': 'purple',
      'HOME_SUPPLIES': 'purple',
      'BEAUTY_COSMETICS': 'purple',

      // FAMILY & CHILDCARE - Pink tones
      'CHILDCARE': 'pink',
      'EDUCATION_CHILD': 'pink',
      'TOYS_GAMES': 'pink',
      'PET_EXPENSES': 'pink',

      // EDUCATION & SELF-DEVELOPMENT - Teal tones
      'TUITION': 'teal',
      'ONLINE_COURSES': 'teal',
      'BOOKS': 'teal',
      'WORKSHOPS': 'teal',

      // ENTERTAINMENT & LEISURE - Yellow tones
      'STREAMING': 'yellow',
      'MOVIES_EVENTS': 'yellow',
      'TRAVEL': 'yellow',
      'HOBBIES': 'yellow',

      // DEBT & SAVINGS - Indigo tones
      'LOAN_PAYMENT': 'indigo',
      'CREDIT_CARD_PAYMENT': 'indigo',
      'SAVINGS_CONTRIBUTION': 'indigo',
      'INVESTMENT_CONTRIBUTION': 'indigo',

      // BUSINESS & PROFESSIONAL - Gray tones
      'WORK_TOOLS': 'gray',
      'PROFESSIONAL_SERVICES': 'gray',
      'PROFESSIONAL_SUBSCRIPTIONS': 'gray',
      'OFFICE_RENT': 'gray',

      // GIVING & DONATIONS - Brown tones
      'CHARITY': 'brown',
      'GIFTS': 'brown',
      'RELIGIOUS_OFFERING': 'brown',

      // EMERGENCY & UNPLANNED - Deep Red tones
      'EMERGENCY_EXPENSE': 'deep-red',
      'ACCIDENT': 'deep-red',
      'UNPLANNED_TRAVEL': 'deep-red',
      'MEDICAL_EMERGENCY': 'deep-red',

      // FEES & CHARGES - Light Gray tones
      'BANK_FEES': 'light-gray',
      'LATE_FEES': 'light-gray',
      'SERVICE_CHARGES': 'light-gray',
      'FOREIGN_FEES': 'light-gray'
    };
    return colorMap[category] || 'default';
  }

  public getCategoryLabel(value: string): string {
    const match = EXPENSE_CATEGORY_OPTIONS.find(option => option.value === value);
    return match ? match.label : value;
  }

  public getAmountClass(amount: number): string {
    return amount >= 10000 ? 'high-amount' :
           amount >= 5000 ? 'medium-amount' : 'regular-amount';
  }

  public getCategoryClass(category: string): string {
    const categoryColorMap: Record<string, string> = {
      food: 'food',
      housing: 'housing',
      transportation: 'transportation',
      entertainment: 'entertainment',
      utilities: 'utilities',
      healthcare: 'healthcare',
      education: 'education',
      personal: 'personal',
      debt: 'debt',
      savings: 'savings',
      gifts: 'gifts',
      other: 'other',
    };
    return categoryColorMap[category.toLowerCase()] || 'other';
  }

  public toggleRowExpand(element: Expense): void {
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
    const { search, fromDate, toDate, category, method } = this.filterForm?.value || {};
    return !!search || !!fromDate || !!toDate || !!category || !!method;
  }

  public formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  public trackByExpense(index: number, item: Expense): number {
    return item.id;
  }

  public trackByCategory(index: number, category: { value: string; label: string }): string {
    return category.value;
  }

  public trackByPaymentMethod(index: number, method: { value: string; label: string }): string {
    return method.value;
  }

  private initFilterForm(): void {
    this.filterForm = this.fb.group({
      search: [''],
      fromDate: [''],
      toDate: [''],
      category: [''],
      method: [''],
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
        this.loadExpenses();
      });
  }

  private initDataSource(): void {
    this.loadExpenses();
  }

  private handleExpensesChange(): void {
    this.dataSource.data = this.expenses;
    this.totalCount = this.expenses.length;
    this.filteredCount = this.totalCount;
    this.calculateTotalAmount(this.expenses);
    this.cdr.markForCheck();
  }

  private loadExpenses(): void {
    const filters: ExpenseFilterParams = this.filterForm?.value || {};
    this.expenseApiService.getExpenses(this.currentPage, this.pageSize, filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ExpenseApiResponse) => {
          this.dataSource.data = response.data;
          this.totalCount = response.total;
          this.filteredCount = response.data.length;
          this.calculateTotalAmount(response.data);
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading expenses:', error);
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  private calculateTotalAmount(expenses: Expense[]): void {
    this.totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

  public onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadExpenses();
  }
}