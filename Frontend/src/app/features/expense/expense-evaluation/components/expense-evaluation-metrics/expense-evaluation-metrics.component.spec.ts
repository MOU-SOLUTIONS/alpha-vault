/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseEvaluationMetricsComponent
  @description Expense evaluation metrics component for displaying expense data
*/

import { DecimalPipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseEvaluationMetricsComponent } from './expense-evaluation-metrics.component';

describe('ExpenseEvaluationMetricsComponent', () => {
  let component: ExpenseEvaluationMetricsComponent;
  let fixture: ComponentFixture<ExpenseEvaluationMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseEvaluationMetricsComponent, DecimalPipe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseEvaluationMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display metrics correctly', () => {
    component.efficiency = 85.5;
    component.growthPotential = 72.3;
    component.goalAlignment = 90.1;
    component.stabilityIndex = 78.9;
    fixture.detectChanges();

    const scoreValues = fixture.debugElement.nativeElement.querySelectorAll('.score-value');
    expect(scoreValues[0].textContent).toContain('85.50%');
    expect(scoreValues[1].textContent).toContain('72.30%');
    expect(scoreValues[2].textContent).toContain('90.10%');
    expect(scoreValues[3].textContent).toContain('78.90%');
  });

  it('should display progress bars with correct widths', () => {
    component.efficiency = 50;
    component.growthPotential = 75;
    fixture.detectChanges();

    const progressBars = fixture.debugElement.nativeElement.querySelectorAll('.score-fill');
    expect(progressBars[0].style.width).toBe('50%');
    expect(progressBars[1].style.width).toBe('75%');
  });

  it('should have proper ARIA attributes', () => {
    const section = fixture.debugElement.nativeElement.querySelector('section');
    expect(section.getAttribute('role')).toBe('region');
    expect(section.getAttribute('aria-labelledby')).toBe('metrics-title');

    const progressBars = fixture.debugElement.nativeElement.querySelectorAll('.score-bar');
    progressBars.forEach((bar: any) => {
      expect(bar.getAttribute('role')).toBe('progressbar');
      expect(bar.getAttribute('aria-valuemin')).toBe('0');
      expect(bar.getAttribute('aria-valuemax')).toBe('100');
    });

    const titleIcon = fixture.debugElement.nativeElement.querySelector('.title-icon');
    expect(titleIcon.getAttribute('aria-hidden')).toBe('true');
  });

  it('should display metric titles correctly', () => {
    const metricTitles = fixture.debugElement.nativeElement.querySelectorAll('h3');
    expect(metricTitles[0].textContent).toBe('Expense Efficiency');
    expect(metricTitles[1].textContent).toBe('Growth Potential');
    expect(metricTitles[2].textContent).toBe('Performance Score');
    expect(metricTitles[3].textContent).toBe('Stability Index');
  });

  it('should display metric icons correctly', () => {
    const metricIcons = fixture.debugElement.nativeElement.querySelectorAll('.metric-icon');
    expect(metricIcons[0].textContent).toBe('💰');
    expect(metricIcons[1].textContent).toBe('📈');
    expect(metricIcons[2].textContent).toBe('🎯');
    expect(metricIcons[3].textContent).toBe('⚡');
  });

  it('should handle zero values correctly', () => {
    component.efficiency = 0;
    component.growthPotential = 0;
    component.goalAlignment = 0;
    component.stabilityIndex = 0;
    fixture.detectChanges();

    const scoreValues = fixture.debugElement.nativeElement.querySelectorAll('.score-value');
    scoreValues.forEach((value: any) => {
      expect(value.textContent).toContain('0.00%');
    });

    const progressBars = fixture.debugElement.nativeElement.querySelectorAll('.score-fill');
    progressBars.forEach((bar: any) => {
      expect(bar.style.width).toBe('0%');
    });
  });

  it('should handle high values correctly', () => {
    component.efficiency = 100;
    component.growthPotential = 100;
    component.goalAlignment = 100;
    component.stabilityIndex = 100;
    fixture.detectChanges();

    const scoreValues = fixture.debugElement.nativeElement.querySelectorAll('.score-value');
    scoreValues.forEach((value: any) => {
      expect(value.textContent).toContain('100.00%');
    });

    const progressBars = fixture.debugElement.nativeElement.querySelectorAll('.score-fill');
    progressBars.forEach((bar: any) => {
      expect(bar.style.width).toBe('100%');
    });
  });

  it('should be responsive', () => {
    // Test that the component renders without errors
    expect(component).toBeTruthy();
    
    // Test with different input values
    component.efficiency = 25.5;
    component.growthPotential = 50.0;
    component.goalAlignment = 75.5;
    component.stabilityIndex = 99.9;
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should support keyboard navigation', () => {
    const metricRows = fixture.debugElement.nativeElement.querySelectorAll('.metric-row');
    expect(metricRows.length).toBe(4);
    
    // Test that metric rows are focusable
    metricRows.forEach((row: any) => {
      expect(row.getAttribute('tabindex')).toBe('0');
      expect(row.getAttribute('role')).toBe('button');
    });
  });

  it('should have proper focus management', () => {
    const firstRow = fixture.debugElement.nativeElement.querySelector('.metric-row');
    firstRow.focus();
    expect(document.activeElement).toBe(firstRow);
  });

  it('should announce progress changes to screen readers', () => {
    component.efficiency = 50;
    component.growthPotential = 75;
    fixture.detectChanges();
    
    const progressBars = fixture.debugElement.nativeElement.querySelectorAll('.score-bar');
    expect(progressBars[0].getAttribute('aria-valuenow')).toBe('50');
    expect(progressBars[1].getAttribute('aria-valuenow')).toBe('75');
  });

  it('should handle keyboard activation', () => {
    const spy = spyOn(component, 'onMetricActivate');
    
    // Test Enter key
    const firstRow = fixture.debugElement.nativeElement.querySelector('.metric-row');
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    firstRow.dispatchEvent(enterEvent);
    
    // Test Space key
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    firstRow.dispatchEvent(spaceEvent);
    
    expect(spy).toHaveBeenCalledWith('efficiency');
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should have proper ARIA labels for metric rows', () => {
    component.efficiency = 85.5;
    component.growthPotential = 72.3;
    fixture.detectChanges();

    const metricRows = fixture.debugElement.nativeElement.querySelectorAll('.metric-row');
    expect(metricRows[0].getAttribute('aria-label')).toBe('Expense Efficiency: 85.5%');
    expect(metricRows[1].getAttribute('aria-label')).toBe('Growth Potential: 72.3%');
  });
});
