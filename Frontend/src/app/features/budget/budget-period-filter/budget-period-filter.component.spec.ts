/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component BudgetPeriodFilterComponent
  @description Elite budget period navigation component tests with responsive design
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

import { BudgetService } from '../../../core/services/budget.service';
import { BudgetPeriod } from '../../../models/budget.model';
import { BudgetPeriodFilterComponent } from './budget-period-filter.component';

describe('BudgetPeriodFilterComponent', () => {
  let component: BudgetPeriodFilterComponent;
  let fixture: ComponentFixture<BudgetPeriodFilterComponent>;
  let mockBudgetService: jasmine.SpyObj<BudgetService>;

  const mockPeriods: BudgetPeriod[] = [
    { month: 1, year: 2024 },
    { month: 2, year: 2024 },
    { month: 3, year: 2024 },
    { month: 4, year: 2024 },
    { month: 5, year: 2024 },
    { month: 6, year: 2024 }
  ];

  beforeEach(async () => {
    const budgetServiceSpy = jasmine.createSpyObj('BudgetService', ['getAvailableBudgetPeriods']);

    await TestBed.configureTestingModule({
      imports: [BudgetPeriodFilterComponent],
      providers: [
        { provide: BudgetService, useValue: budgetServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetPeriodFilterComponent);
    component = fixture.componentInstance;
    mockBudgetService = TestBed.inject(BudgetService) as jasmine.SpyObj<BudgetService>;
    
    mockBudgetService.getAvailableBudgetPeriods.and.returnValue(of(mockPeriods));
    
    component.ngOnInit();
    
    (component as any).isInteractiveSignal.set(true);
    (component as any).isVisibleSignal.set(true);
    (component as any).showTimelineSignal.set(true);
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load available periods from service', () => {
    expect(mockBudgetService.getAvailableBudgetPeriods).toHaveBeenCalledWith(1);
  });

  describe('Component Initialization', () => {
    it('should initialize with current month and year', () => {
      const now = new Date();
      expect(component.currentMonth()).toBe(now.getMonth() + 1);
      expect(component.currentYear()).toBe(now.getFullYear());
    });

    it('should emit dateChanged on initialization', (done) => {
      spyOn(component.dateChanged, 'emit');
      
      setTimeout(() => {
        expect(component.dateChanged.emit).toHaveBeenCalledWith({
          month: component.currentMonth(),
          year: component.currentYear()
        });
        done();
      }, 350);
      
      component.ngOnInit();
    });
  });

  describe('Navigation', () => {
    it('should navigate to previous month', () => {
      (component as any).currentMonthSignal.set(6);
      (component as any).currentYearSignal.set(2023);
      
      component.onPreviousMonth();
      
      expect((component as any).currentMonthSignal()).toBe(5);
      expect((component as any).currentYearSignal()).toBe(2023);
    });

    it('should navigate to next month', () => {
      (component as any).currentMonthSignal.set(6);
      (component as any).currentYearSignal.set(2023);
      
      component.onNextMonth();
      
      expect((component as any).currentMonthSignal()).toBe(7);
      expect((component as any).currentYearSignal()).toBe(2023);
    });

    it('should not navigate beyond minimum period', () => {
      (component as any).currentMonthSignal.set(1);
      (component as any).currentYearSignal.set(2020);
      
      component.onPreviousMonth();
      
      expect(component.currentMonth()).toBe(1);
      expect(component.currentYear()).toBe(2020);
    });

    it('should not navigate beyond maximum period', () => {
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 2);
      
      (component as any).currentMonthSignal.set(maxDate.getMonth() + 1);
      (component as any).currentYearSignal.set(maxDate.getFullYear());
      
      component.onNextMonth();
      
      expect(component.currentMonth()).toBe(maxDate.getMonth() + 1);
      expect(component.currentYear()).toBe(maxDate.getFullYear());
    });
  });

  describe('Keyboard Navigation', () => {
    it('should handle arrow key navigation', () => {
      (component as any).currentMonthSignal.set(6);
      (component as any).currentYearSignal.set(2023);
      
      const leftArrowEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      component.handleKeyboardNavigation(leftArrowEvent);
      
      expect((component as any).currentMonthSignal()).toBe(5);
      
      const rightArrowEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      component.handleKeyboardNavigation(rightArrowEvent);
      
      expect((component as any).currentMonthSignal()).toBe(6);
    });

    it('should handle Home key to go to current period', () => {
      (component as any).currentMonthSignal.set(6);
      (component as any).currentYearSignal.set(2020);
      
      const homeEvent = new KeyboardEvent('keydown', { key: 'Home' });
      component.handleKeyboardNavigation(homeEvent);
      
      const now = new Date();
      expect((component as any).currentMonthSignal()).toBe(now.getMonth() + 1);
      expect((component as any).currentYearSignal()).toBe(now.getFullYear());
    });

    it('should handle Escape key to close timeline', () => {
      (component as any).showTimelineSignal.set(true);
      
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      component.handleKeyboardNavigation(escapeEvent);
      
      expect(component.showTimeline()).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const prevButton = fixture.debugElement.query(By.css('.prev-button'));
      const nextButton = fixture.debugElement.query(By.css('.next-button'));
      
      expect(prevButton.attributes['aria-label']).toContain('Previous month');
      expect(nextButton.attributes['aria-label']).toContain('Next month');
    });

    it('should have proper ARIA disabled attributes', () => {
      (component as any).currentMonthSignal.set(1);
      (component as any).currentYearSignal.set(2020);
      fixture.detectChanges();
      
      const prevButton = fixture.debugElement.query(By.css('.prev-button'));
      expect(prevButton.attributes['aria-disabled']).toBe('true');
    });

    it('should have proper role attributes', () => {
      const mainSection = fixture.debugElement.query(By.css('.elite-budget-filter'));
      const timeline = fixture.debugElement.query(By.css('.period-timeline'));
      
      expect(mainSection.attributes['role']).toBe('region');
      expect(timeline.attributes['role']).toBe('list');
    });
  });

  describe('Timeline Functionality', () => {
    it('should toggle timeline visibility', () => {
      expect(component.showTimeline()).toBe(false);
      
      component.toggleTimeline();
      expect(component.showTimeline()).toBe(true);
      
      component.toggleTimeline();
      expect(component.showTimeline()).toBe(false);
    });

    it('should select period from timeline', () => {
      (component as any).currentMonthSignal.set(1);
      (component as any).currentYearSignal.set(2020);
      
      const testPeriod = {
        month: 6,
        year: 2023,
        label: 'Jun 23',
        isCurrent: false,
        isFuture: false
      };
      
      component.selectPeriod(testPeriod);
      
      expect((component as any).currentMonthSignal()).toBe(6);
      expect((component as any).currentYearSignal()).toBe(2023);
    });

    it('should track periods correctly', () => {
      const period1 = { month: 1, year: 2023, label: 'Jan 23', isCurrent: false, isFuture: false };
      const period2 = { month: 2, year: 2023, label: 'Feb 23', isCurrent: false, isFuture: false };
      
      expect(component.trackByPeriod(0, period1)).toBe('2023-1');
      expect(component.trackByPeriod(1, period2)).toBe('2023-2');
    });
  });

  describe('Computed Properties', () => {
    it('should compute current month label correctly', () => {
      (component as any).currentMonthSignal.set(6);
      (component as any).currentYearSignal.set(2023);
      
      expect(component.currentMonthLabel()).toContain('June');
      expect(component.currentMonthLabel()).toContain('2023');
    });

    it('should identify current period correctly', () => {
      const now = new Date();
      (component as any).currentMonthSignal.set(now.getMonth() + 1);
      (component as any).currentYearSignal.set(now.getFullYear());
      
      expect(component.isCurrentPeriod()).toBe(true);
    });

    it('should identify min/max periods correctly', () => {
      (component as any).currentMonthSignal.set(1);
      (component as any).currentYearSignal.set(2020);
      expect(component.isMinPeriod()).toBe(true);
      
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 2);
      (component as any).currentMonthSignal.set(maxDate.getMonth() + 1);
      (component as any).currentYearSignal.set(maxDate.getFullYear());
      expect(component.isMaxPeriod()).toBe(true);
    });
  });

  describe('Component Cleanup', () => {
    it('should complete destroy subject on destroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');
      
      component.ngOnDestroy();
      
      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });
});
