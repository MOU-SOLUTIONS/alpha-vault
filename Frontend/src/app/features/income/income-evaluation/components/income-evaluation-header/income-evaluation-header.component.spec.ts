/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component IncomeEvaluationHeaderComponent
  @description Income evaluation header component for displaying income data
*/

import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeEvaluationHeaderComponent } from './income-evaluation-header.component';

describe('IncomeEvaluationHeaderComponent', () => {
  let component: IncomeEvaluationHeaderComponent;
  let fixture: ComponentFixture<IncomeEvaluationHeaderComponent>;
  let cdr: ChangeDetectorRef;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomeEvaluationHeaderComponent, CurrencyPipe, DecimalPipe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeEvaluationHeaderComponent);
    component = fixture.componentInstance;
    cdr = fixture.debugElement.injector.get(ChangeDetectorRef);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display total income correctly', () => {
    component.totalIncome = 10000;
    component.growthRate = 0;
    component.achievementRate = 0;
    cdr.detectChanges();

    const statValues = fixture.debugElement.nativeElement.querySelectorAll('.stat-value');
    expect(statValues[0].textContent).toContain('$10,000.00');
  });

  it('should display growth rate correctly', () => {
    component.totalIncome = 10000;
    component.growthRate = 15.5;
    component.achievementRate = 85.2;
    cdr.detectChanges();

    const statValues = fixture.debugElement.nativeElement.querySelectorAll('.stat-value');
    expect(statValues[1].textContent).toContain('15.50%');
  });

  it('should display achievement rate correctly', () => {
    component.totalIncome = 10000;
    component.growthRate = 15.5;
    component.achievementRate = 85.2;
    cdr.detectChanges();

    const statValues = fixture.debugElement.nativeElement.querySelectorAll('.stat-value');
    expect(statValues[2].textContent).toContain('85.20%');
  });

  it('should have proper ARIA attributes', () => {
    const header = fixture.debugElement.nativeElement.querySelector('header');
    expect(header.getAttribute('role')).toBe('banner');
    expect(header.getAttribute('aria-labelledby')).toBe('main-title');

    const statsRegion = fixture.debugElement.nativeElement.querySelector('.header-stats');
    expect(statsRegion.getAttribute('role')).toBe('region');
    expect(statsRegion.getAttribute('aria-label')).toBe('Income statistics');

    const statIcons = fixture.debugElement.nativeElement.querySelectorAll('.stat-icon');
    statIcons.forEach((icon: any) => {
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    });
  });

  it('should support keyboard navigation', () => {
    component.totalIncome = 10000;
    component.growthRate = 15.5;
    component.achievementRate = 85.2;
    cdr.detectChanges();

    const statCards = fixture.debugElement.nativeElement.querySelectorAll('.stat-card');
    
    // Test that stat cards are focusable
    expect(statCards[0].getAttribute('tabindex')).toBe('0');
    expect(statCards[1].getAttribute('tabindex')).toBe('0');
    expect(statCards[2].getAttribute('tabindex')).toBe('0');

    // Test keyboard event handlers
    const firstCard = statCards[0];
    const keyboardEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    spyOn(component, 'onStatCardFocus');
    
    firstCard.dispatchEvent(keyboardEvent);
    expect(component.onStatCardFocus).toHaveBeenCalledWith(keyboardEvent);
  });

  it('should handle edge cases', () => {
    component.totalIncome = 0;
    component.growthRate = -5.2;
    component.achievementRate = 0;
    cdr.detectChanges();

    const statValues = fixture.debugElement.nativeElement.querySelectorAll('.stat-value');
    expect(statValues[0].textContent).toContain('$0.00');
    expect(statValues[1].textContent).toContain('-5.20%');
    expect(statValues[2].textContent).toContain('0.00%');
  });

  it('should have proper focus management', () => {
    component.totalIncome = 10000;
    component.growthRate = 15.5;
    component.achievementRate = 85.2;
    cdr.detectChanges();

    const statCards = fixture.debugElement.nativeElement.querySelectorAll('.stat-card');
    
    // Test focus styles
    const firstCard = statCards[0];
    firstCard.focus();
    expect(document.activeElement).toBe(firstCard);
  });
});
