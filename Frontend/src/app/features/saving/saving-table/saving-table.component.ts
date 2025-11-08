/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component SavingTableComponent
  @description Saving table component for displaying and managing saving goals
*/

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, EventEmitter, Input, OnChanges, OnInit, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { META_FRAGMENT } from '../../../core/seo/page-meta.model';
import { SAVING_GOAL_CATEGORY_OPTIONS, SAVING_GOAL_PRIORITY_OPTIONS, SAVING_GOAL_STATUS_OPTIONS } from '../../../enums/saving-goal';
import { SavingGoalResponseDTO } from '../../../models/saving.model';
import { SavingTableEmptyComponent } from './components/saving-table-empty/saving-table-empty.component';

@Component({
  selector: 'app-saving-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatPaginatorModule,
    SavingTableEmptyComponent
  ],
  templateUrl: './saving-table.component.html',
  styleUrls: ['./saving-table.component.scss'],
  providers: [
    {
      provide: META_FRAGMENT,
      useValue: {
        description: 'Comprehensive saving goals table with category-wise tracking, progress monitoring, priority levels, deadline management, and interactive controls. View, edit, add money, and delete saving goals with real-time statistics and status indicators in Alpha Vault.'
      }
    }
  ]
})
export class SavingTableComponent implements OnInit, OnChanges {
  @Input() goals: SavingGoalResponseDTO[] = [];
  
  @Output() readonly modify = new EventEmitter<SavingGoalResponseDTO>();
  @Output() readonly delete = new EventEmitter<number>();
  @Output() readonly add = new EventEmitter<void>();
  @Output() readonly addMoney = new EventEmitter<{ goal: SavingGoalResponseDTO; amount: number }>();

  displayedColumns: string[] = ['name', 'target', 'current', 'priority', 'status', 'deadline', 'actions'];
  dataSource = new MatTableDataSource<SavingGoalResponseDTO>();

  private readonly goalsSignal = signal<SavingGoalResponseDTO[]>([]);
  
  showAddMoneyOverlay = false;
  showDeleteOverlay = false;
  selectedGoalForAddMoney: SavingGoalResponseDTO | null = null;
  selectedGoalForDelete: SavingGoalResponseDTO | null = null;
  addMoneyAmount = 0;

  readonly filteredGoals = computed(() => this.goalsSignal());
  
  readonly stats = computed(() => {
    const goals = this.goalsSignal();
    return {
      completed: goals.filter(goal => goal.status === 'COMPLETED').length,
      active: goals.filter(goal => goal.status !== 'COMPLETED' && !this.isOverdue(goal)).length,
      overdue: goals.filter(goal => this.isOverdue(goal)).length,
      totalSaved: goals.reduce((total, goal) => total + goal.currentAmount, 0)
    };
  });

  readonly completedCount = computed(() => this.stats().completed);
  readonly activeCount = computed(() => this.stats().active);
  readonly overdueCount = computed(() => this.stats().overdue);
  readonly totalSaved = computed(() => this.stats().totalSaved);

  readonly pageSize = computed(() => 10);
  readonly currentPage = computed(() => 0);
  readonly showEmptyState = computed(() => this.filteredGoals().length === 0);

  private readonly categoryLabelCache = new Map<string, string>();
  private readonly priorityLabelCache = new Map<string, string>();
  private readonly statusLabelCache = new Map<string, string>();
  private readonly amountClassCache = new Map<number, string>();
  private readonly priorityClassCache = new Map<string, string>();
  private readonly statusClassCache = new Map<string, string>();
  private readonly deadlineClassCache = new Map<SavingGoalResponseDTO, string>();

  ngOnInit(): void {
    this.goalsSignal.set(this.goals);
    this.dataSource.data = this.goals;
  }

  ngOnChanges(): void {
    this.goalsSignal.set(this.goals);
    this.dataSource.data = this.goals;
  }

  getCategoryLabel(category: string): string {
    if (!this.categoryLabelCache.has(category)) {
      const match = SAVING_GOAL_CATEGORY_OPTIONS.find(option => option.value === category);
      this.categoryLabelCache.set(category, match ? match.label : category);
    }
    return this.categoryLabelCache.get(category)!;
  }

  getPriorityLabel(priority: string): string {
    if (!this.priorityLabelCache.has(priority)) {
      const match = SAVING_GOAL_PRIORITY_OPTIONS.find(option => option.value === priority);
      this.priorityLabelCache.set(priority, match ? match.label : priority);
    }
    return this.priorityLabelCache.get(priority)!;
  }

