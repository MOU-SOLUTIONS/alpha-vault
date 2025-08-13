import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Debt, DebtRequest } from '../../../models/debt.model';

@Component({
  selector: 'app-debt-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="debt-form-container">
      <div class="form-header">
        <h3>{{ isAddMode ? 'Add New Debt' : 'Edit Debt' }}</h3>
        <button type="button" class="close-btn" (click)="onCancel.emit()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <form [formGroup]="debtForm" (ngSubmit)="submitForm()" class="debt-form">
        <div class="form-row">
          <div class="form-group">
            <label for="creditorName">Creditor Name *</label>
            <input 
              type="text" 
              id="creditorName" 
              formControlName="creditorName"
              placeholder="Enter creditor name"
              class="form-control"
            >
            <div class="error-message" *ngIf="debtForm.get('creditorName')?.invalid && debtForm.get('creditorName')?.touched">
              Creditor name is required
            </div>
          </div>

          <div class="form-group">
            <label for="totalAmount">Total Amount *</label>
            <input 
              type="number" 
              id="totalAmount" 
              formControlName="totalAmount"
              placeholder="0.00"
              step="0.01"
              min="0"
              class="form-control"
            >
            <div class="error-message" *ngIf="debtForm.get('totalAmount')?.invalid && debtForm.get('totalAmount')?.touched">
              Valid total amount is required
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="remainingAmount">Remaining Amount *</label>
            <input 
              type="number" 
              id="remainingAmount" 
              formControlName="remainingAmount"
              placeholder="0.00"
              step="0.01"
              min="0"
              class="form-control"
            >
            <div class="error-message" *ngIf="debtForm.get('remainingAmount')?.invalid && debtForm.get('remainingAmount')?.touched">
              Valid remaining amount is required
            </div>
          </div>

          <div class="form-group">
            <label for="interestRate">Interest Rate (%)</label>
            <input 
              type="number" 
              id="interestRate" 
              formControlName="interestRate"
              placeholder="0.00"
              step="0.01"
              min="0"
              max="100"
              class="form-control"
            >
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="dueDate">Due Date *</label>
            <input 
              type="date" 
              id="dueDate" 
              formControlName="dueDate"
              class="form-control"
            >
            <div class="error-message" *ngIf="debtForm.get('dueDate')?.invalid && debtForm.get('dueDate')?.touched">
              Due date is required
            </div>
          </div>

          <div class="form-group">
            <label for="minPayment">Minimum Payment *</label>
            <input 
              type="number" 
              id="minPayment" 
              formControlName="minPayment"
              placeholder="0.00"
              step="0.01"
              min="0"
              class="form-control"
            >
            <div class="error-message" *ngIf="debtForm.get('minPayment')?.invalid && debtForm.get('minPayment')?.touched">
              Valid minimum payment is required
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" (click)="onCancel.emit()">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" [disabled]="debtForm.invalid">
            {{ isAddMode ? 'Add Debt' : 'Update Debt' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['./debt-form.component.scss']
})
export class DebtFormComponent implements OnInit {
  @Input() isVisible: boolean = false;
  @Input() isAddMode: boolean = true;
  @Input() debt: Debt | null = null;
  
  @Output() onSubmit = new EventEmitter<DebtRequest>();
  @Output() onCancel = new EventEmitter<void>();

  debtForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.debtForm = this.fb.group({
      creditorName: ['', [Validators.required, Validators.minLength(2)]],
      totalAmount: [0, [Validators.required, Validators.min(0)]],
      remainingAmount: [0, [Validators.required, Validators.min(0)]],
      interestRate: [0, [Validators.min(0), Validators.max(100)]],
      dueDate: ['', Validators.required],
      minPayment: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    if (this.debt && !this.isAddMode) {
      this.debtForm.patchValue({
        creditorName: this.debt.creditorName,
        totalAmount: this.debt.totalAmount,
        remainingAmount: this.debt.remainingAmount,
        interestRate: this.debt.interestRate,
        dueDate: this.debt.dueDate,
        minPayment: this.debt.minPayment
      });
    }
  }

  submitForm(): void {
    if (this.debtForm.valid) {
      const formValue = this.debtForm.value;
      const debtRequest: DebtRequest = {
        userId: 0, // Will be set by the service
        creditorName: formValue.creditorName,
        totalAmount: formValue.totalAmount,
        remainingAmount: formValue.remainingAmount,
        interestRate: formValue.interestRate,
        dueDate: formValue.dueDate,
        minPayment: formValue.minPayment
      };
      
      this.onSubmit.emit(debtRequest);
    }
  }
}
