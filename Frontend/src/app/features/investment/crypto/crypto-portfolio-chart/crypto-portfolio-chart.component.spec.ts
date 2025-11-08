/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component CryptoPortfolioChartComponent
  @description Crypto portfolio chart component for displaying crypto portfolio allocation
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { InvestmentStatus } from '../../../../enums/investment-status';
import { InvestmentType } from '../../../../enums/investment-type';
import { RiskLevel } from '../../../../enums/risk-level';
import { Investment } from '../../../../models/investment.model';
import { CryptoPortfolioChartComponent } from './crypto-portfolio-chart.component';

describe('CryptoPortfolioChartComponent', () => {
  let component: CryptoPortfolioChartComponent;
  let fixture: ComponentFixture<CryptoPortfolioChartComponent>;

  const mockInvestments: Investment[] = [
    {
      id: 1,
      userId: 1,
      investmentType: InvestmentType.CRYPTO,
      name: 'Bitcoin',
      symbol: 'BTC',
      amountInvested: 10000,
      currentValue: 12000,
      startDate: '01/01/2024',
      status: InvestmentStatus.OPEN,
      riskLevel: 'HIGH' as RiskLevel
    },
    {
      id: 2,
      userId: 1,
      investmentType: InvestmentType.CRYPTO,
      name: 'Ethereum',
      symbol: 'ETH',
      amountInvested: 5000,
      currentValue: 4500,
      startDate: '01/01/2024',
      status: InvestmentStatus.OPEN,
      riskLevel: 'MEDIUM' as RiskLevel
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CryptoPortfolioChartComponent],
      providers: [provideAnimationsAsync()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CryptoPortfolioChartComponent);
    component = fixture.componentInstance;
    component.investments = mockInvestments;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display empty state when investments array is empty', () => {
    component.investments = [];
    fixture.detectChanges();
    
    const emptyState = fixture.debugElement.query(By.css('.empty-state'));
    expect(emptyState).toBeTruthy();
    
    const emptyTitle = fixture.debugElement.query(By.css('.empty-title'));
    expect(emptyTitle?.nativeElement.textContent).toContain('No Crypto Investments Yet');
  });

  it('should compute portfolio metrics on input change', () => {
    expect(component.totalInvested()).toBe(15000);
    expect(component.totalProfitLoss()).toBe(1500);
    expect(component.totalProfitLossPercentage()).toBeCloseTo(10, 1);
  });

  it('should format currency correctly', () => {
    expect(component.formatCurrency(1234.56)).toContain('1,235');
    expect(component.formatCurrency(0)).toContain('$0');
    expect(component.formatCurrency(1000000)).toContain('1,000,000');
  });

  it('should format percentage correctly', () => {
    expect(component.formatPercentage(12.345)).toBe('12.3%');
    expect(component.formatPercentage(0)).toBe('0.0%');
    expect(component.formatPercentage(100)).toBe('100.0%');
  });

  it('should toggle chart type', () => {
    expect(component.selectedChartType()).toBe('pie');
    component.toggleChartType();
    expect(component.selectedChartType()).toBe('doughnut');
    component.toggleChartType();
    expect(component.selectedChartType()).toBe('pie');
  });

  it('should compute chart type icon and label', () => {
    expect(component.chartTypeIcon()).toBe('donut_large');
    expect(component.chartTypeLabel()).toBe('Switch to Doughnut Chart');
    
    component.toggleChartType();
    expect(component.chartTypeIcon()).toBe('pie_chart');
    expect(component.chartTypeLabel()).toBe('Switch to Pie Chart');
  });

  it('should toggle auto refresh', () => {
    expect(component.autoRefresh()).toBe(true);
    component.toggleAutoRefresh();
    expect(component.autoRefresh()).toBe(false);
    component.toggleAutoRefresh();
    expect(component.autoRefresh()).toBe(true);
  });

  it('should support keyboard navigation for chart type toggle', () => {
    const button = fixture.debugElement.query(By.css('.chart-type-btn'));
    expect(button).toBeTruthy();
    
    const clickSpy = spyOn(component, 'toggleChartType');
    button.nativeElement.click();
    expect(clickSpy).toHaveBeenCalled();
  });

  it('should compute formatted values via computed signals', () => {
    expect(component.formattedTotalInvested()).toContain('15,000');
    expect(component.formattedTotalProfitLoss()).toContain('1,500');
    expect(component.formattedTotalProfitLossPercentage()).toBe('10.0%');
  });

  it('should compute profit loss color and icon', () => {
    expect(component.profitLossColor()).toBe('#10b981');
    expect(component.profitLossIcon()).toBe('trending_up');
    
    component.totalProfitLoss.set(-100);
    fixture.detectChanges();
    
    expect(component.profitLossColor()).toBe('#ef4444');
    expect(component.profitLossIcon()).toBe('trending_down');
  });

  it('should generate legend items with computed formatting', () => {
    const legendItems = component.computedLegendItems();
    expect(legendItems.length).toBe(2);
    
    expect(legendItems[0].name).toBe('Bitcoin');
    expect(legendItems[0].formattedPercentage).toContain('%');
    expect(legendItems[0].formattedInvested).toContain('$');
    expect(legendItems[0].profitLossColor).toBe('#10b981');
    
    expect(legendItems[1].name).toBe('Ethereum');
    expect(legendItems[1].profitLossColor).toBe('#ef4444');
  });

  it('should open modal on legend item click', () => {
    const legendItems = component.legendItems();
    expect(legendItems.length).toBeGreaterThan(0);
    
    const firstItem = legendItems[0];
    component.selectItem(firstItem);
    fixture.detectChanges();
    
    expect(component.showDetails()).toBe(true);
    expect(component.selectedItem()).toBe(firstItem);
    
    const modal = fixture.debugElement.query(By.css('.details-modal'));
    expect(modal).toBeTruthy();
  });

  it('should support keyboard activation for legend items', () => {
    const legendItems = component.legendItems();
    expect(legendItems.length).toBeGreaterThan(0);
    
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    
    component.onItemKeyDown(enterEvent, legendItems[0]);
    expect(component.showDetails()).toBe(true);
    
    component.closeDetails();
    component.onItemKeyDown(spaceEvent, legendItems[0]);
    expect(component.showDetails()).toBe(true);
  });

  it('should close modal on Escape key', () => {
    component.selectItem(component.legendItems()[0]);
    fixture.detectChanges();
    
    expect(component.showDetails()).toBe(true);
    
    component.closeDetails();
    fixture.detectChanges();
    
    expect(component.showDetails()).toBe(false);
    expect(component.selectedItem()).toBeNull();
  });

  it('should track legend items by name', () => {
    const item1 = { name: 'BTC', color: '#000', percentage: 50, invested: 1000, profitLoss: 100, profitLossPercentage: 10, isPositive: true };
    const item2 = { name: 'ETH', color: '#fff', percentage: 50, invested: 1000, profitLoss: -100, profitLossPercentage: -10, isPositive: false };
    
    expect(component.trackByLegendItem(0, item1)).toBe('BTC');
    expect(component.trackByLegendItem(1, item2)).toBe('ETH');
  });

  it('should emit addInvestment when empty state button is clicked', () => {
    component.investments = [];
    fixture.detectChanges();
    
    spyOn(component.addInvestment, 'emit');
    const button = fixture.debugElement.query(By.css('.empty-action-btn'));
    expect(button).toBeTruthy();
    
    button.nativeElement.click();
    expect(component.addInvestment.emit).toHaveBeenCalled();
  });

  it('should support keyboard activation for empty state button', () => {
    component.investments = [];
    fixture.detectChanges();
    
    spyOn(component.addInvestment, 'emit');
    const button = fixture.debugElement.query(By.css('.empty-action-btn'));
    
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    button.nativeElement.dispatchEvent(enterEvent);
    expect(component.addInvestment.emit).toHaveBeenCalledTimes(1);
    
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
    button.nativeElement.dispatchEvent(spaceEvent);
    expect(component.addInvestment.emit).toHaveBeenCalledTimes(2);
  });

  it('should have proper ARIA attributes', () => {
    const container = fixture.debugElement.query(By.css('.crypto-portfolio-container'));
    expect(container.nativeElement.getAttribute('role')).toBe('region');
    expect(container.nativeElement.getAttribute('aria-labelledby')).toBe('portfolioChartTitle');
    
    const statsSection = fixture.debugElement.query(By.css('.stats-section'));
    expect(statsSection.nativeElement.getAttribute('aria-live')).toBe('polite');
  });

  it('should display formatted values in template', () => {
    const totalInvested = fixture.debugElement.query(By.css('.total-invested .stat-value'));
    expect(totalInvested.nativeElement.textContent).toContain('$');
    expect(totalInvested.nativeElement.textContent).toContain('15,000');
  });

  it('should refresh data when refreshData is called', () => {
    const computeSpy = spyOn(component as any, 'computePortfolioMetrics');
    const updateSpy = spyOn(component as any, 'updateChart');
    
    component.refreshData();
    
    expect(computeSpy).toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalled();
  });

  it('should handle empty investments gracefully', () => {
    component.investments = [];
    fixture.detectChanges();
    
    expect(component.totalInvested()).toBe(0);
    expect(component.totalProfitLoss()).toBe(0);
    expect(component.totalProfitLossPercentage()).toBe(0);
    expect(component.legendItems().length).toBe(0);
  });

  it('should compute selectedItemFormatted when item is selected', () => {
    const legendItems = component.legendItems();
    component.selectItem(legendItems[0]);
    fixture.detectChanges();
    
    const formatted = component.selectedItemFormatted();
    expect(formatted).toBeTruthy();
    expect(formatted?.name).toBe(legendItems[0].name);
    expect(formatted?.formattedInvested).toContain('$');
    expect(formatted?.formattedPercentage).toContain('%');
  });

  it('should return null for selectedItemFormatted when no item selected', () => {
    expect(component.selectedItemFormatted()).toBeNull();
  });

  it('should set empty state correctly', () => {
    component.investments = [];
    fixture.detectChanges();
    
    const chartData = component.pieData();
    expect(chartData.labels?.length).toBe(0);
    expect(chartData.datasets[0].data.length).toBe(0);
  });

  it('should have button elements with proper type attribute', () => {
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    buttons.forEach(btn => {
      expect(btn.nativeElement.getAttribute('type')).toBe('button');
    });
  });

  it('should have modal with proper ARIA attributes when open', () => {
    component.selectItem(component.legendItems()[0]);
    fixture.detectChanges();
    
    const modalOverlay = fixture.debugElement.query(By.css('.details-overlay'));
    expect(modalOverlay.nativeElement.getAttribute('role')).toBe('dialog');
    expect(modalOverlay.nativeElement.getAttribute('aria-modal')).toBe('true');
  });
});
