/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component SavingFormComponent
  @description Saving form component for adding and modifying saving goals
*/


import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { META_FRAGMENT } from '../../../core/seo/page-meta.model';

@Component({
  standalone: true,
  selector: 'app-saving-goal-form',
  providers: [
    {
      provide: META_FRAGMENT,
      useValue: {
        description: 'Create or modify saving goals with comprehensive form fields. Add goal name, category, target amount, current amount, deadline, and priority level. Secure, accessible, and efficient saving goal management form in Alpha Vault.'
      }
    }
  ],
  template: `
    <!-- Section: Saving Goal Form -->
    <section>
      <form
        [formGroup]="formGroup"
        (ngSubmit)="onSubmit()"
        class="saving-form"
        role="form"
        aria-labelledby="savingFormTitle"
        aria-describedby="formDescription"
       >
         <p class="form-text" id="formDescription">
           {{ mode === 'add'
             ? 'Please add the details of the new saving goal.'
             : 'Please update the details of the saving goal below.' }}
         </p>
 
         <!-- Section: Goal Name & Category -->
        <div class="row">
          <div class="col-12 col-md-6">
            <div class="form-group">
              <label for="goalName-{{ mode }}" class="required-field">Goal Name</label>
              <div class="input-wrapper">
                <input
                  id="goalName-{{ mode }}"
                  type="text"
                  formControlName="name"
                  placeholder="Emergency Fund, Vacation..."
                  aria-required="true"
                />
                <div class="input-icon" *ngIf="nameControl?.valid">
                  <i class="fa fa-check-circle"></i>
                </div>
              </div>
              <div
                class="error"
                *ngIf="nameControl?.touched && nameControl?.invalid"
                role="alert"
              >
                Please enter a goal name.
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="form-group">
              <label for="goalCategory-{{ mode }}" class="required-field">Category</label>
              <div class="input-wrapper select-wrapper">
                <select
                  id="goalCategory-{{ mode }}"
                  formControlName="category"
                  class="form-control"
                  aria-required="true"
                >
                  <option [value]="null" disabled hidden>Select a category</option>
                  <option *ngFor="let category of categories; trackBy: trackByCategory" [value]="category.value">
                    {{ category.label }}
                  </option>
                </select>
                <div class="select-arrow">
                  <i class="fa fa-chevron-down"></i>
                </div>
                <div class="input-icon" *ngIf="categoryControl?.valid">
                  <i class="fa fa-check-circle"></i>
                </div>
              </div>
              <div
                class="error"
                *ngIf="categoryControl?.touched && categoryControl?.invalid"
                role="alert"
              >
                Please select a category.
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Target Amount & Current Amount -->
        <div class="row">
          <div class="col-12 col-md-6">
            <div class="form-group">
              <label for="targetAmount-{{ mode }}" class="required-field">Target Amount</label>
              <div class="input-wrapper amount-wrapper">
                <span class="currency-symbol">$</span>
                <input
                  id="targetAmount-{{ mode }}"
                  type="number"
                  formControlName="targetAmount"
                  placeholder="5000"
                  aria-required="true"
                  step="0.01"
                  min="1"
                />
                <div class="input-icon" *ngIf="targetAmountControl?.valid">
                  <i class="fa fa-check-circle"></i>
                </div>
              </div>
              <div
                class="error"
                *ngIf="targetAmountControl?.touched && targetAmountControl?.invalid"
                role="alert"
              >
                Please enter a valid target amount.
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="form-group">
              <label for="currentAmount-{{ mode }}" class="required-field">Current Amount</label>
              <div class="input-wrapper amount-wrapper">
                <span class="currency-symbol">$</span>
                <input
                  id="currentAmount-{{ mode }}"
                  type="number"
                  formControlName="currentAmount"
                  placeholder="1000"
                  aria-required="true"
                  step="0.01"
                  min="0"
                />
                <div class="input-icon" *ngIf="currentAmountControl?.valid">
                  <i class="fa fa-check-circle"></i>
                </div>
              </div>
              <div
                class="error"
                *ngIf="currentAmountControl?.touched && currentAmountControl?.invalid"
                role="alert"
              >
                Please enter a valid current amount.
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Deadline & Priority -->
        <div class="row">
          <div class="col-12 col-md-6">
            <div class="form-group">
              <label for="deadline-{{ mode }}" class="required-field">Deadline</label>
              <div class="input-wrapper date-wrapper">
                <input
                  id="deadline-{{ mode }}"
                  type="date"
                  formControlName="deadline"
                  aria-required="true"
                />
                <div class="input-icon" *ngIf="deadlineControl?.valid">
                  <i class="fa fa-check-circle"></i>
                </div>
              </div>
              <div
                class="error"
                *ngIf="deadlineControl?.touched && deadlineControl?.invalid"
                role="alert"
              >
                Please select a deadline.
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="form-group">
              <label for="priority-{{ mode }}" class="required-field">Priority</label>
              <div class="input-wrapper select-wrapper">
                <select
                  id="priority-{{ mode }}"
                  formControlName="priority"
                  class="form-control"
                  aria-required="true"
                >
                  <option [value]="null" disabled hidden>Select priority</option>
                  <option *ngFor="let priority of priorities; trackBy: trackByPriority" [value]="priority.value">
                    {{ priority.label }}
                  </option>
                </select>
                <div class="select-arrow">
                  <i class="fa fa-chevron-down"></i>
                </div>
                <div class="input-icon" *ngIf="priorityControl?.valid">
                  <i class="fa fa-check-circle"></i>
                </div>
              </div>
              <div
                class="error"
                *ngIf="priorityControl?.touched && priorityControl?.invalid"
                role="alert"
              >
                Please select a priority.
              </div>
            </div>
          </div>
        </div>

         <!-- Section: Action Buttons -->
         <div class="d-flex justify-content-end gap-3 mt-4">
           <button class="btn btn-secondary" type="button" (click)="cancel.emit()" aria-label="Cancel form submission">
             <i class="fa fa-times me-2"></i>Cancel
           </button>
          <button
            class="btn"
            [ngClass]="mode === 'add' ? 'btn-add' : 'btn-modify'"
            type="submit"
            [disabled]="formGroup.invalid"
          >
            <i class="fa" [ngClass]="mode === 'add' ? 'fa-plus' : 'fa-save'"></i>
            <span class="ms-2">{{ mode === 'add' ? 'Add' : 'Modify' }}</span>
          </button>
        </div>
      </form>
    </section>
  `,
  styleUrls: ['./saving-form.component.scss'],
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SavingFormComponent implements OnInit {
  @Input() formGroup!: FormGroup;
  @Input() mode: 'add' | 'edit' = 'add';
  @Input() categories: { label: string; value: string }[] = [];
  @Input() priorities: { label: string; value: string }[] = [];
  @Output() readonly formSubmit = new EventEmitter<void>();
  @Output() readonly cancel = new EventEmitter<void>();

  constructor() {
    // SEO fragment provided via META_FRAGMENT token
    // Parent component aggregates all fragments via SeoService
  }

  get nameControl() { return this.formGroup.get('name'); }
  get categoryControl() { return this.formGroup.get('category'); }
  get targetAmountControl() { return this.formGroup.get('targetAmount'); }
  get currentAmountControl() { return this.formGroup.get('currentAmount'); }
  get deadlineControl() { return this.formGroup.get('deadline'); }
  get priorityControl() { return this.formGroup.get('priority'); }

  ngOnInit(): void {
    if (this.mode === 'add' && !this.formGroup.get('deadline')?.value) {
      const today = new Date();
      const oneYearFromNow = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
      this.formGroup.get('deadline')?.setValue(oneYearFromNow.toISOString().split('T')[0]);
    }
  }

  onSubmit(): void {
    if (this.formGroup.valid) {
      this.formSubmit.emit();
    } else {
      this.formGroup.markAllAsTouched();
    }
  }

  trackByCategory(index: number, item: { label: string; value: string }) {
    return item.value;
  }

  trackByPriority(index: number, item: { label: string; value: string }) {
    return item.value;
  }
}
