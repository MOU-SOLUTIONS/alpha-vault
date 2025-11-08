/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component BudgetTableComponent
  @description Budget table component for displaying and managing budget categories
*/

import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, DestroyRef, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, fromEvent } from 'rxjs';

import { META_FRAGMENT } from '../../../core/seo/page-meta.model';
import { EXPENSE_CATEGORY_OPTIONS } from '../../../enums/expense-category';
import { ExpenseCategoryIcons } from '../../../enums/expense-category-icons';
import { BudgetCategory, ExpenseCategory } from '../../../models/budget.model';

interface BudgetTableItem {
  category: ExpenseCategory;
  allocated: number;
  remaining: number;
  spent: number;
  usedPercent: number;
  status: 'excellent' | 'good' | 'warning' | 'danger';
  statusColor: string;
  gradient: string;
  icon: string;
  formattedAllocated?: string;
  formattedRemaining?: string;
  formattedUsage?: string;
  categoryLabel?: string;
  categoryIcon?: string;
  allocatedClass?: string;
  remainingClass?: string;
  usageClass?: string;
}

@Component({
  selector: 'app-budget-table',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatTableModule
  ],
  templateUrl: './budget-table.component.html',
  styleUrls: ['./budget-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: META_FRAGMENT,
      useValue: {
        description: 'Comprehensive budget breakdown table with category-wise allocations, spending tracking, usage percentages, and interactive management. View, edit, and delete budget categories with real-time summaries and pagination in Alpha Vault.'
      }
    }
  ],
})
export class BudgetTableComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) categories: BudgetCategory[] = [];
  @Input({ required: true }) onAdd!: () => void;
  @Input({ required: true }) onModify!: (budgetTableItem: BudgetTableItem) => void;
  @Output() delete = new EventEmitter<string>();

  isVisible = false;
  isInteractive = false;
  hasData = false;
  totalAllocated = 0;
  totalRemaining = 0;
  totalSpent = 0;
  averageUsage = 0;
  
  currentPage = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  totalItems = 0;
  
  tableData: BudgetTableItem[] = [];
  paginatedData: BudgetTableItem[] = [];
  
  
  public readonly displayedColumns: string[] = [
    'category', 'allocated', 'remaining', 'usage', 'actions'
  ];
  
  public dataSource = new MatTableDataSource<BudgetTableItem>();
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  
  private readonly _categories = signal<BudgetCategory[]>([]);
  private readonly _tableData = signal<BudgetTableItem[]>([]);
  private readonly _isMobile = signal<boolean>(false);

  constructor() {
    // SEO fragment provided via META_FRAGMENT token
    // Parent component (BudgetComponent) aggregates all fragments via SeoService
  }
  
  readonly computedTableData = computed(() => {
    const tableData = this._tableData();
    return tableData.map(item => ({
      ...item,
      formattedAllocated: this.getFormattedAmount(item.allocated),
      formattedRemaining: this.getFormattedAmount(item.remaining),
      formattedUsage: item.usedPercent.toFixed(1),
      categoryLabel: this.getCategoryLabel(item.category),
      categoryIcon: this.getCategoryIcon(item.category),
      allocatedClass: this.getAmountClassForElement(item, 'allocated'),
      remainingClass: this.getAmountClassForElement(item, 'remaining'),
      usageClass: this.getUsageClassForElement(item)
    }));
  });

  readonly computedSummaryStats = computed(() => {
    const tableData = this._tableData();
    const totalAllocated = tableData.reduce((sum, item) => sum + item.allocated, 0);
    const totalRemaining = tableData.reduce((sum, item) => sum + item.remaining, 0);
    const totalSpent = tableData.reduce((sum, item) => sum + item.spent, 0);
    const averageUsage = tableData.length > 0 
      ? tableData.reduce((sum, item) => sum + item.usedPercent, 0) / tableData.length 
      : 0;

    return {
      totalAllocatedFormatted: this.getFormattedAmount(totalAllocated),
      totalRemainingFormatted: this.getFormattedAmount(totalRemaining),
      totalSpentFormatted: this.getFormattedAmount(totalSpent),
      averageUsageFormatted: averageUsage.toFixed(1)
    };
  });
  
  readonly isMobile = this._isMobile.asReadonly();

  ngOnInit(): void {
    if (this.isBrowser) {
      this.checkScreenSize();
      this.setupResizeListener();
    }
    this._categories.set(this.categories);
    this.processData();
    this.isVisible = true;
    this.isInteractive = true;
    this.cdr.markForCheck();
  }
  
  private setupResizeListener(): void {
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(100),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.checkScreenSize();
      });
  }

  ngOnChanges(): void {
    this._categories.set(this.categories);
    this.processData();
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
  }


  private checkScreenSize(): void {
    if (this.isBrowser) {
      this._isMobile.set(window.innerWidth < 768);
      this.cdr.markForCheck();
    }
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedData();
  }

  getCategoryLabel(value: string): string {
    const match = EXPENSE_CATEGORY_OPTIONS.find(option => option.value === value);
    return match ? match.label : value;
  }

  getCategoryIcon(category: string): string {
    return ExpenseCategoryIcons[category] || 'category';
  }

  getStatusConfig(item: BudgetTableItem): { color: string; label: string } {
    const configs = {
      excellent: { color: '#10b981', label: 'Excellent' },
      good: { color: '#059669', label: 'Good' },
      warning: { color: '#f59e0b', label: 'Warning' },
      danger: { color: '#ef4444', label: 'Danger' }
    };
    return configs[item.status];
  }

  getFormattedAmount(amount: number): string {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  getTotalAllocatedFormatted(): string {
    return this.getFormattedAmount(this.totalAllocated);
  }

  getTotalRemainingFormatted(): string {
    return this.getFormattedAmount(this.totalRemaining);
  }

  getTotalSpentFormatted(): string {
    return this.getFormattedAmount(this.totalSpent);
  }

  getAverageUsageFormatted(): string {
    return this.averageUsage.toFixed(1);
  }

  trackByStat(index: number, stat: { label: string }): string {
    return stat.label;
  }

  trackByKey(index: number, item: { key: string; value: string }): string {
    return item.key;
  }

  trackByCategory(index: number, item: BudgetTableItem): string {
    return item.category;
  }


  onDelete(category: string): void {
    this.delete.emit(category);
  }

  onAddKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onAdd();
    }
  }

  onModifyKeydown(event: KeyboardEvent, item: BudgetTableItem): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onModify(item);
    }
  }

  onDeleteKeydown(event: KeyboardEvent, category: string): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onDelete(category);
    }
  }

  getAmountClassForElement(item: BudgetTableItem, type: 'allocated' | 'remaining'): string {
    const amount = type === 'allocated' ? item.allocated : item.remaining;
    if (amount >= 1000) return 'high-amount';
    if (amount >= 500) return 'medium-amount';
    return 'regular-amount';
  }

  getUsageClassForElement(item: BudgetTableItem): string {
    if (item.usedPercent >= 90) return 'danger';
    if (item.usedPercent >= 75) return 'warning';
    if (item.usedPercent >= 50) return 'good';
    return 'excellent';
  }

  private updatePaginatedData(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const tableData = this._tableData();
    this.paginatedData = tableData.slice(startIndex, endIndex);
    
    this.dataSource.data = this.computedTableData();
    this.cdr.markForCheck();
  }

  private processData(): void {
    const categories = this._categories();
    if (!categories || categories.length === 0) {
      this.hasData = false;
      this._tableData.set([]);
      this.paginatedData = [];
      this.dataSource.data = [];
      this.resetTotals();
      this.cdr.markForCheck();
      return;
    }

    this.hasData = true;
    const processedData = categories.map(cat => {
      const remaining = cat.remaining ?? 0;
      const spent = cat.allocated - remaining;
      const usedPercent = cat.allocated > 0 ? (spent / cat.allocated) * 100 : 0;
      
      let status: BudgetTableItem['status'] = 'excellent';
      let statusColor = '#10b981';
      let gradient = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      let icon = 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z';

      if (usedPercent >= 90) {
        status = 'danger';
        statusColor = '#ef4444';
        gradient = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        icon = 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z';
      } else if (usedPercent >= 75) {
        status = 'warning';
        statusColor = '#f59e0b';
        gradient = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
        icon = 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      } else if (usedPercent >= 50) {
        status = 'good';
        statusColor = '#059669';
        gradient = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
        icon = 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      }

      return {
        category: cat.category,
        allocated: cat.allocated,
        remaining: remaining,
        spent,
        usedPercent: +usedPercent.toFixed(1),
        status,
        statusColor,
        gradient,
        icon
      };
    });

    this._tableData.set(processedData);
    this.totalItems = processedData.length;
    this.updatePaginatedData();
    this.calculateTotals();
    this.cdr.markForCheck();
  }

  private calculateTotals(): void {
    const tableData = this._tableData();
    this.totalAllocated = tableData.reduce((sum, item) => sum + item.allocated, 0);
    this.totalRemaining = tableData.reduce((sum, item) => sum + item.remaining, 0);
    this.totalSpent = tableData.reduce((sum, item) => sum + item.spent, 0);
    this.averageUsage = tableData.length > 0 
      ? tableData.reduce((sum, item) => sum + item.usedPercent, 0) / tableData.length 
      : 0;
  }

  private resetTotals(): void {
    this.totalAllocated = 0;
    this.totalRemaining = 0;
    this.totalSpent = 0;
    this.averageUsage = 0;
    this.totalItems = 0;
  }
}
