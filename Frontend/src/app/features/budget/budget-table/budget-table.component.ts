// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Component, Input, OnChanges, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Meta } from '@angular/platform-browser';
import { Subject } from 'rxjs';

import { BudgetCategory } from '../../../models/budget.model';
import { EXPENSE_CATEGORY_OPTIONS } from '../../../enums/expense-category';

interface BudgetTableItem {
  category: string;
  allocated: number;
  remaining: number;
  spent: number;
  usedPercent: number;
  status: 'excellent' | 'good' | 'warning' | 'danger';
  statusColor: string;
}

@Component({
  selector: 'app-budget-table',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatPaginatorModule
  ],
  templateUrl: './budget-table.component.html',
  styleUrls: ['./budget-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetTableComponent implements OnInit, OnChanges, OnDestroy {
  @Input() categories: BudgetCategory[] = [];
  @Input() onAdd!: () => void;
  @Input() onModify!: (budgetCategory: BudgetCategory) => void;
  @Input() onDelete!: (category: string) => void;

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
  private destroy$ = new Subject<void>();

  constructor(
    private metaService: Meta,
    private cdr: ChangeDetectorRef
  ) {
    this.metaService.addTags([
      { name: 'description', content: 'Elite budget allocation table with real-time spending analysis and category management' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ]);
  }

  ngOnInit(): void {
    this.processData();
    
    setTimeout(() => {
      this.isVisible = true;
      this.isInteractive = true;
      this.cdr.markForCheck();
    }, 300);
  }

  ngOnChanges(): void {
    this.processData();
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedData();
    this.cdr.markForCheck();
  }

  getCategoryLabel(value: string): string {
    const match = EXPENSE_CATEGORY_OPTIONS.find(option => option.value === value);
    return match ? match.label : value;
  }

  getStatusConfig(item: BudgetTableItem): { color: string; label: string } {
    const configs = {
      excellent: { color: '#4caf50', label: 'Excellent' },
      good: { color: '#8bc34a', label: 'Good' },
      warning: { color: '#ff9800', label: 'Warning' },
      danger: { color: '#f44336', label: 'Danger' }
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

  trackByCategory(index: number, item: BudgetTableItem): string {
    return item.category;
  }

  private updatePaginatedData(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedData = this.tableData.slice(startIndex, endIndex);
  }

  private processData(): void {
    if (!this.categories || this.categories.length === 0) {
      this.hasData = false;
      this.tableData = [];
      this.paginatedData = [];
      this.resetTotals();
      return;
    }

    this.hasData = true;
    this.tableData = this.categories.map(cat => {
      const spent = cat.allocated - cat.remaining;
      const usedPercent = cat.allocated > 0 ? (spent / cat.allocated) * 100 : 0;
      
      let status: BudgetTableItem['status'] = 'excellent';
      let statusColor = '#4caf50';

      if (usedPercent >= 90) {
        status = 'danger';
        statusColor = '#f44336';
      } else if (usedPercent >= 75) {
        status = 'warning';
        statusColor = '#ff9800';
      } else if (usedPercent >= 50) {
        status = 'good';
        statusColor = '#8bc34a';
      }

      return {
        category: cat.category,
        allocated: cat.allocated,
        remaining: cat.remaining,
        spent,
        usedPercent: +usedPercent.toFixed(1),
        status,
        statusColor
      };
    });

    this.totalItems = this.tableData.length;
    this.updatePaginatedData();
    this.calculateTotals();
  }

  private calculateTotals(): void {
    this.totalAllocated = this.tableData.reduce((sum, item) => sum + item.allocated, 0);
    this.totalRemaining = this.tableData.reduce((sum, item) => sum + item.remaining, 0);
    this.totalSpent = this.tableData.reduce((sum, item) => sum + item.spent, 0);
    this.averageUsage = this.tableData.length > 0 
      ? this.tableData.reduce((sum, item) => sum + item.usedPercent, 0) / this.tableData.length 
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
