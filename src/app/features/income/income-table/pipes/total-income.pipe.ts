// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Pipe, PipeTransform } from '@angular/core';

import { Income } from '../../../../models/income.model';

@Pipe({
  name: 'totalIncome',
  pure: true,
  standalone: true
})
export class TotalIncomePipe implements PipeTransform {
  transform(incomes: Income[]): number {
    if (!incomes || incomes.length === 0) {
      return 0;
    }
    return incomes.reduce((sum, income) => sum + income.amount, 0);
  }
}
