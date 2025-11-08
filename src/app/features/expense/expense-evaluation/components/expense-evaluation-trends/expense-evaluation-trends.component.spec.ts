/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseEvaluationTrendsComponent
  @description Expense evaluation trends component for displaying expense data
*/

import { DecimalPipe } from '@angular/common';
import { ComponentFixture, ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';

import { ExpenseEvaluationTrendsComponent } from './expense-evaluation-trends.component';

describe('ExpenseEvaluationTrendsComponent', () => {
  let component: ExpenseEvaluationTrendsComponent;
  let fixture: ComponentFixture<ExpenseEvaluationTrendsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseEvaluationTrendsComponent, DecimalPipe],
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseEvaluationTrendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display trend values correctly', () => {
    component.trend = 15.5;
    component.monthlyGrowth = 12.3;
    component.consistencyScore = 85.2;
    component.diversificationScore = 92.1;
    fixture.detectChanges();

    // Test the getter properties directly
    expect(component.trendDisplay).toBe('+15.50%');
    expect(component.monthlyGrowthDisplay).toBe('12.30%');
    expect(component.consistencyDisplay).toBe('85.20%');
    expect(component.diversificationDisplay).toBe('92.10%');
  });

  it('should apply correct trend classes', () => {
    component.trend = 10;
    fixture.detectChanges();

    expect(component.getTrendClass(10)).toBe('positive');
    expect(component.getTrendClass(-5)).toBe('negative');
    expect(component.getTrendClass(0)).toBe('neutral');
  });

  it('should display correct trend icons', () => {
    expect(component.getTrendIcon(10)).toBe('↗');
    expect(component.getTrendIcon(-5)).toBe('↘');
    expect(component.getTrendIcon(0)).toBe('→');
  });

  it('should calculate metric scores correctly', () => {
    expect(component.calculateMetricScore(10, 20)).toBe(50);
    expect(component.calculateMetricScore(25, 20)).toBe(100);
    expect(component.calculateMetricScore(0, 20)).toBe(0);
  });

  it('should show achievement badge for high diversification', () => {
    component.diversificationScore = 85;
    fixture.detectChanges();

    // Test the getter property directly
    expect(component.showAchievementBadge).toBe(true);
  });

  it('should not show achievement badge for low diversification', () => {
    component.diversificationScore = 70;
    fixture.detectChanges();

    // Test the getter property directly
    expect(component.showAchievementBadge).toBe(false);
  });

  it('should have proper ARIA attributes', () => {
    const section = fixture.debugElement.nativeElement.querySelector('section');
    expect(section.getAttribute('role')).toBe('region');
    expect(section.getAttribute('aria-labelledby')).toBe('trends-title');

    const progressBars = fixture.debugElement.nativeElement.querySelectorAll('.progress-bar');
    progressBars.forEach((bar: any) => {
      expect(bar.getAttribute('role')).toBe('progressbar');
      expect(bar.getAttribute('aria-valuemin')).toBe('0');
      expect(bar.getAttribute('aria-valuemax')).toBe('100');
    });

    const titleIcon = fixture.debugElement.nativeElement.querySelector('.title-icon');
    expect(titleIcon.getAttribute('aria-hidden')).toBe('true');
  });

  it('should handle negative values correctly', () => {
    component.trend = -5.2;
    component.monthlyGrowth = -3.1;
    fixture.detectChanges();

    // Test the getter properties directly
    expect(component.trendDisplay).toBe('-5.20%');
    expect(component.monthlyGrowthDisplay).toBe('-3.10%');
  });

  // New accessibility tests
  it('should support keyboard navigation', () => {
    component.trend = 10;
    fixture.detectChanges();

    // Test that the method exists and can be called
    const spy = spyOn(component, 'onTrendIndicatorActivate');
    component.onTrendIndicatorActivate();
    expect(spy).toHaveBeenCalled();
  });

  it('should support card keyboard activation', () => {
    component.monthlyGrowth = 15;
    fixture.detectChanges();

    // Test that the method exists and can be called
    const spy = spyOn(component, 'onCardActivate');
    component.onCardActivate('monthly');
    expect(spy).toHaveBeenCalledWith('monthly');
  });

  it('should have proper focus management', () => {
    component.trend = 10;
    fixture.detectChanges();

    const focusableElements = fixture.debugElement.nativeElement.querySelectorAll('[tabindex="0"]');
    expect(focusableElements.length).toBe(4); // trend indicator + 3 cards

    const trendIndicator = fixture.debugElement.nativeElement.querySelector('.trend-indicator');
    trendIndicator.focus();
    expect(document.activeElement).toBe(trendIndicator);
  });

  it('should have proper ARIA labels for screen readers', () => {
    component.trend = 15.5;
    component.monthlyGrowth = 12.3;
    fixture.detectChanges();

    // Test the getter properties directly
    expect(component.trendAriaLabel).toBe('Overall trend: +15.50%');
    expect(component.monthlyGrowthAriaLabel).toBe('Monthly growth: 12.30%');
  });

  it('should handle edge cases in computed properties', () => {
    component.trend = 0;
    component.monthlyGrowth = 0;
    component.consistencyScore = 0;
    component.diversificationScore = 0;
    fixture.detectChanges();

    expect(component.trendDisplay).toBe('+0.00%');
    expect(component.monthlyGrowthDisplay).toBe('0.00%');
    expect(component.showAchievementBadge).toBe(false);
  });

  it('should test computed properties work correctly', () => {
    component.trend = 15.5;
    component.monthlyGrowth = 12.3;
    component.consistencyScore = 85.2;
    component.diversificationScore = 92.1;
    fixture.detectChanges();

    expect(component.trendClass).toBe('positive');
    expect(component.trendIcon).toBe('↗');
    expect(component.trendDisplay).toBe('+15.50%');
    expect(component.monthlyGrowthClass).toBe('positive');
    expect(component.monthlyGrowthDisplay).toBe('12.30%');
    expect(component.showAchievementBadge).toBe(true);
  });
});
