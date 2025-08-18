// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';
import { trigger, style, transition, animate } from '@angular/animations';

import { Debt } from '../../../models/debt.model';

export interface DebtTableFilters {
  searchTerm: string;
  sortBy: 'creditorName' | 'totalAmount' | 'remainingAmount' | 'interestRate' | 'dueDate' | 'minPayment';
  sortOrder: 'asc' | 'desc';
  showOverdueOnly: boolean;
  showHighInterestOnly: boolean;
}

@Component({
  selector: 'app-debt-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './debt-table.component.html',
  styleUrls: ['./debt-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  @Input() debts: Debt[] = [];
  @Input() loading = false;
  @Input() totalDebts = 0;

  @Output() onAdd = new EventEmitter<void>();
  @Output() onModify = new EventEmitter<Debt>();
  @Output() onDelete = new EventEmitter<number>();
  @Output() onExport = new EventEmitter<void>();
  @Output() onFiltersChange = new EventEmitter<DebtTableFilters>();

  private destroy$ = new Subject<void>();
  filters: DebtTableFilters = {
    searchTerm: '',
    sortBy: 'dueDate',
    sortOrder: 'asc',
    showOverdueOnly: false,
    showHighInterestOnly: false
  };
  filteredDebts: Debt[] = [];
  selectedDebts = new Set<number>();
  showBulkActions = false;

  constructor(
    private meta: Meta,
    private cdr: ChangeDetectorRef
  ) {
    this.meta.addTags([
      { name: 'description', content: 'Manage and track your debts with comprehensive filtering, sorting, and bulk operations' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]);
  }

  ngOnInit(): void {
    this.applyFilters();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['debts']) {
      this.applyFilters();
      this.cdr.detectChanges();
    }
  }

  get currentDebts(): Debt[] {
    return this.debts;
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
    const paid = debt.totalAmount - debt.remainingAmount;
    return Math.round((paid / debt.totalAmount) * 100);
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
    let filtered = [...this.currentDebts];

    if (this.filters.searchTerm) {
      const search = this.filters.searchTerm.toLowerCase();
      filtered = filtered.filter(debt =>
        debt.creditorName.toLowerCase().includes(search) ||
        debt.totalAmount.toString().includes(search) ||
        debt.remainingAmount.toString().includes(search)
      );
    }

    if (this.filters.showOverdueOnly) {
      filtered = filtered.filter(debt => this.isOverdue(debt.dueDate));
    }

    if (this.filters.showHighInterestOnly) {
      filtered = filtered.filter(debt => debt.interestRate > 15);
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
    this.updateBulkActions();
  }

  private getSortValue(debt: Debt, field: DebtTableFilters['sortBy']): any {
    switch (field) {
      case 'creditorName': return debt.creditorName.toLowerCase();
      case 'totalAmount': return debt.totalAmount;
      case 'remainingAmount': return debt.remainingAmount;
      case 'interestRate': return debt.interestRate;
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
    if (this.selectedDebts.size === this.filteredDebts.length) {
      this.selectedDebts.clear();
    } else {
      this.filteredDebts.forEach(debt => this.selectedDebts.add(debt.id));
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
    this.cdr.detectChanges();
  }
}
