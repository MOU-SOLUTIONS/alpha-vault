/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @styles MetricCardComponent
  @description Optimized metric card tests with accessibility
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricCardComponent } from './metric-card.component';

describe('MetricCardComponent', () => {
  let component: MetricCardComponent;
  let fixture: ComponentFixture<MetricCardComponent>;

  const mockData = {
    id: 'test-card',
    title: 'Test Metric',
    value: 1500,
    trend: {
      direction: 'up' as const,
      percentage: 15,
      text: '+15% from last month'
    },
    icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    isNegative: false
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MetricCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('data', mockData);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display metric data correctly', () => {
    const title = fixture.debugElement.nativeElement.querySelector('.card-title');
    const value = fixture.debugElement.nativeElement.querySelector('.card-value');
    const trend = fixture.debugElement.nativeElement.querySelector('.trend-indicator');

    expect(title.textContent).toBe('Test Metric');
    expect(value.textContent).toBe('$1,500');
    expect(trend.textContent).toContain('+15% from last month');
  });

  it('should emit hover events on mouse enter/leave', () => {
    spyOn(component.hoverChange, 'emit');
    
    const card = fixture.debugElement.nativeElement.querySelector('.metric-card');
    card.dispatchEvent(new Event('mouseenter'));
    
    expect(component.hoverChange.emit).toHaveBeenCalledWith('test-card');
    
    card.dispatchEvent(new Event('mouseleave'));
    
    expect(component.hoverChange.emit).toHaveBeenCalledWith(null);
  });

  it('should support keyboard activation', () => {
    spyOn(component.hoverChange, 'emit');
    
    const card = fixture.debugElement.nativeElement.querySelector('.metric-card');
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    
    card.dispatchEvent(enterEvent);
    expect(component.hoverChange.emit).toHaveBeenCalledWith('test-card');
    
    card.dispatchEvent(spaceEvent);
    expect(component.hoverChange.emit).toHaveBeenCalledWith('test-card');
  });

  it('should have proper ARIA attributes', () => {
    const card = fixture.debugElement.nativeElement.querySelector('.metric-card');
    
    expect(card.getAttribute('role')).toBe('button');
    expect(card.getAttribute('tabindex')).toBe('0');
    expect(card.getAttribute('aria-label')).toContain('Test Metric');
    expect(card.getAttribute('aria-describedby')).toBe('trend-test-card');
  });

  it('should format currency correctly', () => {
    expect(component.formattedValue()).toBe('$1,500');
  });

  it('should handle negative values', () => {
    fixture.componentRef.setInput('data', { ...mockData, value: -500, isNegative: true });
    fixture.detectChanges();
    
    const value = fixture.debugElement.nativeElement.querySelector('.card-value');
    expect(value.textContent).toBe('-$500');
    expect(value.classList.contains('negative')).toBe(true);
  });

  it('should display trend indicators correctly', () => {
    expect(component.getTrendDescription('up')).toBe('Increasing');
    expect(component.getTrendDescription('down')).toBe('Decreasing');
    expect(component.getTrendDescription('stable')).toBe('Stable');
    
    expect(component.getTrendVisual('up')).toBe('↗');
    expect(component.getTrendVisual('down')).toBe('↘');
    expect(component.getTrendVisual('stable')).toBe('→');
  });

  it('should apply hover class when isHovered input is true', () => {
    fixture.componentRef.setInput('isHovered', true);
    fixture.detectChanges();
    
    const card = fixture.debugElement.nativeElement.querySelector('.metric-card');
    expect(card.classList.contains('hovered')).toBe(true);
  });

  it('should handle different trend directions', () => {
    const directions = ['excellent', 'good', 'warning', 'danger', 'critical', 'positive', 'negative'];
    
    directions.forEach(direction => {
      fixture.componentRef.setInput('data', { ...mockData, trend: { ...mockData.trend, direction: direction as any } });
      fixture.detectChanges();
      
      const trendIndicator = fixture.debugElement.nativeElement.querySelector('.trend-indicator');
      expect(trendIndicator.classList.contains(direction)).toBe(true);
    });
  });

  it('should have unique trend ID for accessibility', () => {
    const trendIndicator = fixture.debugElement.nativeElement.querySelector('.trend-indicator');
    expect(trendIndicator.getAttribute('id')).toBe('trend-test-card');
  });

  it('should prevent default on keyboard events', () => {
    const card = fixture.debugElement.nativeElement.querySelector('.metric-card');
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    
    spyOn(enterEvent, 'preventDefault');
    card.dispatchEvent(enterEvent);
    
    expect(enterEvent.preventDefault).toHaveBeenCalled();
  });

  it('should not emit on other keyboard keys', () => {
    spyOn(component.hoverChange, 'emit');
    
    const card = fixture.debugElement.nativeElement.querySelector('.metric-card');
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    
    card.dispatchEvent(escapeEvent);
    
    expect(component.hoverChange.emit).not.toHaveBeenCalled();
  });
});
