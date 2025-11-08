/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component BudgetFormComponent
  @description Budget form component tests for adding and modifying budget allocations
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { BudgetFormComponent } from './budget-form.component';

describe('BudgetFormComponent', () => {
  let component: BudgetFormComponent;
  let fixture: ComponentFixture<BudgetFormComponent>;
  let formBuilder: FormBuilder;

  const mockCategories = [
    { label: 'Housing', value: 'housing' },
    { label: 'Food', value: 'food' },
    { label: 'Transportation', value: 'transportation' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetFormComponent, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(BudgetFormComponent);
    component = fixture.componentInstance;
    formBuilder = TestBed.inject(FormBuilder);
    
    component.formGroup = formBuilder.group({
      category: [null],
      allocated: [null]
    });
    component.expenseCategories = mockCategories;
    component.alreadyUsedCategories = ['housing'];
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Computed Properties', () => {
    it('should provide correct submit button text for add mode', () => {
      component.mode = 'add';
      expect(component.computedSubmitButtonText).toBe('Add');
    });

    it('should provide correct submit button text for modify mode', () => {
      component.mode = 'modify';
      expect(component.computedSubmitButtonText).toBe('Modify');
    });

    it('should provide correct submit button text for delete mode', () => {
      component.mode = 'delete';
      expect(component.computedSubmitButtonText).toBe('Delete');
    });

    it('should provide correct button color for add mode', () => {
      component.mode = 'add';
      expect(component.computedSubmitButtonColor).toBe('add');
    });

    it('should provide correct button color for modify mode', () => {
      component.mode = 'modify';
      expect(component.computedSubmitButtonColor).toBe('modify');
    });

    it('should provide correct button color for delete mode', () => {
      component.mode = 'delete';
      expect(component.computedSubmitButtonColor).toBe('delete');
    });

    it('should provide correct button icon for add mode', () => {
      component.mode = 'add';
      expect(component.computedButtonIcon).toBe('fa-plus');
    });

    it('should provide correct button icon for modify mode', () => {
      component.mode = 'modify';
      expect(component.computedButtonIcon).toBe('fa-save');
    });

    it('should provide correct button icon for delete mode', () => {
      component.mode = 'delete';
      expect(component.computedButtonIcon).toBe('fa-trash');
    });
  });

  describe('Category Filtering', () => {
    it('should filter out used categories in add mode', () => {
      component.mode = 'add';
      const filtered = component.filteredCategories;
      expect(filtered.length).toBe(2);
      expect(filtered.find(cat => cat.value === 'housing')).toBeUndefined();
    });

    it('should show all categories in modify mode', () => {
      component.mode = 'modify';
      const filtered = component.filteredCategories;
      expect(filtered.length).toBe(3);
      expect(filtered.find(cat => cat.value === 'housing')).toBeDefined();
    });

    it('should show all categories in delete mode', () => {
      component.mode = 'delete';
      const filtered = component.filteredCategories;
      expect(filtered.length).toBe(3);
    });
  });

  describe('Accessibility', () => {
    it('should support keyboard navigation for cancel button', () => {
      spyOn(component.cancel, 'emit');
      const cancelButton = fixture.debugElement.query(By.css('.btn-secondary'));
      const keyboardEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      
      cancelButton.nativeElement.dispatchEvent(keyboardEvent);
      
      expect(component.cancel.emit).toHaveBeenCalled();
    });

    it('should support keyboard navigation for submit button', () => {
      spyOn(component, 'onSubmit');
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      const keyboardEvent = new KeyboardEvent('keydown', { key: ' ' });
      
      submitButton.nativeElement.dispatchEvent(keyboardEvent);
      
      expect(component.onSubmit).toHaveBeenCalled();
    });

    it('should have proper ARIA labels', () => {
      const cancelButton = fixture.debugElement.query(By.css('.btn-secondary'));
      expect(cancelButton.nativeElement.getAttribute('aria-label')).toBe('Cancel budget form');
    });

    it('should have proper roles', () => {
      const buttons = fixture.debugElement.queryAll(By.css('button'));
      buttons.forEach(button => {
        expect(button.nativeElement.getAttribute('role')).toBe('button');
      });
    });

    it('should have proper tabindex', () => {
      const buttons = fixture.debugElement.queryAll(By.css('button'));
      buttons.forEach(button => {
        expect(button.nativeElement.getAttribute('tabindex')).toBe('0');
      });
    });

    it('should have aria-hidden on icons', () => {
      const icons = fixture.debugElement.queryAll(By.css('i'));
      icons.forEach(icon => {
        expect(icon.nativeElement.getAttribute('aria-hidden')).toBe('true');
      });
    });
  });

  describe('Form Validation', () => {
    it('should disable submit button when form is invalid', () => {
      component.formGroup.patchValue({ category: null, allocated: null });
      fixture.detectChanges();
      
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBe(true);
    });

    it('should enable submit button when form is valid', () => {
      component.formGroup.patchValue({ category: 'food', allocated: 100 });
      fixture.detectChanges();
      
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBe(false);
    });

    it('should enable submit button in delete mode even with invalid form', () => {
      component.mode = 'delete';
      component.formGroup.patchValue({ category: null, allocated: null });
      fixture.detectChanges();
      
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBe(false);
    });
  });

  describe('Form Submission', () => {
    it('should emit formSubmit when form is valid', () => {
      spyOn(component.formSubmit, 'emit');
      component.formGroup.patchValue({ category: 'food', allocated: 100 });
      
      component.onSubmit();
      
      expect(component.formSubmit.emit).toHaveBeenCalled();
    });

    it('should not emit formSubmit when form is invalid', () => {
      spyOn(component.formSubmit, 'emit');
      component.formGroup.patchValue({ category: null, allocated: null });
      
      component.onSubmit();
      
      expect(component.formSubmit.emit).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Handlers', () => {
    it('should handle Enter key on cancel button', () => {
      spyOn(component.cancel, 'emit');
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      spyOn(event, 'preventDefault');
      
      component.onCancelKeydown(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.cancel.emit).toHaveBeenCalled();
    });

    it('should handle Space key on cancel button', () => {
      spyOn(component.cancel, 'emit');
      const event = new KeyboardEvent('keydown', { key: ' ' });
      spyOn(event, 'preventDefault');
      
      component.onCancelKeydown(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.cancel.emit).toHaveBeenCalled();
    });

    it('should handle Enter key on submit button', () => {
      spyOn(component, 'onSubmit');
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      spyOn(event, 'preventDefault');
      
      component.onSubmitKeydown(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.onSubmit).toHaveBeenCalled();
    });

    it('should handle Space key on submit button', () => {
      spyOn(component, 'onSubmit');
      const event = new KeyboardEvent('keydown', { key: ' ' });
      spyOn(event, 'preventDefault');
      
      component.onSubmitKeydown(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.onSubmit).toHaveBeenCalled();
    });

    it('should ignore other keys on cancel button', () => {
      spyOn(component.cancel, 'emit');
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      spyOn(event, 'preventDefault');
      
      component.onCancelKeydown(event);
      
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(component.cancel.emit).not.toHaveBeenCalled();
    });
  });

  describe('TrackBy Function', () => {
    it('should track by category value', () => {
      const result = component.trackByCategory(0, { value: 'housing', label: 'Housing' });
      expect(result).toBe('housing');
    });

    it('should handle different indices', () => {
      const result1 = component.trackByCategory(0, { value: 'housing', label: 'Housing' });
      const result2 = component.trackByCategory(1, { value: 'food', label: 'Food' });
      
      expect(result1).toBe('housing');
      expect(result2).toBe('food');
    });
  });

  describe('Template Rendering', () => {
    it('should render form with proper structure', () => {
      const form = fixture.debugElement.query(By.css('form'));
      expect(form).toBeTruthy();
      expect(form.nativeElement.getAttribute('role')).toBe('form');
    });

    it('should render category select with proper attributes', () => {
      const select = fixture.debugElement.query(By.css('select[formControlName="category"]'));
      expect(select).toBeTruthy();
      expect(select.nativeElement.getAttribute('aria-required')).toBe('true');
    });

    it('should render amount input with proper attributes', () => {
      const input = fixture.debugElement.query(By.css('input[formControlName="allocated"]'));
      expect(input).toBeTruthy();
      expect(input.nativeElement.getAttribute('aria-required')).toBe('true');
      expect(input.nativeElement.getAttribute('step')).toBe('0.01');
      expect(input.nativeElement.getAttribute('min')).toBe('0.01');
    });

    it('should render ARIA live region', () => {
      const liveRegion = fixture.debugElement.query(By.css('[aria-live]'));
      expect(liveRegion).toBeTruthy();
      expect(liveRegion.nativeElement.getAttribute('aria-live')).toBe('polite');
      expect(liveRegion.nativeElement.getAttribute('aria-atomic')).toBe('true');
    });
  });
});
