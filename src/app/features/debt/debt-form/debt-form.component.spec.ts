/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component DebtFormComponent
  @description Main debt dashboard component tests for managing debt form
*/

import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { DebtFormComponent } from './debt-form.component';

describe('DebtFormComponent', () => {
  let component: DebtFormComponent;
  let fixture: ComponentFixture<DebtFormComponent>;
  let formGroup: FormGroup;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebtFormComponent, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DebtFormComponent);
    component = fixture.componentInstance;
    
    const fb = TestBed.inject(FormBuilder);
    formGroup = fb.group({
      creditorName: ['', Validators.required],
      principalAmount: [0, [Validators.required, Validators.min(0.01)]],
      remainingAmount: [0, [Validators.required, Validators.min(0)]],
      interestRateApr: [0, [Validators.min(0), Validators.max(999.9999)]],
      dueDate: ['', Validators.required],
      minPayment: [0, [Validators.required, Validators.min(0)]]
    });
    
    component.formGroup = formGroup;
    component.mode = 'add';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Rendering', () => {
    it('should render all form fields', () => {
      expect(fixture.debugElement.query(By.css('#debtCreditor-add'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('#debtPrincipalAmount-add'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('#debtRemainingAmount-add'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('#debtInterestRateApr-add'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('#debtDueDate-add'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('#debtMinPayment-add'))).toBeTruthy();
    });

    it('should show error messages when field is touched and invalid', () => {
      const creditorInput = fixture.debugElement.query(By.css('#debtCreditor-add'));
      creditorInput.nativeElement.dispatchEvent(new Event('blur'));
      formGroup.get('creditorName')?.markAsTouched();
      formGroup.get('creditorName')?.setErrors({ required: true });
      fixture.detectChanges();
      
      const error = fixture.debugElement.query(By.css('.error'));
      expect(error).toBeTruthy();
      expect(error.nativeElement.textContent).toContain('Please enter a creditor name');
    });

    it('should show validation icons when field is valid', () => {
      formGroup.patchValue({ creditorName: 'Test Creditor' });
      formGroup.get('creditorName')?.markAsTouched();
      fixture.detectChanges();
      
      const icon = fixture.debugElement.query(By.css('.input-icon'));
      expect(icon).toBeTruthy();
    });

    it('should render form with correct mode', () => {
      component.mode = 'edit';
      fixture.detectChanges();
      
      expect(fixture.debugElement.query(By.css('#debtCreditor-edit'))).toBeTruthy();
    });

    it('should display correct form text based on mode', () => {
      component.mode = 'add';
      fixture.detectChanges();
      let formText = fixture.debugElement.query(By.css('.form-text'));
      expect(formText.nativeElement.textContent).toContain('Please add the details');

      component.mode = 'edit';
      fixture.detectChanges();
      formText = fixture.debugElement.query(By.css('.form-text'));
      expect(formText.nativeElement.textContent).toContain('Please update the details');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-required on required fields', () => {
      const requiredInputs = fixture.debugElement.queryAll(By.css('[aria-required="true"]'));
      expect(requiredInputs.length).toBeGreaterThan(0);
      
      const creditorInput = fixture.debugElement.query(By.css('#debtCreditor-add'));
      expect(creditorInput.nativeElement.getAttribute('aria-required')).toBe('true');
    });

    it('should have role="alert" on error messages', () => {
      formGroup.get('creditorName')?.markAsTouched();
      formGroup.get('creditorName')?.setErrors({ required: true });
      fixture.detectChanges();
      
      const error = fixture.debugElement.query(By.css('[role="alert"]'));
      expect(error).toBeTruthy();
    });

    it('should have aria-describedby linking inputs to errors', () => {
      formGroup.get('creditorName')?.markAsTouched();
      formGroup.get('creditorName')?.setErrors({ required: true });
      fixture.detectChanges();
      
      const input = fixture.debugElement.query(By.css('#debtCreditor-add'));
      const ariaDescribedBy = input.nativeElement.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toBeTruthy();
      expect(ariaDescribedBy).toContain('error');
    });

    it('should have aria-invalid on invalid inputs', () => {
      formGroup.get('creditorName')?.markAsTouched();
      formGroup.get('creditorName')?.setErrors({ required: true });
      fixture.detectChanges();
      
      const input = fixture.debugElement.query(By.css('#debtCreditor-add'));
      expect(input.nativeElement.getAttribute('aria-invalid')).toBe('true');
    });

    it('should have keyboard handlers on buttons', () => {
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      spyOn(component, 'onSubmit');
      
      submitButton.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      expect(component.onSubmit).toHaveBeenCalled();
    });

    it('should have keyboard handlers on cancel button', () => {
      const cancelButton = fixture.debugElement.query(By.css('.btn-secondary'));
      spyOn(component.cancel, 'emit');
      
      cancelButton.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      expect(component.cancel.emit).toHaveBeenCalled();
    });

    it('should have aria-label on buttons', () => {
      const cancelButton = fixture.debugElement.query(By.css('.btn-secondary'));
      expect(cancelButton.nativeElement.getAttribute('aria-label')).toBe('Cancel form');
      
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.getAttribute('aria-label')).toBeTruthy();
    });

    it('should have aria-hidden on decorative icons', () => {
      const icons = fixture.debugElement.queryAll(By.css('[aria-hidden="true"]'));
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should have visually-hidden form title', () => {
      const title = fixture.debugElement.query(By.css('#debtFormTitle'));
      expect(title).toBeTruthy();
      expect(title.nativeElement.classList.contains('visually-hidden')).toBe(true);
    });

    it('should have role="form" on form element', () => {
      const form = fixture.debugElement.query(By.css('form[role="form"]'));
      expect(form).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should disable submit button when form is invalid', () => {
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBe(true);
    });

    it('should enable submit button when form is valid', () => {
      formGroup.patchValue({
        creditorName: 'Test Creditor',
        principalAmount: 1000,
        remainingAmount: 500,
        dueDate: '2024-12-31',
        minPayment: 50
      });
      fixture.detectChanges();
      
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBe(false);
    });

    it('should validate principal amount minimum', () => {
      formGroup.patchValue({ principalAmount: 0 });
      formGroup.get('principalAmount')?.markAsTouched();
      fixture.detectChanges();
      
      expect(formGroup.get('principalAmount')?.invalid).toBe(true);
    });

    it('should validate interest rate maximum', () => {
      formGroup.patchValue({ interestRateApr: 1000 });
      formGroup.get('interestRateApr')?.markAsTouched();
      fixture.detectChanges();
      
      expect(formGroup.get('interestRateApr')?.invalid).toBe(true);
    });

    it('should validate remaining amount minimum', () => {
      formGroup.patchValue({ remainingAmount: -1 });
      formGroup.get('remainingAmount')?.markAsTouched();
      fixture.detectChanges();
      
      expect(formGroup.get('remainingAmount')?.invalid).toBe(true);
    });
  });

  describe('Output Events', () => {
    it('should emit formSubmit when form is valid and submitted', () => {
      formGroup.patchValue({
        creditorName: 'Test',
        principalAmount: 1000,
        remainingAmount: 500,
        dueDate: '2024-12-31',
        minPayment: 50
      });
      spyOn(component.formSubmit, 'emit');
      
      component.onSubmit();
      expect(component.formSubmit.emit).toHaveBeenCalled();
    });

    it('should not emit formSubmit when form is invalid', () => {
      spyOn(component.formSubmit, 'emit');
      component.onSubmit();
      expect(component.formSubmit.emit).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched when form is invalid on submit', () => {
      component.onSubmit();
      expect(formGroup.get('creditorName')?.touched).toBe(true);
      expect(formGroup.get('principalAmount')?.touched).toBe(true);
      expect(formGroup.get('remainingAmount')?.touched).toBe(true);
      expect(formGroup.get('dueDate')?.touched).toBe(true);
      expect(formGroup.get('minPayment')?.touched).toBe(true);
    });

    it('should emit cancel when cancel button is clicked', () => {
      spyOn(component.cancel, 'emit');
      const cancelButton = fixture.debugElement.query(By.css('.btn-secondary'));
      cancelButton.nativeElement.click();
      expect(component.cancel.emit).toHaveBeenCalled();
    });

    it('should emit cancel when cancel button receives Enter key', () => {
      spyOn(component.cancel, 'emit');
      const cancelButton = fixture.debugElement.query(By.css('.btn-secondary'));
      cancelButton.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      expect(component.cancel.emit).toHaveBeenCalled();
    });

    it('should emit cancel when cancel button receives Space key', () => {
      spyOn(component.cancel, 'emit');
      const cancelButton = fixture.debugElement.query(By.css('.btn-secondary'));
      const event = new KeyboardEvent('keydown', { key: ' ' });
      spyOn(event, 'preventDefault');
      cancelButton.nativeElement.dispatchEvent(event);
      expect(component.cancel.emit).toHaveBeenCalled();
    });
  });

  describe('Mode Handling', () => {
    it('should set default due date when mode is add', () => {
      formGroup.patchValue({ dueDate: '' });
      component.mode = 'add';
      component.ngOnInit();
      expect(formGroup.get('dueDate')?.value).toBeTruthy();
    });

    it('should not set default due date when mode is edit and date exists', () => {
      formGroup.patchValue({ dueDate: '2024-12-31' });
      component.mode = 'edit';
      component.ngOnInit();
      expect(formGroup.get('dueDate')?.value).toBe('2024-12-31');
    });

    it('should not set default due date when mode is add and date already exists', () => {
      formGroup.patchValue({ dueDate: '2024-12-31' });
      component.mode = 'add';
      component.ngOnInit();
      expect(formGroup.get('dueDate')?.value).toBe('2024-12-31');
    });

    it('should display correct button text and icon for add mode', () => {
      component.mode = 'add';
      fixture.detectChanges();
      
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.textContent).toContain('Add');
      expect(submitButton.nativeElement.querySelector('.fa-plus')).toBeTruthy();
    });

    it('should display correct button text and icon for edit mode', () => {
      component.mode = 'edit';
      fixture.detectChanges();
      
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.textContent).toContain('Modify');
      expect(submitButton.nativeElement.querySelector('.fa-save')).toBeTruthy();
    });
  });

  describe('SSR Compatibility', () => {
    it('should not access Meta service during SSR', () => {
      const serverFixture = TestBed.configureTestingModule({
        imports: [DebtFormComponent, ReactiveFormsModule, NoopAnimationsModule],
        providers: [
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      }).createComponent(DebtFormComponent);
      
      serverFixture.componentInstance.formGroup = formGroup;
      expect(() => serverFixture.detectChanges()).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty form group gracefully', () => {
      component.formGroup = new FormBuilder().group({});
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle null formGroup getter calls', () => {
      formGroup.get('creditorName')?.setValue(null);
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle very large numbers in amount fields', () => {
      formGroup.patchValue({
        principalAmount: 999999999,
        remainingAmount: 888888888
      });
      expect(formGroup.get('principalAmount')?.valid).toBe(true);
      expect(formGroup.get('remainingAmount')?.valid).toBe(true);
    });

    it('should handle zero values correctly', () => {
      formGroup.patchValue({
        principalAmount: 0.01,
        remainingAmount: 0,
        interestRateApr: 0,
        minPayment: 0
      });
      expect(formGroup.get('principalAmount')?.valid).toBe(true);
      expect(formGroup.get('remainingAmount')?.valid).toBe(true);
      expect(formGroup.get('interestRateApr')?.valid).toBe(true);
      expect(formGroup.get('minPayment')?.valid).toBe(true);
    });
  });
});

