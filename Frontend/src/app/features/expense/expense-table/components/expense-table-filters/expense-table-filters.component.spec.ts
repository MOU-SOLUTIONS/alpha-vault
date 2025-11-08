/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseTableFiltersComponent
  @description Expense table filters component for displaying expense data
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';

import { ExpenseTableFiltersComponent } from './expense-table-filters.component';

describe('ExpenseTableFiltersComponent', () => {
  let component: ExpenseTableFiltersComponent;
  let fixture: ComponentFixture<ExpenseTableFiltersComponent>;
  let mockFormGroup: FormGroup;

  beforeEach(async () => {
    const fb = new FormBuilder();
    mockFormGroup = fb.group({
      search: [''],
      fromDate: [''],
      toDate: [''],
      method: [''],
      category: ['']
    });

    await TestBed.configureTestingModule({
      imports: [
        ExpenseTableFiltersComponent,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatIconModule,
        MatTooltipModule
      ],
      providers: [FormBuilder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseTableFiltersComponent);
    component = fixture.componentInstance;
    component.isExpanded = true;
    component.filterForm = mockFormGroup;
    component.paymentMethods = [
      { value: 'cash', label: 'Cash' },
      { value: 'card', label: 'Card' }
    ];
    component.categories = [
      { value: 'food', label: 'Food' },
      { value: 'transport', label: 'Transport' }
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit resetFilters when reset button is clicked', () => {
    component.isExpanded = true;
    component.hasActiveFilters = true; // Enable the button
    fixture.detectChanges();
    
    spyOn(component.resetFilters, 'emit');
    
    const resetButton = fixture.debugElement.nativeElement.querySelector('.reset-button');
    expect(resetButton).toBeTruthy();
    resetButton.click();
    
    expect(component.resetFilters.emit).toHaveBeenCalled();
  });

  it('should show filter count when filteredCount differs from totalCount', () => {
    component.isExpanded = true;
    component.filteredCount = 5;
    component.totalCount = 10;
    fixture.detectChanges();
    
    const subtitle = fixture.debugElement.nativeElement.querySelector('.filter-subtitle');
    expect(subtitle).toBeTruthy();
    expect(subtitle.textContent).toContain('Showing 5 of 10 entries');
  });

  it('should disable reset button when hasActiveFilters is false', () => {
    component.isExpanded = true;
    component.hasActiveFilters = false;
    fixture.detectChanges();
    
    const resetButton = fixture.debugElement.nativeElement.querySelector('.reset-button');
    expect(resetButton.disabled).toBeTruthy();
  });

  it('should enable reset button when hasActiveFilters is true', () => {
    component.isExpanded = true;
    component.hasActiveFilters = true;
    fixture.detectChanges();
    
    const resetButton = fixture.debugElement.nativeElement.querySelector('.reset-button');
    expect(resetButton.disabled).toBeFalsy();
  });

  it('should track payment methods correctly', () => {
    const result = component.trackByPaymentMethod(0, { value: 'cash', label: 'Cash' });
    expect(result).toBe('cash');
  });

  it('should track categories correctly', () => {
    const result = component.trackByCategory(0, { value: 'food', label: 'Food' });
    expect(result).toBe('food');
  });

  it('should support keyboard navigation on reset button', () => {
    component.isExpanded = true;
    component.hasActiveFilters = true;
    fixture.detectChanges();
    
    spyOn(component.resetFilters, 'emit');
    
    const resetButton = fixture.debugElement.query(By.css('.reset-button'));
    resetButton.triggerEventHandler('keydown.enter', new KeyboardEvent('keydown', { key: 'Enter' }));
    
    expect(component.resetFilters.emit).toHaveBeenCalled();
  });

  it('should support space key navigation on reset button', () => {
    component.isExpanded = true;
    component.hasActiveFilters = true;
    fixture.detectChanges();
    
    spyOn(component.resetFilters, 'emit');
    
    const resetButton = fixture.debugElement.query(By.css('.reset-button'));
    resetButton.triggerEventHandler('keydown.space', new KeyboardEvent('keydown', { key: ' ' }));
    
    expect(component.resetFilters.emit).toHaveBeenCalled();
  });

  it('should have proper ARIA attributes', () => {
    component.isExpanded = true;
    fixture.detectChanges();
    
    const form = fixture.debugElement.query(By.css('form'));
    const resetButton = fixture.debugElement.query(By.css('.reset-button'));
    
    expect(form.nativeElement.getAttribute('role')).toBe('search');
    expect(form.nativeElement.getAttribute('aria-labelledby')).toBe('filterSectionLabel');
    expect(resetButton.nativeElement.getAttribute('aria-label')).toBe('Reset all filters');
  });

  it('should have proper form labels and inputs', () => {
    component.isExpanded = true;
    fixture.detectChanges();
    
    const fromDateInput = fixture.debugElement.query(By.css('#fromDate'));
    const toDateInput = fixture.debugElement.query(By.css('#toDate'));
    const methodSelect = fixture.debugElement.query(By.css('#method'));
    const categorySelect = fixture.debugElement.query(By.css('#category'));
    
    expect(fromDateInput.nativeElement.getAttribute('aria-label')).toBe('Filter from date');
    expect(toDateInput.nativeElement.getAttribute('aria-label')).toBe('Filter to date');
    expect(methodSelect.nativeElement.getAttribute('aria-label')).toBe('Filter by payment method');
    expect(categorySelect.nativeElement.getAttribute('aria-label')).toBe('Filter by expense category');
  });

  it('should not render when isExpanded is false', () => {
    component.isExpanded = false;
    fixture.detectChanges();
    
    const form = fixture.debugElement.query(By.css('form'));
    expect(form).toBeFalsy();
  });

  it('should have proper semantic structure', () => {
    component.isExpanded = true;
    fixture.detectChanges();
    
    const form = fixture.debugElement.query(By.css('form'));
    const title = fixture.debugElement.query(By.css('h3'));
    
    expect(form).toBeTruthy();
    expect(title.nativeElement.textContent.trim()).toContain('Filters');
  });
});