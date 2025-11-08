/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseTableDesktopComponent
  @description Expense table desktop component for displaying expense data
*/

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ExpenseCategoryIcons } from '../../../../../enums/expense-category-icons';
import { PaymentMethodIcons } from '../../../../../enums/payment-method';
import { Expense } from '../../../../../models/expense.model';

/* ===== COMPONENT DECORATOR ===== */
@Component({
  selector: 'app-expense-table-desktop',
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
    <div class="table-wrapper">
      <table mat-table [dataSource]="dataSource" class="w-100">
        <ng-container matColumnDef="method">
          <th mat-header-cell *matHeaderCellDef>Method</th>
          <td mat-cell *matCellDef="let element">
            <div class="method-circle" [ngClass]="getPaymentMethodClassForElement(element)">
              <i [ngClass]="getPaymentMethodIconForElement(element)" [attr.aria-label]="'Payment method: ' + element.paymentMethod" aria-hidden="true"></i>
            </div>
          </td>
        </ng-container>
        <ng-container matColumnDef="category">
          <th mat-header-cell *matHeaderCellDef>Category</th>
          <td mat-cell *matCellDef="let element">
            <div class="category-elite">
              <div class="category-icon">
                <mat-icon aria-hidden="true">{{ getCategoryIcon(element.category) }}</mat-icon>
              </div>
              <div class="category-content">
                <div class="category-name">{{ element.category }}</div>
                <div class="category-type">Expense Category</div>
              </div>
            </div>
          </td>
        </ng-container>
        <ng-container matColumnDef="amount">
          <th mat-header-cell *matHeaderCellDef>Amount</th>
          <td mat-cell *matCellDef="let element">
            <div class="amount-display" [ngClass]="getAmountClassForElement(element)">
              <div class="amount-value">{{ element.amount | currency }}</div>
            </div>
          </td>
        </ng-container>
        <ng-container matColumnDef="date">
          <th mat-header-cell *matHeaderCellDef>Date</th>
          <td mat-cell *matCellDef="let element">
            <span class="date-text">{{ getFormattedDateForElement(element) }}</span>
          </td>
        </ng-container>
        <ng-container matColumnDef="description">
          <th mat-header-cell *matHeaderCellDef>Description</th>
          <td mat-cell *matCellDef="let element">
            <span class="description-text">{{ element.description || 'N/A' }}</span>
          </td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let element">
            <div class="actions-wrapper">
              <button
                class="edit-button"
                mat-icon-button
                color="primary"
                (click)="onModify(element)"
                (keydown.enter)="onModify(element)"
                (keydown.space)="onModify(element)"
                matTooltip="Edit expense"
                aria-label="Edit expense">
                <mat-icon>edit</mat-icon>
              </button>
              <button
                class="delete-button"
                mat-icon-button
                color="warn"
                (click)="onDelete(element.id)"
                (keydown.enter)="onDelete(element.id)"
                (keydown.space)="onDelete(element.id)"
                matTooltip="Delete expense"
                aria-label="Delete expense">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="activeColumns"></tr>
        <tr 
          mat-row 
          *matRowDef="let row; columns: activeColumns"
          [class.highlight-row]="expandedElement === row"
        ></tr>
      </table>
    </div>
  `,
  styleUrls: ['./expense-table-desktop.component.scss']
})
export class ExpenseTableDesktopComponent {
  /* ===== INPUTS ===== */
  @Input() dataSource!: MatTableDataSource<Expense>;
  @Input() activeColumns: string[] = [];
  @Input() expandedElement: Expense | null = null;
  
  /* ===== OUTPUTS ===== */
  @Output() modify = new EventEmitter<Expense>();
  @Output() delete = new EventEmitter<number>();

  /* ===== DEPENDENCIES ===== */
  private cdr = inject(ChangeDetectorRef);

  /* ===== UTILITY METHODS ===== */
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

  getCategoryIcon(category: string): string {
    return ExpenseCategoryIcons[category] || 'category';
  }

  getAmountClass(amount: number): string {
    return amount >= 1000 ? 'high-amount' : 'normal-amount';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  /* ===== EVENT HANDLERS ===== */
  onModify(expense: Expense): void {
    this.modify.emit(expense);
    this.cdr.markForCheck();
  }

  onDelete(id: number): void {
    this.delete.emit(id);
    this.cdr.markForCheck();
  }

  /* ===== TEMPLATE COMPUTED PROPERTIES ===== */
  getPaymentMethodClassForElement(element: Expense): string {
    return this.getPaymentMethodClass(element.paymentMethod);
  }

  getPaymentMethodIconForElement(element: Expense): string {
    return this.getPaymentMethodIcon(element.paymentMethod);
  }

  getAmountClassForElement(element: Expense): string {
    return this.getAmountClass(element.amount);
  }

  getFormattedDateForElement(element: Expense): string {
    return this.formatDate(element.date);
  }

  /* ===== PERFORMANCE OPTIMIZATION ===== */
  trackByExpenseId(index: number, expense: Expense): number {
    return expense.id;
  }
}