/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component DebtFormComponent
  @description Main debt dashboard component for managing debt form
*/

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { META_FRAGMENT } from '../../../core/seo/page-meta.model';

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
        [attr.aria-label]="mode === 'add' ? 'Add new debt form' : 'Modify debt form'"
      >
        <h2 id="debtFormTitle" class="visually-hidden">
          {{ mode === 'add' ? 'Add New Debt' : 'Modify Debt' }}
        </h2>
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
                  [attr.aria-describedby]="formGroup.get('creditorName')?.invalid && formGroup.get('creditorName')?.touched ? 'debtCreditor-error-' + mode : null"
                  [attr.aria-invalid]="formGroup.get('creditorName')?.invalid && formGroup.get('creditorName')?.touched"
                />
                <div class="input-icon" *ngIf="formGroup.get('creditorName')?.valid" aria-hidden="true">
                  <i class="fa fa-check-circle"></i>
                </div>
              </div>
              <div
                id="debtCreditor-error-{{ mode }}"
                class="error"
                *ngIf="formGroup.get('creditorName')?.touched && formGroup.get('creditorName')?.invalid"
                role="alert"
              >
                <span aria-hidden="true">⚠️</span>
                <span>Please enter a creditor name.</span>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="form-group">
              <label for="debtPrincipalAmount-{{ mode }}" class="required-field">Principal Amount</label>
              <div class="input-wrapper amount-wrapper">
                <span class="currency-symbol">$</span>
                <input
                  id="debtPrincipalAmount-{{ mode }}"
                  type="number"
                  formControlName="principalAmount"
                  placeholder="1000"
                  aria-required="true"
                  step="0.0001"
                  min="0.01"
                  [attr.aria-describedby]="formGroup.get('principalAmount')?.invalid && formGroup.get('principalAmount')?.touched ? 'debtPrincipalAmount-error-' + mode : null"
                  [attr.aria-invalid]="formGroup.get('principalAmount')?.invalid && formGroup.get('principalAmount')?.touched"
                />
                <div class="input-icon" *ngIf="formGroup.get('principalAmount')?.valid" aria-hidden="true">
                  <i class="fa fa-check-circle"></i>
                </div>
              </div>
              <div
                id="debtPrincipalAmount-error-{{ mode }}"
                class="error"
                *ngIf="formGroup.get('principalAmount')?.touched && formGroup.get('principalAmount')?.invalid"
                role="alert"
              >
                <span aria-hidden="true">⚠️</span>
                <span>Please enter a valid principal amount.</span>
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
                  [attr.aria-describedby]="formGroup.get('remainingAmount')?.invalid && formGroup.get('remainingAmount')?.touched ? 'debtRemainingAmount-error-' + mode : null"
                  [attr.aria-invalid]="formGroup.get('remainingAmount')?.invalid && formGroup.get('remainingAmount')?.touched"
                />
                <div class="input-icon" *ngIf="formGroup.get('remainingAmount')?.valid" aria-hidden="true">
                  <i class="fa fa-check-circle"></i>
                </div>
              </div>
              <div
                id="debtRemainingAmount-error-{{ mode }}"
                class="error"
                *ngIf="formGroup.get('remainingAmount')?.touched && formGroup.get('remainingAmount')?.invalid"
                role="alert"
              >
                <span aria-hidden="true">⚠️</span>
                <span>Please enter a valid remaining amount.</span>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="form-group">
              <label for="debtInterestRateApr-{{ mode }}">Interest Rate APR (%)</label>
              <div class="input-wrapper">
                <input
                  id="debtInterestRateApr-{{ mode }}"
                  type="number"
                  formControlName="interestRateApr"
                  placeholder="5.9999"
                  step="0.0001"
                  min="0"
                  max="999.9999"
                  [attr.aria-describedby]="formGroup.get('interestRateApr')?.invalid && formGroup.get('interestRateApr')?.touched ? 'debtInterestRateApr-error-' + mode : null"
                  [attr.aria-invalid]="formGroup.get('interestRateApr')?.invalid && formGroup.get('interestRateApr')?.touched"
                />
                <div class="input-icon" *ngIf="formGroup.get('interestRateApr')?.valid" aria-hidden="true">
                  <i class="fa fa-check-circle"></i>
                </div>
              </div>
              <div
                id="debtInterestRateApr-error-{{ mode }}"
                class="error"
                *ngIf="formGroup.get('interestRateApr')?.touched && formGroup.get('interestRateApr')?.invalid"
                role="alert"
              >
                <span aria-hidden="true">⚠️</span>
                <span>Please enter a valid interest rate APR (0-999.9999%).</span>
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
                  [attr.aria-describedby]="formGroup.get('dueDate')?.invalid && formGroup.get('dueDate')?.touched ? 'debtDueDate-error-' + mode : null"
                  [attr.aria-invalid]="formGroup.get('dueDate')?.invalid && formGroup.get('dueDate')?.touched"
                />
                <div class="input-icon" *ngIf="formGroup.get('dueDate')?.valid" aria-hidden="true">
                  <i class="fa fa-check-circle"></i>
                </div>
              </div>
              <div
                id="debtDueDate-error-{{ mode }}"
                class="error"
                *ngIf="formGroup.get('dueDate')?.touched && formGroup.get('dueDate')?.invalid"
                role="alert"
              >
                <span aria-hidden="true">⚠️</span>
                <span>Please select a due date.</span>
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
                  [attr.aria-describedby]="formGroup.get('minPayment')?.invalid && formGroup.get('minPayment')?.touched ? 'debtMinPayment-error-' + mode : null"
                  [attr.aria-invalid]="formGroup.get('minPayment')?.invalid && formGroup.get('minPayment')?.touched"
                />
                <div class="input-icon" *ngIf="formGroup.get('minPayment')?.valid" aria-hidden="true">
                  <i class="fa fa-check-circle"></i>
                </div>
              </div>
              <div
                id="debtMinPayment-error-{{ mode }}"
                class="error"
                *ngIf="formGroup.get('minPayment')?.touched && formGroup.get('minPayment')?.invalid"
                role="alert"
              >
                <span aria-hidden="true">⚠️</span>
                <span>Please enter a valid minimum payment.</span>
              </div>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-end gap-3 mt-4">
          <button 
            class="btn btn-secondary" 
            type="button" 
            (click)="cancel.emit()"
            (keydown.enter)="cancel.emit()"
            (keydown.space)="cancel.emit(); $event.preventDefault()"
            aria-label="Cancel form">
            <i class="fa fa-times me-2" aria-hidden="true"></i>Cancel
          </button>
          <button
            class="btn"
            [ngClass]="mode === 'add' ? 'btn-add' : 'btn-modify'"
            type="submit"
            [disabled]="formGroup.invalid"
            (keydown.enter)="onSubmit()"
            (keydown.space)="onSubmit(); $event.preventDefault()"
            [attr.aria-label]="mode === 'add' ? 'Add new debt' : 'Modify debt'">
            <i class="fa" [ngClass]="mode === 'add' ? 'fa-plus' : 'fa-save'" aria-hidden="true"></i>
            <span class="ms-2">{{ mode === 'add' ? 'Add' : 'Modify' }}</span>
          </button>
        </div>
      </form>
    </section>
  `,
  styleUrls: ['./debt-form.component.scss'],
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: META_FRAGMENT,
      useValue: {
        description: 'Add or modify a debt record in Alpha Vault. Secure, accessible, and efficient debt management.'
      }
    }
  ],
})
export class DebtFormComponent implements OnInit {
  @Input() formGroup!: FormGroup;
  @Input() mode: 'add' | 'edit' = 'add';

  @Output() formSubmit = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

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
