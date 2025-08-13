// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta } from '@angular/platform-browser';

import { SavingGoal } from '../../../models/saving.model';
import { PriorityLevel } from '../../../enums/priority-level';
import { SavingGoalCategory } from '../../../enums/saving-goal';

@Component({
  standalone: true,
  selector: 'app-saving-card-list',
  template: `
    <!-- Section: Saving Goals Grid -->
    <section class="goals-container" role="region" aria-labelledby="goalsTitle">
      <div class="goals-header" *ngIf="goals.length > 0">
        <h2 id="goalsTitle" class="goals-title">
          <i class="fa fa-piggy-bank me-2" aria-hidden="true"></i>
          Your Saving Goals
          <span class="goals-count">({{ goals.length }})</span>
        </h2>
        <div class="goals-stats">
          <div class="stat-item">
            <i class="fa fa-check-circle text-success" aria-hidden="true"></i>
            <span>{{ completedGoalsCount }} Completed</span>
          </div>
          <div class="stat-item">
            <i class="fa fa-clock text-warning" aria-hidden="true"></i>
            <span>{{ activeGoalsCount }} Active</span>
          </div>
          <div class="stat-item">
            <i class="fa fa-exclamation-triangle text-danger" aria-hidden="true"></i>
            <span>{{ overdueGoalsCount }} Overdue</span>
          </div>
        </div>
      </div>

      <!-- Section: Empty State -->
      <div class="empty-state" *ngIf="goals.length === 0">
        <div class="empty-icon">
          <i class="fa fa-piggy-bank" aria-hidden="true"></i>
        </div>
        <h3>No Saving Goals Yet</h3>
        <p>Start your financial journey by creating your first saving goal</p>
        <button class="btn-create-goal" (click)="createNewGoal()">
          <i class="fa fa-plus me-2" aria-hidden="true"></i>Create First Goal
        </button>
      </div>

      <!-- Section: Goals Grid -->
      <div class="goals-grid" *ngIf="goals.length > 0">
        <article
          class="goal-card"
          *ngFor="let goal of goals; trackBy: trackByGoal"
          [ngClass]="{
            'completed': isCompleted(goal),
            'overdue': isOverdue(goal),
            'active': !isCompleted(goal) && !isOverdue(goal)
          }"
          (click)="openOverlay.emit(goal)"
          role="button"
          tabindex="0"
          [attr.aria-label]="'View details for ' + goal.name + ' saving goal'"
          (keydown.enter)="openOverlay.emit(goal)"
          (keydown.space)="openOverlay.emit(goal)"
        >
          <!-- Section: Card Header -->
          <div class="card-header">
            <div class="status-badge" [ngClass]="getStatusClass(goal)">
              <i class="fa" [ngClass]="getStatusIcon(goal)" aria-hidden="true"></i>
              <span>{{ getStatusText(goal) }}</span>
            </div>
            <div class="priority-badge" [ngClass]="goal.priority.toLowerCase()">
              <i class="fa fa-flag" aria-hidden="true"></i>
              <span>{{ goal.priority }}</span>
            </div>
          </div>

          <!-- Section: Goal Image -->
          <div class="goal-image">
            <img
              [src]="getImageForCategory(goal.category)"
              [alt]="goal.category + ' goal category'"
              loading="lazy"
            />
            <div class="image-overlay">
              <div class="category-label">
                <i class="fa" [ngClass]="getCategoryIcon(goal.category)" aria-hidden="true"></i>
                <span>{{ goal.category }}</span>
              </div>
            </div>
          </div>

          <!-- Section: Goal Content -->
          <div class="goal-content">
            <h3 class="goal-title">{{ goal.name }}</h3>
            
            <div class="goal-metrics">
              <div class="metric-item">
                <div class="metric-label">
                  <i class="fa fa-bullseye" aria-hidden="true"></i>
                  <span>Target</span>
                </div>
                <div class="metric-value">{{ goal.targetAmount | currency:'USD':'symbol':'1.0-0' }}</div>
              </div>
              
              <div class="metric-item">
                <div class="metric-label">
                  <i class="fa fa-piggy-bank" aria-hidden="true"></i>
                  <span>Saved</span>
                </div>
                <div class="metric-value">{{ goal.currentAmount | currency:'USD':'symbol':'1.0-0' }}</div>
              </div>
              
              <div class="metric-item">
                <div class="metric-label">
                  <i class="fa fa-calendar" aria-hidden="true"></i>
                  <span>Deadline</span>
                </div>
                <div class="metric-value">{{ goal.deadline | date:'MMM dd, yyyy' }}</div>
              </div>
            </div>

            <!-- Section: Progress -->
            <div class="progress-section">
              <div class="progress-header">
                <span class="progress-label">Progress</span>
                <span class="progress-percentage">{{ calculateProgress(goal) }}%</span>
              </div>
              
              <div class="progress-bar">
                <div 
                  class="progress-fill"
                  [ngStyle]="{
                    width: calculateProgress(goal) + '%',
                    background: getProgressGradient(goal)
                  }"
                ></div>
                <div class="progress-glow" [ngStyle]="{ width: calculateProgress(goal) + '%' }"></div>
              </div>
              
              <div class="progress-stats">
                <span class="remaining-amount">
                  {{ getRemainingAmount(goal) | currency:'USD':'symbol':'1.0-0' }} remaining
                </span>
                <span class="days-left" *ngIf="!isCompleted(goal)">
                  {{ getDaysLeft(goal) }} days left
                </span>
              </div>
            </div>
          </div>

          <!-- Section: Card Footer -->
          <div class="card-footer">
            <button class="btn-view-details" (click)="viewDetails.emit(goal); $event.stopPropagation()">
              <i class="fa fa-eye" aria-hidden="true"></i>
              <span>View Details</span>
            </button>
          </div>
        </article>
      </div>
    </section>
  `,
  styleUrls: ['./saving-card-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class SavingCardListComponent implements OnInit, OnChanges {
  @Input() goals: SavingGoal[] = [];
  @Output() viewDetails = new EventEmitter<SavingGoal>();
  @Output() openOverlay = new EventEmitter<SavingGoal>();
  @Output() createGoal = new EventEmitter<void>();

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

  private readonly priorityColorMap: Record<PriorityLevel, string> = {
    'HIGH': '#dc3545',
    'MEDIUM': '#ffc107',
    'LOW': '#28a745',
  };

  constructor(
   private meta: Meta,
  ) {
    this.meta.addTags([
      { name: 'description', content: 'View and manage your saving goals with beautiful progress tracking and detailed analytics.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ]);
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['goals']) {
      console.log('Goals changed:', this.goals);
    }
  }

  get completedGoalsCount(): number {
    return this.goals.filter(goal => this.isCompleted(goal)).length;
  }

  get activeGoalsCount(): number {
    return this.goals.filter(goal => !this.isCompleted(goal) && !this.isOverdue(goal)).length;
  }

  get overdueGoalsCount(): number {
    return this.goals.filter(goal => this.isOverdue(goal)).length;
  }

  getImageForCategory(category: string): string {
    return this.imageMap[category] || 'assets/images/goals/default.png';
  }

  getCategoryIcon(category: string): string {
    return this.iconMap[category] || 'fa-tag';
  }

  getPriorityColor(priority: PriorityLevel): string {
    return this.priorityColorMap[priority] || '#6c757d';
  }

  calculateProgress(goal: SavingGoal): number {
    if (goal.targetAmount === 0) return 0;
    const percent = (goal.currentAmount / goal.targetAmount) * 100;
    return Math.min(100, Math.max(0, +percent.toFixed(1)));
  }

  isCompleted(goal: SavingGoal): boolean {
    return goal.currentAmount >= goal.targetAmount;
  }

  isOverdue(goal: SavingGoal): boolean {
    const today = new Date().toISOString().split('T')[0];
    return goal.deadline < today && !this.isCompleted(goal);
  }

  getStatusClass(goal: SavingGoal): string {
    if (this.isCompleted(goal)) return 'completed';
    if (this.isOverdue(goal)) return 'overdue';
    return 'active';
  }

  getStatusIcon(goal: SavingGoal): string {
    if (this.isCompleted(goal)) return 'fa-check-circle';
    if (this.isOverdue(goal)) return 'fa-exclamation-triangle';
    return 'fa-clock';
  }

  getStatusText(goal: SavingGoal): string {
    if (this.isCompleted(goal)) return 'Completed';
    if (this.isOverdue(goal)) return 'Overdue';
    return 'Active';
  }

  getProgressGradient(goal: SavingGoal): string {
    const progress = this.calculateProgress(goal);
    if (progress >= 100) return 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
    if (progress >= 75) return 'linear-gradient(135deg, #17a2b8 0%, #20c997 100%)';
    if (progress >= 50) return 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)';
    if (progress >= 25) return 'linear-gradient(135deg, #fd7e14 0%, #e74c3c 100%)';
    return 'linear-gradient(135deg, #e74c3c 0%, #dc3545 100%)';
  }

  getRemainingAmount(goal: SavingGoal): number {
    return Math.max(0, goal.targetAmount - goal.currentAmount);
  }

  getDaysLeft(goal: SavingGoal): number {
    const today = new Date();
    const deadline = new Date(goal.deadline);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  createNewGoal(): void {
    this.createGoal.emit();
  }

  trackByGoal(index: number, goal: SavingGoal): number {
    return goal.id;
  }
}
