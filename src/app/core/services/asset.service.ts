// src/app/core/services/asset.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ApiResponse } from '../../models/auth.model';
import { Asset } from '../../models/asset.model';

@Injectable({ providedIn: 'root' })
export class AssetService {
  constructor(private http: HttpClient) {}

  searchAssets(type: string, q: string): Observable<Asset[]> {
    let params = new HttpParams();
    // Always send a "search" param, even if it's empty string,
    // so the backend returns the top‐50 list when q === ''
    params = params.set('search', q);
    return this.http.get<ApiResponse<Asset[]> | Asset[]>(`/api/assets/${type}`, { params })
      .pipe(
        map((response) => {
          // Handle both wrapped ApiResponse and direct array
          if (response && typeof response === 'object' && 'data' in response) {
            return Array.isArray(response.data) ? response.data : [];
          }
          return Array.isArray(response) ? response : [];
        })
      );
  }

  searchForex(q: string): Observable<Asset[]> {
    let params = new HttpParams();
    if (q?.length > 0) {
      params = params.set('search', q);
    }
    return this.http.get<Asset[]>('/api/assets/FOREX', { params });
  }

  /**
   * Fetch the current USD → {symbol} exchange rate.
   * Response body is { rate: number }.
   */
  getForexRate(symbol: string): Observable<{ rate: number }> {
    const params = new HttpParams().set('symbol', symbol);
    return this.http.get<{ rate: number }>('/api/assets/FOREX/rate', {
      params,
    });
  }
}
