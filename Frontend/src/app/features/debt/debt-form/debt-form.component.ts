// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Meta } from '@angular/platform-browser';

@Component({
  standalone: true,
  selector: 'app-debt-form',
  template: `
    <section>
      <form
        [formGroup]="formGroup"
        (ngSubmit)="onSubmit()"
        class="debt-form"
        role="form"
        aria-labelledby="debtFormTitle"
      >
        <p class="form-text">
          {{ mode === 'add'
            ? 'Please add the details of the new debt.'
            : 'Please update the details of the debt record below.' }}
        </p>

        <div class="row">
          <div class="col-12 col-md-6">
            <div class="form-group">
              <label for="debtCreditor-{{ mode }}" class="required-field">Creditor Name</label>
              <div class="input-wrapper">
                <input
                  id="debtCreditor-{{ mode }}"
                  type="text"
                  formControlName="creditorName"
                  placeholder="Bank, Credit Card..."
                  aria-required="true"
                />
                <div class="input-icon" *ngIf="formGroup.get('creditorName')?.valid">
                  <i class="fa fa-check-circle"></i>
                </div>
              </div>
              <div
                class="error"
                *ngIf="formGroup.get('creditorName')?.touched && formGroup.get('creditorName')?.invalid"
                role="alert"
              >
                Please enter a creditor name.
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="form-group">
              <label for="debtTotalAmount-{{ mode }}" class="required-field">Total Amount</label>
              <div class="input-wrapper amount-wrapper">
                <span class="currency-symbol">$</span>
                <input
                  id="debtTotalAmount-{{ mode }}"
                  type="number"
                  formControlName="totalAmount"
                  placeholder="1000"
                  aria-required="true"
                  step="0.01"
                  min="0"
                />
                <div class="input-icon" *ngIf="formGroup.get('totalAmount')?.valid">
                  <i class="fa fa-check-circle"></i>
                </div>
              </div>
              <div
                class="error"
                *ngIf="formGroup.get('totalAmount')?.touched && formGroup.get('totalAmount')?.invalid"
                role="alert"
              >
                Please enter a valid total amount.
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-12 col-md-6">
            <div class="form-group">
              <label for="debtRemainingAmount-{{ mode }}" class="required-field">Remaining Amount</label>
              <div class="input-wrapper amount-wrapper">
                <span class="currency-symbol">$</span>
                <input
                  id="debtRemainingAmount-{{ mode }}"
                  type="number"
                  formControlName="remainingAmount"
                  placeholder="750"
                  aria-required="true"
                  step="0.01"
                  min="0"
                />
                <div class="input-icon" *ngIf="formGroup.get('remainingAmount')?.valid">
                  <i class="fa fa-check-circle"></i>
                </div>
              </div>
              <div
                class="error"
                *ngIf="formGroup.get('remainingAmount')?.touched && formGroup.get('remainingAmount')?.invalid"
                role="alert"
              >
                Please enter a valid remaining amount.
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="form-group">
              <label for="debtInterestRate-{{ mode }}">Interest Rate (%)</label>
              <div class="input-wrapper">
                <input
                  id="debtInterestRate-{{ mode }}"
                  type="number"
                  formControlName="interestRate"
                  placeholder="5.99"
                  step="0.01"
                  min="0"
                  max="100"
                />
                <div class="input-icon" *ngIf="formGroup.get('interestRate')?.valid">
                  <i class="fa fa-check-circle"></i>
                </div>
              </div>
              <div
                class="error"
                *ngIf="formGroup.get('interestRate')?.touched && formGroup.get('interestRate')?.invalid"
                role="alert"
              >
                Please enter a valid interest rate (0-100%).
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-12 col-md-6">
            <div class="form-group">
              <label for="debtDueDate-{{ mode }}" class="required-field">Due Date</label>
              <div class="input-wrapper date-wrapper">
                <input
                  id="debtDueDate-{{ mode }}"
                  type="date"
                  formControlName="dueDate"
                  aria-required="true"
                />
                <div class="input-icon" *ngIf="formGroup.get('dueDate')?.valid">
                  <i class="fa fa-check-circle"></i>
                </div>
              </div>
              <div
                class="error"
                *ngIf="formGroup.get('dueDate')?.touched && formGroup.get('dueDate')?.invalid"
                role="alert"
              >
                Please select a due date.
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="form-group">
              <label for="debtMinPayment-{{ mode }}" class="required-field">Minimum Payment</label>
              <div class="input-wrapper amount-wrapper">
                <span class="currency-symbol">$</span>
                <input
                  id="debtMinPayment-{{ mode }}"
                  type="number"
                  formControlName="minPayment"
                  placeholder="25"
                  aria-required="true"
                  step="0.01"
                  min="0"
                />
                <div class="input-icon" *ngIf="formGroup.get('minPayment')?.valid">
                  <i class="fa fa-check-circle"></i>
                </div>
              </div>
              <div
                class="error"
                *ngIf="formGroup.get('minPayment')?.touched && formGroup.get('minPayment')?.invalid"
                role="alert"
              >
                Please enter a valid minimum payment.
              </div>
            </div>
          </div>
        </div>

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
  styleUrls: ['./debt-form.component.scss'],
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DebtFormComponent implements OnInit {
  @Input() formGroup!: FormGroup;
  @Input() mode: 'add' | 'edit' = 'add';

  @Output() formSubmit = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  constructor(
    private meta: Meta,
  ) {
    this.meta.addTags([
      { name: 'description', content: 'Add or modify a debt record in Alpha Vault. Secure, accessible, and efficient debt management.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ]);
  }

  ngOnInit(): void {
    if (this.mode === 'add' && !this.formGroup.get('dueDate')?.value) {
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
      const nextMonthStr = nextMonth.toISOString().split('T')[0];
      this.formGroup.get('dueDate')?.setValue(nextMonthStr);
    }
  }

  onSubmit(): void {
    if (this.formGroup.valid) {
      this.formSubmit.emit();
    } else {
      this.formGroup.markAllAsTouched();
    }
  }
}
