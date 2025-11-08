/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component SavingOverlayComponent
  @description Saving overlay component tests for displaying saving goal details
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By, Meta } from '@angular/platform-browser';

import { SavingGoalResponseDTO } from '../../../models/saving.model';
import { SavingOverlayComponent } from './saving-overlay.component';

describe('SavingOverlayComponent', () => {
  let component: SavingOverlayComponent;
  let fixture: ComponentFixture<SavingOverlayComponent>;
  let mockMeta: jasmine.SpyObj<Meta>;

  const mockGoal: SavingGoalResponseDTO = {
    id: 1,
    userId: 1,
    version: 1,
    name: 'Test Saving Goal',
    category: 'HEALTH',
    priority: 'HIGH',
    status: 'ACTIVE',
    currency: 'USD',
    targetAmount: 10000,
    currentAmount: 5000,
    remainingAmount: 5000,
    progressPercent: 50,
    deadline: '2024-12-31',
    achievedAt: undefined,
    notes: 'Test notes',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  const mockCardPosition = {
    x: 100,
    y: 100,
    width: 200,
    height: 150
  };

  beforeEach(async () => {
    mockMeta = jasmine.createSpyObj('Meta', ['addTags']);

    await TestBed.configureTestingModule({
      imports: [SavingOverlayComponent],
      providers: [
        { provide: Meta, useValue: mockMeta }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SavingOverlayComponent);
    component = fixture.componentInstance;
    component.goal = mockGoal;
    component.cardPosition = mockCardPosition;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should set goal input correctly', () => {
      expect(component.goal).toEqual(mockGoal);
    });

    it('should set cardPosition input correctly', () => {
      expect(component.cardPosition).toEqual(mockCardPosition);
    });

    it('should initialize overlayPosition with default values', () => {
      expect(component.overlayPosition).toEqual({
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      });
    });

    it('should call meta.addTags on init', () => {
      expect(mockMeta.addTags).toHaveBeenCalledWith([
        { name: 'description', content: `View detailed information about your saving goal: ${mockGoal.name}` },
        { name: 'robots', content: 'noindex,nofollow' }
      ]);
    });
  });

  describe('Position Calculation', () => {
    it('should calculate overlay position based on card position', () => {
      spyOn(component as any, 'calculateOverlayPosition').and.callThrough();
      component.ngOnInit();
      expect((component as any).calculateOverlayPosition).toHaveBeenCalled();
    });

    it('should handle missing card position gracefully', () => {
      component.cardPosition = undefined;
      component.ngOnInit();
      expect(component.overlayPosition).toEqual({
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      });
    });
  });

  describe('Event Handling', () => {
    it('should emit close event when onCancel is called', () => {
      spyOn(component.close, 'emit');
      component.onCancel();
      expect(component.close.emit).toHaveBeenCalled();
    });

    it('should emit modify event with goal when onModify is called', () => {
      spyOn(component.modify, 'emit');
      component.onModify();
      expect(component.modify.emit).toHaveBeenCalledWith(mockGoal);
    });

    it('should show delete confirmation when onDelete is called', () => {
      component.onDelete();
      expect(component.showDeleteConfirmation).toBeTrue();
    });

    it('should emit delete event and hide confirmation when confirmDelete is called', () => {
      spyOn(component.delete, 'emit');
      component.showDeleteConfirmation = true;
      component.confirmDelete();
      expect(component.delete.emit).toHaveBeenCalledWith(mockGoal.id);
      expect(component.showDeleteConfirmation).toBeFalse();
    });

    it('should hide delete confirmation when cancelDelete is called', () => {
      component.showDeleteConfirmation = true;
      component.cancelDelete();
      expect(component.showDeleteConfirmation).toBeFalse();
    });
  });

  describe('Utility Methods', () => {
    it('should calculate progress correctly', () => {
      const progress = component.calculateProgress(mockGoal);
      expect(progress).toBe(50);
    });

    it('should return 0 for progress when target amount is 0', () => {
      const goalWithZeroTarget = { ...mockGoal, targetAmount: 0 };
      const progress = component.calculateProgress(goalWithZeroTarget);
      expect(progress).toBe(0);
    });

    it('should return correct category icon', () => {
      const icon = component.getCategoryIcon('HEALTH');
      expect(icon).toBe('fa-heartbeat');
    });

    it('should return default icon for unknown category', () => {
      const icon = component.getCategoryIcon('UNKNOWN');
      expect(icon).toBe('fa-tag');
    });

    it('should return correct category label', () => {
      const label = component.getCategoryLabel('HEALTH');
      expect(label).toBe('Health');
    });

    it('should return category value if no match found', () => {
      const label = component.getCategoryLabel('UNKNOWN');
      expect(label).toBe('UNKNOWN');
    });

    it('should return correct progress gradient for different progress levels', () => {
      const goal100 = { ...mockGoal, currentAmount: 10000 };
      const goal75 = { ...mockGoal, currentAmount: 7500 };
      const goal50 = { ...mockGoal, currentAmount: 5000 };
      const goal25 = { ...mockGoal, currentAmount: 2500 };
      const goal0 = { ...mockGoal, currentAmount: 0 };

      expect(component.getProgressGradient(goal100)).toContain('#28a745');
      expect(component.getProgressGradient(goal75)).toContain('#17a2b8');
      expect(component.getProgressGradient(goal50)).toContain('#ffc107');
      expect(component.getProgressGradient(goal25)).toContain('#fd7e14');
      expect(component.getProgressGradient(goal0)).toContain('#e74c3c');
    });

    it('should calculate days left correctly', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const goalWithFutureDate = { ...mockGoal, deadline: futureDate.toISOString().split('T')[0] };
      
      const daysLeft = component.getDaysLeft(goalWithFutureDate);
      expect(daysLeft).toBeGreaterThan(0);
    });

    it('should return 0 days left for past deadline', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30);
      const goalWithPastDate = { ...mockGoal, deadline: pastDate.toISOString().split('T')[0] };
      
      const daysLeft = component.getDaysLeft(goalWithPastDate);
      expect(daysLeft).toBe(0);
    });

    it('should correctly identify completed goals', () => {
      const completedGoal = { ...mockGoal, currentAmount: 10000 };
      expect(component.isCompleted(completedGoal)).toBeTrue();
      
      const incompleteGoal = { ...mockGoal, currentAmount: 5000 };
      expect(component.isCompleted(incompleteGoal)).toBeFalse();
    });

    it('should correctly identify overdue goals', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30);
      const overdueGoal = { ...mockGoal, deadline: pastDate.toISOString().split('T')[0] };
      
      expect(component.isOverdue(overdueGoal)).toBeTrue();
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const activeGoal = { ...mockGoal, deadline: futureDate.toISOString().split('T')[0] };
      
      expect(component.isOverdue(activeGoal)).toBeFalse();
    });

    it('should return correct status class', () => {
      const completedGoal = { ...mockGoal, currentAmount: 10000 };
      const overdueGoal = { ...mockGoal, deadline: new Date(Date.now() - 86400000).toISOString().split('T')[0] };
      
      expect(component.getStatusClass(completedGoal)).toBe('completed');
      expect(component.getStatusClass(overdueGoal)).toBe('overdue');
      expect(component.getStatusClass(mockGoal)).toBe('active');
    });

    it('should return correct status text', () => {
      const completedGoal = { ...mockGoal, currentAmount: 10000 };
      const overdueGoal = { ...mockGoal, deadline: new Date(Date.now() - 86400000).toISOString().split('T')[0] };
      
      expect(component.getStatusText(completedGoal)).toBe('Completed');
      expect(component.getStatusText(overdueGoal)).toBe('Overdue');
      expect(component.getStatusText(mockGoal)).toBe('Active');
    });

    it('should return correct status icon', () => {
      const completedGoal = { ...mockGoal, currentAmount: 10000 };
      const overdueGoal = { ...mockGoal, deadline: new Date(Date.now() - 86400000).toISOString().split('T')[0] };
      
      expect(component.getStatusIcon(completedGoal)).toBe('fa-check-circle');
      expect(component.getStatusIcon(overdueGoal)).toBe('fa-exclamation-triangle');
      expect(component.getStatusIcon(mockGoal)).toBe('fa-clock');
    });

    it('should calculate remaining amount correctly', () => {
      const remaining = component.getRemainingAmount(mockGoal);
      expect(remaining).toBe(5000);
    });

    it('should return 0 for remaining amount when current amount exceeds target', () => {
      const goalWithExcess = { ...mockGoal, currentAmount: 15000 };
      const remaining = component.getRemainingAmount(goalWithExcess);
      expect(remaining).toBe(0);
    });

    it('should return correct time remaining text', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const goalWithTomorrow = { ...mockGoal, deadline: futureDate.toISOString().split('T')[0] };
      
      const timeRemaining = component.getTimeRemaining(goalWithTomorrow);
      expect(timeRemaining).toBe('Due tomorrow');
    });
  });

  describe('Template Rendering', () => {
    it('should render goal name in header', () => {
      const titleElement = fixture.debugElement.query(By.css('.goal-title'));
      expect(titleElement.nativeElement.textContent.trim()).toBe(mockGoal.name);
    });

    it('should render progress percentage', () => {
      const progressElement = fixture.debugElement.query(By.css('.progress-percentage'));
      expect(progressElement.nativeElement.textContent.trim()).toBe('50%');
    });

    it('should render category badge', () => {
      const categoryBadge = fixture.debugElement.query(By.css('.category-badge'));
      expect(categoryBadge.nativeElement.textContent.trim()).toContain('Health');
    });

    it('should render priority badge', () => {
      const priorityBadge = fixture.debugElement.query(By.css('.priority-badge'));
      expect(priorityBadge.nativeElement.textContent.trim()).toContain('HIGH');
    });

    it('should render status badge', () => {
      const statusBadge = fixture.debugElement.query(By.css('.status-badge'));
      expect(statusBadge.nativeElement.textContent.trim()).toContain('Active');
    });

    it('should render detail cards', () => {
      const detailCards = fixture.debugElement.queryAll(By.css('.detail-card'));
      expect(detailCards.length).toBe(6);
    });

    it('should render action buttons', () => {
      const actionButtons = fixture.debugElement.queryAll(By.css('.overlay-actions .btn'));
      expect(actionButtons.length).toBe(3);
    });
  });

  describe('Delete Confirmation Modal', () => {
    it('should not show delete modal by default', () => {
      const deleteModal = fixture.debugElement.query(By.css('.delete-modal'));
      expect(deleteModal).toBeFalsy();
    });

    it('should show delete modal when showDeleteConfirmation is true', () => {
      component.showDeleteConfirmation = true;
      fixture.detectChanges();
      
      const deleteModal = fixture.debugElement.query(By.css('.delete-modal'));
      expect(deleteModal).toBeTruthy();
    });

    it('should render goal name in delete confirmation', () => {
      component.showDeleteConfirmation = true;
      fixture.detectChanges();
      
      const deleteBody = fixture.debugElement.query(By.css('.delete-body p'));
      expect(deleteBody.nativeElement.textContent).toContain(mockGoal.name);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const backdrop = fixture.debugElement.query(By.css('.overlay-backdrop'));
      expect(backdrop.attributes['role']).toBe('dialog');
      expect(backdrop.attributes['aria-modal']).toBe('true');
      expect(backdrop.attributes['aria-label']).toContain(mockGoal.name);
    });

    it('should have proper tabindex on interactive elements', () => {
      const closeBtn = fixture.debugElement.query(By.css('.close-btn'));
      const actionButtons = fixture.debugElement.queryAll(By.css('.overlay-actions .btn'));
      
      expect(closeBtn.attributes['tabindex']).toBe('0');
      actionButtons.forEach(btn => {
        expect(btn.attributes['tabindex']).toBe('0');
      });
    });

    it('should have proper aria-hidden on decorative icons', () => {
      const icons = fixture.debugElement.queryAll(By.css('i[aria-hidden="true"]'));
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should support keyboard navigation with Enter key', () => {
      const closeBtn = fixture.debugElement.query(By.css('.close-btn'));
      spyOn(component, 'onCancel');
      
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      closeBtn.nativeElement.dispatchEvent(event);
      
      expect(component.onCancel).toHaveBeenCalled();
    });

    it('should support keyboard navigation with Space key', () => {
      const modifyBtn = fixture.debugElement.query(By.css('.btn-primary'));
      spyOn(component, 'onModify');
      
      const event = new KeyboardEvent('keydown', { key: ' ' });
      modifyBtn.nativeElement.dispatchEvent(event);
      
      expect(component.onModify).toHaveBeenCalled();
    });

    it('should trap focus within overlay', () => {
      const buttons = fixture.debugElement.queryAll(By.css('button'));
      const firstButton = buttons[0];
      const lastButton = buttons[buttons.length - 1];
      
      expect(firstButton.nativeElement.tabIndex).toBe(0);
      expect(lastButton.nativeElement.tabIndex).toBe(0);
    });

    it('should handle tab navigation correctly', () => {
      const buttons = fixture.debugElement.queryAll(By.css('button'));
      expect(buttons.length).toBeGreaterThan(0);
        
      buttons.forEach(btn => {
        expect(btn.nativeElement.tabIndex).toBe(0);
      });
    });

    it('should have proper focus management on initialization', () => {
      component.ngAfterViewInit();
      expect(component.overlayContent).toBeDefined();
    });

    it('should have proper ARIA labels and descriptions', () => {
      const overlayContent = fixture.debugElement.query(By.css('.overlay-content'));
      expect(overlayContent.attributes['aria-labelledby']).toBe(`goal-title-${mockGoal.id}`);
      expect(overlayContent.attributes['aria-describedby']).toBe(`goal-description-${mockGoal.id}`);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should handle escape key press', () => {
      spyOn(component, 'onCancel');
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
      expect(component.onCancel).toHaveBeenCalled();
    });
  });

  describe('Memoized Computed Properties', () => {
    it('should compute progress correctly', () => {
      expect(component.computedProgress()).toBe(50);
    });

    it('should compute status class correctly', () => {
      expect(component.computedStatusClass()).toBe('active');
    });

    it('should compute status text correctly', () => {
      expect(component.computedStatusText()).toBe('Active');
    });

    it('should compute status icon correctly', () => {
      expect(component.computedStatusIcon()).toBe('fa-clock');
    });

    it('should compute remaining amount correctly', () => {
      expect(component.computedRemainingAmount()).toBe(5000);
    });

    it('should compute days left correctly', () => {
      expect(component.computedDaysLeft()).toBeGreaterThanOrEqual(0);
    });

    it('should compute time remaining correctly', () => {
      const timeRemaining = component.computedTimeRemaining();
      expect(timeRemaining).toBeTruthy();
    });

    it('should compute progress gradient correctly', () => {
      const gradient = component.computedProgressGradient();
      expect(gradient).toContain('linear-gradient');
    });
  });

  describe('Component Lifecycle', () => {
    it('should complete destroy subject on destroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');
      
      component.ngOnDestroy();
      
      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });

    it('should set initial focus on afterViewInit', () => {
      spyOn(component.overlayContent.nativeElement, 'focus');
      component.ngAfterViewInit();
      expect(component.overlayContent.nativeElement.focus).toHaveBeenCalled();
    });
  });
});