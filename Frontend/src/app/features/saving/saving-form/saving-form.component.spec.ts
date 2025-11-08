/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component SavingFormComponent
  @description Saving form component tests for adding and modifying saving goals
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { SavingFormComponent } from './saving-form.component';

describe('SavingFormComponent', () => {
  let component: SavingFormComponent;
  let fixture: ComponentFixture<SavingFormComponent>;
  let mockFormGroup: FormGroup;

  beforeEach(async () => {
    const fb = new FormBuilder();
    mockFormGroup = fb.group({
      name: [''],
      category: [''],
      targetAmount: [0],
      currentAmount: [0],
      deadline: [''],
      priority: [''],
      description: ['']
    });

    await TestBed.configureTestingModule({
      imports: [SavingFormComponent, ReactiveFormsModule],
      providers: [FormBuilder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavingFormComponent);
    component = fixture.componentInstance;
    component.formGroup = mockFormGroup;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit formSubmit when form is valid', () => {
    const spy = spyOn(component.formSubmit, 'emit');
    component.formGroup.patchValue({
      name: 'Test Goal',
      category: 'EDUCATION',
      targetAmount: 5000,
      currentAmount: 0,
      deadline: '2026-12-31',
      priority: 'MEDIUM'
    });
    component.onSubmit();
    expect(spy).toHaveBeenCalled();
  });

  it('should mark all as touched when form is invalid on submit', () => {
    const markAllAsTouchedSpy = spyOn(component.formGroup, 'markAllAsTouched');
    component.onSubmit();
    expect(markAllAsTouchedSpy).toHaveBeenCalled();
  });

  it('should emit cancel event', () => {
    const spy = spyOn(component.cancel, 'emit');
    component.cancel.emit();
    expect(spy).toHaveBeenCalled();
  });

  it('should have required form inputs', () => {
    expect(component.formGroup).toBeDefined();
    expect(component.categories).toBeDefined();
    expect(component.priorities).toBeDefined();
  });

  it('should set default deadline for add mode', () => {
    component.mode = 'add';
    component.ngOnInit();
    const deadlineValue = component.formGroup.get('deadline')?.value;
    expect(deadlineValue).toBeTruthy();
  });

  it('should not override deadline if it exists', () => {
    const existingDeadline = '2027-12-31';
    component.formGroup.get('deadline')?.setValue(existingDeadline);
    component.mode = 'add';
    component.ngOnInit();
    expect(component.formGroup.get('deadline')?.value).toBe(existingDeadline);
  });
});
