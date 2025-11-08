/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component IncomeTableMobileComponent
  @description Mobile-optimized income table component with expandable rows
*/

/* ===== IMPORTS ===== */
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output, PLATFORM_ID, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { PaymentMethodIcons } from '../../../../../enums/payment-method';
import { Income } from '../../../../../models/income.model';

/* ===== COMPONENT DECORATOR ===== */
@Component({
  selector: 'app-income-table-mobile',
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
          *ngFor="let element of dataSource.data; trackBy: trackByIncome" 
          class="mobile-row"
          [class.expanded]="isExpanded(element)"
          (click)="onToggleRowExpand(element)"
          (keydown.enter)="onToggleRowExpand(element)"
          (keydown.space)="onToggleRowExpand(element)"
          tabindex="0"
          role="button"
          [attr.aria-expanded]="isExpanded(element)"
          [attr.aria-label]="'Expand income details for ' + element.source"
        >
          <div class="mobile-row-header">
            <div class="mobile-header-main">
              <div class="mobile-method">
                <div class="method-circle" [ngClass]="getPaymentMethodClass(element.paymentMethod)">
                  <i [ngClass]="getPaymentMethodIcon(element.paymentMethod)" aria-hidden="true"></i>
                </div>
              </div>
              <div class="mobile-source">
                <span class="source-text">{{ element.source }}</span>
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
            <div class="detail-item">
              <span class="detail-label">Received:</span>
              <span class="detail-value">{{ element.isReceived ? 'Yes' : 'No' }}</span>
            </div>
          </div>
          <div class="mobile-actions" 
               *ngIf="isExpanded(element)" 
               (click)="$event.stopPropagation()"
               (keyup.enter)="$event.stopPropagation()"
               (keyup.space)="$event.stopPropagation()"
               tabindex="0"
               role="button"
               [attr.aria-label]="'Actions for income entry'">
            <button
              class="edit-button"
              mat-icon-button
              color="primary"
              (click)="onModify(element); $event.stopPropagation()"
              (keydown.enter)="onModify(element); $event.stopPropagation()"
              (keydown.space)="onModify(element); $event.stopPropagation()"
              matTooltip="Edit income"
              aria-label="Edit income">
              <mat-icon>edit</mat-icon>
            </button>
            <button
              class="delete-button"
              mat-icon-button
              color="warn"
              (click)="onDelete(element.id); $event.stopPropagation()"
              (keydown.enter)="onDelete(element.id); $event.stopPropagation()"
              (keydown.space)="onDelete(element.id); $event.stopPropagation()"
              matTooltip="Delete income"
              aria-label="Delete income">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./income-table-mobile.component.scss']
})
export class IncomeTableMobileComponent {
  /* ===== INPUTS ===== */
  @Input() dataSource!: MatTableDataSource<Income>;
  @Input() set expandedElement(value: Income | null) {
    this._expandedElement.set(value);
  }
  get expandedElement(): Income | null {
    return this._expandedElement();
  }
  private _expandedElement = signal<Income | null>(null);
  
  /* ===== OUTPUTS ===== */
  @Output() toggleRowExpand = new EventEmitter<Income>();
  @Output() modify = new EventEmitter<Income>();
  @Output() delete = new EventEmitter<number>();

  /* ===== DEPENDENCIES ===== */
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /* ===== COMPUTED PROPERTIES ===== */
  // Removed hardcoded icons - now using centralized PaymentMethodIcons

  /* ===== METHODS ===== */
  trackByIncome(index: number, income: Income): number {
    return income.id;
  }

  isExpanded(element: Income): boolean {
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

  getAmountClass(amount: number): string {
    return amount >= 1000 ? 'high-amount' : 'normal-amount';
  }

  getFormattedDate(date: string): string {
    if (!this.isBrowser) {
      return date; // Return raw date for SSR
    }
    return new Date(date).toLocaleDateString();
  }

  onToggleRowExpand(income: Income): void {
    this.toggleRowExpand.emit(income);
  }

  onModify(income: Income): void {
    this.modify.emit(income);
  }

  onDelete(id: number): void {
    this.delete.emit(id);
  }
}
