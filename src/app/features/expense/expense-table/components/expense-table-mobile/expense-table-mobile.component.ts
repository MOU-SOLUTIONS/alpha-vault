/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseTableMobileComponent
  @description Mobile-optimized expense table component with expandable rows
*/

/* ===== IMPORTS ===== */
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output, PLATFORM_ID, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ExpenseCategoryIcons } from '../../../../../enums/expense-category-icons';
import { PaymentMethodIcons } from '../../../../../enums/payment-method';
import { Expense } from '../../../../../models/expense.model';

/* ===== COMPONENT DECORATOR ===== */
@Component({
  selector: 'app-expense-table-mobile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  template: `
    <div class="mobile-scroll-container">
      <div class="mobile-table-view">
        <div 
          *ngFor="let element of dataSource.data; trackBy: trackByExpense" 
          class="mobile-row"
          [class.expanded]="isExpanded(element)"
          (click)="onToggleRowExpand(element)"
          (keydown.enter)="onToggleRowExpand(element)"
          (keydown.space)="onToggleRowExpand(element)"
          tabindex="0"
          role="button"
          [attr.aria-expanded]="isExpanded(element)"
          [attr.aria-label]="'Expand expense details for ' + element.category"
        >
          <div class="mobile-row-header">
            <div class="mobile-header-main">
              <div class="mobile-method">
                <div class="method-circle" [ngClass]="getPaymentMethodClass(element.paymentMethod)">
                  <i [ngClass]="getPaymentMethodIcon(element.paymentMethod)" aria-hidden="true"></i>
                </div>
              </div>
              <div class="mobile-category">
                <div class="category-display">
                  <mat-icon class="category-icon" aria-hidden="true">{{ getCategoryIcon(element.category) }}</mat-icon>
                  <span class="category-text">{{ element.category }}</span>
                </div>
              </div>
              <div class="mobile-amount">
                <span class="amount-text" [ngClass]="getAmountClass(element.amount)">{{ element.amount | currency }}</span>
              </div>
            </div>
          </div>
          <div class="mobile-divider" *ngIf="isExpanded(element)"></div>
          <div 
            class="mobile-row-detail"
            *ngIf="isExpanded(element)"
          >
            <div class="detail-item">
              <span class="detail-label">Date:</span>
              <span class="detail-value">{{ getFormattedDate(element.date) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Method:</span>
              <span class="detail-value">
                <span class="method-text" [ngClass]="getPaymentMethodClass(element.paymentMethod)">
                  {{ getPaymentLabel(element.paymentMethod) }}
                </span>
              </span>
            </div>
            <div class="detail-item" *ngIf="element.description">
              <span class="detail-label">Description:</span>
              <span class="detail-value">{{ element.description }}</span>
            </div>
          </div>
          <div class="mobile-actions" 
               *ngIf="isExpanded(element)" 
               (click)="$event.stopPropagation()"
               (keyup.enter)="$event.stopPropagation()"
               (keyup.space)="$event.stopPropagation()"
               tabindex="0"
               role="button"
               [attr.aria-label]="'Actions for expense entry'">
            <button
              class="edit-button"
              mat-icon-button
              color="primary"
              (click)="onModify(element); $event.stopPropagation()"
              (keydown.enter)="onModify(element); $event.stopPropagation()"
              (keydown.space)="onModify(element); $event.stopPropagation()"
              matTooltip="Edit expense"
              aria-label="Edit expense">
              <mat-icon>edit</mat-icon>
            </button>
            <button
              class="delete-button"
              mat-icon-button
              color="warn"
              (click)="onDelete(element.id); $event.stopPropagation()"
              (keydown.enter)="onDelete(element.id); $event.stopPropagation()"
              (keydown.space)="onDelete(element.id); $event.stopPropagation()"
              matTooltip="Delete expense"
              aria-label="Delete expense">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./expense-table-mobile.component.scss']
})
export class ExpenseTableMobileComponent {
  /* ===== INPUTS ===== */
  @Input() dataSource!: MatTableDataSource<Expense>;
  @Input() set expandedElement(value: Expense | null) {
    this._expandedElement.set(value);
  }
  get expandedElement(): Expense | null {
    return this._expandedElement();
  }
  private _expandedElement = signal<Expense | null>(null);
  
  /* ===== OUTPUTS ===== */
  @Output() toggleRowExpand = new EventEmitter<Expense>();
  @Output() modify = new EventEmitter<Expense>();
  @Output() delete = new EventEmitter<number>();

  /* ===== DEPENDENCIES ===== */
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /* ===== COMPUTED PROPERTIES ===== */
  // Removed hardcoded icons - now using centralized PaymentMethodIcons

  /* ===== METHODS ===== */
  trackByExpense(index: number, expense: Expense): number {
    return expense.id;
  }

  isExpanded(element: Expense): boolean {
    return this._expandedElement()?.id === element.id;
  }

  get isAnyExpanded(): boolean {
    return this.expandedElement !== null;
  }

  getPaymentMethodClass(method: string): string {
    return method.toLowerCase();
  }

  getPaymentMethodIcon(method: string): string {
    // Map payment method strings to enum values and get the corresponding icon
    const methodMap: Record<string, string> = {
      'cash': 'CASH',
      'card': 'CARD', 
      'check': 'CHECK',
      'transfer': 'TRANSFER',
      'bank': 'TRANSFER',
      'crypto': 'CRYPTO',
      'cryptocurrency': 'CRYPTO',
      'paypal': 'PAYPAL'
    };
    
    const enumValue = methodMap[method.toLowerCase()];
    return enumValue ? PaymentMethodIcons[enumValue as keyof typeof PaymentMethodIcons] : 'fas fa-question-circle';
  }

  getPaymentLabel(method: string): string {
    const methodMap: Record<string, string> = {
      'cash': 'Cash',
      'card': 'Card',
      'check': 'Check',
      'transfer': 'Bank Transfer',
      'bank': 'Bank Transfer',
      'crypto': 'Cryptocurrency',
      'cryptocurrency': 'Cryptocurrency',
      'paypal': 'PayPal'
    };
    
    return methodMap[method.toLowerCase()] || 'Other';
  }

  getCategoryIcon(category: string): string {
    return ExpenseCategoryIcons[category] || 'category';
  }

  getAmountClass(amount: number): string {
    return amount >= 1000 ? 'high-amount' : 'normal-amount';
  }

  getFormattedDate(date: string): string {
    if (!this.isBrowser) {
      return date; // Return raw date for SSR
    }
    return new Date(date).toLocaleDateString();
  }

  onToggleRowExpand(expense: Expense): void {
    this.toggleRowExpand.emit(expense);
  }

  onModify(expense: Expense): void {
    this.modify.emit(expense);
  }

  onDelete(id: number): void {
    this.delete.emit(id);
  }
}