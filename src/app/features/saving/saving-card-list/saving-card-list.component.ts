/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component SavingCardListComponent
  @description Saving card list component for displaying saving goals
*/

import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';

import { META_FRAGMENT } from '../../../core/seo/page-meta.model';
import { SavingGoalCategory } from '../../../enums/saving-goal';
import { SavingGoalResponseDTO } from '../../../models/saving.model';

@Component({
  standalone: true,
  selector: 'app-saving-card-list',
  imports: [CommonModule, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: META_FRAGMENT,
      useValue: {
        description: 'Interactive saving goals card list with visual progress tracking, category management, and goal status monitoring. Display all your saving goals with progress percentages, remaining amounts, deadlines, and priority levels in Alpha Vault.'
      }
    }
  ],
  template: `
    <section class="goals-container" #goalsContainer role="region" aria-labelledby="goalsTitle">
      <div class="goals-header" *ngIf="goals.length > 0">
        <h2 id="goalsTitle" class="goals-title">
          <i class="fa fa-piggy-bank me-2" aria-hidden="true"></i>
          Your Saving Goals
          <span class="goals-count">({{ goals.length }})</span>
        </h2>
        <div class="goals-stats">
          <div class="stat-item" [attr.aria-label]="'Completed goals: ' + completedGoalsCount()">
            <i class="fa fa-check-circle text-success" aria-hidden="true"></i>
            <span>{{ completedGoalsCount() }} Completed</span>
          </div>
          <div class="stat-item" [attr.aria-label]="'Active goals: ' + activeGoalsCount()">
            <i class="fa fa-clock text-warning" aria-hidden="true"></i>
            <span>{{ activeGoalsCount() }} Active</span>
          </div>
          <div class="stat-item" [attr.aria-label]="'Overdue goals: ' + overdueGoalsCount()">
            <i class="fa fa-exclamation-triangle text-danger" aria-hidden="true"></i>
            <span>{{ overdueGoalsCount() }} Overdue</span>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="goals.length === 0" role="status" aria-live="polite">
        <div class="empty-icon">
          <i class="fa fa-piggy-bank" aria-hidden="true"></i>
        </div>
        <h3>No Saving Goals Yet</h3>
        <p>Start your financial journey by creating your first saving goal</p>
        <button 
          class="btn-create-goal" 
          (click)="createNewGoal()"
          (keydown.enter)="createNewGoal()"
          (keydown.space)="createNewGoal()"
          aria-label="Create your first saving goal"
        >
          <i class="fa fa-plus me-2" aria-hidden="true"></i>Create First Goal
        </button>
      </div>

      <div class="goals-grid" *ngIf="goals.length > 0" role="grid" aria-label="Saving goals grid">
        <article
          #goalCard
          class="goal-card"
          *ngFor="let goal of goals; trackBy: trackByGoal; let i = index"
          [ngClass]="{
            'completed': isCompleted(goal),
            'overdue': isOverdue(goal),
            'active': !isCompleted(goal) && !isOverdue(goal)
          }"
          (click)="onCardClick(goal, $event)"
          role="gridcell"
          tabindex="0"
          [attr.aria-label]="'Saving goal: ' + goal.name + ', Progress: ' + getProgress(goal.id) + '%, Status: ' + getStatusText(goal.id)"
          [attr.aria-rowindex]="i + 1"
          (keydown.enter)="onCardClick(goal, $event)"
          (keydown.space)="onCardClick(goal, $event)"
          (keydown.arrowdown)="focusNextCard(i)"
          (keydown.arrowup)="focusPreviousCard(i)"
        >

          <div class="card-header">
            <div class="status-badge" [ngClass]="getStatusClass(goal.id)" [attr.aria-label]="'Status: ' + getStatusText(goal.id)">
              <i class="fa" [ngClass]="getStatusIcon(goal.id)" aria-hidden="true"></i>
              <span>{{ getStatusText(goal.id) }}</span>
            </div>
            <div class="priority-badge" [ngClass]="goal.priority.toLowerCase()" [attr.aria-label]="'Priority: ' + goal.priority">
              <i class="fa fa-flag" aria-hidden="true"></i>
              <span>{{ goal.priority }}</span>
            </div>
          </div>

          <div class="goal-image">
            <img
              ngOptimizedImage
              [ngSrc]="getImageForCategory(goal.category)"
              [alt]="goal.category + ' goal category image'"
              width="320"
              height="183"
              loading="lazy"
              decoding="async"
              [attr.sizes]="'(max-width: 768px) 100vw, 320px'"
              (error)="onImageError($event)"
            />
            <div class="image-overlay">
              <div class="category-label">
                <i class="fa" [ngClass]="getCategoryIcon(goal.category)" aria-hidden="true"></i>
                <span>{{ goal.category }}</span>
              </div>
            </div>
          </div>

          <div class="goal-content">
            <h3 class="goal-title">{{ goal.name }}</h3>
            

            <div class="progress-section">
              <div class="progress-header">
                <span class="progress-label">Progress</span>
                <span class="progress-percentage" [attr.aria-label]="'Progress: ' + getProgress(goal.id) + ' percent'">
                  {{ getProgress(goal.id) }}%
                </span>
              </div>
              
              <div class="progress-bar" role="progressbar" 
                   [attr.aria-valuenow]="getProgress(goal.id)"
                   [attr.aria-valuemin]="0"
                   [attr.aria-valuemax]="100"
                   [attr.aria-label]="'Progress: ' + getProgress(goal.id) + ' percent complete'">
                <div 
                  class="progress-fill"
                  [ngStyle]="{
                    width: getProgress(goal.id) + '%',
                    background: getProgressGradient(goal.id)
                  }"
                ></div>
                <div class="progress-glow" [ngStyle]="{ width: getProgress(goal.id) + '%' }"></div>
              </div>
              
              <div class="progress-stats">
                <span class="remaining-amount" [attr.aria-label]="'Remaining amount: ' + (getRemainingAmount(goal.id) | currency:'USD':'symbol':'1.0-0')">
                  {{ getRemainingAmount(goal.id) | currency:'USD':'symbol':'1.0-0' }} remaining
                </span>
                <span class="days-left" *ngIf="!isCompleted(goal)" [attr.aria-label]="'Days remaining: ' + getDaysLeft(goal.id)">
                  {{ getDaysLeft(goal.id) }} days left
                </span>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div class="card-overlay" *ngIf="showOverlay && selectedGoal" [ngStyle]="overlayPosition">
        <div class="overlay-content">
          <button class="close-btn" (click)="onCloseOverlay()" aria-label="Close overlay">
            <i class="fa fa-times" aria-hidden="true"></i>
          </button>
          
          <div class="overlay-header">
            <div class="goal-icon">
              <i class="fa" [ngClass]="getCategoryIcon(selectedGoal.category)" aria-hidden="true"></i>
            </div>
            <div class="header-content">
              <h3 class="goal-title">{{ selectedGoal.name }}</h3>
              <div class="goal-meta">
                <span class="category-badge">{{ getCategoryLabel(selectedGoal.category) }}</span>
                <span class="priority-badge">{{ selectedGoal.priority }}</span>
                <span class="status-badge" [ngClass]="getStatusClass(selectedGoal.id)">
                  {{ getStatusText(selectedGoal.id) }}
                </span>
              </div>
            </div>
          </div>

          <div class="overlay-body">
            <div class="progress-section">
              <div class="progress-header">
                <span class="progress-label">Progress</span>
                <span class="progress-percentage">{{ getProgress(selectedGoal.id) }}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" 
                     [ngStyle]="{
                       width: getProgress(selectedGoal.id) + '%',
                       background: getProgressGradient(selectedGoal.id)
                     }">
                </div>
              </div>
              <div class="progress-amounts">
                <span>{{ selectedGoal.currentAmount | currency:'USD':'symbol':'1.0-0' }}</span>
                <span>{{ selectedGoal.targetAmount | currency:'USD':'symbol':'1.0-0' }}</span>
              </div>
            </div>

            <div class="details-section">
              <div class="detail-item">
                <span class="detail-label">Remaining</span>
                <span class="detail-value">{{ getRemainingAmount(selectedGoal.id) | currency:'USD':'symbol':'1.0-0' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Days Left</span>
                <span class="detail-value">{{ getDaysLeft(selectedGoal.id) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Deadline</span>
                <span class="detail-value">{{ selectedGoal.deadline | date:'MMM dd, yyyy' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./saving-card-list.component.scss'],
})
export class SavingCardListComponent implements OnInit {
  @Input() goals: SavingGoalResponseDTO[] = [];
  @Output() readonly viewDetails = new EventEmitter<SavingGoalResponseDTO>();
  @Output() readonly openOverlay = new EventEmitter<{ goal: SavingGoalResponseDTO; position: { x: number; y: number; width: number; height: number } }>();
  @Output() readonly createGoal = new EventEmitter<void>();

  @ViewChild('goalsContainer', { static: false }) goalsContainer!: ElementRef;
  @ViewChildren('goalCard') goalCards!: QueryList<ElementRef<HTMLElement>>;

  selectedGoal: SavingGoalResponseDTO | null = null;
  showOverlay = false;
  overlayPosition = { top: '0px', left: '0px' };

  readonly completedGoalsCount = computed(() => 
    this.goals.filter(goal => this.isCompleted(goal)).length
  );

  readonly activeGoalsCount = computed(() => 
    this.goals.filter(goal => !this.isCompleted(goal) && !this.isOverdue(goal)).length
  );

  readonly overdueGoalsCount = computed(() => 
    this.goals.filter(goal => this.isOverdue(goal)).length
  );

  readonly goalProgressMap = computed(() => {
    const map = new Map<number, number>();
    this.goals.forEach(goal => {
      map.set(goal.id, goal.progressPercent ?? this.calculateProgress(goal));
    });
    return map;
  });

  readonly goalStatusMap = computed(() => {
    const map = new Map<number, string>();
    this.goals.forEach(goal => {
      map.set(goal.id, this.getStatusTextFromGoal(goal));
    });
    return map;
  });

  readonly goalRemainingMap = computed(() => {
    const map = new Map<number, number>();
    this.goals.forEach(goal => {
      map.set(goal.id, this.getRemainingAmountFromGoal(goal));
    });
    return map;
  });

  readonly goalDaysLeftMap = computed(() => {
    const map = new Map<number, number>();
    this.goals.forEach(goal => {
      map.set(goal.id, this.getDaysLeftFromGoal(goal));
    });
    return map;
  });

  readonly goalStatusClassMap = computed(() => {
    const map = new Map<number, string>();
    this.goals.forEach(goal => {
      map.set(goal.id, this.getStatusClassFromGoal(goal));
    });
    return map;
  });

  readonly goalStatusIconMap = computed(() => {
    const map = new Map<number, string>();
    this.goals.forEach(goal => {
      map.set(goal.id, this.getStatusIconFromGoal(goal));
    });
    return map;
  });

  readonly goalProgressGradientMap = computed(() => {
    const map = new Map<number, string>();
    this.goals.forEach(goal => {
      map.set(goal.id, this.getProgressGradientFromGoal(goal));
    });
    return map;
  });

  private readonly imageMap: Record<SavingGoalCategory, string> = {
    'HEALTH': 'assets/images/saving/Health.png',
    'MARRIAGE': 'assets/images/saving/Family support.png',
    'EDUCATION': 'assets/images/saving/Education.png',
    'TRAVEL': 'assets/images/saving/Travel.png',
    'EMERGENCY': 'assets/images/saving/Emergency.png',
    'OTHER': 'assets/images/saving/Gifts.png',
  };

  private readonly iconMap: Record<SavingGoalCategory, string> = {
    'HEALTH': 'fa-heartbeat',
    'MARRIAGE': 'fa-heart',
    'EDUCATION': 'fa-graduation-cap',
    'TRAVEL': 'fa-plane',
    'EMERGENCY': 'fa-shield',
    'OTHER': 'fa-star',
  };


  constructor() {
    // SEO fragment provided via META_FRAGMENT token
    // Parent component aggregates all fragments via SeoService
  }

  ngOnInit(): void {
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    // ngOptimizedImage requires setting ngSrc attribute
    img.setAttribute('ngSrc', 'assets/images/saving/Gifts.png');
  }

  getImageForCategory(category: SavingGoalCategory): string {
    return this.imageMap[category] || 'assets/images/saving/Gifts.png';
  }

  getCategoryIcon(category: SavingGoalCategory): string {
    return this.iconMap[category] || 'fa-tag';
  }

  getCategoryLabel(category: SavingGoalCategory): string {
    const categoryMap: Record<SavingGoalCategory, string> = {
      'HEALTH': 'Health',
      'MARRIAGE': 'Marriage',
      'EDUCATION': 'Education',
      'TRAVEL': 'Travel',
      'EMERGENCY': 'Emergency',
      'OTHER': 'Other',
    };
    return categoryMap[category] || category;
  }

  getProgress(goalId: number): number {
    return this.goalProgressMap().get(goalId) ?? 0;
  }

  getStatusText(goalId: number): string {
    return this.goalStatusMap().get(goalId) ?? 'Unknown';
  }

  getRemainingAmount(goalId: number): number {
    return this.goalRemainingMap().get(goalId) ?? 0;
  }

  getDaysLeft(goalId: number): number {
    return this.goalDaysLeftMap().get(goalId) ?? 0;
  }

  getStatusClass(goalId: number): string {
    return this.goalStatusClassMap().get(goalId) ?? 'active';
  }

  getStatusIcon(goalId: number): string {
    return this.goalStatusIconMap().get(goalId) ?? 'fa-clock';
  }

  getProgressGradient(goalId: number): string {
    return this.goalProgressGradientMap().get(goalId) ?? 'linear-gradient(135deg, #e74c3c 0%, #dc3545 100%)';
  }

  calculateProgress(goal: SavingGoalResponseDTO): number {
    if (goal.targetAmount === 0) return 0;
    const percent = (goal.currentAmount / goal.targetAmount) * 100;
    return Math.min(100, Math.max(0, +percent.toFixed(1)));
  }

  isCompleted(goal: SavingGoalResponseDTO): boolean {
    return goal.status === 'COMPLETED' || goal.currentAmount >= goal.targetAmount;
  }

  isOverdue(goal: SavingGoalResponseDTO): boolean {
    if (this.isCompleted(goal)) return false;
    const today = new Date().toISOString().split('T')[0];
    return goal.deadline < today;
  }

  private getStatusTextFromGoal(goal: SavingGoalResponseDTO): string {
    if (this.isCompleted(goal)) return 'Completed';
    if (this.isOverdue(goal)) return 'Overdue';
    if (goal.status === 'PAUSED') return 'Paused';
    if (goal.status === 'CANCELLED') return 'Cancelled';
    return 'Active';
  }

  private getRemainingAmountFromGoal(goal: SavingGoalResponseDTO): number {
    return goal.remainingAmount ?? Math.max(0, goal.targetAmount - goal.currentAmount);
  }

  private getDaysLeftFromGoal(goal: SavingGoalResponseDTO): number {
    const today = new Date();
    const deadline = new Date(goal.deadline);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  private getStatusClassFromGoal(goal: SavingGoalResponseDTO): string {
    if (this.isCompleted(goal)) return 'completed';
    if (this.isOverdue(goal)) return 'overdue';
    if (goal.status === 'PAUSED') return 'paused';
    if (goal.status === 'CANCELLED') return 'cancelled';
    return 'active';
  }

  private getStatusIconFromGoal(goal: SavingGoalResponseDTO): string {
    if (this.isCompleted(goal)) return 'fa-check-circle';
    if (this.isOverdue(goal)) return 'fa-exclamation-triangle';
    if (goal.status === 'PAUSED') return 'fa-pause-circle';
    if (goal.status === 'CANCELLED') return 'fa-times-circle';
    return 'fa-clock';
  }

  private getProgressGradientFromGoal(goal: SavingGoalResponseDTO): string {
    const progress = this.calculateProgress(goal);
    if (progress >= 100) return 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
    if (progress >= 75) return 'linear-gradient(135deg, #17a2b8 0%, #20c997 100%)';
    if (progress >= 50) return 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)';
    if (progress >= 25) return 'linear-gradient(135deg, #fd7e14 0%, #e74c3c 100%)';
    return 'linear-gradient(135deg, #e74c3c 0%, #dc3545 100%)';
  }

  createNewGoal(): void {
    this.createGoal.emit();
  }

  trackByGoal(index: number, goal: SavingGoalResponseDTO): number {
    return goal.id;
  }

  onCardClick(goal: SavingGoalResponseDTO, event: Event): void {
    const target = event.target as HTMLElement;
    const cardElement = target.closest('.goal-card') as HTMLElement;
    
    if (cardElement && this.goalsContainer) {
      const containerRect = this.goalsContainer.nativeElement.getBoundingClientRect();
      const cardRect = cardElement.getBoundingClientRect();
      
      const relativeX = cardRect.left - containerRect.left;
      const relativeY = cardRect.top - containerRect.top;
      
      this.overlayPosition = {
        top: `${relativeY}px`,
        left: `${relativeX}px`
      };
      
      this.selectedGoal = goal;
      this.showOverlay = true;
    }
  }

  onCloseOverlay(): void {
    this.showOverlay = false;
    this.selectedGoal = null;
  }

  focusNextCard(currentIndex: number): void {
    const nextIndex = Math.min(currentIndex + 1, this.goals.length - 1);
    this.focusCardByIndex(nextIndex);
  }

  focusPreviousCard(currentIndex: number): void {
    const prevIndex = Math.max(currentIndex - 1, 0);
    this.focusCardByIndex(prevIndex);
  }

  private focusCardByIndex(index: number): void {
    if (this.goalCards && this.goalCards.length > index) {
      this.goalCards.toArray()[index].nativeElement.focus();
    }
  }
}
