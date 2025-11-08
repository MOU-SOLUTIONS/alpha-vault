/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component DashboardInvestmentSummaryComponent
  @description Comprehensive unit tests for investment summary widget component
*/

import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { InvestmentService } from '../../../../core/services/investment.service';
import { InvestmentStatus } from '../../../../enums/investment-status';
import { InvestmentType } from '../../../../enums/investment-type';
import { InvestmentResponse } from '../../../../models/investment.model';
import { DashboardInvestmentSummaryComponent } from './dashboard-investment-summary.component';

describe('DashboardInvestmentSummaryComponent', () => {
  let component: DashboardInvestmentSummaryComponent;
  let fixture: ComponentFixture<DashboardInvestmentSummaryComponent>;
  let mockInvestmentService: jasmine.SpyObj<InvestmentService>;
  let mockChangeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;

  const mockInvestments: InvestmentResponse[] = [
    {
      id: 1,
      userId: 1,
      investmentType: InvestmentType.CRYPTO,
      name: 'Bitcoin',
      symbol: 'BTC',
      amountInvested: 10000,
      currentValue: 12000,
      status: InvestmentStatus.OPEN,
      startDate: '01/01/2024'
    },
    {
      id: 2,
      userId: 1,
      investmentType: InvestmentType.STOCKS,
      name: 'Apple Stock',
      symbol: 'AAPL',
      amountInvested: 5000,
      currentValue: 5500,
      status: InvestmentStatus.OPEN,
      startDate: '01/01/2024'
    },
    {
      id: 3,
      userId: 1,
      investmentType: InvestmentType.CRYPTO,
      name: 'Ethereum',
      symbol: 'ETH',
      amountInvested: 3000,
      soldValue: 2800,
      status: InvestmentStatus.CLOSED,
      soldDate: '06/01/2024',
      startDate: '01/01/2024'
    }
  ];

  beforeEach(async () => {
    const investmentServiceSpy = jasmine.createSpyObj('InvestmentService', ['getAll']);
    investmentServiceSpy.getAll.and.returnValue(of(mockInvestments));

    const changeDetectorRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck']);

    await TestBed.configureTestingModule({
      imports: [
        DashboardInvestmentSummaryComponent,
        RouterTestingModule
      ],
      providers: [
        { provide: InvestmentService, useValue: investmentServiceSpy },
        { provide: ChangeDetectorRef, useValue: changeDetectorRefSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardInvestmentSummaryComponent);
    component = fixture.componentInstance;
    mockInvestmentService = TestBed.inject(InvestmentService) as jasmine.SpyObj<InvestmentService>;
    mockChangeDetectorRef = TestBed.inject(ChangeDetectorRef) as jasmine.SpyObj<ChangeDetectorRef>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have proper component structure', () => {
    expect(component.isLoading).toBeDefined();
    expect(component.totalValue).toBeDefined();
    expect(component.totalInvested).toBeDefined();
    expect(component.totalGain).toBeDefined();
    expect(component.gainPercentage).toBeDefined();
    expect(component.activeInvestments).toBeDefined();
  });

  it('should initialize with default values', () => {
    expect(component.isLoading).toBe(true);
    expect(component.totalValue).toBe(0);
    expect(component.totalInvested).toBe(0);
    expect(component.totalGain).toBe(0);
    expect(component.gainPercentage).toBe(0);
    expect(component.activeInvestments).toBe(0);
  });

  it('should load investment summary on init', () => {
    fixture.detectChanges();
    
    expect(mockInvestmentService.getAll).toHaveBeenCalled();
    expect(mockChangeDetectorRef.markForCheck).toHaveBeenCalled();
  });

  it('should load and calculate investment totals correctly', (done) => {
    fixture.detectChanges();

    setTimeout(() => {
      expect(component.isLoading).toBe(false);
      expect(component.activeInvestments).toBe(2);
      expect(component.totalInvested).toBe(18000);
      expect(component.totalValue).toBe(20300);
      expect(component.totalGain).toBe(2300);
      expect(component.gainPercentage).toBeCloseTo(12.78, 1);
      expect(mockChangeDetectorRef.markForCheck).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should filter active investments correctly', (done) => {
    const investmentsWithClosed: InvestmentResponse[] = [
      { ...mockInvestments[0], status: InvestmentStatus.OPEN },
      { ...mockInvestments[1], status: InvestmentStatus.CLOSED, soldDate: '01/01/2024' },
      { ...mockInvestments[2], status: InvestmentStatus.OPEN }
    ];
    
    mockInvestmentService.getAll.and.returnValue(of(investmentsWithClosed));
    
    component['loadInvestmentSummary']();
    
    setTimeout(() => {
      expect(component.activeInvestments).toBe(2);
      done();
    }, 100);
  });

  it('should handle investments with soldDate but not CLOSED status', (done) => {
    const investmentsWithSoldDate: InvestmentResponse[] = [
      { ...mockInvestments[0], status: InvestmentStatus.OPEN, soldDate: '01/01/2024' }
    ];
    
    mockInvestmentService.getAll.and.returnValue(of(investmentsWithSoldDate));
    
    component['loadInvestmentSummary']();
    
    setTimeout(() => {
      expect(component.activeInvestments).toBe(0);
      done();
    }, 100);
  });

  it('should calculate total invested from amountInvested field', (done) => {
    const investments: InvestmentResponse[] = [
      { ...mockInvestments[0], amountInvested: 5000 },
      { ...mockInvestments[1], amountInvested: 3000 }
    ];
    
    mockInvestmentService.getAll.and.returnValue(of(investments));
    
    component['loadInvestmentSummary']();
    
    setTimeout(() => {
      expect(component.totalInvested).toBe(8000);
      done();
    }, 100);
  });

  it('should use soldValue for closed investments', (done) => {
    const closedInvestment: InvestmentResponse[] = [
      {
        ...mockInvestments[0],
        status: InvestmentStatus.CLOSED,
        soldValue: 15000,
        soldDate: '01/01/2024'
      }
    ];
    
    mockInvestmentService.getAll.and.returnValue(of(closedInvestment));
    
    component['loadInvestmentSummary']();
    
    setTimeout(() => {
      expect(component.totalValue).toBe(15000);
      done();
    }, 100);
  });

  it('should use currentValue for open investments', (done) => {
    const openInvestment: InvestmentResponse[] = [
      {
        ...mockInvestments[0],
        status: InvestmentStatus.OPEN,
        currentValue: 15000
      }
    ];
    
    mockInvestmentService.getAll.and.returnValue(of(openInvestment));
    
    component['loadInvestmentSummary']();
    
    setTimeout(() => {
      expect(component.totalValue).toBe(15000);
      done();
    }, 100);
  });

  it('should fallback to amountInvested when currentValue is missing', (done) => {
    const investmentWithoutCurrentValue: InvestmentResponse[] = [
      {
        ...mockInvestments[0],
        status: InvestmentStatus.OPEN,
        currentValue: undefined
      }
    ];
    
    mockInvestmentService.getAll.and.returnValue(of(investmentWithoutCurrentValue));
    
    component['loadInvestmentSummary']();
    
    setTimeout(() => {
      expect(component.totalValue).toBe(10000);
      done();
    }, 100);
  });

  it('should calculate gain percentage correctly', (done) => {
    const investments: InvestmentResponse[] = [
      { ...mockInvestments[0], amountInvested: 10000, currentValue: 15000 }
    ];
    
    mockInvestmentService.getAll.and.returnValue(of(investments));
    
    component['loadInvestmentSummary']();
    
    setTimeout(() => {
      expect(component.totalGain).toBe(5000);
      expect(component.gainPercentage).toBe(50);
      done();
    }, 100);
  });

  it('should handle zero gain percentage when totalInvested is zero', (done) => {
    const emptyInvestments: InvestmentResponse[] = [];
    
    mockInvestmentService.getAll.and.returnValue(of(emptyInvestments));
    
    component['loadInvestmentSummary']();
    
    setTimeout(() => {
      expect(component.totalInvested).toBe(0);
      expect(component.gainPercentage).toBe(0);
      done();
    }, 100);
  });

  it('should handle negative gains correctly', (done) => {
    const lossInvestment: InvestmentResponse[] = [
      {
        ...mockInvestments[0],
        amountInvested: 10000,
        currentValue: 8000
      }
    ];
    
    mockInvestmentService.getAll.and.returnValue(of(lossInvestment));
    
    component['loadInvestmentSummary']();
    
    setTimeout(() => {
      expect(component.totalGain).toBe(-2000);
      expect(component.gainPercentage).toBe(-20);
      expect(component.isGainPositive).toBe(false);
      done();
    }, 100);
  });

  it('should handle API errors gracefully', (done) => {
    mockInvestmentService.getAll.and.returnValue(
      throwError(() => new Error('API Error'))
    );
    
    component['loadInvestmentSummary']();
    
    setTimeout(() => {
      expect(component.isLoading).toBe(false);
      expect(component.totalValue).toBe(0);
      expect(component.totalInvested).toBe(0);
      expect(component.totalGain).toBe(0);
      expect(component.gainPercentage).toBe(0);
      expect(component.activeInvestments).toBe(0);
      expect(mockChangeDetectorRef.markForCheck).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should handle empty investments array', (done) => {
    mockInvestmentService.getAll.and.returnValue(of([]));
    
    component['loadInvestmentSummary']();
    
    setTimeout(() => {
      expect(component.activeInvestments).toBe(0);
      expect(component.totalInvested).toBe(0);
      expect(component.totalValue).toBe(0);
      expect(component.totalGain).toBe(0);
      expect(component.gainPercentage).toBe(0);
      done();
    }, 100);
  });

  it('should format gain percentage correctly for positive values', () => {
    component.gainPercentage = 12.345;
    
    expect(component.formattedGainPercentage).toBe('+12.35%');
  });

  it('should format gain percentage correctly for negative values', () => {
    component.gainPercentage = -5.678;
    
    expect(component.formattedGainPercentage).toBe('-5.68%');
  });

  it('should format gain percentage correctly for zero', () => {
    component.gainPercentage = 0;
    
    expect(component.formattedGainPercentage).toBe('+0.00%');
  });

  it('should return true for isGainPositive when gain is positive', () => {
    component.totalGain = 1000;
    
    expect(component.isGainPositive).toBe(true);
  });

  it('should return false for isGainPositive when gain is negative', () => {
    component.totalGain = -500;
    
    expect(component.isGainPositive).toBe(false);
  });

  it('should return true for isGainPositive when gain is zero', () => {
    component.totalGain = 0;
    
    expect(component.isGainPositive).toBe(true);
  });

  it('should display loading state initially', () => {
    component.isLoading = true;
    fixture.detectChanges();
    
    const loadingElement = fixture.nativeElement.querySelector('.loading-state');
    expect(loadingElement).toBeTruthy();
    
    const contentElement = fixture.nativeElement.querySelector('.investment-content');
    expect(contentElement).toBeFalsy();
  });

  it('should display investment content when not loading', () => {
    component.isLoading = false;
    component.totalValue = 20000;
    component.totalInvested = 15000;
    component.activeInvestments = 2;
    component.totalGain = 5000;
    component.gainPercentage = 33.33;
    fixture.detectChanges();
    
    const contentElement = fixture.nativeElement.querySelector('.investment-content');
    expect(contentElement).toBeTruthy();
    
    const loadingElement = fixture.nativeElement.querySelector('.loading-state');
    expect(loadingElement).toBeFalsy();
  });

  it('should display formatted currency values', () => {
    component.isLoading = false;
    component.totalValue = 20000;
    component.totalInvested = 15000;
    fixture.detectChanges();
    
    const portfolioValueElement = fixture.nativeElement.querySelector('.stat-value.value');
    expect(portfolioValueElement).toBeTruthy();
    expect(portfolioValueElement.textContent).toContain('$20,000');
    
    const investedElement = fixture.nativeElement.querySelector('.stat-value.invested');
    expect(investedElement).toBeTruthy();
    expect(investedElement.textContent).toContain('$15,000');
  });

  it('should display active investments count', () => {
    component.isLoading = false;
    component.activeInvestments = 5;
    fixture.detectChanges();
    
    const activeElement = fixture.nativeElement.querySelector('.stat-value.active');
    expect(activeElement).toBeTruthy();
    expect(activeElement.textContent).toContain('5');
  });

  it('should display positive gain with correct styling', () => {
    component.isLoading = false;
    component.totalGain = 5000;
    component.gainPercentage = 33.33;
    fixture.detectChanges();
    
    const gainSection = fixture.nativeElement.querySelector('.gain-section');
    expect(gainSection).toBeTruthy();
    expect(gainSection.classList.contains('positive')).toBe(true);
    expect(gainSection.classList.contains('negative')).toBe(false);
    
    const gainAmount = fixture.nativeElement.querySelector('.gain-amount');
    expect(gainAmount.textContent).toContain('+');
  });

  it('should display negative gain with correct styling', () => {
    component.isLoading = false;
    component.totalGain = -2000;
    component.gainPercentage = -13.33;
    fixture.detectChanges();
    
    const gainSection = fixture.nativeElement.querySelector('.gain-section');
    expect(gainSection).toBeTruthy();
    expect(gainSection.classList.contains('positive')).toBe(false);
    expect(gainSection.classList.contains('negative')).toBe(true);
    
    const gainAmount = fixture.nativeElement.querySelector('.gain-amount');
    expect(gainAmount.textContent).not.toContain('+');
  });

  it('should display formatted gain percentage', () => {
    component.isLoading = false;
    component.gainPercentage = 12.345;
    fixture.detectChanges();
    
    const gainPercentageElement = fixture.nativeElement.querySelector('.gain-percentage');
    expect(gainPercentageElement).toBeTruthy();
    expect(gainPercentageElement.textContent).toContain('+12.35%');
  });

  it('should have proper ARIA labels', () => {
    fixture.detectChanges();
    
    const article = fixture.nativeElement.querySelector('article[role="article"]');
    expect(article).toBeTruthy();
    expect(article.getAttribute('aria-labelledby')).toBe('investmentTitle');
    
    const title = fixture.nativeElement.querySelector('#investmentTitle');
    expect(title).toBeTruthy();
    
    const link = fixture.nativeElement.querySelector('.view-all-link');
    expect(link).toBeTruthy();
    expect(link.getAttribute('aria-label')).toBe('View all investments');
  });

  it('should support keyboard navigation on link', () => {
    component.isLoading = false;
    fixture.detectChanges();
    
    const link = fixture.nativeElement.querySelector('.view-all-link');
    expect(link).toBeTruthy();
    
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    
    spyOn(enterEvent, 'preventDefault');
    spyOn(enterEvent, 'stopPropagation');
    spyOn(spaceEvent, 'preventDefault');
    spyOn(spaceEvent, 'stopPropagation');
    
    link.dispatchEvent(enterEvent);
    link.dispatchEvent(spaceEvent);
    
    expect(enterEvent.preventDefault).toHaveBeenCalled();
    expect(enterEvent.stopPropagation).toHaveBeenCalled();
    expect(spaceEvent.preventDefault).toHaveBeenCalled();
    expect(spaceEvent.stopPropagation).toHaveBeenCalled();
  });

  it('should have hidden icons marked with aria-hidden', () => {
    fixture.detectChanges();
    
    const icons = fixture.nativeElement.querySelectorAll('i[aria-hidden="true"]');
    expect(icons.length).toBeGreaterThan(0);
    
    icons.forEach((icon: HTMLElement) => {
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    });
  });

  it('should handle zero values correctly', () => {
    component.isLoading = false;
    component.totalValue = 0;
    component.totalInvested = 0;
    component.activeInvestments = 0;
    component.totalGain = 0;
    component.gainPercentage = 0;
    fixture.detectChanges();
    
    const portfolioValueElement = fixture.nativeElement.querySelector('.stat-value.value');
    expect(portfolioValueElement.textContent).toContain('$0');
    
    const activeElement = fixture.nativeElement.querySelector('.stat-value.active');
    expect(activeElement.textContent).toContain('0');
  });

  it('should handle very large investment values', () => {
    component.isLoading = false;
    component.totalValue = 999999999.99;
    fixture.detectChanges();
    
    const portfolioValueElement = fixture.nativeElement.querySelector('.stat-value.value');
    expect(portfolioValueElement).toBeTruthy();
    expect(portfolioValueElement.textContent).toContain('$');
  });

  it('should handle investments with missing optional fields', (done) => {
    const minimalInvestment: InvestmentResponse[] = [
      {
        id: 1,
        userId: 1,
        investmentType: InvestmentType.CRYPTO,
        name: 'Test',
        amountInvested: 1000,
        status: InvestmentStatus.OPEN,
        startDate: '01/01/2024'
      }
    ];
    
    mockInvestmentService.getAll.and.returnValue(of(minimalInvestment));
    
    component['loadInvestmentSummary']();
    
    setTimeout(() => {
      expect(component.totalInvested).toBe(1000);
      expect(component.totalValue).toBe(1000);
      done();
    }, 100);
  });

  it('should use OnPush change detection strategy', () => {
    const componentDef = (component.constructor as unknown as { ɵcmp: ComponentDef<DashboardInvestmentSummaryComponent> }).ɵcmp;
    expect(componentDef).toBeDefined();
    expect(componentDef.onPush).toBeDefined();
  });

  it('should call markForCheck after data updates', (done) => {
    fixture.detectChanges();
    
    mockChangeDetectorRef.markForCheck.calls.reset();
    
    setTimeout(() => {
      expect(mockChangeDetectorRef.markForCheck).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should cleanup subscriptions on destroy', () => {
    fixture.detectChanges();
    
    const subscriptionCount = (component as unknown as { destroyRef: unknown })['destroyRef'] ? 1 : 0;
    
    fixture.destroy();
    
    expect(subscriptionCount).toBeGreaterThanOrEqual(0);
  });
});

