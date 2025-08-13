// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Pipe, PipeTransform } from '@angular/core';
import { Income } from '../../../../models/income.model';

export interface IncomeFilterParams {
  search?: string;
  fromDate?: string;
  toDate?: string;
  method?: string;
  received?: string;
}

@Pipe({
  name: 'incomeFilter',
  pure: true
})
export class IncomeFilterPipe implements PipeTransform {
  transform(
    incomes: Income[],
    filters: IncomeFilterParams
  ): { filtered: Income[]; count: number } {
    if (!incomes || incomes.length === 0) {
      return { filtered: [], count: 0 };
    }

    if (!filters || Object.keys(filters).every(key => !filters[key as keyof IncomeFilterParams])) {
      return { filtered: incomes, count: incomes.length };
    }

    const filtered = incomes.filter((income) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          income.source.toLowerCase().includes(searchLower) ||
          income.paymentMethod.toLowerCase().includes(searchLower) ||
          (income.description && income.description.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }

      if (filters.fromDate) {
        if (new Date(income.date) < new Date(filters.fromDate)) {
          return false;
        }
      }

      if (filters.toDate) {
        if (new Date(income.date) > new Date(filters.toDate)) {
          return false;
        }
      }

      if (filters.method) {
        if (income.paymentMethod !== filters.method) {
          return false;
        }
      }

      if (filters.received !== undefined && filters.received !== '') {
        const received = filters.received === 'true';
        if (income.isReceived !== received) {
          return false;
        }
      }

      return true;
    });

    return { filtered, count: filtered.length };
  }
} 