// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { trigger, style, transition, animate, query, stagger } from '@angular/animations';

import { SavingGoal } from '../../../models/saving.model';
import { PriorityLevel } from '../../../enums/priority-level';
import { SAVING_GOAL_CATEGORY_OPTIONS } from '../../../enums/saving-goal';

@Component({
  selector: 'app-saving-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './saving-overlay.component.html',
  styleUrls: ['./saving-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('overlayAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8) translateY(-20px)' }),
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0, transform: 'scale(0.8) translateY(-20px)' }))
      ])
    ]),
    trigger('backdropAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('contentAnimation', [
      transition(':enter', [
        query('.overlay-header, .progress-wrapper, .overlay-body, .overlay-actions', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('progressAnimation', [
      transition('* => *', [
        style({ width: '0%' }),
        animate('1500ms cubic-bezier(0.4, 0, 0.2, 1)', style({ width: '*' }))
      ])
    ])
  ]
})
export class SavingOverlayComponent implements OnInit, OnDestroy {
  @Input() goal!: SavingGoal;
  @Output() close = new EventEmitter<void>();
  @Output() refresh = new EventEmitter<void>();
  @Output() modify = new EventEmitter<SavingGoal>();
  @Output() delete = new EventEmitter<number>();

  showDeleteConfirmation = false;
  isClosing = false;

  private readonly destroy$ = new Subject<void>();

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
  ) {}

  ngOnInit(): void {
    this.meta.addTags([
      { name: 'description', content: `View detailed information about your saving goal: ${this.goal.name}` },
      { name: 'robots', content: 'noindex,nofollow' },
    ]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.onCancel();
  }

  onCancel(): void {
    if (this.isClosing) return;
    this.isClosing = true;
    this.close.emit();
  }

  onModify(): void {
    this.modify.emit(this.goal);
  }

  onDelete(): void {
    this.showDeleteConfirmation = true;
  }

  confirmDelete(): void {
    this.delete.emit(this.goal.id);
    this.showDeleteConfirmation = false;
  }

  cancelDelete(): void {
    this.showDeleteConfirmation = false;
  }

  calculateProgress(goal: SavingGoal): number {
    if (!goal.targetAmount || goal.targetAmount === 0) return 0;
    const percent = (goal.currentAmount / goal.targetAmount) * 100;
    return Math.min(100, Math.max(0, +percent.toFixed(1)));
  }

  getCategoryIcon(category: string): string {
    return this.iconMap[category] || 'fa-tag';
  }

  getCategoryLabel(value: string): string {
    const match = SAVING_GOAL_CATEGORY_OPTIONS.find(option => option.value === value);
    return match ? match.label : value;
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

  getStatusClass(goal: SavingGoal): string {
    if (this.isCompleted(goal)) return 'completed';
    if (this.isOverdue(goal)) return 'overdue';
    return 'active';
  }

  getStatusText(goal: SavingGoal): string {
    if (this.isCompleted(goal)) return 'Completed';
    if (this.isOverdue(goal)) return 'Overdue';
    return 'Active';
  }

  getStatusIcon(goal: SavingGoal): string {
    if (this.isCompleted(goal)) return 'fa-check-circle';
    if (this.isOverdue(goal)) return 'fa-exclamation-triangle';
    return 'fa-clock';
  }

  getRemainingAmount(goal: SavingGoal): number {
    return Math.max(0, goal.targetAmount - goal.currentAmount);
  }

  getTimeRemaining(goal: SavingGoal): string {
    const daysLeft = this.getDaysLeft(goal);
    if (daysLeft === 0) return 'Due today';
    if (daysLeft === 1) return 'Due tomorrow';
    if (daysLeft < 7) return `${daysLeft} days left`;
    if (daysLeft < 30) return `${Math.ceil(daysLeft / 7)} weeks left`;
    return `${Math.ceil(daysLeft / 30)} months left`;
  }
}
