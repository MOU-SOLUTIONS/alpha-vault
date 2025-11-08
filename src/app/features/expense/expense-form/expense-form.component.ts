/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseFormComponent
  @description Form component for adding and editing expense records
*/

import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, EventEmitter, inject, Input, OnInit, Output, PLATFORM_ID } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Meta } from '@angular/platform-browser';

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
              <div class="input-wrapper">
                <select
                  id="expenseCategory-{{ mode }}"
                  formControlName="category"
                  aria-required="true"
                  (keydown.enter)="onFieldKeydown($event, 'category')"
                  (keydown.escape)="onEscapeKey()"
                >
                  <option value="" disabled>Select a category...</option>
                  <option *ngFor="let category of expenseCategories" [value]="category.value">
                    {{ category.label }}
                  </option>
                </select>
                <div class="input-icon" *ngIf="categoryValid()">
                  <i class="fa fa-check-circle" aria-hidden="true"></i>
                </div>
              </div>
              <div
                class="error"
                *ngIf="categoryError()"
                role="alert"
                aria-live="polite"
              >
                Please select a category.
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="form-group">
              <label for="expenseAmount-{{ mode }}" class="required-field">Amount</label>
              <div class="input-wrapper amount-wrapper">
                <span class="currency-symbol" aria-hidden="true">$</span>
                <input
                  id="expenseAmount-{{ mode }}"
                  type="number"
                  formControlName="amount"
                  placeholder="1000"
                  aria-required="true"
                  step="0.01"
                  min="0"
                  (keydown.enter)="onFieldKeydown($event, 'amount')"
                  (keydown.escape)="onEscapeKey()"
                />
                <div class="input-icon" *ngIf="amountValid()">
                  <i class="fa fa-check-circle" aria-hidden="true"></i>
                </div>
              </div>
              <div
                class="error"
                *ngIf="amountError()"
                role="alert"
                aria-live="polite"
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
                  (keydown.enter)="onFieldKeydown($event, 'paymentMethod')"
                  (keydown.escape)="onEscapeKey()"
                >
                  <option [value]="null" disabled hidden>Select a method</option>
                  <option *ngFor="let method of paymentMethods; trackBy: trackByMethod" [value]="method.value">
                    {{ method.label }}
                  </option>
                </select>
                <div class="select-arrow" aria-hidden="true">
                  <i class="fa fa-chevron-down"></i>
                </div>
                <div class="input-icon" *ngIf="paymentMethodValid()">
                  <i class="fa fa-check-circle" aria-hidden="true"></i>
                </div>
              </div>
              <div
                class="error"
                *ngIf="paymentMethodError()"
                role="alert"
                aria-live="polite"
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
                  (keydown.enter)="onFieldKeydown($event, 'date')"
                  (keydown.escape)="onEscapeKey()"
                />
                <div class="input-icon" *ngIf="dateValid()">
                  <i class="fa fa-check-circle" aria-hidden="true"></i>
                </div>
              </div>
              <div
                class="error"
                *ngIf="dateError()"
                role="alert"
                aria-live="polite"
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
                  (keydown.enter)="onFieldKeydown($event, 'description')"
                  (keydown.escape)="onEscapeKey()"
                ></textarea>
                <div class="input-icon" *ngIf="descriptionHasValue()">
                  <i class="fa fa-check-circle" aria-hidden="true"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Action Buttons -->
        <div class="d-flex justify-content-end gap-3 mt-4">
          <button 
            class="btn btn-secondary" 
            type="button" 
            (click)="cancel.emit()"
            (keydown.enter)="cancel.emit()"
            (keydown.space)="cancel.emit()"
            aria-label="Cancel form submission"
          >
            <i class="fa fa-times me-2" aria-hidden="true"></i>Cancel
          </button>
          <button
            class="btn"
            [ngClass]="mode === 'add' ? 'btn-add' : 'btn-modify'"
            type="submit"
            [disabled]="formGroup.invalid"
            [attr.aria-label]="mode === 'add' ? 'Add expense record' : 'Modify expense record'"
          >
            <i class="fa" [ngClass]="mode === 'add' ? 'fa-plus' : 'fa-save'" aria-hidden="true"></i>
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
  @Input() mode: 'add' | 'edit' = 'add';
  @Input() paymentMethods: { label: string; value: string }[] = [];
  @Input() expenseCategories: { label: string; value: string }[] = [];
  @Output() formSubmit = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  // SSR guard for browser-only APIs
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  // Computed validation states
  readonly categoryValid = computed(() => this.formGroup.get('category')?.valid ?? false);
  readonly categoryError = computed(() => 
    this.formGroup.get('category')?.touched && this.formGroup.get('category')?.invalid
  );
  readonly amountValid = computed(() => this.formGroup.get('amount')?.valid ?? false);
  readonly amountError = computed(() => 
    this.formGroup.get('amount')?.touched && this.formGroup.get('amount')?.invalid
  );
  readonly paymentMethodValid = computed(() => this.formGroup.get('paymentMethod')?.valid ?? false);
  readonly paymentMethodError = computed(() => 
    this.formGroup.get('paymentMethod')?.touched && this.formGroup.get('paymentMethod')?.invalid
  );
  readonly dateValid = computed(() => this.formGroup.get('date')?.valid ?? false);
  readonly dateError = computed(() => 
    this.formGroup.get('date')?.touched && this.formGroup.get('date')?.invalid
  );
  readonly descriptionHasValue = computed(() => !!this.formGroup.get('description')?.value);

  constructor(private meta: Meta) {
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

  onFieldKeydown(event: Event, fieldName: string): void {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      event.preventDefault();
      this.focusNextField(fieldName);
    }
  }

  onEscapeKey(): void {
    this.cancel.emit();
  }

  /**
   * Focuses the next form field for keyboard navigation
   * Uses document.getElementById for form focus management (acceptable with SSR guard)
   */
  private focusNextField(currentField: string): void {
    if (!this.isBrowser) return; // SSR guard
    
    const fieldOrder = ['category', 'amount', 'paymentMethod', 'date', 'description'];
    const currentIndex = fieldOrder.indexOf(currentField);
    const nextField = fieldOrder[currentIndex + 1];
    
    if (nextField) {
      const nextElement = document.getElementById(`expense${nextField.charAt(0).toUpperCase() + nextField.slice(1)}-${this.mode}`);
      nextElement?.focus();
    } else {
      const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      submitButton?.focus();
    }
  }

  trackByMethod = (index: number, item: { label: string; value: string }) => item.value;
}