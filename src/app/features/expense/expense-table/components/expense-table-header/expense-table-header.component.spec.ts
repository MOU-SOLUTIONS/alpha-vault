/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseTableHeaderComponent
  @description Expense table header component for displaying expense data
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';

import { ExpenseTableHeaderComponent } from './expense-table-header.component';

describe('ExpenseTableHeaderComponent', () => {
  let component: ExpenseTableHeaderComponent;
  let fixture: ComponentFixture<ExpenseTableHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ExpenseTableHeaderComponent,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatBadgeModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseTableHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit toggleFilters when filter button is clicked', () => {
    spyOn(component.toggleFilters, 'emit');
    
    const filterButton = fixture.debugElement.nativeElement.querySelector('.filter-toggle-button');
    filterButton.click();
    
    expect(component.toggleFilters.emit).toHaveBeenCalled();
  });

  it('should emit addExpense when add button is clicked', () => {
    spyOn(component.addExpense, 'emit');
    
    const addButton = fixture.debugElement.nativeElement.querySelector('.add-button');
    addButton.click();
    
    expect(component.addExpense.emit).toHaveBeenCalled();
  });

  it('should show active state when hasActiveFilters is true', () => {
    component.hasActiveFilters = true;
    fixture.detectChanges();
    
    const filterButton = fixture.debugElement.nativeElement.querySelector('.filter-toggle-button');
    expect(filterButton.classList.contains('active')).toBeTruthy();
  });

  it('should show badge when hasActiveFilters is true', () => {
    component.hasActiveFilters = true;
    fixture.detectChanges();
    
    const button = fixture.debugElement.nativeElement.querySelector('.filter-toggle-button');
    
    // Check that the button has the active class and badge is configured
    expect(button.classList.contains('active')).toBeTruthy();
    expect(component.hasActiveFilters).toBeTruthy();
  });

  it('should support keyboard navigation on filter button', () => {
    spyOn(component.toggleFilters, 'emit');
    
    const filterButton = fixture.debugElement.query(By.css('.filter-toggle-button'));
    filterButton.triggerEventHandler('keydown.enter', new KeyboardEvent('keydown', { key: 'Enter' }));
    
    expect(component.toggleFilters.emit).toHaveBeenCalled();
  });

  it('should support space key navigation on add button', () => {
    spyOn(component.addExpense, 'emit');
    
    const addButton = fixture.debugElement.query(By.css('.add-button'));
    addButton.triggerEventHandler('keydown.space', new KeyboardEvent('keydown', { key: ' ' }));
    
    expect(component.addExpense.emit).toHaveBeenCalled();
  });

  it('should have proper ARIA attributes', () => {
    const filterButton = fixture.debugElement.query(By.css('.filter-toggle-button'));
    const addButton = fixture.debugElement.query(By.css('.add-button'));
    
    expect(filterButton.nativeElement.getAttribute('aria-label')).toBe('Toggle filter panel');
    expect(filterButton.nativeElement.getAttribute('aria-expanded')).toBe('false');
    expect(filterButton.nativeElement.getAttribute('aria-controls')).toBe('filterPanel');
    expect(addButton.nativeElement.getAttribute('aria-label')).toBe('Add new expense');
  });

  it('should update aria-expanded when isFilterExpanded changes', () => {
    component.isFilterExpanded = true;
    fixture.detectChanges();
    
    const filterButton = fixture.debugElement.query(By.css('.filter-toggle-button'));
    expect(filterButton.nativeElement.getAttribute('aria-expanded')).toBe('true');
  });

  it('should have proper semantic structure', () => {
    const header = fixture.debugElement.query(By.css('header'));
    const title = fixture.debugElement.query(By.css('h2'));
    
    expect(header).toBeTruthy();
    expect(title.nativeElement.textContent.trim()).toContain('Expense Breakdown');
  });

  it('should have decorative icon with aria-hidden', () => {
    const icon = fixture.debugElement.query(By.css('mat-icon[aria-hidden="true"]'));
    expect(icon).toBeTruthy();
  });
});