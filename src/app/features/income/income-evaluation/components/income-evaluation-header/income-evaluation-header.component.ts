/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component IncomeEvaluationHeaderComponent
  @description Income evaluation header component for displaying income data
*/

/* ===== IMPORTS ===== */
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/* ===== COMPONENT ===== */
@Component({
  selector: 'app-income-evaluation-header',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DecimalPipe],
  templateUrl: './income-evaluation-header.component.html',
  styleUrls: ['./income-evaluation-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomeEvaluationHeaderComponent {
  @Input({ required: true }) totalIncome = 0;
  @Input({ required: true }) growthRate = 0;
  @Input({ required: true }) achievementRate = 0;

  /* ===== METHODS ===== */
  onStatCardFocus(event: Event): void {
    event.preventDefault();
    // Handle focus logic for accessibility
  }
}
