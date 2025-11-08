/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component IncomeFormComponent
  @description Form component for adding and editing income records
*/

import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, EventEmitter, inject, Input, OnInit, Output, PLATFORM_ID } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
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
                  (keydown.enter)="onFieldKeydown($event, 'source')"
                  (keydown.escape)="onEscapeKey()"
                />
                <div class="input-icon" *ngIf="sourceValid()">
                  <i class="fa fa-check-circle" aria-hidden="true"></i>
                </div>
              </div>
              <div
                class="error"
                *ngIf="sourceError()"
                role="alert"
                aria-live="polite"
              >
                Please enter a source.
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="form-group">
              <label for="incomeAmount-{{ mode }}" class="required-field">Amount</label>
              <div class="input-wrapper amount-wrapper">
                <span class="currency-symbol" aria-hidden="true">$</span>
                <input
                  id="incomeAmount-{{ mode }}"
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
              <label for="incomeMethod-{{ mode }}" class="required-field">Payment Method</label>
              <div class="input-wrapper select-wrapper">
                <select
                  id="incomeMethod-{{ mode }}"
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
              <label for="incomeDate-{{ mode }}" class="required-field">Date</label>
              <div class="input-wrapper date-wrapper">
                <input
                  id="incomeDate-{{ mode }}"
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
              <label for="incomeDescription-{{ mode }}">Description</label>
              <div class="input-wrapper">
                <textarea
                  id="incomeDescription-{{ mode }}"
                  rows="3"
                  formControlName="description"
                  placeholder="Optional note about this income..."
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

        <!-- Section: Is Received Checkbox -->
        <div class="form-check mt-3 d-flex align-items-center">
          <div class="custom-checkbox">
            <input
              type="checkbox"
              id="isReceived-{{ mode }}"
              class="form-check-input"
              formControlName="isReceived"
              (keydown.enter)="onFieldKeydown($event, 'isReceived')"
              (keydown.space)="onFieldKeydown($event, 'isReceived')"
            />
            <span class="checkmark" aria-hidden="true"></span>
          </div>
          <label for="isReceived-{{ mode }}" class="form-check-label">
            Income Received
          </label>
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
            [attr.aria-label]="mode === 'add' ? 'Add income record' : 'Modify income record'"
          >
            <i class="fa" [ngClass]="mode === 'add' ? 'fa-plus' : 'fa-save'" aria-hidden="true"></i>
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

  // SSR guard for browser-only APIs
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  // Computed validation states
  readonly sourceValid = computed(() => this.formGroup.get('source')?.valid ?? false);
  readonly sourceError = computed(() => 
    this.formGroup.get('source')?.touched && this.formGroup.get('source')?.invalid
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

  onFieldKeydown(event: Event, fieldName: string): void {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      event.preventDefault();
      // Move to next field or submit
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
    
    const fieldOrder = ['source', 'amount', 'paymentMethod', 'date', 'description', 'isReceived'];
    const currentIndex = fieldOrder.indexOf(currentField);
    const nextField = fieldOrder[currentIndex + 1];
    
    if (nextField) {
      const nextElement = document.getElementById(`income${nextField.charAt(0).toUpperCase() + nextField.slice(1)}-${this.mode}`);
      nextElement?.focus();
    } else {
      // Focus submit button
      const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      submitButton?.focus();
    }
  }

  trackByMethod = (index: number, item: { label: string; value: string }) => item.value;
}
