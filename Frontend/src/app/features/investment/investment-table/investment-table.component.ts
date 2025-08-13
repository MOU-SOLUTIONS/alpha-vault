import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Investment } from '../../../models/investment.model';

@Component({
  selector: 'app-investment-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './investment-table.component.html',
  styleUrls: ['./investment-table.component.scss'],
})
export class InvestmentTableComponent {
  @Input() goals: Investment[] = [];
  @Output() modify = new EventEmitter<Investment>();
  @Output() remove = new EventEmitter<number>();
  @Output() sell = new EventEmitter<Investment>();

  /** % change since invested */
  calculateChange(inv: Investment): number {
    return inv.amountInvested
      ? ((inv.currentValue - inv.amountInvested) / inv.amountInvested) * 100
      : 0;
  }

  /** Whether this investment is still active */
  isActive(inv: Investment): boolean {
    return !inv.isSold;
  }
}
