/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component SavingComponent
  @description Main saving dashboard component for managing saving goals
*/

import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, HostListener, inject, OnDestroy, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { SeoService } from '../../core/seo/seo.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { SavingGoalService } from '../../core/services/saving.service';
import { PRIORITY_LEVEL_OPTIONS } from '../../enums/priority-level';
import { SAVING_GOAL_CATEGORY_OPTIONS, SavingGoalCategory, SavingGoalPriority } from '../../enums/saving-goal';
import { SavingGoalRequestDTO, SavingGoalResponseDTO } from '../../models/saving.model';
import { OverlayContainerComponent } from '../../shared/components/overlay-container/overlay-container/overlay-container.component';
import { SavingCardListComponent } from './saving-card-list/saving-card-list.component';
import { SavingFilterComponent } from './saving-filter/saving-filter.component';
import { SavingFormComponent } from './saving-form/saving-form.component';
import { SavingOverlayComponent } from './saving-overlay/saving-overlay.component';
import { SavingTableComponent } from './saving-table/saving-table.component';

@Component({
  selector: 'app-saving-goal',
  standalone: true,
  imports: [
    CommonModule,
    SavingFilterComponent,
    SavingCardListComponent,
    SavingTableComponent,
    SavingFormComponent,
    SavingOverlayComponent,
    OverlayContainerComponent,
  ],
  templateUrl: './saving.component.html',
  styleUrls: ['./saving.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SavingComponent implements OnInit, OnDestroy {

  userId$: any;
  goals = signal<SavingGoalResponseDTO[]>([]);
  
  filterCategory = signal<SavingGoalCategory | 'ALL'>('ALL');
  filterPriority = signal<SavingGoalPriority | 'ALL'>('ALL');
  
  filteredGoals = computed(() => {
    const goals = this.goals();
    const category = this.filterCategory();
    const priority = this.filterPriority();
    
    return goals.filter(goal => {
      if (category !== 'ALL' && goal.category !== category) return false;
      if (priority !== 'ALL' && goal.priority !== priority) return false;
      return true;
    });
  });
  
  selectedView: 'cards' | 'table' = 'cards';
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  
  isMobile = this.isBrowser ? window.innerWidth < 768 : false;
  isTablet = this.isBrowser ? window.innerWidth >= 768 && window.innerWidth < 1024 : false;
  showViewToggle = this.isTablet || (this.isBrowser && window.innerWidth >= 1024);
  
  overlayVisible = false;
  isModifyOverlayVisible = false;
  isAddOverlayVisible = false;
  
  showAddForm = false;
  isModifyMode = false;
  
  selectedGoal: SavingGoalResponseDTO | null = null;
  selectedGoalToModify: SavingGoalResponseDTO | null = null;
  cardPosition: { x: number; y: number; width: number; height: number } | undefined;
  
  savingForm: FormGroup;
  readonly categories = Object.values(SAVING_GOAL_CATEGORY_OPTIONS);
  readonly priorities = Object.values(PRIORITY_LEVEL_OPTIONS);
  
  private userId: number | null = null;

  private readonly seo = inject(SeoService);

  constructor(
    private readonly authService: AuthService,
    private readonly savingGoalService: SavingGoalService,
    private readonly notificationService: NotificationService,
    private readonly fb: FormBuilder
  ) {
    this.savingForm = this.initForm();
    this.userId$ = this.authService.userId$;
  }

  ngOnInit(): void {
    this.setupSEO();
    this.authService.userId$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((id: number | null) => {
        if (id && id > 0) {
          this.userId = id;
          this.loadGoals();
        }
      });
  }

  ngOnDestroy(): void {
    // DestroyRef handles cleanup automatically
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.updateViewForScreenSize();
  }

  onFilterChanged(filters: {
    category: SavingGoalCategory | 'ALL';
    priority: SavingGoalPriority | 'ALL';
  }): void {
    this.filterCategory.set(filters.category);
    this.filterPriority.set(filters.priority);
  }

  onToggleView(view: 'cards' | 'table'): void {
    if (this.isMobile) return;
    this.selectedView = view;
  }

  onOpenOverlay(event: { goal: SavingGoalResponseDTO; position: { x: number; y: number; width: number; height: number } }): void {
    this.selectedGoal = event.goal;
    this.cardPosition = event.position;
    this.overlayVisible = true;
  }

  onCloseOverlay(): void {
    this.selectedGoal = null;
    this.overlayVisible = false;
  }

  onGoalUpdated(): void {
    this.loadGoals();
    this.onCloseOverlay();
  }

  onModifyGoal(goal: SavingGoalResponseDTO): void {
    this.selectedGoalToModify = { ...goal };
    this.patchFormWithGoal(goal);
    this.isModifyMode = true;
    this.showAddForm = true;
  }

  onDeleteGoal(goalId: number): void {
    this.savingGoalService.delete(goalId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        const deletedGoal = this.goals().find(g => g.id === goalId);
        if (deletedGoal) {
          this.notificationService.addSavingDeletedNotification(deletedGoal.name);
        }
        
        this.loadGoals();
      },
      error: (error) => {
        if (error.status === 409) {
          this.notificationService.addSavingErrorNotification('delete', 'Cannot delete this goal. It may have active transactions or dependencies.');
        } else if (error.status === 404) {
          this.notificationService.addSavingErrorNotification('delete', 'Goal not found. It may have already been deleted.');
        } else if (error.status === 403) {
          this.notificationService.addSavingErrorNotification('delete', 'You do not have permission to delete this goal.');
        } else {
          this.notificationService.addSavingErrorNotification('delete', error.message || 'An error occurred while deleting the goal.');
        }
      }
      });
  }

  onAddMoneyToGoal(event: { goal: SavingGoalResponseDTO; amount: number }): void {
    const updatedGoal = { ...event.goal };
    updatedGoal.currentAmount = event.goal.currentAmount + event.amount;
    
    const requestPayload = {
      userId: this.userId!,
      name: updatedGoal.name,
      targetAmount: updatedGoal.targetAmount,
      currentAmount: updatedGoal.currentAmount,
      deadline: this.formatDateForBackend(updatedGoal.deadline),
      category: updatedGoal.category,
      priority: updatedGoal.priority,
      currency: updatedGoal.currency || 'USD',
      status: updatedGoal.status || 'ACTIVE'
    };
    
    // Debug logging removed for production - use LoggingService if needed
    // this.loggingService.log('PUT /api/saving-goals/' + event.goal.id);
    
    this.savingGoalService.update(event.goal.id, requestPayload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notificationService.addSavingMoneyAddedNotification(event.goal.name, event.amount);
          
          this.loadGoals();
        },
        error: (error) => {
          // Extract meaningful error message from HTTP error
          let errorMessage = 'Unknown error';
          if (error?.error?.message) {
            errorMessage = error.error.message;
          } else if (error?.message) {
            errorMessage = error.message;
          } else if (error?.status === 500) {
            errorMessage = 'Server error occurred. Please try again later.';
          } else if (error?.status === 404) {
            errorMessage = 'Saving goal not found.';
          } else if (error?.status === 400) {
            errorMessage = 'Invalid request. Please check your input.';
          }
          
          this.notificationService.addSavingErrorNotification('add money', errorMessage);
        }
      });
  }

  onAddGoal(): void {
    this.toggleAddForm();
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.isModifyMode = false;
      this.resetForm();
    }
  }

  closeAddForm(): void {
    this.showAddForm = false;
    this.isModifyMode = false;
    this.resetForm();
  }

  openAddOverlay(): void {
    this.selectedGoalToModify = null;
    this.resetForm();
    this.setDefaultDeadline();
    this.isAddOverlayVisible = true;
  }

  closeOverlay(): void {
    this.resetAllOverlays();
    this.resetForm();
  }

  submitCreation(): void {
    if (!this.userId || !this.savingForm.valid) return;

    const formValue = this.savingForm.value;
    const dto = this.createGoalRequest(formValue);

    this.savingGoalService.create(dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (createdGoal) => {
        this.notificationService.addSavingCreatedNotification(createdGoal.name, createdGoal.targetAmount);
        
        this.loadGoals();
        
        this.closeAddForm();
      },
        error: (error) => {
          // Extract meaningful error message from HTTP error
          let errorMessage = 'Unknown error';
          if (error?.error?.message) {
            errorMessage = error.error.message;
          } else if (error?.message) {
            errorMessage = error.message;
          } else if (error?.status === 500) {
            errorMessage = 'Server error occurred. Please try again later.';
          } else if (error?.status === 404) {
            errorMessage = 'Resource not found.';
          } else if (error?.status === 400) {
            errorMessage = 'Invalid request. Please check your input.';
          }
          
          this.notificationService.addSavingErrorNotification('create', errorMessage);
        }
      });
  }

  submitModification(): void {
    if (!this.userId || !this.selectedGoalToModify || !this.savingForm.valid) return;

    const formValue = this.savingForm.value;
    const request = this.createGoalRequest(formValue);

    this.savingGoalService.update(this.selectedGoalToModify.id, request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (updatedGoal) => {
        this.notificationService.addSavingModifiedNotification(updatedGoal.name, updatedGoal.targetAmount);
        
        this.loadGoals();
        this.closeAddForm();
      },
      error: (error) => {
        // Extract meaningful error message from HTTP error
        let errorMessage = 'Unknown error';
        if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (error?.message) {
          errorMessage = error.message;
        } else if (error?.status === 500) {
          errorMessage = 'Server error occurred. Please try again later.';
        } else if (error?.status === 404) {
          errorMessage = 'Saving goal not found.';
        } else if (error?.status === 400) {
          errorMessage = 'Invalid request. Please check your input.';
        }
        
        this.notificationService.addSavingErrorNotification('modify', errorMessage);
      }
      });
  }


  // Removed unused setupSubscriptions method - userId$ subscription handled in ngOnInit

  private initForm(): FormGroup {
    return this.fb.group({
      name: [null, [Validators.required, Validators.minLength(2)]],
      targetAmount: [null, [Validators.required, Validators.min(1)]],
      currentAmount: [0, [Validators.required, Validators.min(0)]],
      deadline: [null, Validators.required],
      category: [null, Validators.required],
      priority: [null, Validators.required],
    });
  }

  private loadGoals(): void {
    if (!this.userId) return;
    
    this.savingGoalService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.goals.set(response.content);
        },
        error: (error) => {
        }
      });
  }

  private updateViewForScreenSize(): void {
    if (!this.isBrowser) return;
    
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    
    if (isMobile && this.selectedView === 'table') {
      this.selectedView = 'cards';
    }
    
    this.showViewToggle = isTablet || window.innerWidth >= 1024;
  }

  private patchFormWithGoal(goal: SavingGoalResponseDTO): void {
    this.savingForm.patchValue({
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      deadline: goal.deadline,
      category: goal.category,
      priority: goal.priority,
    });
  }

  private resetForm(): void {
    this.savingForm.reset();
  }

  private setDefaultDeadline(): void {
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    this.savingForm.patchValue({
      currentAmount: 0,
      deadline: oneYearFromNow.toISOString().split('T')[0]
    });
  }

  private resetAllOverlays(): void {
    this.isModifyOverlayVisible = false;
    this.isAddOverlayVisible = false;
    this.selectedGoalToModify = null;
    this.selectedGoal = null;
    this.overlayVisible = false;
  }

  private createGoalRequest(formValue: any): SavingGoalRequestDTO {
    const formattedDeadline = this.formatDateForBackend(formValue.deadline);
    
    return {
      userId: this.userId!,
      name: formValue.name,
      targetAmount: formValue.targetAmount,
      currentAmount: formValue.currentAmount || 0,
      deadline: formattedDeadline,
      category: formValue.category,
      priority: formValue.priority,
      currency: 'USD',
      status: 'ACTIVE',
    };
  }

  private formatDateForBackend(isoDate: string): string {
    const date = new Date(isoDate);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  private setupSEO(): void {
    const title = 'Saving Dashboard';
    const description = 'Manage and track your saving goals with progress monitoring, deadline management, and comprehensive analytics. Plan, monitor, and achieve your financial goals with category-wise tracking and priority management.';
    
    let canonical = 'https://alphavault.app/saving';
    if (this.isBrowser && typeof window !== 'undefined' && window.location) {
      canonical = `${window.location.origin}/saving`;
    } else {
      canonical = 'https://alphavault.app/saving';
    }

    this.seo.set({
      title,
      description,
      canonicalUrl: canonical,
      keywords: ['saving goals', 'financial goals', 'goal tracking', 'savings management', 'financial planning', 'Alpha Vault'],
      og: {
        title: 'Saving Dashboard - Manage Your Financial Goals',
        description,
        image: '/assets/og/default.png',
        type: 'website'
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Saving Dashboard',
        description
      },
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: title,
        description,
        url: canonical
      }
    });
  }
}
