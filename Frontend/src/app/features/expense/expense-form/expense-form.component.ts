// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { PAYMENT_METHOD_OPTIONS } from '../../../enums/payment-method';
import { EXPENSE_CATEGORY_OPTIONS } from '../../../enums/expense-category';

@Component({
  standalone: true,
  selector: 'app-expense-form',
  template: `
    <!-- Section: Expense Form -->
    <section>
      <form
        [formGroup]="formGroup"
        (ngSubmit)="onSubmit()"
        class="expense-form"
        role="form"
        aria-labelledby="expenseFormTitle"
      >
        <p class="form-text">
          {{ mode === 'add'
            ? 'Please add the details of the new expense.'
            : 'Please update the details of the expense record below.' }}
        </p>

        <!-- Section: Category & Amount -->
        <div class="row">
          <div class="col-12 col-md-6">
            <div class="form-group">
              <label for="expenseCategory-{{ mode }}" class="required-field">Category</label>
              <div class="input-wrapper select-wrapper">
                <select
                  id="expenseCategory-{{ mode }}"
                  formControlName="category"
                  class="form-control"
                  aria-required="true"
                >
                  <option [value]="null" disabled hidden>Select a category</option>
                  <option *ngFor="let cat of expenseCategories; trackBy: trackByCategory" [value]="cat.value">
                    {{ cat.label }}
                  </option>
                </select>
                <div class="select-arrow">
                  <i class="fa fa-chevron-down"></i>
                </div>
                <div class="input-icon" *ngIf="formGroup.get('category')?.valid">
                  <i class="fa fa-check-circle"></i>
                </div>
              </div>
              <div
                class="error"
                *ngIf="formGroup.get('category')?.touched && formGroup.get('category')?.invalid"
                role="alert"
              >
                Please select a category.
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="form-group">
              <label for="expenseAmount-{{ mode }}" class="required-field">Amount</label>
              <div class="input-wrapper amount-wrapper">
                <span class="currency-symbol">$</span>
                <input
                  id="expenseAmount-{{ mode }}"
                  type="number"
                  formControlName="amount"
                  placeholder="100"
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
              <label for="expenseMethod-{{ mode }}" class="required-field">Payment Method</label>
              <div class="input-wrapper select-wrapper">
                <select
                  id="expenseMethod-{{ mode }}"
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
              <label for="expenseDate-{{ mode }}" class="required-field">Date</label>
              <div class="input-wrapper date-wrapper">
                <input
                  id="expenseDate-{{ mode }}"
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
              <label for="expenseDescription-{{ mode }}">Description</label>
              <div class="input-wrapper">
                <textarea
                  id="expenseDescription-{{ mode }}"
                  rows="3"
                  formControlName="description"
                  placeholder="Optional note about this expense..."
                ></textarea>
                <div class="input-icon" *ngIf="formGroup.get('description')?.value">
                  <i class="fa fa-check-circle"></i>
                </div>
              </div>
            </div>
          </div>
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
  styleUrls: ['./expense-form.component.scss'],
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseFormComponent implements OnInit {
  @Input() formGroup!: FormGroup;
  @Input() mode: 'add' | 'modify' = 'add';
  @Output() formSubmit = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  expenseCategories = EXPENSE_CATEGORY_OPTIONS;
  paymentMethods = PAYMENT_METHOD_OPTIONS;

  constructor(private title: Title, private meta: Meta) {
    this.title.setTitle('Expense Form | Alpha Vault');
    this.meta.addTags([
      { name: 'description', content: 'Add or modify an expense record in Alpha Vault. Secure, accessible, and efficient.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ]);
  }

  ngOnInit(): void {
    if (this.mode === 'add' && !this.formGroup.get('date')?.value) {
      const today = new Date().toISOString().split('T')[0];
      this.formGroup.get('date')?.setValue(today);
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

  trackByMethod(index: number, item: { label: string; value: string }) {
    return item.value;
  }
}
