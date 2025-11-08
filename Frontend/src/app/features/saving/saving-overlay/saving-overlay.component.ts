/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component SavingOverlayComponent
  @description Saving overlay component for displaying saving goal details
*/

import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, computed, ElementRef, EventEmitter, HostListener, inject, Input, OnDestroy, OnInit, Output, PLATFORM_ID, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';

import { META_FRAGMENT } from '../../../core/seo/page-meta.model';
import { SAVING_GOAL_CATEGORY_OPTIONS } from '../../../enums/saving-goal';
import { SavingGoalResponseDTO } from '../../../models/saving.model';

@Component({
  selector: 'app-saving-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './saving-overlay.component.html',
  styleUrls: ['./saving-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: META_FRAGMENT,
      useValue: {
        description: 'Detailed overlay modal displaying comprehensive saving goal information including progress tracking, remaining amounts, deadlines, and status indicators. Interactive overlay with modify and delete actions for goal management in Alpha Vault.'
      }
    }
  ],
  animations: [
    trigger('overlayAnimation', [
      transition(':enter', [
        style({ 
          opacity: 0, 
          transform: 'scale(0.9) translateY(-10px)',
          filter: 'blur(10px)'
        }),
        animate('500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
          style({ 
            opacity: 1, 
            transform: 'scale(1) translateY(0)',
            filter: 'blur(0px)'
          }))
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.55, 0.06, 0.68, 0.19)', 
          style({ 
            opacity: 0, 
            transform: 'scale(0.95) translateY(10px)',
            filter: 'blur(5px)'
          }))
      ])
    ]),
    trigger('backdropAnimation', [
      transition(':enter', [
        style({ opacity: 0, backdropFilter: 'blur(0px)' }),
        animate('400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
          style({ opacity: 1, backdropFilter: 'blur(20px)' }))
      ]),
      transition(':leave', [
        animate('250ms cubic-bezier(0.55, 0.06, 0.68, 0.19)', 
          style({ opacity: 0, backdropFilter: 'blur(0px)' }))
      ])
    ]),
    trigger('contentAnimation', [
      transition(':enter', [
        query('.overlay-header, .progress-wrapper, .overlay-body, .overlay-actions', [
          style({ 
            opacity: 0, 
            transform: 'translateY(30px) scale(0.95)',
            filter: 'blur(5px)'
          }),
          stagger(80, [
            animate('400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
              style({ 
                opacity: 1, 
                transform: 'translateY(0) scale(1)',
                filter: 'blur(0px)'
              }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('progressAnimation', [
      transition('* => *', [
        style({ width: '0%', opacity: 0.7 }),
        animate('2000ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
          style({ width: '*', opacity: 1 }))
      ])
    ]),
    trigger('cardAnimation', [
      transition(':enter', [
        style({ 
          opacity: 0, 
          transform: 'translateY(20px) scale(0.9)',
          filter: 'blur(3px)'
        }),
        animate('300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
          style({ 
            opacity: 1, 
            transform: 'translateY(0) scale(1)',
            filter: 'blur(0px)'
          }))
      ])
    ])
  ]
})
export class SavingOverlayComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() goal!: SavingGoalResponseDTO;
  @Input() cardPosition?: { x: number; y: number; width: number; height: number };
  @Output() readonly close = new EventEmitter<void>();
  @Output() readonly refresh = new EventEmitter<void>();
  @Output() readonly modify = new EventEmitter<SavingGoalResponseDTO>();
  @Output() readonly delete = new EventEmitter<number>();

  showDeleteConfirmation = false;
  isClosing = false;
  overlayPosition = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

  @ViewChild('overlayContent', { static: false }) overlayContent!: ElementRef;

  readonly computedProgress = computed(() => this.calculateProgress(this.goal));
  readonly computedStatusClass = computed(() => this.getStatusClass(this.goal));
  readonly computedStatusText = computed(() => this.getStatusText(this.goal));
  readonly computedStatusIcon = computed(() => this.getStatusIcon(this.goal));
  readonly computedRemainingAmount = computed(() => this.getRemainingAmount(this.goal));
  readonly computedDaysLeft = computed(() => this.getDaysLeft(this.goal));
  readonly computedTimeRemaining = computed(() => this.getTimeRemaining(this.goal));
  readonly computedProgressGradient = computed(() => this.getProgressGradient(this.goal));

  private readonly destroy$ = new Subject<void>();
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly elementRef = inject(ElementRef);

  private readonly iconMap: Record<string, string> = {
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
    if (this.cardPosition && this.isBrowser) {
      this.calculateOverlayPosition();
    } else {
      this.overlayPosition = {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }
  }

  ngAfterViewInit(): void {
    if (this.overlayContent) {
      this.overlayContent.nativeElement.focus();
    }
  }

  private calculateOverlayPosition(): void {
    if (!this.cardPosition || !this.isBrowser) return;

    const { x, y, width, height } = this.cardPosition;
    const overlayWidth = 500;
    const overlayHeight = 600;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 20;

    const cardCenterX = x + width / 2;
    const cardCenterY = y + height / 2;

    let left = cardCenterX - overlayWidth / 2;
    let top = cardCenterY - overlayHeight / 2;

    if (left < padding) {
      left = padding;
    } else if (left + overlayWidth > viewportWidth - padding) {
      left = viewportWidth - overlayWidth - padding;
    }

    if (top < padding) {
      top = padding;
    } else if (top + overlayHeight > viewportHeight - padding) {
      top = viewportHeight - overlayHeight - padding;
    }

    if (cardCenterX < overlayWidth / 2 || cardCenterX > viewportWidth - overlayWidth / 2) {
      left = (viewportWidth - overlayWidth) / 2;
    }

    if (cardCenterY < overlayHeight / 2 || cardCenterY > viewportHeight - overlayHeight / 2) {
      top = (viewportHeight - overlayHeight) / 2;
    }

    left = Math.max(padding, left);
    top = Math.max(padding, top);

    const position = {
      top: `${top}px`,
      left: `${left}px`,
      transform: 'none'
    };

    this.overlayPosition = position;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.onCancel();
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      this.handleTabNavigation(event);
    }
  }

  private handleTabNavigation(event: KeyboardEvent): void {
    if (!this.isBrowser) return;
    
    const focusableElements = this.elementRef.nativeElement.querySelectorAll(
      'button, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
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

  calculateProgress(goal: SavingGoalResponseDTO): number {
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

  getProgressGradient(goal: SavingGoalResponseDTO): string {
    const progress = this.calculateProgress(goal);
    if (progress >= 100) return 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
    if (progress >= 75) return 'linear-gradient(135deg, #17a2b8 0%, #20c997 100%)';
    if (progress >= 50) return 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)';
    if (progress >= 25) return 'linear-gradient(135deg, #fd7e14 0%, #e74c3c 100%)';
    return 'linear-gradient(135deg, #e74c3c 0%, #dc3545 100%)';
  }

  getDaysLeft(goal: SavingGoalResponseDTO): number {
    const today = new Date();
    const deadline = new Date(goal.deadline);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  isCompleted(goal: SavingGoalResponseDTO): boolean {
    return goal.currentAmount >= goal.targetAmount;
  }

  isOverdue(goal: SavingGoalResponseDTO): boolean {
    const today = new Date().toISOString().split('T')[0];
    return goal.deadline < today && !this.isCompleted(goal);
  }

  getStatusClass(goal: SavingGoalResponseDTO): string {
    if (this.isCompleted(goal)) return 'completed';
    if (this.isOverdue(goal)) return 'overdue';
    return 'active';
  }

  getStatusText(goal: SavingGoalResponseDTO): string {
    if (this.isCompleted(goal)) return 'Completed';
    if (this.isOverdue(goal)) return 'Overdue';
    return 'Active';
  }

  getStatusIcon(goal: SavingGoalResponseDTO): string {
    if (this.isCompleted(goal)) return 'fa-check-circle';
    if (this.isOverdue(goal)) return 'fa-exclamation-triangle';
    return 'fa-clock';
  }

  getRemainingAmount(goal: SavingGoalResponseDTO): number {
    return Math.max(0, goal.targetAmount - goal.currentAmount);
  }

  getTimeRemaining(goal: SavingGoalResponseDTO): string {
    const daysLeft = this.getDaysLeft(goal);
    if (daysLeft === 0) return 'Due today';
    if (daysLeft === 1) return 'Due tomorrow';
    if (daysLeft < 7) return `${daysLeft} days left`;
    if (daysLeft < 30) return `${Math.ceil(daysLeft / 7)} weeks left`;
    return `${Math.ceil(daysLeft / 30)} months left`;
  }
}
