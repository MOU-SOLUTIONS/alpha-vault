// ====================================================================
//      Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Meta } from '@angular/platform-browser';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Investment } from '../../../../models/investment.model';
import { RISK_LEVEL_OPTIONS } from '../../../../enums/risk-level';

@Component({
  standalone: true,
  selector: 'app-crypto-investment-table',
  templateUrl: './crypto-investment-table.component.html',
  styleUrls: ['./crypto-investment-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatBadgeModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
    MatTooltipModule,
    ScrollingModule,
  ],
})
export class CryptoInvestmentTableComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() investments: readonly Investment[] = [];
  @Output() modify = new EventEmitter<Investment>();
  @Output() remove = new EventEmitter<Investment>();
  @Output() add = new EventEmitter<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  readonly riskLevels = RISK_LEVEL_OPTIONS;
  
  isFilterExpanded = false;
  isLoading = false;
  expandedElement: Investment | null = null;
  isMobile = false;

  readonly activeColumns = [
    'name',
    'amountInvested',
    'currentValue',
    'profitLoss',
    'startDate',
    'riskLevel',
    'isSold',
    'actions',
  ];

  readonly dataSource = new MatTableDataSource<Investment>([]);

  readonly pageSize = 10;
  readonly pageSizeOptions = [5, 10, 25, 50];
  totalCount = 0;
  filteredCount = 0;

  readonly itemSize = 60;
  viewportHeight = 400;

  filterForm!: FormGroup;

  totalInvested = 0;
  totalCurrentValue = 0;
  totalProfitLoss = 0;
  totalProfitLossPercentage = 0;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
    private readonly meta: Meta,
  ) {
    this.meta.addTags([
      { name: 'description', content: 'Manage and track your cryptocurrency investments with real-time data and comprehensive analytics' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ]);
  }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      search: [''],
      sold: ['all'],
      risk: ['all'],
      sortBy: ['name'],
      sortOrder: ['asc'],
    });

    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyFilter());
    this.checkMobile();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('investments' in changes) {
      this.dataSource.data = [...this.investments];
      this.totalCount = this.investments.length;
      
      if (this.filterForm) {
        this.applyFilter();
      } else {
        this.filteredCount = this.investments.length;
        this.calculateStatistics();
      }
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkMobile();
    this.cdr.detectChanges();
  }

  checkMobile(): void {
    this.isMobile = window.innerWidth < 768;
    this.viewportHeight = this.isMobile ? 300 : 400;
  }

  toggleFilterSection(): void {
    this.isFilterExpanded = !this.isFilterExpanded;
    this.cdr.detectChanges();
  }

  toggleRowExpand(element: Investment): void {
    this.expandedElement = this.expandedElement === element ? null : element;
    this.cdr.detectChanges();
  }

  hasActiveFilters(): boolean {
    const formValue = this.filterForm.value;
    return formValue.search || formValue.sold !== 'all' || formValue.risk !== 'all';
  }

  private applyFilter(): void {
    if (!this.filterForm) {
      return;
    }

    const formValue = this.filterForm.value;
    let filtered = [...this.investments];

    if (formValue.search) {
      const searchTerm = formValue.search.toLowerCase();
      filtered = filtered.filter(investment =>
        investment.name.toLowerCase().includes(searchTerm) ||
        investment.amountInvested.toString().includes(searchTerm) ||
        investment.currentValue.toString().includes(searchTerm),
      );
    }

    if (formValue.sold !== 'all') {
      const isSold = formValue.sold === 'sold';
      filtered = filtered.filter(investment => investment.isSold === isSold);
    }

    if (formValue.risk !== 'all') {
      filtered = filtered.filter(investment => investment.riskLevel === formValue.risk);
    }

    if (formValue.sortBy && formValue.sortOrder) {
      filtered.sort((a, b) => {
        const aValue = a[formValue.sortBy as keyof Investment];
        const bValue = b[formValue.sortBy as keyof Investment];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return formValue.sortOrder === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return formValue.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        return 0;
      });
    }

    this.dataSource.data = filtered;
    this.filteredCount = filtered.length;
    this.calculateStatistics();
    this.cdr.detectChanges();
  }

  private calculateStatistics(): void {
    const filteredData = this.dataSource.data;
    
    this.totalInvested = filteredData.reduce((sum, i) => sum + Number(i.amountInvested), 0);
    this.totalCurrentValue = filteredData.reduce((sum, i) => sum + Number(i.currentValue), 0);
    this.totalProfitLoss = this.totalCurrentValue - this.totalInvested;
    this.totalProfitLossPercentage = this.totalInvested > 0 ? (this.totalProfitLoss / this.totalInvested) * 100 : 0;
  }

  getProfitLoss(investment: Investment): number {
    return Number(investment.currentValue) - Number(investment.amountInvested);
  }

  getProfitLossPercentage(investment: Investment): number {
    const profitLoss = this.getProfitLoss(investment);
    return Number(investment.amountInvested) > 0 ? (profitLoss / Number(investment.amountInvested)) * 100 : 0;
  }

  getProfitLossClass(investment: Investment): string {
    const profitLoss = this.getProfitLoss(investment);
    if (profitLoss > 0) return 'profit';
    if (profitLoss < 0) return 'loss';
    return 'neutral';
  }

  getProfitLossIcon(investment: Investment): string {
    const profitLoss = this.getProfitLoss(investment);
    if (profitLoss > 0) return 'trending_up';
    if (profitLoss < 0) return 'trending_down';
    return 'remove';
  }

  getRiskLevelClass(riskLevel: string | undefined): string {
    if (!riskLevel) return 'risk-neutral';
    
    const riskClasses: { [key: string]: string } = {
      'LOW': 'risk-low',
      'MEDIUM': 'risk-medium',
      'HIGH': 'risk-high',
    };
    return riskClasses[riskLevel] || 'risk-neutral';
  }

  getRiskColor(riskLevel: string | undefined): string {
    if (!riskLevel) return '#6b7280';
    
    const riskColors: { [key: string]: string } = {
      'LOW': '#10b981',
      'MEDIUM': '#f59e0b',
      'HIGH': '#ef4444',
    };
    return riskColors[riskLevel] || '#6b7280';
  }

  getRiskIcon(riskLevel: string | undefined): string {
    if (!riskLevel) return 'help_outline';
    
    const riskIcons: { [key: string]: string } = {
      'LOW': 'trending_up',
      'MEDIUM': 'trending_flat',
      'HIGH': 'trending_down',
    };
    return riskIcons[riskLevel] || 'help_outline';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  formatPercentage(value: number): string {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  }

  getTimeAgo(date: Date | string): string {
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const diff = now.getTime() - dateObj.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days < 1) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 30) return `${days} days ago`;
    
    const months = Math.floor(days / 30);
    if (months === 1) return '1 month ago';
    if (months < 12) return `${months} months ago`;
    
    const years = Math.floor(months / 12);
    if (years === 1) return '1 year ago';
    return `${years} years ago`;
  }

  resetFilters(): void {
    this.filterForm.reset({
      search: '',
      sold: 'all',
      risk: 'all',
      sortBy: 'name',
      sortOrder: 'asc',
    });
  }

  trackByInvestment(index: number, investment: Investment): string {
    return investment.id ? investment.id.toString() : index.toString();
  }

  onPageChange(event: PageEvent): void {
    this.cdr.detectChanges();
  }

  onModifyClicked(investment: Investment): void {
    this.modify.emit(investment);
  }

  onRemoveClicked(investment: Investment): void {
    this.remove.emit(investment);
  }

  onAddClicked(): void {
    this.add.emit();
  }
}
