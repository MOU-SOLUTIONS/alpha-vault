// src/app/core/services/asset.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Asset } from '../../models/asset.model';

@Injectable({ providedIn: 'root' })
export class AssetService {
  constructor(private http: HttpClient) {}

  searchAssets(type: string, q: string): Observable<Asset[]> {
    let params = new HttpParams();
    // Always send a “search” param, even if it’s empty string,
    // so the backend returns the top‐50 list when q === ''
    params = params.set('search', q);
    return this.http.get<Asset[]>(`/api/assets/${type}`, { params });
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
    let params = new HttpParams().set('symbol', symbol);
    return this.http.get<{ rate: number }>('/api/assets/FOREX/rate', {
      params,
    });
  }
}
