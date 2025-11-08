/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component CryptoDataGridComponent
  @description Crypto data grid component for displaying crypto data
*/

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { CryptoDataGridComponent } from './crypto-data-grid.component';

describe('CryptoDataGridComponent', () => {
  let component: CryptoDataGridComponent;
  let fixture: ComponentFixture<CryptoDataGridComponent>;
  let httpMock: HttpTestingController;

  const mockCryptoData = [
    {
      id: 'bitcoin',
      name: 'Bitcoin',
      symbol: 'BTC',
      current_price: 43250.67,
      price_change_24h: 1034.23,
      price_change_percentage_24h: 2.45,
      market_cap: 850000000000,
      market_cap_rank: 1,
      total_volume: 25000000000,
      high_24h: 44500.00,
      low_24h: 42000.00,
      circulating_supply: 19500000,
      total_supply: 21000000,
      max_supply: 21000000,
      ath: 69000.00,
      ath_change_percentage: -37.32,
      atl: 67.81,
      atl_change_percentage: 63647.12,
      image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579',
      last_updated: new Date().toISOString()
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CryptoDataGridComponent,
        HttpClientTestingModule,
        NoopAnimationsModule,
        MatPaginatorModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule
      ],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CryptoDataGridComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load sample data on init', () => {
    expect(component.cryptoData().length).toBeGreaterThan(0);
  });

  it('should display loading state during data fetch', () => {
    component.isLoading.set(true);
    fixture.detectChanges();
    
    const loadingState = fixture.debugElement.query(By.css('.loading-state'));
    expect(loadingState).toBeTruthy();
  });

  it('should display error state when fetch fails', () => {
    component.error.set('Failed to load data');
    component.cryptoData.set([]);
    fixture.detectChanges();
    
    const errorState = fixture.debugElement.query(By.css('.error-state'));
    expect(errorState).toBeTruthy();
  });

  it('should toggle view mode', () => {
    const initialMode = component.viewMode;
    component.toggleViewMode();
    expect(component.viewMode).not.toBe(initialMode);
  });

  it('should sort data by field', () => {
    const initialSort = component.sortBy();
    component.sortData('price');
    expect(component.sortBy()).toBe('price');
    expect(component.sortOrder()).toBe('desc');
  });

  it('should toggle sort order when same field clicked', () => {
    component.sortData('price');
    const initialOrder = component.sortOrder();
    component.sortData('price');
    expect(component.sortOrder()).not.toBe(initialOrder);
  });

  it('should reset page when sorting changes', () => {
    component.currentPage.set(2);
    component.sortData('volume');
    expect(component.currentPage()).toBe(0);
  });

  it('should handle pagination', () => {
    component.currentPage.set(0);
    const event: PageEvent = { pageIndex: 1, pageSize: 10, length: 50 };
    component.onPageChange(event);
    expect(component.currentPage()).toBe(1);
    expect(component.pageSize).toBe(10);
  });

  it('should select crypto when card clicked', () => {
    const crypto = component.cryptoData()[0];
    component.selectCrypto(crypto);
    expect(component.selectedCrypto).toBe(crypto);
    expect(component.showDetails).toBe(true);
  });

  it('should close details modal', () => {
    component.showDetails = true;
    component.selectedCrypto = component.cryptoData()[0];
    component.closeDetails();
    expect(component.showDetails).toBe(false);
    expect(component.selectedCrypto).toBeNull();
  });

  it('should toggle auto refresh', () => {
    const initialValue = component.autoRefresh();
    component.toggleAutoRefresh();
    expect(component.autoRefresh()).not.toBe(initialValue);
  });

  it('should track by crypto id', () => {
    const crypto = component.cryptoData()[0];
    expect(component.trackByCrypto(0, crypto)).toBe(crypto.id);
  });

  it('should format currency correctly', () => {
    expect(component.formatCurrency(1000000)).toContain('M');
    expect(component.formatCurrency(1000000000)).toContain('B');
    expect(component.formatCurrency(1000000000000)).toContain('T');
  });

  it('should format numbers correctly', () => {
    expect(component.formatNumber(1000000)).toContain('M');
    expect(component.formatNumber(1000000000)).toContain('B');
  });

  it('should get change class correctly', () => {
    expect(component.getChangeClass(5)).toBe('positive');
    expect(component.getChangeClass(-5)).toBe('negative');
  });

  it('should get change icon correctly', () => {
    expect(component.getChangeIcon(5)).toBe('trending_up');
    expect(component.getChangeIcon(-5)).toBe('trending_down');
    expect(component.getChangeIcon(0)).toBe('trending_flat');
  });

  it('should get rank color correctly', () => {
    expect(component.getRankColor(1)).toBe('#fbbf24');
    expect(component.getRankColor(5)).toBe('#6b7280');
    expect(component.getRankColor(15)).toBe('#9ca3af');
  });

  describe('Accessibility', () => {
    it('should have keyboard handlers on action buttons', () => {
      const button = fixture.debugElement.query(By.css('.action-btn'));
      expect(button).toBeTruthy();
      
      const nativeButton = button.nativeElement;
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      
      spyOn(component, 'toggleViewMode');
      nativeButton.dispatchEvent(enterEvent);
      nativeButton.dispatchEvent(spaceEvent);
    });

    it('should have ARIA labels on buttons', () => {
      fixture.detectChanges();
      const refreshButton = fixture.debugElement.query(By.css('.refresh-btn'));
      expect(refreshButton.nativeElement.getAttribute('aria-label')).toBeTruthy();
    });

    it('should have ARIA attributes on crypto cards', () => {
      fixture.detectChanges();
      const card = fixture.debugElement.query(By.css('.crypto-card'));
      if (card) {
        expect(card.nativeElement.getAttribute('aria-label')).toBeTruthy();
        expect(card.nativeElement.getAttribute('role')).toBe('button');
        expect(card.nativeElement.getAttribute('tabindex')).toBe('0');
      }
    });

    it('should close modal on Escape key', () => {
      component.showDetails = true;
      component.selectedCrypto = component.cryptoData()[0];
      fixture.detectChanges();
      
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);
      
      expect(component.showDetails).toBeDefined();
    });
  });

  describe('Pagination', () => {
    it('should compute paginated data correctly', () => {
      component.cryptoData.set([
        { id: '1', name: 'Test1', symbol: 'T1', price: 100, price_change_24h: 0, price_change_percentage_24h: 0, market_cap: 1000000, market_cap_rank: 1, total_volume: 100000, high_24h: 110, low_24h: 90, circulating_supply: 1000000, total_supply: 1000000, max_supply: null, ath: 200, ath_change_percentage: 0, atl: 50, atl_change_percentage: 0, image: '', last_updated: '', change: 0 },
        { id: '2', name: 'Test2', symbol: 'T2', price: 200, price_change_24h: 0, price_change_percentage_24h: 0, market_cap: 2000000, market_cap_rank: 2, total_volume: 200000, high_24h: 210, low_24h: 190, circulating_supply: 2000000, total_supply: 2000000, max_supply: null, ath: 300, ath_change_percentage: 0, atl: 100, atl_change_percentage: 0, image: '', last_updated: '', change: 0 }
      ]);
      component.pageSize = 1;
      component.currentPage.set(0);
      
      const paginated = component.paginatedData();
      expect(paginated.length).toBe(1);
    });
  });

  describe('Computed signals', () => {
    it('should compute sorted data', () => {
      component.cryptoData.set([
        { id: '1', name: 'Test1', symbol: 'T1', price: 100, price_change_24h: 0, price_change_percentage_24h: 0, market_cap: 2000000, market_cap_rank: 2, total_volume: 100000, high_24h: 110, low_24h: 90, circulating_supply: 1000000, total_supply: 1000000, max_supply: null, ath: 200, ath_change_percentage: 0, atl: 50, atl_change_percentage: 0, image: '', last_updated: '', change: 0 },
        { id: '2', name: 'Test2', symbol: 'T2', price: 200, price_change_24h: 0, price_change_percentage_24h: 0, market_cap: 1000000, market_cap_rank: 1, total_volume: 200000, high_24h: 210, low_24h: 190, circulating_supply: 2000000, total_supply: 2000000, max_supply: null, ath: 300, ath_change_percentage: 0, atl: 100, atl_change_percentage: 0, image: '', last_updated: '', change: 0 }
      ]);
      component.sortBy.set('market_cap');
      component.sortOrder.set('desc');
      
      const sorted = component.sortedData();
      expect(sorted[0].market_cap).toBeGreaterThan(sorted[1].market_cap);
    });
  });
});

