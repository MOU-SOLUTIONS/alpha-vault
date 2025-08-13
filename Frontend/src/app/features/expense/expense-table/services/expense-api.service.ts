// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { Expense } from '../../../../models/expense.model';
import { ExpenseService } from '../../../../core/services/expense.service';

export interface ExpenseFilterParams {
  search?: string;
  fromDate?: string;
  toDate?: string;
  category?: string;
  method?: string;
}

export interface ExpenseApiResponse {
  data: Expense[];
  total: number;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseApiService {
  constructor(private expenseService: ExpenseService) {}

  getExpenses(page: number, size: number, filters: ExpenseFilterParams): Observable<ExpenseApiResponse> {
    return this.expenseService.getAllExpenses().pipe(
      map((expenses: Expense[]) => {
        let filteredExpenses: Expense[] = [...expenses];

        if (filters.search) {
          const search = filters.search.toLowerCase();
          filteredExpenses = filteredExpenses.filter(expense =>
            expense.category.toLowerCase().includes(search) ||
            expense.paymentMethod.toLowerCase().includes(search) ||
            (expense.description && expense.description.toLowerCase().includes(search))
          );
        }

        if (filters.fromDate) {
          filteredExpenses = filteredExpenses.filter(expense =>
            new Date(expense.date) >= new Date(filters.fromDate!)
          );
        }

        if (filters.toDate) {
          filteredExpenses = filteredExpenses.filter(expense =>
            new Date(expense.date) <= new Date(filters.toDate!)
          );
        }

        if (filters.category) {
          filteredExpenses = filteredExpenses.filter(expense =>
            expense.category === filters.category
          );
        }

        if (filters.method) {
          filteredExpenses = filteredExpenses.filter(expense =>
            expense.paymentMethod === filters.method
          );
        }

        const total = filteredExpenses.length;
        const startIndex = page * size;
        const endIndex = startIndex + size;
        const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);

        return {
          data: paginatedExpenses,
          total,
          page,
          size
        };
      }),
      delay(300)
    );
  }
} 