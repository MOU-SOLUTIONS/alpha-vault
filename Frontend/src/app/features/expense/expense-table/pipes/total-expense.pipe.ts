// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Pipe, PipeTransform } from '@angular/core';
import { Expense } from '../../../../models/expense.model';

@Pipe({
  name: 'totalExpense',
  pure: true,
  standalone: true
})
export class TotalExpensePipe implements PipeTransform {
  transform(expenses: Expense[]): number {
    if (!expenses || expenses.length === 0) {
      return 0;
    }
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }
} 