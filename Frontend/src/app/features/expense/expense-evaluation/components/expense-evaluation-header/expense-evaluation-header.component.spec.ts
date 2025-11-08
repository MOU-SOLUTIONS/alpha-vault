/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseEvaluationHeaderComponent
  @description Expense evaluation header component for displaying expense data
*/

import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseEvaluationHeaderComponent } from './expense-evaluation-header.component';

describe('ExpenseEvaluationHeaderComponent', () => {
  let component: ExpenseEvaluationHeaderComponent;
  let fixture: ComponentFixture<ExpenseEvaluationHeaderComponent>;
  let cdr: ChangeDetectorRef;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseEvaluationHeaderComponent, CurrencyPipe, DecimalPipe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseEvaluationHeaderComponent);
    component = fixture.componentInstance;
    cdr = fixture.debugElement.injector.get(ChangeDetectorRef);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display total expense correctly', () => {
    component.totalExpense = 10000;
    component.growthRate = 0;
    component.achievementRate = 0;
    cdr.detectChanges();

    const statValues = fixture.debugElement.nativeElement.querySelectorAll('.stat-value');
    expect(statValues[0].textContent).toContain('$10,000.00');
  });

  it('should display growth rate correctly', () => {
    component.totalExpense = 10000;
    component.growthRate = 15.5;
    component.achievementRate = 85.2;
    cdr.detectChanges();

    const statValues = fixture.debugElement.nativeElement.querySelectorAll('.stat-value');
    expect(statValues[1].textContent).toContain('15.50%');
  });

  it('should display achievement rate correctly', () => {
    component.totalExpense = 10000;
    component.growthRate = 15.5;
    component.achievementRate = 85.2;
    cdr.detectChanges();

    const statValues = fixture.debugElement.nativeElement.querySelectorAll('.stat-value');
    expect(statValues[2].textContent).toContain('85.20%');
  });

  it('should have proper accessibility attributes', () => {
    component.totalExpense = 10000;
    component.growthRate = 15.5;
    component.achievementRate = 85.2;
    cdr.detectChanges();

    const header = fixture.debugElement.nativeElement.querySelector('header');
    expect(header.getAttribute('role')).toBe('banner');
    expect(header.getAttribute('aria-labelledby')).toBe('main-title');

    const mainTitle = fixture.debugElement.nativeElement.querySelector('#main-title');
    expect(mainTitle).toBeTruthy();

    const statsRegion = fixture.debugElement.nativeElement.querySelector('.header-stats');
    expect(statsRegion.getAttribute('role')).toBe('region');
    expect(statsRegion.getAttribute('aria-label')).toBe('Expense statistics');
  });

  it('should have proper ARIA labels on stat cards', () => {
    component.totalExpense = 10000;
    component.growthRate = 15.5;
    component.achievementRate = 85.2;
    cdr.detectChanges();

    const statCards = fixture.debugElement.nativeElement.querySelectorAll('.stat-card');
    
    expect(statCards[0].getAttribute('aria-label')).toContain('Total Expenses: $10,000.00');
    expect(statCards[1].getAttribute('aria-label')).toContain('Growth Rate: 15.50%');
    expect(statCards[2].getAttribute('aria-label')).toContain('Expense Performance: 85.20%');
  });

  it('should handle keyboard events on stat cards', () => {
    component.totalExpense = 10000;
    component.growthRate = 15.5;
    component.achievementRate = 85.2;
    cdr.detectChanges();

    const statCards = fixture.debugElement.nativeElement.querySelectorAll('.stat-card');
    const firstCard = statCards[0];
    
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    
    spyOn(component, 'onStatCardFocus');
    
    firstCard.dispatchEvent(enterEvent);
    firstCard.dispatchEvent(spaceEvent);
    
    expect(component.onStatCardFocus).toHaveBeenCalledTimes(2);
  });

  it('should display floating elements', () => {
    const floatingElements = fixture.debugElement.nativeElement.querySelector('.floating-elements');
    expect(floatingElements).toBeTruthy();
    expect(floatingElements.getAttribute('aria-hidden')).toBe('true');

    const floatingCircle = fixture.debugElement.nativeElement.querySelector('.floating-circle');
    const floatingSquare = fixture.debugElement.nativeElement.querySelector('.floating-square');
    const floatingTriangle = fixture.debugElement.nativeElement.querySelector('.floating-triangle');
    
    expect(floatingCircle).toBeTruthy();
    expect(floatingSquare).toBeTruthy();
    expect(floatingTriangle).toBeTruthy();
  });

  it('should have proper tabindex for keyboard navigation', () => {
    component.totalExpense = 10000;
    component.growthRate = 15.5;
    component.achievementRate = 85.2;
    cdr.detectChanges();

    const statCards = fixture.debugElement.nativeElement.querySelectorAll('.stat-card');
    statCards.forEach((card: any) => {
      expect(card.getAttribute('tabindex')).toBe('0');
    });
  });

  it('should display correct title and subtitle', () => {
    const title = fixture.debugElement.nativeElement.querySelector('.main-title');
    const subtitle = fixture.debugElement.nativeElement.querySelector('.subtitle');
    
    expect(title.textContent).toContain('Expense');
    expect(title.textContent).toContain('Evaluation');
    expect(subtitle.textContent).toContain('Comprehensive analysis of your expense patterns and performance');
  });
});
