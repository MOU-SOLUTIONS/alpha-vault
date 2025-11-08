/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseEvaluationHeaderComponent
  @description Expense evaluation header component for displaying expense data
*/

/* ===== IMPORTS ===== */
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/* ===== COMPONENT ===== */
@Component({
  selector: 'app-expense-evaluation-header',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DecimalPipe],
  templateUrl: './expense-evaluation-header.component.html',
  styleUrls: ['./expense-evaluation-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseEvaluationHeaderComponent {
  @Input({ required: true }) totalExpense = 0;
  @Input({ required: true }) growthRate = 0;
  @Input({ required: true }) achievementRate = 0;

  /* ===== METHODS ===== */
  onStatCardFocus(event: Event): void {
    event.preventDefault();
    // Handle focus logic for accessibility
  }
}
