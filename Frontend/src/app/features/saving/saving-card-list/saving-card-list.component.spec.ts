/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component SavingCardListComponent
  @description Saving card list component tests for displaying saving goals
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SavingGoalCategory, SavingGoalPriority, SavingGoalStatus } from '../../../enums/saving-goal';
import { SavingGoalResponseDTO } from '../../../models/saving.model';
import { SavingCardListComponent } from './saving-card-list.component';

describe('SavingCardListComponent', () => {
  let component: SavingCardListComponent;
  let fixture: ComponentFixture<SavingCardListComponent>;

  const mockGoals: SavingGoalResponseDTO[] = [
    {
      id: 1,
      userId: 1,
      version: 1,
      name: 'Emergency Fund',
      category: 'EMERGENCY' as SavingGoalCategory,
      priority: 'HIGH' as SavingGoalPriority,
      status: 'ACTIVE' as SavingGoalStatus,
      currency: 'USD',
      targetAmount: 10000,
      currentAmount: 5000,
      remainingAmount: 5000,
      progressPercent: 50,
      deadline: '2024-12-31',
      achievedAt: undefined,
      notes: 'Emergency savings',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      userId: 1,
      version: 1,
      name: 'Vacation Fund',
      category: 'TRAVEL' as SavingGoalCategory,
      priority: 'MEDIUM' as SavingGoalPriority,
      status: 'COMPLETED' as SavingGoalStatus,
      currency: 'USD',
      targetAmount: 5000,
      currentAmount: 5000,
      remainingAmount: 0,
      progressPercent: 100,
      deadline: '2024-06-30',
      achievedAt: '2024-06-15T00:00:00Z',
      notes: 'Summer vacation',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-06-15T00:00:00Z'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavingCardListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavingCardListComponent);
    component = fixture.componentInstance;
    component.goals = mockGoals;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with empty goals array', () => {
      const emptyComponent = TestBed.createComponent(SavingCardListComponent);
      expect(emptyComponent.componentInstance.goals).toEqual([]);
    });

    it('should display goals when provided', () => {
      const goalCards = fixture.debugElement.queryAll(By.css('.goal-card'));
      expect(goalCards.length).toBe(2);
    });

    it('should display empty state when no goals', () => {
      component.goals = [];
      fixture.detectChanges();
      
      const emptyState = fixture.debugElement.query(By.css('.empty-state'));
      expect(emptyState).toBeTruthy();
    });
  });

  describe('Goal Statistics', () => {
    it('should calculate completed goals count correctly', () => {
      expect(component.completedGoalsCount()).toBe(1);
    });

    it('should calculate active goals count correctly', () => {
      expect(component.activeGoalsCount()).toBe(1);
    });

    it('should calculate overdue goals count correctly', () => {
      expect(component.overdueGoalsCount()).toBe(0);
    });

    it('should update statistics when goals change', () => {
      const newGoals = [...mockGoals, {
        id: 3,
        userId: 1,
        version: 1,
        name: 'Overdue Goal',
        category: 'HEALTH' as SavingGoalCategory,
        priority: 'HIGH' as SavingGoalPriority,
        status: 'ACTIVE' as SavingGoalStatus,
        currency: 'USD',
        targetAmount: 2000,
        currentAmount: 500,
        remainingAmount: 1500,
        progressPercent: 25,
        deadline: '2023-12-31',
        achievedAt: undefined,
        notes: 'Overdue goal',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }];
      
      component.goals = newGoals;
      fixture.detectChanges();
      
      expect(component.overdueGoalsCount()).toBe(1);
    });
  });

  describe('Goal Status Logic', () => {
    it('should identify completed goals correctly', () => {
      const completedGoal = mockGoals[1];
      expect(component.isCompleted(completedGoal)).toBe(true);
    });

    it('should identify active goals correctly', () => {
      const activeGoal = mockGoals[0];
      expect(component.isCompleted(activeGoal)).toBe(false);
    });

    it('should identify overdue goals correctly', () => {
      const overdueGoal = {
        ...mockGoals[0],
        deadline: '2023-12-31'
      };
      expect(component.isOverdue(overdueGoal)).toBe(true);
    });

    it('should not mark completed goals as overdue', () => {
      const completedGoal = mockGoals[1];
      expect(component.isOverdue(completedGoal)).toBe(false);
    });
  });

  describe('Progress Calculation', () => {
    it('should calculate progress percentage correctly', () => {
      const goal = mockGoals[0];
      expect(component.calculateProgress(goal)).toBe(50);
    });

    it('should handle zero target amount', () => {
      const goal = { ...mockGoals[0], targetAmount: 0 };
      expect(component.calculateProgress(goal)).toBe(0);
    });

    it('should cap progress at 100%', () => {
      const goal = { ...mockGoals[0], currentAmount: 15000, targetAmount: 10000 };
      expect(component.calculateProgress(goal)).toBe(100);
    });

    it('should handle negative progress', () => {
      const goal = { ...mockGoals[0], currentAmount: -1000 };
      expect(component.calculateProgress(goal)).toBe(0);
    });
  });

  describe('Utility Methods', () => {
    it('should get correct image for category', () => {
      expect(component.getImageForCategory('EMERGENCY')).toBe('assets/images/saving/Emergency.png');
    });

    it('should get default image for unknown category', () => {
      expect(component.getImageForCategory('UNKNOWN' as SavingGoalCategory)).toBe('assets/images/saving/Gifts.png');
    });

    it('should get correct icon for category', () => {
      expect(component.getCategoryIcon('EMERGENCY')).toBe('fa-shield');
    });

    it('should get default icon for unknown category', () => {
      expect(component.getCategoryIcon('UNKNOWN' as SavingGoalCategory)).toBe('fa-tag');
    });

    it('should calculate remaining amount correctly', () => {
      const goal = mockGoals[0];
      expect(component.getRemainingAmount(goal.id)).toBe(5000);
    });

    it('should calculate days left correctly', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const goal = { ...mockGoals[0], deadline: futureDate.toISOString().split('T')[0] };
      
      const daysLeft = component.getDaysLeft(goal.id);
      expect(daysLeft).toBeGreaterThan(25);
      expect(daysLeft).toBeLessThan(35);
    });

    it('should return zero days left for past deadlines', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30);
      const goal = { ...mockGoals[0], deadline: pastDate.toISOString().split('T')[0] };
      
      expect(component.getDaysLeft(goal.id)).toBe(0);
    });
  });

  describe('Event Handling', () => {
    it('should emit createGoal when create button is clicked', () => {
      component.goals = [];
      fixture.detectChanges();
      
      spyOn(component.createGoal, 'emit');
      const createButton = fixture.debugElement.query(By.css('.btn-create-goal'));
      createButton.nativeElement.click();
      
      expect(component.createGoal.emit).toHaveBeenCalled();
    });

    it('should emit openOverlay when goal card is clicked', () => {
      spyOn(component.openOverlay, 'emit');
      const goalCard = fixture.debugElement.query(By.css('.goal-card'));
      goalCard.nativeElement.click();
      
      expect(component.openOverlay.emit).toHaveBeenCalledWith({
        goal: mockGoals[0],
        position: { x: 0, y: 0, width: 0, height: 0 }
      });
    });

    it('should emit viewDetails when view details button is clicked', () => {
      spyOn(component.viewDetails, 'emit');
      const viewButton = fixture.debugElement.query(By.css('.btn-view-details'));
      viewButton.nativeElement.click();
      
      expect(component.viewDetails.emit).toHaveBeenCalledWith(mockGoals[0]);
    });

    it('should prevent event propagation when view details button is clicked', () => {
      spyOn(component.openOverlay, 'emit');
      spyOn(component.viewDetails, 'emit');
      
      const viewButton = fixture.debugElement.query(By.css('.btn-view-details'));
      viewButton.nativeElement.click();
      
      expect(component.viewDetails.emit).toHaveBeenCalled();
      expect(component.openOverlay.emit).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should handle Enter key on goal cards', () => {
      spyOn(component.openOverlay, 'emit');
      const goalCard = fixture.debugElement.query(By.css('.goal-card'));
      
      goalCard.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      
      expect(component.openOverlay.emit).toHaveBeenCalledWith({
        goal: mockGoals[0],
        position: { x: 0, y: 0, width: 0, height: 0 }
      });
    });

    it('should handle Space key on goal cards', () => {
      spyOn(component.openOverlay, 'emit');
      const goalCard = fixture.debugElement.query(By.css('.goal-card'));
      
      goalCard.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
      
      expect(component.openOverlay.emit).toHaveBeenCalledWith({
        goal: mockGoals[0],
        position: { x: 0, y: 0, width: 0, height: 0 }
      });
    });

    it('should handle Enter key on create button', () => {
      component.goals = [];
      fixture.detectChanges();
      
      spyOn(component.createGoal, 'emit');
      const createButton = fixture.debugElement.query(By.css('.btn-create-goal'));
      
      createButton.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      
      expect(component.createGoal.emit).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const goalCards = fixture.debugElement.queryAll(By.css('.goal-card'));
      goalCards.forEach((card, index) => {
        const ariaLabel = card.nativeElement.getAttribute('aria-label');
        expect(ariaLabel).toContain(mockGoals[index].name);
        expect(ariaLabel).toContain('Progress:');
        expect(ariaLabel).toContain('Status:');
      });
    });

    it('should have proper role attributes', () => {
      const goalsGrid = fixture.debugElement.query(By.css('.goals-grid'));
      expect(goalsGrid.nativeElement.getAttribute('role')).toBe('grid');
      
      const goalCards = fixture.debugElement.queryAll(By.css('.goal-card'));
      goalCards.forEach(card => {
        expect(card.nativeElement.getAttribute('role')).toBe('gridcell');
      });
    });

    it('should have proper progress bar ARIA attributes', () => {
      const progressBars = fixture.debugElement.queryAll(By.css('.progress-bar'));
      progressBars.forEach(bar => {
        expect(bar.nativeElement.getAttribute('role')).toBe('progressbar');
        expect(bar.nativeElement.getAttribute('aria-valuemin')).toBe('0');
        expect(bar.nativeElement.getAttribute('aria-valuemax')).toBe('100');
        expect(bar.nativeElement.getAttribute('aria-valuenow')).toBeTruthy();
      });
    });

    it('should have proper tabindex for keyboard navigation', () => {
      const goalCards = fixture.debugElement.queryAll(By.css('.goal-card'));
      goalCards.forEach(card => {
        expect(card.nativeElement.getAttribute('tabindex')).toBe('0');
      });
    });
  });

  describe('Image Error Handling', () => {
    it('should handle image load errors', () => {
      const img = fixture.debugElement.query(By.css('.goal-image img'));
      
      component.onImageError(new Event('error'));
      fixture.detectChanges();
      
      expect(img.nativeElement.src).toBe('assets/images/saving/Gifts.png');
    });
  });

  describe('TrackBy Function', () => {
    it('should return goal id for trackBy', () => {
      const result = component.trackByGoal(0, mockGoals[0]);
      expect(result).toBe(mockGoals[0].id);
    });
  });

  describe('Memoized Computed Properties', () => {
    it('should memoize progress calculations', () => {
      const progress1 = component.getProgress(1);
      const progress2 = component.getProgress(1);
      expect(progress1).toBe(progress2);
      expect(progress1).toBe(50);
    });

    it('should memoize status text calculations', () => {
      const status1 = component.getStatusText(1);
      const status2 = component.getStatusText(1);
      expect(status1).toBe(status2);
      expect(status1).toBe('Active');
    });

    it('should memoize remaining amount calculations', () => {
      const remaining1 = component.getRemainingAmount(1);
      const remaining2 = component.getRemainingAmount(1);
      expect(remaining1).toBe(remaining2);
      expect(remaining1).toBe(5000);
    });

    it('should memoize days left calculations', () => {
      const days1 = component.getDaysLeft(1);
      const days2 = component.getDaysLeft(1);
      expect(days1).toBe(days2);
    });

    it('should memoize status class calculations', () => {
      const class1 = component.getStatusClass(1);
      const class2 = component.getStatusClass(1);
      expect(class1).toBe(class2);
      expect(class1).toBe('active');
    });

    it('should memoize status icon calculations', () => {
      const icon1 = component.getStatusIcon(1);
      const icon2 = component.getStatusIcon(1);
      expect(icon1).toBe(icon2);
      expect(icon1).toBe('fa-clock');
    });

    it('should memoize progress gradient calculations', () => {
      const gradient1 = component.getProgressGradient(1);
      const gradient2 = component.getProgressGradient(1);
      expect(gradient1).toBe(gradient2);
    });

    it('should return default values for unknown goal IDs', () => {
      expect(component.getProgress(999)).toBe(0);
      expect(component.getStatusText(999)).toBe('Unknown');
      expect(component.getRemainingAmount(999)).toBe(0);
      expect(component.getDaysLeft(999)).toBe(0);
      expect(component.getStatusClass(999)).toBe('active');
      expect(component.getStatusIcon(999)).toBe('fa-clock');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation', () => {
      const goalCards = fixture.debugElement.queryAll(By.css('.goal-card'));
      const firstCard = goalCards[0].nativeElement;
      
      spyOn(component.openOverlay, 'emit');
      
      firstCard.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      expect(component.openOverlay.emit).toHaveBeenCalledWith({
        goal: mockGoals[0],
        position: { x: 0, y: 0, width: 0, height: 0 }
      });
      
      firstCard.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
      expect(component.openOverlay.emit).toHaveBeenCalledWith({
        goal: mockGoals[0],
        position: { x: 0, y: 0, width: 0, height: 0 }
      });
    });

    it('should handle arrow key navigation', () => {
      spyOn(component, 'focusNextCard');
      spyOn(component, 'focusPreviousCard');
      
      const goalCards = fixture.debugElement.queryAll(By.css('.goal-card'));
      const firstCard = goalCards[0].nativeElement;
      
      firstCard.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      expect(component.focusNextCard).toHaveBeenCalledWith(0);
      
      firstCard.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      expect(component.focusPreviousCard).toHaveBeenCalledWith(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const goalCards = fixture.debugElement.queryAll(By.css('.goal-card'));
      const progressBars = fixture.debugElement.queryAll(By.css('.progress-bar'));
      
      expect(goalCards[0].nativeElement.getAttribute('role')).toBe('gridcell');
      expect(goalCards[0].nativeElement.getAttribute('tabindex')).toBe('0');
      expect(progressBars[0].nativeElement.getAttribute('role')).toBe('progressbar');
      expect(progressBars[0].nativeElement.getAttribute('aria-valuenow')).toBe('50');
    });

    it('should have proper ARIA labels', () => {
      const goalCards = fixture.debugElement.queryAll(By.css('.goal-card'));
      const firstCard = goalCards[0].nativeElement;
      
      expect(firstCard.getAttribute('aria-label')).toContain('Saving goal:');
      expect(firstCard.getAttribute('aria-label')).toContain('Progress:');
      expect(firstCard.getAttribute('aria-label')).toContain('Status:');
    });
  });

  describe('Status and Priority Styling', () => {
    it('should apply correct status classes', () => {
      const goalCards = fixture.debugElement.queryAll(By.css('.goal-card'));
      
      expect(goalCards[0].nativeElement.classList.contains('active')).toBe(true);
      
      expect(goalCards[1].nativeElement.classList.contains('completed')).toBe(true);
    });

    it('should apply correct priority classes', () => {
      const priorityBadges = fixture.debugElement.queryAll(By.css('.priority-badge'));
      
      expect(priorityBadges[0].nativeElement.classList.contains('high')).toBe(true);
      expect(priorityBadges[1].nativeElement.classList.contains('medium')).toBe(true);
    });
  });
});