  getStatusLabel(status: string): string {
    if (!this.statusLabelCache.has(status)) {
      const match = SAVING_GOAL_STATUS_OPTIONS.find(option => option.value === status);
      this.statusLabelCache.set(status, match ? match.label : status);
    }
    return this.statusLabelCache.get(status)!;
  }

  getAmountClass(amount: number): string {
    if (!this.amountClassCache.has(amount)) {
      const className = amount >= 1000 ? 'high-amount' : 'normal-amount';
      this.amountClassCache.set(amount, className);
    }
    return this.amountClassCache.get(amount)!;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  isCompleted(goal: SavingGoalResponseDTO): boolean {
    return goal.status === 'COMPLETED';
  }

  isOverdue(goal: SavingGoalResponseDTO): boolean {
    if (this.isCompleted(goal)) return false;
    const deadline = new Date(goal.deadline);
    const today = new Date();
    return deadline < today;
  }

  onModify(goal: SavingGoalResponseDTO): void {
    this.modify.emit(goal);
  }

  onDelete(id: number): void {
    this.delete.emit(id);
  }

  addGoal(): void {
    this.add.emit();
  }

  onPageChange(event: PageEvent): void {
  }

  onAddKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.addGoal();
    }
  }

  onModifyKeydown(event: KeyboardEvent, goal: SavingGoalResponseDTO): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onModify(goal);
    }
  }

  onDeleteKeydown(event: KeyboardEvent, id: number): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onDelete(id);
    }
  }

  getAmountClassForElement(element: SavingGoalResponseDTO, type: 'target' | 'current'): string {
    const amount = type === 'target' ? element.targetAmount : element.currentAmount;
    return this.getAmountClass(amount);
  }

  getPriorityClassForElement(element: SavingGoalResponseDTO): string {
    if (!this.priorityClassCache.has(element.priority)) {
      this.priorityClassCache.set(element.priority, element.priority.toLowerCase());
    }
    return this.priorityClassCache.get(element.priority)!;
  }

  getPriorityLabelForElement(element: SavingGoalResponseDTO): string {
    return this.getPriorityLabel(element.priority);
  }

  getStatusClassForElement(element: SavingGoalResponseDTO): string {
    if (!this.statusClassCache.has(element.status)) {
      this.statusClassCache.set(element.status, element.status.toLowerCase());
    }
    return this.statusClassCache.get(element.status)!;
  }

  getStatusLabelForElement(element: SavingGoalResponseDTO): string {
    return this.getStatusLabel(element.status);
  }

  getDeadlineClassForElement(element: SavingGoalResponseDTO): string {
    if (!this.deadlineClassCache.has(element)) {
      const className = this.isOverdue(element) ? 'overdue' : 'normal';
      this.deadlineClassCache.set(element, className);
    }
    return this.deadlineClassCache.get(element)!;
  }

  getFormattedDateForElement(element: SavingGoalResponseDTO): string {
    return this.formatDate(element.deadline);
  }

  trackByGoalId(index: number, goal: SavingGoalResponseDTO): number {
    return goal.id;
  }

  onAddMoney(goal: SavingGoalResponseDTO): void {
    if (this.isGoalCompleted(goal)) {
      return;
    }
    this.selectedGoalForAddMoney = goal;
    this.showAddMoneyOverlay = true;
    this.addMoneyAmount = 0;
  }

  closeAddMoneyOverlay(): void {
    this.showAddMoneyOverlay = false;
    this.selectedGoalForAddMoney = null;
    this.addMoneyAmount = 0;
  }

  confirmAddMoney(): void {
    if (!this.selectedGoalForAddMoney || this.addMoneyAmount <= 0) return;
    
    this.addMoney.emit({ 
      goal: this.selectedGoalForAddMoney, 
      amount: this.addMoneyAmount 
    });
    
    this.closeAddMoneyOverlay();
  }

  onDeleteWithOverlay(goal: SavingGoalResponseDTO): void {
    this.selectedGoalForDelete = goal;
    this.showDeleteOverlay = true;
  }

  closeDeleteOverlay(): void {
    this.showDeleteOverlay = false;
    this.selectedGoalForDelete = null;
  }

  confirmDeleteGoal(): void {
    if (this.selectedGoalForDelete) {
      this.delete.emit(this.selectedGoalForDelete.id);
      this.closeDeleteOverlay();
    }
  }

  isGoalCompleted(goal: SavingGoalResponseDTO): boolean {
    return goal.status === 'COMPLETED' || goal.currentAmount >= goal.targetAmount;
  }

  getRemainingAmount(goal: SavingGoalResponseDTO): number {
    return Math.max(0, goal.targetAmount - goal.currentAmount);
  }
}