/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseFormComponent
  @description Test suite for expense form component
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Meta } from '@angular/platform-browser';

import { ExpenseFormComponent } from './expense-form.component';

describe('ExpenseFormComponent', () => {
  let component: ExpenseFormComponent;
  let fixture: ComponentFixture<ExpenseFormComponent>;
  let mockFormGroup: FormGroup;
  let mockMeta: jasmine.SpyObj<Meta>;

  beforeEach(async () => {
    const metaSpy = jasmine.createSpyObj('Meta', ['addTags']);

    const fb = new FormBuilder();
    mockFormGroup = fb.group({
      amount: [0],
      description: [''],
      category: [''],
      paymentMethod: [''],
      date: [''],
    });

    await TestBed.configureTestingModule({
      imports: [ExpenseFormComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: Meta, useValue: metaSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseFormComponent);
    component = fixture.componentInstance;
    component.formGroup = mockFormGroup;
    component.paymentMethods = [
      { label: 'Credit Card', value: 'credit_card' },
      { label: 'Bank Transfer', value: 'bank_transfer' }
    ];
    mockMeta = TestBed.inject(Meta) as jasmine.SpyObj<Meta>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should setup meta tags in constructor', () => {
    expect(mockMeta.addTags).toHaveBeenCalledWith([
      { name: 'description', content: 'Add or modify an expense record in Alpha Vault. Secure, accessible, and efficient.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]);
  });

  it('should initialize form with default values for add mode', () => {
    component.mode = 'add';
    component.formGroup.patchValue({ date: '' });
    component.ngOnInit();
    
    expect(component.formGroup.get('date')?.value).toBeTruthy();
  });

  it('should not modify form values for edit mode', () => {
    component.mode = 'edit';
    component.formGroup.patchValue({ date: '2023-01-01' });
    component.ngOnInit();
    
    expect(component.formGroup.get('date')?.value).toBe('2023-01-01');
  });

  it('should emit formSubmit when form is valid', () => {
    spyOn(component.formSubmit, 'emit');
    component.formGroup.patchValue({
      category: 'Test Category',
      amount: 1000,
      paymentMethod: 'credit_card',
      date: '2023-01-01'
    });
    
    component.onSubmit();
    
    expect(component.formSubmit.emit).toHaveBeenCalled();
  });

  it('should call onSubmit method', () => {
    spyOn(component, 'onSubmit');
    
    const form = fixture.debugElement.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('ngSubmit'));
    
    expect(component.onSubmit).toHaveBeenCalled();
  });

  it('should support keyboard navigation', () => {
    const categoryInput = fixture.debugElement.nativeElement.querySelector('#expenseCategory-add');
    const amountInput = fixture.debugElement.nativeElement.querySelector('#expenseAmount-add');
    
    categoryInput.focus();
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    categoryInput.dispatchEvent(enterEvent);
    
    expect(document.activeElement).toBe(amountInput);
  });

  it('should emit cancel on escape key', () => {
    spyOn(component.cancel, 'emit');
    
    component.onEscapeKey();
    
    expect(component.cancel.emit).toHaveBeenCalled();
  });

  it('should have proper ARIA attributes', () => {
    const form = fixture.debugElement.nativeElement.querySelector('form');
    const categoryInput = fixture.debugElement.nativeElement.querySelector('#expenseCategory-add');
    
    expect(form.getAttribute('role')).toBe('form');
    expect(form.getAttribute('aria-labelledby')).toBe('expenseFormTitle');
    expect(categoryInput.getAttribute('aria-required')).toBe('true');
  });

  it('should have proper focus management', () => {
    const categoryInput = fixture.debugElement.nativeElement.querySelector('#expenseCategory-add');
    const amountInput = fixture.debugElement.nativeElement.querySelector('#expenseAmount-add');
    
    categoryInput.focus();
    expect(document.activeElement).toBe(categoryInput);
    
    // Test keyboard navigation instead of direct method call
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    categoryInput.dispatchEvent(enterEvent);
    expect(document.activeElement).toBe(amountInput);
  });

  it('should track payment methods correctly', () => {
    const result1 = component.trackByMethod(0, { label: 'Credit Card', value: 'credit_card' });
    const result2 = component.trackByMethod(1, { label: 'Bank Transfer', value: 'bank_transfer' });
    
    expect(result1).toBe('credit_card');
    expect(result2).toBe('bank_transfer');
  });

  it('should have proper button accessibility', () => {
    const cancelButton = fixture.debugElement.nativeElement.querySelector('.btn-secondary');
    const submitButton = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    
    expect(cancelButton.getAttribute('aria-label')).toBe('Cancel form submission');
    expect(submitButton.getAttribute('aria-label')).toBe('Add expense record');
  });


  it('should compute validation states correctly', () => {
    component.formGroup.patchValue({ category: 'Test' });
    component.formGroup.get('category')?.markAsTouched();
    
    expect(component.categoryValid()).toBe(true);
    expect(component.categoryError()).toBe(false);
  });

  it('should handle invalid form state', () => {
    // Test computed signals work
    expect(component.categoryValid()).toBeDefined();
    expect(component.categoryError()).toBeDefined();
    expect(component.amountValid()).toBeDefined();
    expect(component.amountError()).toBeDefined();
  });
});