// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Income } from '../../../../models/income.model';
import { IncomeService } from '../../../../core/services/income.service';

export interface IncomeFilterParams {
  search?: string;
  fromDate?: string;
  toDate?: string;
  method?: string;
  received?: string;
}

export interface IncomeApiResponse {
  data: Income[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class IncomeApiService {
  constructor(private incomeService: IncomeService) {}

  getIncomes(
    page: number = 0,
    size: number = 10,
    filters: IncomeFilterParams = {}
  ): Observable<IncomeApiResponse> {
    return this.incomeService.getAllIncomes().pipe(
      map(allIncomes => {
        let filteredIncomes = this.applyFilters(allIncomes, filters);
        
        const startIndex = page * size;
        const endIndex = startIndex + size;
        const paginatedIncomes = filteredIncomes.slice(startIndex, endIndex);
        
        return {
          data: paginatedIncomes,
          total: filteredIncomes.length,
          page,
          size,
          totalPages: Math.ceil(filteredIncomes.length / size)
        };
      })
    );
  }

  private applyFilters(incomes: Income[], filters: IncomeFilterParams): Income[] {
    if (!filters || Object.keys(filters).every(key => !filters[key as keyof IncomeFilterParams])) {
      return incomes;
    }

    return incomes.filter((income) => {
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
  }
} 