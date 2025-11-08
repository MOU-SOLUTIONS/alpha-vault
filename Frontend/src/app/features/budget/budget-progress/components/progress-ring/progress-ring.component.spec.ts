/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @styles ProgressRingComponent
  @description Optimized progress ring tests with smooth animations
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressRingComponent } from './progress-ring.component';

describe('ProgressRingComponent', () => {
  let component: ProgressRingComponent;
  let fixture: ComponentFixture<ProgressRingComponent>;

  const mockData = {
    percentage: 75,
    color: '#22c55e',
    glowColor: 'rgba(34, 197, 94, 0.3)',
    level: 'good',
    totalSpent: 2250
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressRingComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressRingComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('data', mockData);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display progress data correctly', () => {
    const centerValue = fixture.debugElement.nativeElement.querySelector('.center-value');
    const centerLabel = fixture.debugElement.nativeElement.querySelector('.center-label');
    const progressFill = fixture.debugElement.nativeElement.querySelector('.progress-fill');

    expect(centerValue.textContent).toBe('$2,250');
    expect(centerLabel.textContent).toBe('spent');
    expect(progressFill.classList.contains('good')).toBe(true);
  });

  it('should calculate dash offset correctly', () => {
    expect(component.dashOffset()).toBe(78.5);
  });

  it('should format currency correctly', () => {
    expect(component.formattedCurrency()).toBe('$2,250');
  });

  it('should have proper ARIA attributes', () => {
    const svg = fixture.debugElement.nativeElement.querySelector('.progress-svg');
    
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Budget progress visualization');
    expect(svg.getAttribute('aria-valuenow')).toBe('75');
    expect(svg.getAttribute('aria-valuemin')).toBe('0');
    expect(svg.getAttribute('aria-valuemax')).toBe('100');
    expect(svg.getAttribute('aria-live')).toBe('polite');
  });

  it('should apply correct stroke color', () => {
    const progressFill = fixture.debugElement.nativeElement.querySelector('.progress-fill');
    expect(progressFill.style.stroke).toBe('#22c55e');
  });

  it('should apply correct glow color', () => {
    const progressGlow = fixture.debugElement.nativeElement.querySelector('.progress-glow');
    expect(progressGlow.style.stroke).toBe('rgba(34, 197, 94, 0.3)');
  });

  it('should handle different levels', () => {
    const levels = ['excellent', 'good', 'warning', 'danger', 'critical'];
    
    levels.forEach(level => {
      fixture.componentRef.setInput('data', { ...mockData, level });
      fixture.detectChanges();
      
      const progressFill = fixture.debugElement.nativeElement.querySelector('.progress-fill');
      expect(progressFill.classList.contains(level)).toBe(true);
    });
  });

  it('should handle zero percentage', () => {
    fixture.componentRef.setInput('data', { ...mockData, percentage: 0 });
    fixture.detectChanges();
    
    expect(component.dashOffset()).toBe(314);
  });

  it('should handle 100% percentage', () => {
    fixture.componentRef.setInput('data', { ...mockData, percentage: 100 });
    fixture.detectChanges();
    
    expect(component.dashOffset()).toBe(0);
  });

  it('should handle negative values', () => {
    fixture.componentRef.setInput('data', { ...mockData, totalSpent: -500 });
    fixture.detectChanges();
    
    expect(component.formattedCurrency()).toBe('-$500');
  });

  it('should handle large values', () => {
    fixture.componentRef.setInput('data', { ...mockData, totalSpent: 1234567 });
    fixture.detectChanges();
    
    expect(component.formattedCurrency()).toBe('$1,234,567');
  });

  it('should update when data changes', () => {
    fixture.componentRef.setInput('data', { ...mockData, percentage: 50, totalSpent: 1500 });
    fixture.detectChanges();
    
    expect(component.dashOffset()).toBe(157);
    expect(component.formattedCurrency()).toBe('$1,500');
  });

  it('should have proper SVG structure', () => {
    const svg = fixture.debugElement.nativeElement.querySelector('.progress-svg');
    const circles = svg.querySelectorAll('circle');
    
    expect(svg).toBeTruthy();
    expect(circles.length).toBe(3);
    expect(svg.getAttribute('viewBox')).toBe('0 0 120 120');
  });

  it('should have proper center content structure', () => {
    const centerContent = fixture.debugElement.nativeElement.querySelector('.center-content');
    const centerValue = centerContent.querySelector('.center-value');
    const centerLabel = centerContent.querySelector('.center-label');
    
    expect(centerContent).toBeTruthy();
    expect(centerValue).toBeTruthy();
    expect(centerLabel).toBeTruthy();
  });
});
