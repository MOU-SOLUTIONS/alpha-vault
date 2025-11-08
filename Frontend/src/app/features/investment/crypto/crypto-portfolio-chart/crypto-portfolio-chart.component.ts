/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component CryptoPortfolioChartComponent
  @description Crypto portfolio chart component for displaying crypto portfolio allocation
*/

import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { FocusTrapFactory } from '@angular/cdk/a11y';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewChecked, ChangeDetectionStrategy, Component, computed, DestroyRef, effect, ElementRef, EventEmitter, inject, Input, OnChanges, OnInit, Output, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChartConfiguration, ChartData } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { interval } from 'rxjs';
import { filter } from 'rxjs/operators';

import { LoggingService } from '../../../../core/services/logging.service';
import { META_FRAGMENT } from '../../../../core/seo/page-meta.model';
import { Investment } from '../../../../models/investment.model';

type ChartType = 'pie' | 'doughnut';

interface LegendItem {
  readonly name: string;
  readonly color: string;
  readonly percentage: number;
  readonly invested: number;
  readonly profitLoss: number;
  readonly profitLossPercentage: number;
  readonly isPositive: boolean;
}

@Component({
  standalone: true,
  selector: 'app-crypto-portfolio-chart',
  templateUrl: './crypto-portfolio-chart.component.html',
  styleUrls: ['./crypto-portfolio-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NgChartsModule, MatIconModule, MatTooltipModule],
  providers: [
    {
      provide: META_FRAGMENT,
      useValue: {
        description: 'View your cryptocurrency portfolio allocation and performance breakdown with interactive charts and detailed analytics.'
      }
    }
  ],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerItems', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateX(-20px)' }),
          stagger(100, [
            animate('400ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class CryptoPortfolioChartComponent implements OnChanges, OnInit, AfterViewChecked {
  @Input() investments: readonly Investment[] = [];
  @Output() addInvestment = new EventEmitter<void>();

  readonly totalInvested = signal(0);
  readonly totalProfitLoss = signal(0);
  readonly totalProfitLossPercentage = signal(0);
  readonly isLoading = signal(false);
  readonly autoRefresh = signal(true);
  readonly selectedChartType = signal<ChartType>('pie');
  readonly showDetails = signal(false);
  readonly selectedItem = signal<LegendItem | null>(null);
  readonly legendItems = signal<LegendItem[]>([]);

  readonly chartTypeIcon = computed(() => 
    this.selectedChartType() === 'pie' ? 'donut_large' : 'pie_chart'
  );
  
  readonly chartTypeLabel = computed(() => 
    this.selectedChartType() === 'pie' ? 'Switch to Doughnut Chart' : 'Switch to Pie Chart'
  );

  readonly formattedTotalInvested = computed(() => 
    this.formatCurrency(this.totalInvested())
  );

  readonly formattedTotalProfitLoss = computed(() => 
    this.formatCurrency(this.totalProfitLoss())
  );

  readonly formattedTotalProfitLossPercentage = computed(() => 
    this.formatPercentage(this.totalProfitLossPercentage())
  );

  readonly profitLossColor = computed(() => 
    this.getProfitLossColor(this.totalProfitLoss() >= 0)
  );

  readonly profitLossPercentageColor = computed(() => 
    this.getProfitLossColor(this.totalProfitLossPercentage() >= 0)
  );

  readonly profitLossIcon = computed(() => 
    this.getProfitLossIcon(this.totalProfitLoss() >= 0)
  );

  readonly computedLegendItems = computed(() => 
    this.legendItems().map(item => ({
      ...item,
      formattedPercentage: this.formatPercentage(item.percentage),
      formattedInvested: this.formatCurrency(item.invested),
      formattedProfitLoss: this.formatCurrency(item.profitLoss),
      formattedProfitLossPercentage: this.formatPercentage(item.profitLossPercentage),
      profitLossColor: this.getProfitLossColor(item.isPositive),
      profitLossIcon: this.getProfitLossIcon(item.isPositive)
    }))
  );

  readonly selectedItemFormatted = computed(() => {
    const item = this.selectedItem();
    if (!item) return null;
    return {
      ...item,
      formattedPercentage: this.formatPercentage(item.percentage),
      formattedInvested: this.formatCurrency(item.invested),
      formattedProfitLoss: this.formatCurrency(item.profitLoss),
      formattedProfitLossPercentage: this.formatPercentage(item.profitLossPercentage),
      profitLossColor: this.getProfitLossColor(item.isPositive)
    };
  });

  readonly pieData = signal<ChartData<'pie' | 'doughnut'>>({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      borderColor: '#ffffff',
      borderWidth: 2,
      hoverBorderWidth: 3,
      hoverBorderColor: '#ffffff'
    }]
  });

  readonly pieOptions: Readonly<ChartConfiguration<'pie' | 'doughnut'>['options']> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(126, 87, 194, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#7E57C2',
        borderWidth: 2,
        cornerRadius: 12,
        displayColors: false,
        padding: 12,
        titleFont: {
          size: 14,
          weight: 600
        },
        bodyFont: {
          size: 13,
          weight: 500
        },
        callbacks: {
          title: (context) => `📊 ${context[0].label}`,
          label: (context) => {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `💰 $${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
    elements: {
      arc: {
        borderWidth: 2
      }
    }
  };

  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly focusTrapFactory = inject(FocusTrapFactory);
  private readonly loggingService = inject(LoggingService);
  private focusTrap: any;

  @ViewChild('modalRef', { read: ElementRef }) modalElementRef?: ElementRef<HTMLElement>;

  constructor() {
    effect(() => {
      const isVisible = this.showDetails();
      
      if (!isVisible && this.focusTrap) {
        this.removeFocusTrap();
        return;
      }
      
      if (isVisible && this.isBrowser && this.modalElementRef?.nativeElement) {
        setTimeout(() => {
          if (this.showDetails() && !this.focusTrap && this.modalElementRef?.nativeElement) {
            try {
              const element = this.modalElementRef.nativeElement;
              this.focusTrap = this.focusTrapFactory.create(element);
              const closeButton = element.querySelector(
                '.close-btn'
              ) as HTMLElement;
              if (closeButton) {
                closeButton.focus();
              }
            } catch (error) {
              this.loggingService.warn('Failed to create focus trap:', error);
            }
          }
        }, 0);
      }
    });
  }

  ngOnInit(): void {
    this.startAutoRefresh();
  }

  ngAfterViewChecked(): void {
    if (this.showDetails() && this.isBrowser && this.modalElementRef?.nativeElement && !this.focusTrap) {
      try {
        const element = this.modalElementRef.nativeElement;
        this.focusTrap = this.focusTrapFactory.create(element);
        const closeButton = element.querySelector('.close-btn') as HTMLElement;
        if (closeButton) {
          closeButton.focus();
        }
      } catch (error) {
        this.loggingService.warn('Failed to create focus trap in ngAfterViewChecked:', error);
      }
    }
  }

  ngOnChanges(): void {
    this.computePortfolioMetrics();
    this.updateChart();
  }

  toggleChartType(): void {
    this.selectedChartType.update(type => type === 'pie' ? 'doughnut' : 'pie');
    this.updateChart();
  }

  toggleAutoRefresh(): void {
    this.autoRefresh.update(val => !val);
    if (this.autoRefresh()) {
      this.startAutoRefresh();
    }
  }

  refreshData(): void {
    this.computePortfolioMetrics();
    this.updateChart();
  }

  selectItem(item: LegendItem): void {
    this.selectedItem.set(item);
    this.showDetails.set(true);
  }

  onItemKeyDown(event: KeyboardEvent, item: LegendItem): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectItem(item);
    }
  }

  closeDetails(): void {
    this.removeFocusTrap();
    this.showDetails.set(false);
    this.selectedItem.set(null);
  }

  private removeFocusTrap(): void {
    if (this.focusTrap) {
      this.focusTrap.destroy();
      this.focusTrap = undefined;
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  getProfitLossColor(isPositive: boolean): string {
    return isPositive ? '#10b981' : '#ef4444';
  }

  getProfitLossIcon(isPositive: boolean): string {
    return isPositive ? 'trending_up' : 'trending_down';
  }

  trackByLegendItem(index: number, item: LegendItem | ReturnType<typeof this.computedLegendItems>[number]): string {
    return item.name;
  }

  private startAutoRefresh(): void {
    if (!this.isBrowser) return;
    interval(30000)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(() => this.autoRefresh())
      )
      .subscribe(() => {
        this.refreshData();
      });
  }

  private computePortfolioMetrics(): void {
    if (this.investments.length === 0) {
      this.setEmptyState();
      return;
    }

    const totalInv = this.investments.reduce((sum, inv) => sum + Number(inv.amountInvested), 0);
    const totalCurrentValue = this.investments.reduce((sum, inv) => sum + Number(inv.currentValue || 0), 0);
    const profitLoss = totalCurrentValue - totalInv;
    const profitLossPct = totalInv > 0 ? (profitLoss / totalInv) * 100 : 0;
    
    this.totalInvested.set(totalInv);
    this.totalProfitLoss.set(profitLoss);
    this.totalProfitLossPercentage.set(profitLossPct);

    this.calculatePortfolioMetrics();
  }

  private calculatePortfolioMetrics(): void {
    const portfolioData = this.investments.map(inv => ({
      name: inv.name,
      invested: Number(inv.amountInvested),
      currentValue: Number(inv.currentValue),
      profitLoss: Number(inv.currentValue) - Number(inv.amountInvested),
      profitLossPercentage: Number(inv.amountInvested) > 0 
        ? ((Number(inv.currentValue) - Number(inv.amountInvested)) / Number(inv.amountInvested)) * 100 
        : 0
    }));

    const totalInvested = portfolioData.reduce((sum, item) => sum + item.invested, 0);

    const items = portfolioData.map((item, index) => ({
      name: item.name,
      color: this.getDeterministicColor(item.name, index),
      percentage: totalInvested > 0 ? (item.invested / totalInvested) * 100 : 0,
      invested: item.invested,
      profitLoss: item.profitLoss,
      profitLossPercentage: item.profitLossPercentage,
      isPositive: item.profitLoss >= 0
    }));

    this.legendItems.set(items);
    this.generateChartData();
  }

  private generateChartData(): void {
    const items = this.legendItems();
    const labels = items.map(item => item.name);
    const data = items.map(item => item.invested);
    const colors = items.map(item => item.color);

    this.pieData.set({
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverBorderColor: '#ffffff'
      }]
    });
  }

  private updateChart(): void {
    this.generateChartData();
  }

  private setEmptyState(): void {
    this.totalInvested.set(0);
    this.totalProfitLoss.set(0);
    this.totalProfitLossPercentage.set(0);
    this.legendItems.set([]);
    this.pieData.set({
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [],
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverBorderColor: '#ffffff'
      }]
    });
  }

  private getDeterministicColor(name: string, index: number): string {
    const colors = [
      '#7E57C2', '#9575CD', '#B39DDB', '#D1C4E9', '#EDE7F6',
      '#5E35B1', '#512DA8', '#4527A0', '#311B92', '#4A148C'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash + index) % colors.length];
  }
}
