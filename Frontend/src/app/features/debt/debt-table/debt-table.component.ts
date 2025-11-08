/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component DebtTableComponent
  @description Main debt dashboard component for managing debt table
*/

import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';

import { META_FRAGMENT } from '../../../core/seo/page-meta.model';
import { Debt } from '../../../models/debt.model';
import { DebtFormComponent } from '../debt-form/debt-form.component';
import { DebtTablePaginatorComponent } from './components/debt-table-paginator/debt-table-paginator.component';

export interface DebtTableFilters {
  searchTerm: string;
  sortBy: 'creditorName' | 'principalAmount' | 'remainingAmount' | 'interestRateApr' | 'dueDate' | 'minPayment';
  sortOrder: 'asc' | 'desc';
  showOverdueOnly: boolean;
  showHighInterestOnly: boolean;
}

@Component({
  selector: 'app-debt-table',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    DebtFormComponent,
    DebtTablePaginatorComponent
  ],
  templateUrl: './debt-table.component.html',
  styleUrls: ['./debt-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: META_FRAGMENT,
      useValue: {
        description: 'Manage and track your debts with comprehensive filtering, sorting, and bulk operations. View detailed debt information, track payment progress, and efficiently organize your financial obligations in Alpha Vault.'
      }
    }
  ],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class DebtTableComponent implements OnInit, OnDestroy, OnChanges {
  /**
   * Array of debt records to display in the table
   */
  @Input() debts: Debt[] = [];
  
  /**
   * Loading state indicator
   */
  @Input() loading = false;
  
  /**
   * Total number of debts
   */
  @Input() totalDebts = 0;

  @Output() onAdd = new EventEmitter<void>();
  @Output() onModify = new EventEmitter<Debt>();
  @Output() onDelete = new EventEmitter<number>();
  @Output() onExport = new EventEmitter<void>();
  @Output() onFiltersChange = new EventEmitter<DebtTableFilters>();
  @Output() onFormSubmit = new EventEmitter<{ mode: 'add' | 'edit'; formValue: any; debtId?: number }>();

  private destroy$ = new Subject<void>();
  filters: DebtTableFilters = {
    searchTerm: '',
    sortBy: 'dueDate',
    sortOrder: 'asc',
    showOverdueOnly: false,
    showHighInterestOnly: false
  };
  filteredDebts: Debt[] = [];
  paginatedDebts: Debt[] = [];
  selectedDebts = new Set<number>();
  showBulkActions = false;
  
  // Pagination properties
  pageSize = 10;
  currentPage = 0;
  pageSizeOptions: number[] = [5, 10, 25, 50];

  showAddForm = false;
  isModifyMode = false;
  selectedDebtForModify: Debt | null = null;
  debtForm: FormGroup;
  
  isDeleteOverlayVisible = false;
  debtIdToDelete: number | null = null;
  
  dataSource = new MatTableDataSource<Debt>([]);
  displayedColumns: string[] = [
    'checkbox',
    'creditor',
    'principalAmount',
    'remainingAmount',
    'interestRateApr',
    'dueDate',
    'minPayment',
    'progress',
    'actions'
  ];

  private _debtStatusCache = new Map<number, {
    isOverdue: boolean;
    daysUntilDue: number;
    overdueDays: number;
    urgencyClass: string;
    interestRateClass: string;
    progressPercentage: number;
    formattedDate: string;
  }>();

  private _lastDebtsArray?: Debt[];

  constructor(
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.debtForm = this.fb.group({
      creditorName: ['', Validators.required],
      principalAmount: [0, [Validators.required, Validators.min(0.01)]],
      remainingAmount: [0, [Validators.required, Validators.min(0)]],
      interestRateApr: [0, [Validators.min(0), Validators.max(999.9999)]],
      dueDate: ['', Validators.required],
      minPayment: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.applyFilters();
    this.applyPagination();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['debts']) {
      this.invalidateCache();
      this.applyFilters();
      this.cdr.markForCheck();
    }
  }

  private invalidateCache(): void {
    this._debtStatusCache.clear();
    this._lastDebtsArray = undefined;
  }

  private isDebtsArrayEqual(a: Debt[] | undefined, b: Debt[]): boolean {
    if (!a || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i].id !== b[i].id || 
          a[i].dueDate !== b[i].dueDate || 
          a[i].interestRateApr !== b[i].interestRateApr ||
          a[i].principalAmount !== b[i].principalAmount ||
          a[i].remainingAmount !== b[i].remainingAmount) {
        return false;
      }
    }
    return true;
  }

  get currentDebts(): Debt[] {
    return this.debts;
  }

  getDebtStatus(debt: Debt): {
    isOverdue: boolean;
    daysUntilDue: number;
    overdueDays: number;
    urgencyClass: string;
    interestRateClass: string;
    progressPercentage: number;
    formattedDate: string;
  } {
    if (this._debtStatusCache.has(debt.id)) {
      return this._debtStatusCache.get(debt.id)!;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(debt.dueDate);
    due.setHours(0, 0, 0, 0);
    const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isOverdue = due < today;
    const overdueDays = Math.abs(daysUntilDue);

    let urgencyClass: string;
    if (daysUntilDue < 0) {
      urgencyClass = 'critical';
    } else if (daysUntilDue <= 3) {
      urgencyClass = 'urgent';
    } else if (daysUntilDue <= 7) {
      urgencyClass = 'warning';
    } else {
      urgencyClass = 'normal';
    }

    let interestRateClass: string;
    if (debt.interestRateApr >= 25) {
      interestRateClass = 'critical';
    } else if (debt.interestRateApr >= 15) {
      interestRateClass = 'high';
    } else if (debt.interestRateApr >= 10) {
      interestRateClass = 'medium';
    } else if (debt.interestRateApr >= 5) {
      interestRateClass = 'low';
    } else {
      interestRateClass = 'very-low';
    }

    const paid = debt.principalAmount - debt.remainingAmount;
    const progressPercentage = Math.round((paid / debt.principalAmount) * 100);
    const formattedDate = new Date(debt.dueDate).toLocaleDateString();

    const status = {
      isOverdue,
      daysUntilDue,
      overdueDays,
      urgencyClass,
      interestRateClass,
      progressPercentage,
      formattedDate
    };

    this._debtStatusCache.set(debt.id, status);
    return status;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  isOverdue(dueDate: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  }

  getDaysUntilDue(dueDate: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  getOverdueDays(dueDate: string): number {
    return Math.abs(this.getDaysUntilDue(dueDate));
  }

  getUrgencyClass(dueDate: string): string {
    const days = this.getDaysUntilDue(dueDate);
    if (days < 0) return 'critical';
    if (days <= 3) return 'urgent';
    if (days <= 7) return 'warning';
    return 'normal';
  }

  getInterestRateClass(rate: number): string {
    if (rate >= 25) return 'critical';
    if (rate >= 15) return 'high';
    if (rate >= 10) return 'medium';
    if (rate >= 5) return 'low';
    return 'very-low';
  }

  getProgressPercentage(debt: Debt): number {
    const paid = debt.principalAmount - debt.remainingAmount;
    return Math.round((paid / debt.principalAmount) * 100);
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.filters.searchTerm = target.value;
    this.applyFilters();
  }

  onSortChange(field: DebtTableFilters['sortBy']): void {
    if (this.filters.sortBy === field) {
      this.filters.sortOrder = this.filters.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.filters.sortBy = field;
      this.filters.sortOrder = 'asc';
    }
    this.applyFilters();
  }

  onFilterToggle(filter: 'showOverdueOnly' | 'showHighInterestOnly'): void {
    this.filters[filter] = !this.filters[filter];
    this.applyFilters();
  }

  applyFilters(): void {
    if (!this.isDebtsArrayEqual(this._lastDebtsArray, this.debts)) {
      this.invalidateCache();
      this._lastDebtsArray = [...this.debts];
    }

    // Reset to first page when filters change
    this.currentPage = 0;

    let filtered = [...this.currentDebts];

    if (this.filters.searchTerm) {
      const search = this.filters.searchTerm.toLowerCase();
      filtered = filtered.filter(debt =>
        debt.creditorName.toLowerCase().includes(search) ||
        debt.principalAmount.toString().includes(search) ||
        debt.remainingAmount.toString().includes(search)
      );
    }

    if (this.filters.showOverdueOnly) {
      filtered = filtered.filter(debt => this.isOverdue(debt.dueDate));
    }

    if (this.filters.showHighInterestOnly) {
      filtered = filtered.filter(debt => debt.interestRateApr > 15);
    }

    filtered.sort((a, b) => {
      const aValue = this.getSortValue(a, this.filters.sortBy);
      const bValue = this.getSortValue(b, this.filters.sortBy);
      
      if (this.filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    this.filteredDebts = filtered;
    this.applyPagination();
    this.updateBulkActions();
    this.cdr.markForCheck();
  }

  private applyPagination(): void {
    // If current page is beyond available data, reset to first page
    const totalPages = Math.ceil(this.filteredDebts.length / this.pageSize);
    if (this.currentPage >= totalPages && totalPages > 0) {
      this.currentPage = 0;
    }
    
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedDebts = this.filteredDebts.slice(startIndex, endIndex);
    this.dataSource.data = this.paginatedDebts;
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.applyPagination();
    this.updateBulkActions();
    this.cdr.markForCheck();
  }

  private getSortValue(debt: Debt, field: DebtTableFilters['sortBy']): any {
    switch (field) {
      case 'creditorName': return debt.creditorName.toLowerCase();
      case 'principalAmount': return debt.principalAmount;
      case 'remainingAmount': return debt.remainingAmount;
      case 'interestRateApr': return debt.interestRateApr;
      case 'dueDate': return new Date(debt.dueDate).getTime();
      case 'minPayment': return debt.minPayment;
      default: return 0;
    }
  }

  toggleDebtSelection(debtId: number): void {
    if (this.selectedDebts.has(debtId)) {
      this.selectedDebts.delete(debtId);
    } else {
      this.selectedDebts.add(debtId);
    }
    this.updateBulkActions();
  }

  selectAllDebts(): void {
    if (this.selectedDebts.size === this.paginatedDebts.length) {
      this.selectedDebts.clear();
    } else {
      this.paginatedDebts.forEach(debt => this.selectedDebts.add(debt.id));
    }
    this.updateBulkActions();
  }

  getSelectedDebtsTotal(): number {
    return this.filteredDebts
      .filter(debt => this.selectedDebts.has(debt.id))
      .reduce((sum, debt) => sum + debt.remainingAmount, 0);
  }

  onBulkDelete(): void {
    const selectedDebts = this.filteredDebts.filter(debt => this.selectedDebts.has(debt.id));
    selectedDebts.forEach(debt => this.onDelete.emit(debt.id));
    this.selectedDebts.clear();
    this.updateBulkActions();
  }

  private updateBulkActions(): void {
    this.showBulkActions = this.selectedDebts.size > 0;
  }

  trackByDebt(index: number, debt: Debt): number {
    return debt.id;
  }

  refreshData(): void {
    this.applyFilters();
    this.cdr.markForCheck();
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm && !this.isModifyMode) {
      this.debtForm.reset();
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
      const nextMonthStr = nextMonth.toISOString().split('T')[0];
      this.debtForm.patchValue({ dueDate: nextMonthStr });
    }
    this.cdr.markForCheck();
  }

  closeAddForm(): void {
    this.showAddForm = false;
    this.isModifyMode = false;
    this.selectedDebtForModify = null;
    this.debtForm.reset();
    this.cdr.markForCheck();
  }

  onFormHeaderKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleAddForm();
    }
  }

  onAddFromHeader(): void {
    this.isModifyMode = false;
    this.selectedDebtForModify = null;
    this.debtForm.reset();
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    const nextMonthStr = nextMonth.toISOString().split('T')[0];
    this.debtForm.patchValue({ dueDate: nextMonthStr });
    this.showAddForm = true;
    this.cdr.markForCheck();
  }

  handleFormSubmit(): void {
    if (this.debtForm.invalid) {
      this.debtForm.markAllAsTouched();
      return;
    }

    const formValue = this.debtForm.value;
    
    if (this.isModifyMode && this.selectedDebtForModify) {
      this.onFormSubmit.emit({
        mode: 'edit',
        formValue: formValue,
        debtId: this.selectedDebtForModify.id
      });
    } else {
      this.onFormSubmit.emit({
        mode: 'add',
        formValue: formValue
      });
    }

    this.closeAddForm();
  }

  handleModifyClick(debt: Debt): void {
    this.selectedDebtForModify = debt;
    this.isModifyMode = true;
    
    const dueDateStr = this.toHtmlDateFormat(debt.dueDate);
    
    this.debtForm.reset();
    this.debtForm.patchValue({
      creditorName: debt.creditorName,
      principalAmount: debt.principalAmount,
      remainingAmount: debt.remainingAmount,
      interestRateApr: debt.interestRateApr || 0,
      dueDate: dueDateStr,
      minPayment: debt.minPayment
    });
    
    this.showAddForm = true;
    this.cdr.markForCheck();
  }

  private toHtmlDateFormat(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
    }
    return dateStr;
  }

  handleDeleteClick(id: number): void {
    this.debtIdToDelete = id;
    this.isDeleteOverlayVisible = true;
    this.cdr.markForCheck();
  }

  confirmDelete(): void {
    if (this.debtIdToDelete !== null) {
      this.onDelete.emit(this.debtIdToDelete);
      this.closeDeleteOverlay();
    }
  }

  closeDeleteOverlay(): void {
    this.isDeleteOverlayVisible = false;
    this.debtIdToDelete = null;
    this.cdr.markForCheck();
  }
}
