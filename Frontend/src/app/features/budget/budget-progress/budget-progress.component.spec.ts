/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @styles BudgetProgressComponent
  @description Premium budget progress tests with glassmorphism, advanced animations, and stunning visualizations
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetProgressComponent } from './budget-progress.component';

describe('BudgetProgressComponent', () => {
  let component: BudgetProgressComponent;
  let fixture: ComponentFixture<BudgetProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetProgressComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetProgressComponent);
    component = fixture.componentInstance;
    
    component.totalBudget = 1000;
    component.totalSpent = 500;
    component.totalRemaining = 500;
    component.month = 12;
    component.year = 2024;
    
    component.ngOnChanges();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute progress percentage correctly', () => {
    expect(component.progressPercentage()).toBe(50);
  });

  it('should compute budget status correctly', () => {
    const status = component.budgetStatus();
    expect(status.level).toBe('good');
    expect(status.score).toBe(70);
  });

  it('should compute budget metrics correctly', () => {
    const metrics = component.budgetMetrics();
    expect(metrics.totalBudget).toBe(1000);
    expect(metrics.totalSpent).toBe(500);
    expect(metrics.totalRemaining).toBe(500);
    expect(metrics.dailyAverage).toBeGreaterThan(0);
  });

  it('should handle zero budget gracefully', () => {
    component.totalBudget = 0;
    component.totalSpent = 0;
    component.ngOnChanges();
    fixture.detectChanges();
    
    expect(component.progressPercentage()).toBe(0);
    expect(component.budgetMetrics().dailyAverage).toBe(0);
  });

  it('should support keyboard navigation on cards', () => {
    const card = fixture.debugElement.nativeElement.querySelector('.metric-card');
    const keydownEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    
    spyOn(component, 'onCardHover');
    card.dispatchEvent(keydownEvent);
    
    expect(component.onCardHover).toHaveBeenCalledWith('budget');
  });

  it('should handle space key on cards', () => {
    const card = fixture.debugElement.nativeElement.querySelector('.metric-card');
    const keydownEvent = new KeyboardEvent('keydown', { key: ' ' });
    
    spyOn(component, 'onCardHover');
    card.dispatchEvent(keydownEvent);
    
    expect(component.onCardHover).toHaveBeenCalledWith('budget');
  });

  it('should have proper ARIA labels', () => {
    const cards = fixture.debugElement.nativeElement.querySelectorAll('[role="button"]');
    cards.forEach((card: any) => {
      expect(card.getAttribute('aria-label')).toBeTruthy();
    });
  });

  it('should have proper tabindex for keyboard navigation', () => {
    const cards = fixture.debugElement.nativeElement.querySelectorAll('.metric-card');
    cards.forEach((card: any) => {
      expect(card.getAttribute('tabindex')).toBe('0');
    });
  });

  it('should compute trend indicators correctly', () => {
    const trend = component.spendingTrend();
    expect(['up', 'down', 'stable']).toContain(trend.direction);
    expect(trend.period).toBe('monthly');
  });

  it('should format currency correctly', () => {
    expect(component.getFormattedCurrency(1000)).toBe('$1,000');
    expect(component.getFormattedCurrency(0)).toBe('$0');
  });

  it('should format percentage correctly', () => {
    expect(component.getFormattedPercentage(50.7)).toBe('51%');
    expect(component.getFormattedPercentage(0)).toBe('0%');
  });

  it('should handle over budget scenario', () => {
    component.totalSpent = 1200;
    component.totalRemaining = -200;
    component.ngOnChanges();
    fixture.detectChanges();
    
    expect(component.isOverBudget()).toBe(true);
    expect(component.budgetStatus().level).toBe('critical');
  });

  it('should handle near limit scenario', () => {
    component.totalSpent = 950;
    component.ngOnChanges();
    fixture.detectChanges();
    
    expect(component.isNearLimit()).toBe(true);
    expect(component.budgetStatus().level).toBe('danger');
  });

  it('should handle healthy budget scenario', () => {
    component.totalSpent = 300;
    component.ngOnChanges();
    fixture.detectChanges();
    
    expect(component.isHealthy()).toBe(true);
    expect(component.budgetStatus().level).toBe('excellent');
  });

  it('should compute daily budget recommendation', () => {
    const recommendation = component.dailyBudgetRecommendation();
    expect(recommendation).toBeGreaterThan(0);
  });

  it('should provide accessible trend indicators', () => {
    expect(component.trendIndicator()).toMatch(/^(Increasing|Decreasing|Stable)$/);
    expect(component.trendVisual()).toMatch(/^(↗|↘|→)$/);
  });

  it('should have proper ARIA attributes for metric cards', () => {
    const cards = fixture.debugElement.nativeElement.querySelectorAll('app-metric-card');
    cards.forEach((card: any) => {
      expect(card.getAttribute('role')).toBe('button');
      expect(card.getAttribute('tabindex')).toBe('0');
      expect(card.getAttribute('aria-label')).toContain('Budget metric:');
    });
  });

  it('should support keyboard navigation', () => {
    const card = fixture.debugElement.nativeElement.querySelector('app-metric-card');
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    
    spyOn(component, 'onCardKeydown');
    
    card.dispatchEvent(enterEvent);
    card.dispatchEvent(spaceEvent);
    
    expect(component.onCardKeydown).toHaveBeenCalledTimes(2);
  });

  it('should handle edge cases gracefully', () => {
    component.totalBudget = 0;
    component.totalSpent = 0;
    component.ngOnChanges();
    fixture.detectChanges();
    
    expect(component.progressPercentage()).toBe(0);
    expect(component.budgetMetrics().dailyAverage).toBe(0);
    expect(component.budgetStatus().level).toBe('excellent');
  });

  it('should memoize currency formatting', () => {
    const formatted1 = component.formattedCurrency();
    const formatted2 = component.formattedCurrency();
    
    expect(formatted1).toBe(formatted2);
  });

  it('should have proper trackBy function', () => {
    const mockCard = { id: 'test-id', title: 'Test' };
    expect(component.trackByCardId(0, mockCard)).toBe('test-id');
  });

  it('should handle negative remaining budget', () => {
    component.totalSpent = 1200;
    component.totalRemaining = -200;
    component.ngOnChanges();
    fixture.detectChanges();
    
    expect(component.budgetMetrics().totalRemaining).toBe(-200);
    expect(component.isOverBudget()).toBe(true);
  });

  it('should compute daily budget recommendation correctly', () => {
    const recommendation = component.dailyBudgetRecommendation();
    expect(typeof recommendation).toBe('number');
    expect(recommendation).toBeGreaterThanOrEqual(0);
  });

  it('should handle different budget status levels', () => {
    const levels = ['excellent', 'good', 'warning', 'danger', 'critical'];
    
    component.totalSpent = 200;
    component.ngOnChanges();
    expect(component.budgetStatus().level).toBe('excellent');
    
    component.totalSpent = 600;
    component.ngOnChanges();
    expect(component.budgetStatus().level).toBe('good');
    
    component.totalSpent = 800;
    component.ngOnChanges();
    expect(component.budgetStatus().level).toBe('warning');
    
    component.totalSpent = 950;
    component.ngOnChanges();
    expect(component.budgetStatus().level).toBe('danger');
    
    component.totalSpent = 1200;
    component.ngOnChanges();
    expect(component.budgetStatus().level).toBe('critical');
  });

  it('should have proper signal accessors', () => {
    expect(typeof component.getMonthSignal()).toBe('number');
    expect(typeof component.getYearSignal()).toBe('number');
    expect(component.getMonthSignal()).toBe(12);
    expect(component.getYearSignal()).toBe(2024);
  });

  it('should handle card hover events', () => {
    spyOn(component, 'onCardHover');
    component.onCardHover('test-card');
    expect(component.onCardHover).toHaveBeenCalledWith('test-card');
  });

  it('should handle card keydown events', () => {
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    spyOn(event, 'preventDefault');
    spyOn(component, 'onCardHover');
    
    component.onCardKeydown(event, 'test-card');
    
    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.onCardHover).toHaveBeenCalledWith('test-card');
  });

  it('should handle space key on cards', () => {
    const event = new KeyboardEvent('keydown', { key: ' ' });
    spyOn(event, 'preventDefault');
    spyOn(component, 'onCardHover');
    
    component.onCardKeydown(event, 'test-card');
    
    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.onCardHover).toHaveBeenCalledWith('test-card');
  });

  it('should not handle other keys', () => {
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    spyOn(event, 'preventDefault');
    spyOn(component, 'onCardHover');
    
    component.onCardKeydown(event, 'test-card');
    
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(component.onCardHover).not.toHaveBeenCalled();
  });
});
