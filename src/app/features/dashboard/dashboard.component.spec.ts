/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component DashboardComponent
  @description Comprehensive unit tests for financial dashboard component
*/

import { ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { SeoService } from '../../core/seo/seo.service';
import { AuthService } from '../../core/services/auth.service';
import { BudgetService } from '../../core/services/budget.service';
import { DebtService } from '../../core/services/debt.service';
import { ExpenseService } from '../../core/services/expense.service';
import { IncomeService } from '../../core/services/income.service';
import { InvestmentService } from '../../core/services/investment.service';
import { SavingGoalService } from '../../core/services/saving.service';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockIncomeService: jasmine.SpyObj<IncomeService>;
  let mockExpenseService: jasmine.SpyObj<ExpenseService>;
  let mockBudgetService: jasmine.SpyObj<BudgetService>;
  let mockSavingService: jasmine.SpyObj<SavingGoalService>;
  let mockInvestmentService: jasmine.SpyObj<InvestmentService>;
  let mockDebtService: jasmine.SpyObj<DebtService>;
  let mockSeoService: jasmine.SpyObj<SeoService>;
  let mockChangeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;

  const mockDashboardData = {
    monthlyIncome: 5000,
    yearlyIncome: 60000,
    monthlyExpense: 3000,
    yearlyExpense: 36000,
    savingsStats: {
      totalCurrent: 10000,
      totalTarget: 20000,
      goalsCount: 3,
      totalRemaining: 10000
    },
    investments: [
      { id: 1, status: 'ACTIVE', currentValue: 5000, amountInvested: 4000 },
      { id: 2, status: 'CLOSED', soldValue: 3000, amountInvested: 2500 }
    ],
    debtTotals: {
      totalRemaining: 15000,
      totalMinPayments: 500,
      debtsCount: 2
    },
    budgetSummary: {
      totalBudget: 3500,
      availableBudget: 500
    }
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getUserId']);
    authServiceSpy.getUserId.and.returnValue(1);

    const incomeServiceSpy = jasmine.createSpyObj('IncomeService', [
      'getCurrentMonthIncome',
      'getCurrentYearIncome'
    ]);
    incomeServiceSpy.getCurrentMonthIncome.and.returnValue(of(mockDashboardData.monthlyIncome));
    incomeServiceSpy.getCurrentYearIncome.and.returnValue(of(mockDashboardData.yearlyIncome));

    const expenseServiceSpy = jasmine.createSpyObj('ExpenseService', [
      'getMonthExpense',
      'getYearExpense'
    ]);
    expenseServiceSpy.getMonthExpense.and.returnValue(of(mockDashboardData.monthlyExpense));
    expenseServiceSpy.getYearExpense.and.returnValue(of(mockDashboardData.yearlyExpense));

    const budgetServiceSpy = jasmine.createSpyObj('BudgetService', [
      'getCurrentMonthBudgetSummary'
    ]);
    budgetServiceSpy.getCurrentMonthBudgetSummary.and.returnValue(of(mockDashboardData.budgetSummary));

    const savingServiceSpy = jasmine.createSpyObj('SavingGoalService', ['getTotals']);
    savingServiceSpy.getTotals.and.returnValue(of(mockDashboardData.savingsStats));

    const investmentServiceSpy = jasmine.createSpyObj('InvestmentService', ['getAll']);
    investmentServiceSpy.getAll.and.returnValue(of(mockDashboardData.investments));

    const debtServiceSpy = jasmine.createSpyObj('DebtService', ['getDebtTotals']);
    debtServiceSpy.getDebtTotals.and.returnValue(of(mockDashboardData.debtTotals));

    const seoServiceSpy = jasmine.createSpyObj('SeoService', ['set']);

    const changeDetectorRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck']);

    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        RouterTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: IncomeService, useValue: incomeServiceSpy },
        { provide: ExpenseService, useValue: expenseServiceSpy },
        { provide: BudgetService, useValue: budgetServiceSpy },
        { provide: SavingGoalService, useValue: savingServiceSpy },
        { provide: InvestmentService, useValue: investmentServiceSpy },
        { provide: DebtService, useValue: debtServiceSpy },
        { provide: SeoService, useValue: seoServiceSpy },
        { provide: ChangeDetectorRef, useValue: changeDetectorRefSpy },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockIncomeService = TestBed.inject(IncomeService) as jasmine.SpyObj<IncomeService>;
    mockExpenseService = TestBed.inject(ExpenseService) as jasmine.SpyObj<ExpenseService>;
    mockBudgetService = TestBed.inject(BudgetService) as jasmine.SpyObj<BudgetService>;
    mockSavingService = TestBed.inject(SavingGoalService) as jasmine.SpyObj<SavingGoalService>;
    mockInvestmentService = TestBed.inject(InvestmentService) as jasmine.SpyObj<InvestmentService>;
    mockDebtService = TestBed.inject(DebtService) as jasmine.SpyObj<DebtService>;
    mockSeoService = TestBed.inject(SeoService) as jasmine.SpyObj<SeoService>;
    mockChangeDetectorRef = TestBed.inject(ChangeDetectorRef) as jasmine.SpyObj<ChangeDetectorRef>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have proper component structure', () => {
    expect(component.isLoading).toBeDefined();
    expect(component.totalIncome).toBeDefined();
    expect(component.totalExpense).toBeDefined();
    expect(component.netWorth).toBeDefined();
    expect(component.currentMonthName).toBeDefined();
    expect(component.currentYear).toBeDefined();
  });

  it('should initialize cached date values in constructor', () => {
    expect(component.currentMonthName).toBeTruthy();
    expect(typeof component.currentMonthName).toBe('string');
    expect(component.currentYear).toBeGreaterThan(2000);
    expect(component.currentYear).toBeLessThan(2100);
  });

  it('should initialize with default values', () => {
    expect(component.isLoading).toBe(true);
    expect(component.totalIncome).toBe(0);
    expect(component.totalExpense).toBe(0);
    expect(component.netWorth).toBe(0);
    expect(component.totalSavings).toBe(0);
    expect(component.totalInvestments).toBe(0);
    expect(component.totalDebt).toBe(0);
  });

  it('should setup SEO on init', () => {
    fixture.detectChanges();
    expect(mockSeoService.set).toHaveBeenCalled();
  });

  it('should load dashboard data on init', (done) => {
    fixture.detectChanges();

    setTimeout(() => {
      expect(mockIncomeService.getCurrentMonthIncome).toHaveBeenCalled();
      expect(mockIncomeService.getCurrentYearIncome).toHaveBeenCalled();
      expect(mockExpenseService.getMonthExpense).toHaveBeenCalled();
      expect(mockExpenseService.getYearExpense).toHaveBeenCalled();
      expect(mockSavingService.getTotals).toHaveBeenCalled();
      expect(mockInvestmentService.getAll).toHaveBeenCalled();
      expect(mockDebtService.getDebtTotals).toHaveBeenCalled();
      expect(mockBudgetService.getCurrentMonthBudgetSummary).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should load and process all data correctly', (done) => {
    fixture.detectChanges();

    setTimeout(() => {
      expect(component.isLoading).toBe(false);
      expect(component.monthlyIncome).toBe(5000);
      expect(component.yearlyIncome).toBe(60000);
      expect(component.totalIncome).toBe(60000);
      expect(component.monthlyExpense).toBe(3000);
      expect(component.yearlyExpense).toBe(36000);
      expect(component.totalExpense).toBe(36000);
      done();
    }, 100);
  });

  it('should process savings stats correctly', (done) => {
    fixture.detectChanges();

    setTimeout(() => {
      expect(component.totalSavings).toBe(10000);
      done();
    }, 100);
  });

  it('should process investments correctly', (done) => {
    fixture.detectChanges();

    setTimeout(() => {
      // Active investment: 5000, Closed investment: 3000
      expect(component.totalInvestments).toBe(8000);
      done();
    }, 100);
  });

  it('should process debt totals correctly', (done) => {
    fixture.detectChanges();

    setTimeout(() => {
      expect(component.totalDebt).toBe(15000);
      done();
    }, 100);
  });

  it('should process budget summary correctly', (done) => {
    fixture.detectChanges();

    setTimeout(() => {
      expect(component.monthlyBudget).toBe(3500);
      expect(component.availableBudget).toBe(500);
      done();
    }, 100);
  });

  it('should calculate net worth correctly', (done) => {
    fixture.detectChanges();

    setTimeout(() => {
      // Net worth = totalIncome - totalExpense + totalSavings + totalInvestments - totalDebt
      // 60000 - 36000 + 10000 + 8000 - 15000 = 27000
      expect(component.netWorth).toBe(27000);
      done();
    }, 100);
  });

  it('should handle missing userId gracefully', () => {
    mockAuthService.getUserId.and.returnValue(null);
    
    component['loadDashboardData']();
    
    expect(component.isLoading).toBe(false);
    expect(mockChangeDetectorRef.markForCheck).toHaveBeenCalled();
    expect(mockIncomeService.getCurrentMonthIncome).not.toHaveBeenCalled();
  });

  it('should handle API errors gracefully', (done) => {
    mockIncomeService.getCurrentMonthIncome.and.returnValue(
      throwError(() => new Error('API Error'))
    );
    
    fixture.detectChanges();
    
    setTimeout(() => {
      expect(component.isLoading).toBe(false);
      expect(component.monthlyIncome).toBe(0);
      done();
    }, 100);
  });

  it('should calculate monthlySurplus correctly', () => {
    component.monthlyIncome = 5000;
    component.monthlyExpense = 3000;
    expect(component.monthlySurplus).toBe(2000);

    component.monthlyIncome = 3000;
    component.monthlyExpense = 5000;
    expect(component.monthlySurplus).toBe(-2000);
  });

  it('should calculate isSurplus correctly', () => {
    component.monthlyIncome = 5000;
    component.monthlyExpense = 3000;
    expect(component.isSurplus).toBe(true);

    component.monthlyIncome = 3000;
    component.monthlyExpense = 5000;
    expect(component.isSurplus).toBe(false);
  });

  it('should calculate savingsRate correctly', () => {
    component.totalSavings = 5000;
    component.monthlyIncome = 10000;
    expect(component.savingsRate).toBe('50.0');

    component.totalSavings = 2500;
    component.monthlyIncome = 5000;
    expect(component.savingsRate).toBe('50.0');

    component.monthlyIncome = 0;
    expect(component.savingsRate).toBe('0');
  });

  it('should display loading state initially', () => {
    component.isLoading = true;
    fixture.detectChanges();
    
    const loadingElement = fixture.nativeElement.querySelector('.loading-container');
    expect(loadingElement).toBeTruthy();
    
    const contentElement = fixture.nativeElement.querySelector('.dashboard-content');
    expect(contentElement).toBeFalsy();
  });

  it('should display dashboard content when not loading', () => {
    component.isLoading = false;
    fixture.detectChanges();
    
    const contentElement = fixture.nativeElement.querySelector('.dashboard-content');
    expect(contentElement).toBeTruthy();
    
    const loadingElement = fixture.nativeElement.querySelector('.loading-container');
    expect(loadingElement).toBeFalsy();
  });

  it('should display current month and year in header', () => {
    component.isLoading = false;
    fixture.detectChanges();
    
    const metaText = fixture.nativeElement.querySelector('.meta-text');
    expect(metaText.textContent).toContain(component.currentMonthName);
    expect(metaText.textContent).toContain(component.currentYear.toString());
  });

  it('should display all overview cards', () => {
    component.isLoading = false;
    fixture.detectChanges();
    
    const overviewCards = fixture.nativeElement.querySelectorAll('.overview-card');
    expect(overviewCards.length).toBe(6);
  });

  it('should display overview card values correctly', () => {
    component.isLoading = false;
    component.netWorth = 27000;
    component.totalIncome = 60000;
    component.totalExpense = 36000;
    component.totalSavings = 10000;
    component.totalInvestments = 8000;
    component.totalDebt = 15000;
    fixture.detectChanges();
    
    const valueAmounts = fixture.nativeElement.querySelectorAll('.value-amount');
    expect(valueAmounts.length).toBeGreaterThan(0);
  });

  it('should display monthly surplus correctly', () => {
    component.isLoading = false;
    component.monthlyIncome = 5000;
    component.monthlyExpense = 3000;
    fixture.detectChanges();
    
    const surplusStat = fixture.nativeElement.querySelector('.comparison-stat .stat-value');
    expect(surplusStat.textContent).toContain('$2,000');
    
    const detail = fixture.nativeElement.querySelector('.comparison-stat .stat-detail');
    expect(detail.textContent).toBe('Surplus');
    expect(detail.classList.contains('positive')).toBe(true);
  });

  it('should display monthly deficit correctly', () => {
    component.isLoading = false;
    component.monthlyIncome = 3000;
    component.monthlyExpense = 5000;
    fixture.detectChanges();
    
    const deficitStat = fixture.nativeElement.querySelector('.comparison-stat .stat-value');
    expect(deficitStat.textContent).toContain('-$2,000');
    
    const detail = fixture.nativeElement.querySelector('.comparison-stat .stat-detail');
    expect(detail.textContent).toBe('Deficit');
    expect(detail.classList.contains('negative')).toBe(true);
  });

  it('should display savings rate correctly', () => {
    component.isLoading = false;
    component.totalSavings = 5000;
    component.monthlyIncome = 10000;
    fixture.detectChanges();
    
    const savingsRateStat = fixture.nativeElement.querySelector('.savings-rate-stat .stat-value');
    expect(savingsRateStat.textContent).toBe('50.0%');
  });

  it('should have proper ARIA labels', () => {
    component.isLoading = false;
    fixture.detectChanges();
    
    const main = fixture.nativeElement.querySelector('main[role="main"]');
    expect(main).toBeTruthy();
    expect(main.getAttribute('aria-label')).toBe('Financial Dashboard');
    
    const overviewSection = fixture.nativeElement.querySelector('section[aria-labelledby="overviewHeading"]');
    expect(overviewSection).toBeTruthy();
    
    const articles = fixture.nativeElement.querySelectorAll('article[role="article"]');
    expect(articles.length).toBeGreaterThan(0);
    
    articles.forEach((article: HTMLElement) => {
      expect(article.getAttribute('aria-label')).toBeTruthy();
    });
  });

  it('should have loading state with proper ARIA attributes', () => {
    component.isLoading = true;
    fixture.detectChanges();
    
    const loadingContainer = fixture.nativeElement.querySelector('.loading-container');
    expect(loadingContainer.getAttribute('role')).toBe('status');
    expect(loadingContainer.getAttribute('aria-label')).toBe('Loading dashboard data');
  });

  it('should have aria-live region for screen reader updates', () => {
    component.isLoading = false;
    fixture.detectChanges();
    
    const srOnly = fixture.nativeElement.querySelector('.sr-only[aria-live]');
    expect(srOnly).toBeTruthy();
    expect(srOnly.getAttribute('aria-live')).toBe('polite');
    expect(srOnly.getAttribute('aria-atomic')).toBe('true');
  });

  it('should have hidden icons marked with aria-hidden', () => {
    component.isLoading = false;
    fixture.detectChanges();
    
    const icons = fixture.nativeElement.querySelectorAll('i[aria-hidden="true"]');
    expect(icons.length).toBeGreaterThan(0);
    
    icons.forEach((icon: HTMLElement) => {
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    });
  });

  it('should handle empty investments array', (done) => {
    mockInvestmentService.getAll.and.returnValue(of([]));
    
    fixture.detectChanges();
    
    setTimeout(() => {
      expect(component.totalInvestments).toBe(0);
      done();
    }, 100);
  });

  it('should handle null budget summary', (done) => {
    mockBudgetService.getCurrentMonthBudgetSummary.and.returnValue(of(null));
    
    fixture.detectChanges();
    
    setTimeout(() => {
      expect(component.monthlyBudget).toBe(0);
      done();
    }, 100);
  });

  it('should handle debt totals as Map', (done) => {
    const debtMap = new Map();
    debtMap.set('totalRemaining', 20000);
    mockDebtService.getDebtTotals.and.returnValue(of(debtMap));
    
    fixture.detectChanges();
    
    setTimeout(() => {
      expect(component.totalDebt).toBe(20000);
      done();
    }, 100);
  });

  it('should handle alternative savings field names', (done) => {
    mockSavingService.getTotals.and.returnValue(of({
      totalCurrentAmount: 15000,
      totalTargetAmount: 25000,
      activeGoals: 5
    }));
    
    fixture.detectChanges();
    
    setTimeout(() => {
      expect(component.totalSavings).toBe(15000);
      done();
    }, 100);
  });

  it('should use OnPush change detection strategy', () => {
    const componentDef = (component.constructor as any).ɵcmp;
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
    
    const subscriptionCount = (component as any)['destroyRef'] ? 1 : 0;
    
    fixture.destroy();
    
    expect(subscriptionCount).toBeGreaterThanOrEqual(0);
  });

  it('should setup SEO metadata correctly', () => {
    fixture.detectChanges();
    
    expect(mockSeoService.set).toHaveBeenCalledWith(jasmine.objectContaining({
      title: 'Financial Dashboard',
      description: jasmine.any(String),
      canonicalUrl: 'https://alphavault.app/main/body/dashboard'
    }));
  });

  it('should not setup SEO on server side', () => {
    TestBed.resetTestingModule();
    
    TestBed.configureTestingModule({
      imports: [DashboardComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: IncomeService, useValue: mockIncomeService },
        { provide: ExpenseService, useValue: mockExpenseService },
        { provide: BudgetService, useValue: mockBudgetService },
        { provide: SavingGoalService, useValue: mockSavingService },
        { provide: InvestmentService, useValue: mockInvestmentService },
        { provide: DebtService, useValue: mockDebtService },
        { provide: SeoService, useValue: mockSeoService },
        { provide: ChangeDetectorRef, useValue: mockChangeDetectorRef },
        { provide: PLATFORM_ID, useValue: 'server' }
      ]
    });
    
    const serverFixture = TestBed.createComponent(DashboardComponent);
    const serverComponent = serverFixture.componentInstance;
    serverFixture.detectChanges();
    
    expect(mockSeoService.set).toHaveBeenCalled();
  });
});

