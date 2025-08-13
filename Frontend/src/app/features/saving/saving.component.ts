// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, HostListener, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

// Services
import { AuthService } from '../../core/services/auth.service';
import { SavingGoalService } from '../../core/services/saving.service';

// Components
import { SavingOverlayComponent } from './saving-overlay/saving-overlay.component';
import { SavingTableComponent } from './saving-table/saving-table.component';
import { SavingCardListComponent } from './saving-card-list/saving-card-list.component';
import { SavingFormComponent } from './saving-form/saving-form.component';
import { SavingFilterComponent } from './saving-filter/saving-filter.component';
import { OverlayContainerComponent } from '../../shared/components/overlay-container/overlay-container/overlay-container.component';

// Models & Enums
import { SavingGoal, SavingGoalRequest } from '../../models/saving.model';
import { SavingGoalCategory, SAVING_GOAL_CATEGORY_OPTIONS } from '../../enums/saving-goal';
import { PriorityLevel, PRIORITY_LEVEL_OPTIONS } from '../../enums/priority-level';

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
  // ====================================================================
  // Properties
  // ====================================================================
  
  // User & Data
  userId$: any;
  goals: SavingGoal[] = [];
  filteredGoals: SavingGoal[] = [];
  isLoading = true;
  
  // View State
  selectedView: 'cards' | 'table' = 'cards';
  isMobile = window.innerWidth < 768;
  isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
  showViewToggle = this.isTablet || window.innerWidth >= 1024;
  
  // Overlay States
  overlayVisible = false;
  isModifyOverlayVisible = false;
  isDeleteOverlayVisible = false;
  isAddOverlayVisible = false;
  
  // Selected Items
  selectedGoal: SavingGoal | null = null;
  selectedGoalToModify: SavingGoal | null = null;
  selectedGoalToDelete: number | null = null;
  
  // Filters
  filterCategory: SavingGoalCategory | null = null;
  filterPriority: PriorityLevel | null = null;
  
  // Form
  savingForm: FormGroup;
  readonly categories = Object.values(SAVING_GOAL_CATEGORY_OPTIONS);
  readonly priorities = Object.values(PRIORITY_LEVEL_OPTIONS);
  
  // Private
  private readonly destroy$ = new Subject<void>();
  private userId: number | null = null;

  // ====================================================================
  // Constructor
  // ====================================================================
  
  constructor(
    private readonly authService: AuthService,
    private readonly savingGoalService: SavingGoalService,
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.savingForm = this.initForm();
    this.userId$ = this.authService.userId$;
  }

  // ====================================================================
  // Lifecycle
  // ====================================================================
  
  ngOnInit(): void {
    this.setupSubscriptions();
    // Ensure cards view is selected by default
    this.selectedView = 'cards';
    console.log('Component initialized, selectedView:', this.selectedView);
    
    // Force change detection after a short delay to ensure view is properly initialized
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ====================================================================
  // Event Listeners
  // ====================================================================
  
  @HostListener('window:resize', ['$event'])
  onResize(): void {
    // Force change detection on resize for responsive behavior
    this.updateViewForScreenSize();
  }

  // ====================================================================
  // Public Methods
  // ====================================================================
  
  onFilterChanged(filters: {
    category: SavingGoalCategory | null;
    priority: PriorityLevel | null;
  }): void {
    this.applyFilter(filters.category, filters.priority);
  }

  onToggleView(view: 'cards' | 'table'): void {
    if (this.isMobile) return; // Prevent toggle on mobile
    this.selectedView = view;
  }

  onOpenOverlay(goal: SavingGoal): void {
    this.selectedGoal = goal;
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

  onModifyGoal(goal: SavingGoal): void {
    this.selectedGoalToModify = { ...goal };
    this.patchFormWithGoal(goal);
    this.isModifyOverlayVisible = true;
  }

  onDeleteGoal(goalId: number): void {
    this.selectedGoalToDelete = goalId;
    this.isDeleteOverlayVisible = true;
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
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadGoals();
        this.closeOverlay();
      });
  }

  submitModification(): void {
    if (!this.userId || !this.selectedGoalToModify || !this.savingForm.valid) return;

    const formValue = this.savingForm.value;
    const request = this.createGoalRequest(formValue);

    this.savingGoalService.update(this.selectedGoalToModify.id, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadGoals();
        this.closeOverlay();
      });
  }

  confirmDelete(): void {
    if (!this.selectedGoalToDelete) return;
    
    this.savingGoalService.delete(this.selectedGoalToDelete)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadGoals();
        this.closeOverlay();
      });
  }

  // ====================================================================
  // Private Methods
  // ====================================================================
  
  private setupSubscriptions(): void {
    this.userId$
      .pipe(takeUntil(this.destroy$))
      .subscribe((id: number) => {
        console.log('User ID received:', id);
        this.userId = id;
        if (id !== null) this.loadGoals();
      });
  }

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
    
    this.isLoading = true;
    console.log('Loading goals for user:', this.userId);
    this.savingGoalService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe((goals) => {
        console.log('Goals loaded:', goals);
        this.goals.length = 0;
        this.goals.push(...goals);
        this.applyFilter(this.filterCategory, this.filterPriority);
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  private applyFilter(category: SavingGoalCategory | null, priority: PriorityLevel | null): void {
    this.filteredGoals.length = 0;
    const filtered = this.goals.filter((goal) => {
      const categoryMatch = category ? goal.category === category : true;
      const priorityMatch = priority ? goal.priority === priority : true;
      return categoryMatch && priorityMatch;
    });
    this.filteredGoals.push(...filtered);
    console.log('Filtered goals:', this.filteredGoals);
    this.cdr.detectChanges();
  }

  private updateViewForScreenSize(): void {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    
    if (isMobile && this.selectedView === 'table') {
      this.selectedView = 'cards';
    }
    
    this.showViewToggle = isTablet || window.innerWidth >= 1024;
  }

  private patchFormWithGoal(goal: SavingGoal): void {
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
    this.isDeleteOverlayVisible = false;
    this.isAddOverlayVisible = false;
    this.selectedGoalToModify = null;
    this.selectedGoalToDelete = null;
    this.selectedGoal = null;
    this.overlayVisible = false;
  }

  private createGoalRequest(formValue: any): SavingGoalRequest {
    return {
      userId: this.userId!,
      name: formValue.name,
      targetAmount: formValue.targetAmount,
      currentAmount: formValue.currentAmount,
      creationDate: new Date().toISOString(),
      deadline: formValue.deadline,
      category: formValue.category,
      priority: formValue.priority,
    };
  }
}
