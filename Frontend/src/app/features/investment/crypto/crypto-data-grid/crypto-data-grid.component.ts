/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component CryptoDataGridComponent
  @description Crypto data grid component for displaying crypto data
*/

import { animate, keyframes, query, stagger, state, style, transition, trigger } from '@angular/animations';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, HostListener, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { interval, timer } from 'rxjs';
import { filter, finalize } from 'rxjs/operators';

import { META_FRAGMENT } from '../../../../core/seo/page-meta.model';

interface CryptoData {
  readonly id: string;
  readonly name: string;
  readonly symbol: string;
  readonly price: number;
  readonly price_change_24h: number;
  readonly price_change_percentage_24h: number;
  readonly market_cap: number;
  readonly market_cap_rank: number;
  readonly total_volume: number;
  readonly high_24h: number;
  readonly low_24h: number;
  readonly circulating_supply: number;
  readonly total_supply: number;
  readonly max_supply: number | null;
  readonly ath: number;
  readonly ath_change_percentage: number;
  readonly atl: number;
  readonly atl_change_percentage: number;
  readonly image: string;
  readonly last_updated: string;
  readonly sparkline_in_7d?: {
    readonly price: readonly number[];
  };
  readonly change: 1 | 0 | -1;
}

@Component({
  selector: 'app-crypto-data-grid',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatPaginatorModule
  ],
  templateUrl: './crypto-data-grid.component.html',
  styleUrls: ['./crypto-data-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: META_FRAGMENT,
      useValue: {
        description: 'Real-time cryptocurrency market data with live prices, market cap, and trading volume for top cryptocurrencies. View, analyze, and track cryptocurrency market trends with interactive data grids and detailed statistics.'
      }
    }
  ],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerList', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateX(-30px)' }),
          stagger(100, [
            animate('500ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateX(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('cardHover', [
      state('normal', style({ transform: 'translateY(0) scale(1)' })),
      state('hovered', style({ transform: 'translateY(-8px) scale(1.02)' })),
      transition('normal => hovered', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)')
      ]),
      transition('hovered => normal', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)')
      ])
    ]),
    trigger('pricePulse', [
      transition(':increment', [
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', keyframes([
          style({ transform: 'scale(1)', offset: 0 }),
          style({ transform: 'scale(1.1)', offset: 0.5 }),
          style({ transform: 'scale(1)', offset: 1 })
        ]))
      ])
    ]),
    trigger('glowPulse', [
      state('normal', style({ boxShadow: '0 8px 32px rgba(126, 87, 194, 0.15)' })),
      state('glowing', style({ boxShadow: '0 12px 40px rgba(126, 87, 194, 0.3)' })),
      transition('normal <=> glowing', [
        animate('2000ms ease-in-out')
      ])
    ])
  ]
})
export class CryptoDataGridComponent implements OnInit {
  readonly cryptoData = signal<readonly CryptoData[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly lastUpdated = signal<Date>(new Date());
  
  selectedCrypto: CryptoData | null = null;
  showDetails = false;
  viewMode: 'grid' | 'list' = 'grid';
  readonly sortBy = signal<'market_cap' | 'price' | 'change_24h' | 'volume'>('market_cap');
  readonly sortOrder = signal<'asc' | 'desc'>('desc');
  
  pageSize = 10;
  readonly pageSizeOptions = [5, 10, 25, 50] as const;
  readonly currentPage = signal(0);
  
  readonly autoRefresh = signal(true);
  readonly refreshInterval = 30000;
  
  readonly sortedData = computed(() => {
    const data = [...this.cryptoData()];
    const field = this.sortBy();
    const order = this.sortOrder();
    
    return data.sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (field) {
        case 'market_cap':
          aValue = a.market_cap;
          bValue = b.market_cap;
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'change_24h':
          aValue = a.price_change_percentage_24h;
          bValue = b.price_change_percentage_24h;
          break;
        case 'volume':
          aValue = a.total_volume;
          bValue = b.total_volume;
          break;
        default:
          aValue = a.market_cap;
          bValue = b.market_cap;
      }
      
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    });
  });

  readonly paginatedData = computed(() => {
    const sorted = this.sortedData();
    const start = this.currentPage() * this.pageSize;
    return sorted.slice(start, start + this.pageSize);
  });

  readonly timeAgo = computed(() => {
    return this.getTimeAgo(this.lastUpdated());
  });

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly destroyRef = inject(DestroyRef);
  
  constructor(
    private readonly http: HttpClient
  ) {
  }

  ngOnInit(): void {
    this.loadSampleData();
    this.loadData();
    
    timer(this.refreshInterval).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.startAutoRefresh();
    });
  }

  @HostListener('window:focus')
  onWindowFocus(): void {
    if (this.autoRefresh() && this.isBrowser) {
      this.loadData();
    }
  }

  refreshData(): void {
    this.loadData();
  }

  toggleAutoRefresh(): void {
    this.autoRefresh.update(val => !val);
    if (this.autoRefresh()) {
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
    }
  }

  toggleViewMode(): void {
    if (this.isBrowser && window.innerWidth > 768) {
      this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
    } else {
      this.viewMode = 'grid';
    }
  }

  sortData(field: 'market_cap' | 'price' | 'change_24h' | 'volume'): void {
    if (this.sortBy() === field) {
      this.sortOrder.update(order => order === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortOrder.set('desc');
    }
    this.currentPage.set(0);
  }

  selectCrypto(crypto: CryptoData): void {
    if (this.selectedCrypto?.id === crypto.id && this.showDetails) {
      this.closeDetails();
    } else {
      this.selectedCrypto = crypto;
      this.showDetails = true;
    }
  }

  closeDetails(): void {
    this.showDetails = false;
    this.selectedCrypto = null;
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize = event.pageSize;
    const totalPages = Math.ceil(this.cryptoData().length / this.pageSize);
    if (this.currentPage() >= totalPages && totalPages > 0) {
      this.currentPage.set(totalPages - 1);
    }
  }

  getChangeClass(percentage: number): string {
    return percentage > 0 ? 'positive' : 'negative';
  }

  formatCurrency(value: number): string {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  }

  formatNumber(value: number): string {
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value.toFixed(2);
  }

  getChangeColor(change: number): string {
    if (change > 0) return '#10b981';
    if (change < 0) return '#ef4444';
    return '#6b7280';
  }

  getChangeIcon(change: number): string {
    if (change > 0) return 'trending_up';
    if (change < 0) return 'trending_down';
    return 'trending_flat';
  }

  getRankColor(rank: number): string {
    if (rank <= 3) return '#fbbf24';
    if (rank <= 10) return '#6b7280';
    return '#9ca3af';
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  }

  trackByCrypto(index: number, crypto: CryptoData): string {
    return crypto.id;
  }

  private startAutoRefresh(): void {
    this.stopAutoRefresh();
    
    interval(this.refreshInterval)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(() => this.autoRefresh())
      )
      .subscribe(() => {
        this.loadData();
      });
  }

  private stopAutoRefresh(): void {
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.http
      .get<readonly any[]>(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=1h,24h,7d'
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: (data) => {
          const currentData = this.cryptoData();
          this.cryptoData.set(data.map((item) => {
            const prev = currentData.find((c) => c.id === item.id)?.price;
            const change: 1 | 0 | -1 =
              prev == null
                ? 0
                : item.current_price > prev
                ? 1
                : item.current_price < prev
                ? -1
                : 0;

            return {
              id: item.id,
              name: item.name,
              symbol: item.symbol.toUpperCase(),
              price: item.current_price,
              price_change_24h: item.price_change_24h,
              price_change_percentage_24h: item.price_change_percentage_24h,
              market_cap: item.market_cap,
              market_cap_rank: item.market_cap_rank,
              total_volume: item.total_volume,
              high_24h: item.high_24h,
              low_24h: item.low_24h,
              circulating_supply: item.circulating_supply,
              total_supply: item.total_supply,
              max_supply: item.max_supply,
              ath: item.ath,
              ath_change_percentage: item.ath_change_percentage,
              atl: item.atl,
              atl_change_percentage: item.atl_change_percentage,
              image: item.image,
              last_updated: item.last_updated,
              sparkline_in_7d: item.sparkline_in_7d,
              change
            };
          }));
          
          this.lastUpdated.set(new Date());
          this.error.set(null);
        },
        error: (error) => {
          if (this.cryptoData().length === 0) {
            this.error.set('Failed to load data. Please try again later.');
          } else {
            this.error.set(null);
          }
        }
      });
  }

  private loadSampleData(): void {
    this.cryptoData.set([
      {
        id: 'bitcoin',
        name: 'Bitcoin',
        symbol: 'BTC',
        price: 43250.67,
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
        last_updated: new Date().toISOString(),
        change: 0
      },
      {
        id: 'ethereum',
        name: 'Ethereum',
        symbol: 'ETH',
        price: 2650.34,
        price_change_24h: -33.12,
        price_change_percentage_24h: -1.23,
        market_cap: 320000000000,
        market_cap_rank: 2,
        total_volume: 18000000000,
        high_24h: 2750.00,
        low_24h: 2600.00,
        circulating_supply: 120000000,
        total_supply: 120000000,
        max_supply: null,
        ath: 4878.26,
        ath_change_percentage: -45.68,
        atl: 0.432979,
        atl_change_percentage: 611847.12,
        image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880',
        last_updated: new Date().toISOString(),
        change: 0
      },
      {
        id: 'binancecoin',
        name: 'BNB',
        symbol: 'BNB',
        price: 312.45,
        price_change_24h: 2.67,
        price_change_percentage_24h: 0.87,
        market_cap: 48000000000,
        market_cap_rank: 3,
        total_volume: 1200000000,
        high_24h: 320.00,
        low_24h: 305.00,
        circulating_supply: 153000000,
        total_supply: 200000000,
        max_supply: 200000000,
        ath: 686.31,
        ath_change_percentage: -54.47,
        atl: 0.0398177,
        atl_change_percentage: 784847.12,
        image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1644979850',
        last_updated: new Date().toISOString(),
        change: 0
      },
      {
        id: 'solana',
        name: 'Solana',
        symbol: 'SOL',
        price: 98.76,
        price_change_24h: 5.29,
        price_change_percentage_24h: 5.67,
        market_cap: 42000000000,
        market_cap_rank: 4,
        total_volume: 2800000000,
        high_24h: 105.00,
        low_24h: 92.00,
        circulating_supply: 425000000,
        total_supply: 533000000,
        max_supply: null,
        ath: 260.06,
        ath_change_percentage: -62.01,
        atl: 0.500801,
        atl_change_percentage: 19647.12,
        image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png?1640133422',
        last_updated: new Date().toISOString(),
        change: 0
      },
      {
        id: 'cardano',
        name: 'Cardano',
        symbol: 'ADA',
        price: 0.52,
        price_change_24h: -0.002,
        price_change_percentage_24h: -0.45,
        market_cap: 18000000000,
        market_cap_rank: 5,
        total_volume: 450000000,
        high_24h: 0.53,
        low_24h: 0.51,
        circulating_supply: 35000000000,
        total_supply: 45000000000,
        max_supply: 45000000000,
        ath: 3.09,
        ath_change_percentage: -83.17,
        atl: 0.01735475,
        atl_change_percentage: 2897.12,
        image: 'https://assets.coingecko.com/coins/images/975/large/Cardano_Logo.png?1552707553',
        last_updated: new Date().toISOString(),
        change: 0
      }
    ]);
    
    this.lastUpdated.set(new Date());
  }
} 