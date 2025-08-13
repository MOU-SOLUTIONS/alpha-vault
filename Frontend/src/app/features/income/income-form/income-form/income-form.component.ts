// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Meta } from '@angular/platform-browser';

@Component({
  standalone: true,
  selector: 'app-income-form',
  template: `
    <!-- Section: Income Form -->
    <section>
      <form
        [formGroup]="formGroup"
        (ngSubmit)="onSubmit()"
        class="income-form"
        role="form"
        aria-labelledby="incomeFormTitle"
      >
        <p class="form-text">
          {{ mode === 'add'
            ? 'Please add the details of the new income.'
            : 'Please update the details of the income record below.' }}
        </p>

        <!-- Section: Source & Amount -->
        <div class="row">
          <div class="col-12 col-md-6">
            <div class="form-group">
              <label for="incomeSource-{{ mode }}" class="required-field">Source</label>
              <div class="input-wrapper">
                <input
                  id="incomeSource-{{ mode }}"
                  type="text"
                  formControlName="source"
                  placeholder="Freelance, Salary..."
                  aria-required="true"
                />
                <div class="input-icon" *ngIf="formGroup.get('source')?.valid">
                  <i class="fa fa-check-circle"></i>
                </div>
              </div>
              <div
                class="error"
                *ngIf="formGroup.get('source')?.touched && formGroup.get('source')?.invalid"
                role="alert"
              >
                Please enter a source.
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="form-group">
              <label for="incomeAmount-{{ mode }}" class="required-field">Amount</label>
              <div class="input-wrapper amount-wrapper">
                <span class="currency-symbol">$</span>
                <input
                  id="incomeAmount-{{ mode }}"
                  type="number"
                  formControlName="amount"
                  placeholder="1000"
                  aria-required="true"
                  step="0.01"
                  min="0"
                />
                <div class="input-icon" *ngIf="formGroup.get('amount')?.valid">
                  <i class="fa fa-check-circle"></i>
                </div>
              </div>
              <div
                class="error"
                *ngIf="formGroup.get('amount')?.touched && formGroup.get('amount')?.invalid"
                role="alert"
              >
                Please enter a valid amount.
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Payment Method & Date -->
        <div class="row">
          <div class="col-12 col-md-6">
            <div class="form-group">
              <label for="incomeMethod-{{ mode }}" class="required-field">Payment Method</label>
              <div class="input-wrapper select-wrapper">
                <select
                  id="incomeMethod-{{ mode }}"
                  formControlName="paymentMethod"
                  class="form-control"
                  aria-required="true"
                >
                  <option [value]="null" disabled hidden>Select a method</option>
                  <option *ngFor="let method of paymentMethods; trackBy: trackByMethod" [value]="method.value">
                    {{ method.label }}
                  </option>
                </select>
                <div class="select-arrow">
                  <i class="fa fa-chevron-down"></i>
                </div>
                <div class="input-icon" *ngIf="formGroup.get('paymentMethod')?.valid">
                  <i class="fa fa-check-circle"></i>
                </div>
              </div>
              <div
                class="error"
                *ngIf="formGroup.get('paymentMethod')?.touched && formGroup.get('paymentMethod')?.invalid"
                role="alert"
              >
                Please select a method.
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="form-group">
              <label for="incomeDate-{{ mode }}" class="required-field">Date</label>
              <div class="input-wrapper date-wrapper">
                <input
                  id="incomeDate-{{ mode }}"
                  type="date"
                  formControlName="date"
                  aria-required="true"
                />
                <div class="input-icon" *ngIf="formGroup.get('date')?.valid">
                  <i class="fa fa-check-circle"></i>
                </div>
              </div>
              <div
                class="error"
                *ngIf="formGroup.get('date')?.touched && formGroup.get('date')?.invalid"
                role="alert"
              >
                Please select a date.
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Description -->
        <div class="row">
          <div class="col-12">
            <div class="form-group">
              <label for="incomeDescription-{{ mode }}">Description</label>
              <div class="input-wrapper">
                <textarea
                  id="incomeDescription-{{ mode }}"
                  rows="3"
                  formControlName="description"
                  placeholder="Optional note about this income..."
                ></textarea>
                <div class="input-icon" *ngIf="formGroup.get('description')?.value">
                  <i class="fa fa-check-circle"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Is Received Checkbox -->
        <div class="form-check mt-3 d-flex align-items-center">
          <div class="custom-checkbox">
            <input
              type="checkbox"
              id="isReceived-{{ mode }}"
              class="form-check-input"
              formControlName="isReceived"
            />
            <span class="checkmark"></span>
          </div>
          <label for="isReceived-{{ mode }}" class="form-check-label">
            Income Received
          </label>
        </div>

        <!-- Section: Action Buttons -->
        <div class="d-flex justify-content-end gap-3 mt-4">
          <button class="btn btn-secondary" type="button" (click)="cancel.emit()">
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
  styleUrls: ['./income-form.component.scss'],
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomeFormComponent implements OnInit {
  @Input() formGroup!: FormGroup;
  @Input() mode: 'add' | 'edit' = 'add';
  @Input() paymentMethods: { label: string; value: string }[] = [];
  @Output() formSubmit = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  constructor(private meta: Meta) {
    this.meta.addTags([
      { name: 'description', content: 'Add or modify an income record in Alpha Vault. Secure, accessible, and efficient.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ]);
  }

  ngOnInit(): void {
    if (this.mode === 'add' && !this.formGroup.get('date')?.value) {
      const today = new Date().toISOString().split('T')[0];
      this.formGroup.get('date')?.setValue(today);
    }
    if (this.mode === 'add' && this.formGroup.get('isReceived')?.value === undefined) {
      this.formGroup.get('isReceived')?.setValue(true);
    }
  }

  onSubmit(): void {
    if (this.formGroup.valid) {
      this.formSubmit.emit();
    } else {
      this.formGroup.markAllAsTouched();
    }
  }

  trackByMethod(index: number, item: { label: string; value: string }) {
    return item.value;
  }
}
