// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Meta } from '@angular/platform-browser';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { SavingGoal } from '../../../models/saving.model';
import { PriorityLevel } from '../../../enums/priority-level';
import { SavingGoalCategory } from '../../../enums/saving-goal';
import { SAVING_GOAL_CATEGORY_OPTIONS } from '../../../enums/saving-goal';

interface TableFilters {
  search: string;
  category: string;
  priority: string;
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

@Component({
  selector: 'app-saving-table',
  standalone: true,
  imports: [CommonModule, FormsModule, MatPaginatorModule],
  templateUrl: './saving-table.component.html',
  styleUrls: ['./saving-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SavingTableComponent implements OnInit, OnDestroy {
  @Input() goals: SavingGoal[] = [];
  @Output() openOverlay = new EventEmitter<SavingGoal>();
  @Output() onModify = new EventEmitter<SavingGoal>();
  @Output() onDelete = new EventEmitter<number>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  filters: TableFilters = {
    search: '',
    category: '',
    priority: '',
    status: '',
    sortBy: 'name',
    sortOrder: 'asc',
  };

  filteredGoals: SavingGoal[] = [];
  paginatedGoals: SavingGoal[] = [];
  categoryOptions = SAVING_GOAL_CATEGORY_OPTIONS;
  showDeleteModal = false;
  goalToDelete: SavingGoal | null = null;

  currentPage = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];

  get shouldShowPaginator(): boolean {
    return this.filteredGoals.length > this.pageSize;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredGoals.length / this.pageSize);
  }

  get isLastPage(): boolean {
    return this.currentPage >= this.totalPages - 1;
  }

  get completedCount(): number {
    return this.goals.filter(goal => this.isCompleted(goal)).length;
  }

  get activeCount(): number {
    return this.goals.filter(goal => !this.isCompleted(goal) && !this.isOverdue(goal)).length;
  }

  get overdueCount(): number {
    return this.goals.filter(goal => this.isOverdue(goal)).length;
  }

  get totalSaved(): number {
    return this.goals.reduce((total, goal) => total + goal.currentAmount, 0);
  }

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  private readonly imageMap: Record<string, string> = {
    'HEALTH': 'assets/images/saving/Health.png',
    'MARRIAGE': 'assets/images/goals/marriage.png',
    'EDUCATION': 'assets/images/saving/Education.png',
    'TRAVEL': 'assets/images/saving/Travel.png',
    'EMERGENCY': 'assets/images/saving/Emergency.png',
    'RETIREMENT': 'assets/images/saving/Retirement.png',
    'HOME': 'assets/images/saving/Home.png',
    'OTHER': 'assets/images/goals/default.png',
  };

  private readonly iconMap: Record<string, string> = {
    'HEALTH': 'fa-heartbeat',
    'MARRIAGE': 'fa-heart',
    'EDUCATION': 'fa-graduation-cap',
    'TRAVEL': 'fa-plane',
    'EMERGENCY': 'fa-shield',
    'RETIREMENT': 'fa-piggy-bank',
    'HOME': 'fa-home',
    'OTHER': 'fa-star',
  };

  constructor(
    private meta: Meta,
  ) {
    this.meta.addTags([
      { name: 'description', content: 'Advanced table view for managing and tracking your saving goals with powerful filtering and sorting capabilities.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ]);
  }

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.applyFilters();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }

  applyFilters(): void {
    let filtered = [...this.goals];

    if (this.filters.search) {
      const search = this.filters.search.toLowerCase();
      filtered = filtered.filter(goal =>
        goal.name.toLowerCase().includes(search) ||
        goal.category.toLowerCase().includes(search)
      );
    }

    if (this.filters.category) {
      filtered = filtered.filter(goal => goal.category === this.filters.category);
    }

    if (this.filters.priority) {
      filtered = filtered.filter(goal => goal.priority === this.filters.priority);
    }

    if (this.filters.status) {
      switch (this.filters.status) {
        case 'completed':
          filtered = filtered.filter(goal => this.isCompleted(goal));
          break;
        case 'overdue':
          filtered = filtered.filter(goal => this.isOverdue(goal));
          break;
        case 'active':
          filtered = filtered.filter(goal => !this.isCompleted(goal) && !this.isOverdue(goal));
          break;
      }
    }

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (this.filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'deadline':
          aValue = new Date(a.deadline);
          bValue = new Date(b.deadline);
          break;
        case 'progress':
          aValue = this.calculateProgress(a);
          bValue = this.calculateProgress(b);
          break;
        case 'priority':
          aValue = this.getPriorityWeight(a.priority);
          bValue = this.getPriorityWeight(b.priority);
          break;
        case 'targetAmount':
          aValue = a.targetAmount;
          bValue = b.targetAmount;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (this.filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    this.filteredGoals = filtered;
    this.updatePaginatedGoals();
  }

  updatePaginatedGoals(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedGoals = this.filteredGoals.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedGoals();
  }

  sortBy(field: string): void {
    if (this.filters.sortBy === field) {
      this.filters.sortOrder = this.filters.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.filters.sortBy = field;
      this.filters.sortOrder = 'asc';
    }
    this.applyFilters();
  }

  toggleSortOrder(): void {
    this.filters.sortOrder = this.filters.sortOrder === 'asc' ? 'desc' : 'asc';
    this.applyFilters();
  }

  clearFilters(): void {
    this.filters = {
      search: '',
      category: '',
      priority: '',
      status: '',
      sortBy: 'name',
      sortOrder: 'asc',
    };
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.search || this.filters.category || this.filters.priority || this.filters.status);
  }

  getEmptyStateMessage(): string {
    if (this.hasActiveFilters()) {
      return 'No goals match your current filters. Try adjusting your search criteria.';
    }
    return 'No saving goals found. Create your first goal to get started!';
  }

  edit(goal: SavingGoal): void {
    this.onModify.emit(goal);
  }

  confirmDelete(goal: SavingGoal): void {
    this.goalToDelete = goal;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.goalToDelete = null;
  }

  confirmDeleteAction(): void {
    if (this.goalToDelete) {
      this.onDelete.emit(this.goalToDelete.id);
      this.cancelDelete();
    }
  }

  handleRowClick(goal: SavingGoal): void {
    this.openOverlay.emit(goal);
  }

  calculateProgress(goal: SavingGoal): number {
    if (!goal.targetAmount || goal.targetAmount === 0) return 0;
    const percent = (goal.currentAmount / goal.targetAmount) * 100;
    return Math.min(100, Math.max(0, +percent.toFixed(1)));
  }

  getPriorityColor(priority: PriorityLevel): string {
    switch (priority) {
      case 'HIGH':
        return '#dc3545';
      case 'MEDIUM':
        return '#ffc107';
      case 'LOW':
        return '#28a745';
      default:
        return '#6c757d';
    }
  }

  getPriorityWeight(priority: PriorityLevel): number {
    switch (priority) {
      case 'HIGH':
        return 3;
      case 'MEDIUM':
        return 2;
      case 'LOW':
        return 1;
      default:
        return 0;
    }
  }

  getCategoryLabel(value: string): string {
    const match = this.categoryOptions.find(option => option.value === value);
    return match ? match.label : value;
  }

  getCategoryIcon(category: string): string {
    return this.iconMap[category] || 'fa-tag';
  }

  getProgressGradient(goal: SavingGoal): string {
    const progress = this.calculateProgress(goal);
    if (progress >= 100) return 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
    if (progress >= 75) return 'linear-gradient(135deg, #17a2b8 0%, #20c997 100%)';
    if (progress >= 50) return 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)';
    if (progress >= 25) return 'linear-gradient(135deg, #fd7e14 0%, #e74c3c 100%)';
    return 'linear-gradient(135deg, #e74c3c 0%, #dc3545 100%)';
  }

  getDaysLeft(goal: SavingGoal): number {
    const today = new Date();
    const deadline = new Date(goal.deadline);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  isCompleted(goal: SavingGoal): boolean {
    return goal.currentAmount >= goal.targetAmount;
  }

  isOverdue(goal: SavingGoal): boolean {
    const today = new Date().toISOString().split('T')[0];
    return goal.deadline < today && !this.isCompleted(goal);
  }

  exportToCSV(): void {
    const headers = ['Name', 'Category', 'Target Amount', 'Current Amount', 'Progress', 'Deadline', 'Priority', 'Status'];
    const csvContent = [
      headers.join(','),
      ...this.filteredGoals.map(goal => [
        goal.name,
        this.getCategoryLabel(goal.category),
        goal.targetAmount,
        goal.currentAmount,
        `${this.calculateProgress(goal)}%`,
        goal.deadline,
        goal.priority,
        this.isCompleted(goal) ? 'Completed' : this.isOverdue(goal) ? 'Overdue' : 'Active'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `saving-goals-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  refreshData(): void {
    this.applyFilters();
  }

  trackByGoal(index: number, goal: SavingGoal): number {
    return goal.id;
  }

  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged(),
      )
      .subscribe(() => {
        this.applyFilters();
      });
  }
}
