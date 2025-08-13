// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Meta } from '@angular/platform-browser';

import { BudgetCategory } from '../../../models/budget.model';
import { EXPENSE_CATEGORY_OPTIONS } from '../../../enums/expense-category';

@Component({
  standalone: true,
  selector: 'app-budget-form',
  template: `
    <!-- Section: Budget Form -->
    <section>
      <form
        [formGroup]="formGroup"
        (ngSubmit)="onSubmit()"
        class="budget-form"
        role="form"
        aria-labelledby="budgetFormTitle"
      >
        <p class="form-text">
          {{ mode === 'add'
            ? 'Please add the details of the new budget allocation.'
            : mode === 'modify'
            ? 'Please update the details of the budget allocation below.'
            : 'Are you sure you want to delete this budget allocation?' }}
        </p>

        <!-- Section: Category & Amount -->
        <div class="row" *ngIf="mode !== 'delete'">
          <div class="col-12 col-md-6">
            <div class="form-group">
              <label for="budgetCategory-{{ mode }}" class="required-field">Category</label>
              <div class="input-wrapper select-wrapper">
                <select
                  id="budgetCategory-{{ mode }}"
                  formControlName="category"
                  class="form-control"
                  aria-required="true"
                >
                  <option [value]="null" disabled hidden>Select a category</option>
                  <option *ngFor="let cat of filteredCategories; trackBy: trackByCategory" [value]="cat.value">
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
              <label for="budgetAmount-{{ mode }}" class="required-field">Allocated Amount</label>
              <div class="input-wrapper amount-wrapper">
                <span class="currency-symbol">$</span>
                <input
                  id="budgetAmount-{{ mode }}"
                  type="number"
                  formControlName="allocated"
                  placeholder="1000"
                  aria-required="true"
                  step="0.01"
                  min="0.01"
                />
                <div class="input-icon" *ngIf="formGroup.get('allocated')?.valid">
                  <i class="fa fa-check-circle"></i>
                </div>
              </div>
              <div
                class="error"
                *ngIf="formGroup.get('allocated')?.touched && formGroup.get('allocated')?.invalid"
                role="alert"
              >
                Please enter a valid amount.
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Delete Confirmation -->
        <div class="delete-confirmation" *ngIf="mode === 'delete'">
          <div class="confirmation-content">
            <div class="confirmation-icon">
              <i class="fa fa-exclamation-triangle"></i>
            </div>
            <div class="confirmation-details">
              <p class="confirmation-text">
                You are about to delete the budget allocation for:
              </p>
              <div class="budget-details">
                <span class="category-name">{{ initialData?.category }}</span>
                <span class="amount-value">{{ initialData?.allocated | currency:'USD':'symbol':'1.0-0' }}</span>
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
            [ngClass]="'btn-' + submitButtonColor"
            type="submit"
            [disabled]="mode !== 'delete' && formGroup.invalid"
          >
            <i class="fa" [ngClass]="getButtonIcon()"></i>
            <span class="ms-2">{{ submitButtonText }}</span>
          </button>
        </div>
      </form>
    </section>
  `,
  styleUrls: ['./budget-form.component.scss'],
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetFormComponent implements OnInit {
  @Input() mode: 'add' | 'modify' | 'delete' = 'add';
  @Input() alreadyUsedCategories: string[] = [];
  @Input() initialData: Partial<BudgetCategory> | null = null;
  @Output() formSubmit = new EventEmitter<Partial<BudgetCategory>>();
  @Output() cancel = new EventEmitter<void>();

  formGroup!: FormGroup;
  expenseCategories = EXPENSE_CATEGORY_OPTIONS;

  constructor(
    private fb: FormBuilder,
    private meta: Meta
  ) {
    this.meta.addTags([
      { name: 'description', content: 'Add or modify a budget allocation in Alpha Vault. Secure, accessible, and efficient.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ]);
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  get filteredCategories() {
    return this.expenseCategories.filter(
      (cat) => !this.alreadyUsedCategories.includes(cat.value)
    );
  }

  get submitButtonText(): string {
    switch (this.mode) {
      case 'add': return 'Add';
      case 'modify': return 'Modify';
      case 'delete': return 'Delete';
      default: return 'Submit';
    }
  }

  get submitButtonColor(): string {
    switch (this.mode) {
      case 'add': return 'add';
      case 'modify': return 'modify';
      case 'delete': return 'delete';
      default: return 'add';
    }
  }

  getButtonIcon(): string {
    switch (this.mode) {
      case 'add': return 'fa-plus';
      case 'modify': return 'fa-save';
      case 'delete': return 'fa-trash';
      default: return 'fa-check';
    }
  }

  onSubmit(): void {
    if (this.formGroup.valid || this.mode === 'delete') {
      this.formSubmit.emit(this.formGroup.getRawValue());
    } else {
      this.formGroup.markAllAsTouched();
    }
  }

  trackByCategory(index: number, item: any): string {
    return item.value;
  }

  private initializeForm(): void {
    this.formGroup = this.fb.group({
      category: [null, this.mode !== 'delete' ? [Validators.required] : []],
      allocated: [null, this.mode !== 'delete' ? [Validators.required, Validators.min(0.01)] : []],
    });

    if (this.mode === 'modify' && this.initialData) {
      this.formGroup.patchValue({
        category: this.initialData.category,
        allocated: this.initialData.allocated,
      });
      this.formGroup.get('category')?.disable();
    }

    if (this.mode === 'delete' && this.initialData) {
      this.formGroup.patchValue({
        category: this.initialData.category,
        allocated: this.initialData.allocated,
      });
      this.formGroup.disable();
    }
  }
}
