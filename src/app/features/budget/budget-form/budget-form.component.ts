/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component BudgetFormComponent
  @description Budget form component for adding and modifying budget allocations
*/

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { META_FRAGMENT } from '../../../core/seo/page-meta.model';

@Component({
  standalone: true,
  selector: 'app-budget-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './budget-form.component.html',
  styleUrls: ['./budget-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: META_FRAGMENT,
      useValue: {
        description: 'Add or modify a budget allocation in Alpha Vault. Secure, accessible, and efficient budget management form.'
      }
    }
  ]
})
export class BudgetFormComponent {
  @Input() formGroup!: FormGroup;
  @Input() mode: 'add' | 'modify' | 'delete' = 'add';
  @Input() expenseCategories: { label: string; value: string }[] = [];
  @Input() alreadyUsedCategories: string[] = [];
  @Output() formSubmit = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  constructor() {
    // SEO handled by parent component (BudgetComponent) via SeoService
  }

  get filteredCategories() {
    if (this.mode === 'modify') {
      return this.expenseCategories;
    }
    
    return this.expenseCategories.filter(
      (cat) => !this.alreadyUsedCategories.includes(cat.value)
    );
  }

  get computedSubmitButtonText(): string {
    switch (this.mode) {
      case 'add': return 'Add';
      case 'modify': return 'Modify';
      case 'delete': return 'Delete';
      default: return 'Submit';
    }
  }

  get computedSubmitButtonColor(): string {
    switch (this.mode) {
      case 'add': return 'add';
      case 'modify': return 'modify';
      case 'delete': return 'delete';
      default: return 'add';
    }
  }

  get computedButtonIcon(): string {
    switch (this.mode) {
      case 'add': return 'fa-plus';
      case 'modify': return 'fa-save';
      case 'delete': return 'fa-trash';
      default: return 'fa-check';
    }
  }

  onSubmit(): void {
    if (this.formGroup.invalid) return;
    this.formSubmit.emit();
  }

  onCancelKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.cancel.emit();
    }
  }

  onSubmitKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onSubmit();
    }
  }

  trackByCategory(index: number, item: { value: string; label: string }): string {
    return item.value;
  }
}


