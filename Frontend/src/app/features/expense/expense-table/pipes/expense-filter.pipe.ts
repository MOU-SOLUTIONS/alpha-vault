// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Pipe, PipeTransform } from '@angular/core';
import { Expense } from '../../../../models/expense.model';

export interface ExpenseFilterCriteria {
  search?: string;
  fromDate?: string;
  toDate?: string;
  category?: string;
  method?: string;
}

@Pipe({
  name: 'expenseFilter',
  pure: true,
  standalone: true
})
export class ExpenseFilterPipe implements PipeTransform {
  transform(expenses: Expense[], criteria: ExpenseFilterCriteria): Expense[] {
    if (!expenses || expenses.length === 0) {
      return [];
    }

    if (!criteria) {
      return expenses;
    }

    return expenses.filter(expense => {
      if (criteria.search) {
        const search = criteria.search.toLowerCase();
        const matchesSearch = 
          expense.category.toLowerCase().includes(search) ||
          expense.paymentMethod.toLowerCase().includes(search) ||
          (expense.description && expense.description.toLowerCase().includes(search));
        
        if (!matchesSearch) return false;
      }

      if (criteria.fromDate) {
        const expenseDate = new Date(expense.date);
        const fromDate = new Date(criteria.fromDate);
        if (expenseDate < fromDate) return false;
      }

      if (criteria.toDate) {
        const expenseDate = new Date(expense.date);
        const toDate = new Date(criteria.toDate);
        if (expenseDate > toDate) return false;
      }

      if (criteria.category && expense.category !== criteria.category) {
        return false;
      }

      if (criteria.method && expense.paymentMethod !== criteria.method) {
        return false;
      }

      return true;
    });
  }
} 