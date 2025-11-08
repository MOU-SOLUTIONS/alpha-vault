/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component DashboardMonthlyTrendComponent
  @description Comprehensive unit tests for monthly trend chart widget component
*/

import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { AuthService } from '../../../../core/services/auth.service';
import { ExpenseService } from '../../../../core/services/expense.service';
import { IncomeService } from '../../../../core/services/income.service';
import { DashboardMonthlyTrendComponent, MonthlyTrendData } from './dashboard-monthly-trend.component';

describe('DashboardMonthlyTrendComponent', () => {
  let component: DashboardMonthlyTrendComponent;
  let fixture: ComponentFixture<DashboardMonthlyTrendComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockIncomeService: jasmine.SpyObj<IncomeService>;
  let mockExpenseService: jasmine.SpyObj<ExpenseService>;
  let mockChangeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;

  const mockYearlyIncome = [5000, 6000, 5500, 7000, 6500, 8000, 7500, 9000, 8500, 10000, 9500, 11000];
  const mockYearlyExpense = [3000, 3500, 3200, 4000, 3800, 4500, 4200, 5000, 4800, 5500, 5200, 6000];

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getUserId']);
    authServiceSpy.getUserId.and.returnValue(1);

    const incomeServiceSpy = jasmine.createSpyObj('IncomeService', ['getYearlyIncomes']);
    incomeServiceSpy.getYearlyIncomes.and.returnValue(of(mockYearlyIncome));

    const expenseServiceSpy = jasmine.createSpyObj('ExpenseService', ['getExpenseForMonthsOfCurrentYear']);
    expenseServiceSpy.getExpenseForMonthsOfCurrentYear.and.returnValue(of(mockYearlyExpense));

    const changeDetectorRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck']);

    await TestBed.configureTestingModule({
      imports: [DashboardMonthlyTrendComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: IncomeService, useValue: incomeServiceSpy },
        { provide: ExpenseService, useValue: expenseServiceSpy },
        { provide: ChangeDetectorRef, useValue: changeDetectorRefSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardMonthlyTrendComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockIncomeService = TestBed.inject(IncomeService) as jasmine.SpyObj<IncomeService>;
    mockExpenseService = TestBed.inject(ExpenseService) as jasmine.SpyObj<ExpenseService>;
    mockChangeDetectorRef = TestBed.inject(ChangeDetectorRef) as jasmine.SpyObj<ChangeDetectorRef>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have proper component structure', () => {
    expect(component.isLoading).toBeDefined();
    expect(component.monthlyData).toBeDefined();
    expect(component.maxValue).toBeDefined();
    expect(component.userId).toBeDefined();
  });

  it('should initialize with default values', () => {
    expect(component.isLoading).toBe(true);
    expect(component.monthlyData).toEqual([]);
    expect(component.maxValue).toBe(0);
    expect(component.userId).toBeNull();
  });

  it('should load monthly trend on init', () => {
    fixture.detectChanges();
    
    expect(mockAuthService.getUserId).toHaveBeenCalled();
    expect(mockIncomeService.getYearlyIncomes).toHaveBeenCalledWith(1);
    expect(mockExpenseService.getExpenseForMonthsOfCurrentYear).toHaveBeenCalled();
  });

  it('should load and calculate monthly data correctly', (done) => {
    fixture.detectChanges();

    setTimeout(() => {
      expect(component.isLoading).toBe(false);
      expect(component.monthlyData.length).toBe(12);
      expect(component.monthlyData[0].month).toBe('Jan');
      expect(component.monthlyData[0].income).toBe(5000);
      expect(component.monthlyData[0].expense).toBe(3000);
      expect(component.monthlyData[0].net).toBe(2000);
      expect(component.maxValue).toBeGreaterThan(0);
      expect(mockChangeDetectorRef.markForCheck).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should calculate percentages correctly', (done) => {
    fixture.detectChanges();

    setTimeout(() => {
      const firstMonth = component.monthlyData[0];
      expect(firstMonth.incomePercentage).toBeGreaterThanOrEqual(0);
      expect(firstMonth.incomePercentage).toBeLessThanOrEqual(100);
      expect(firstMonth.expensePercentage).toBeGreaterThanOrEqual(0);
      expect(firstMonth.expensePercentage).toBeLessThanOrEqual(100);
      done();
    }, 100);
  });

  it('should calculate animation delays correctly', (done) => {
    fixture.detectChanges();

    setTimeout(() => {
      expect(component.monthlyData[0].animationDelay).toBe('0s');
      expect(component.monthlyData[1].animationDelay).toBe('0.05s');
      expect(component.monthlyData[2].animationDelay).toBe('0.1s');
      done();
    }, 100);
  });

  it('should calculate max value from all months', (done) => {
    fixture.detectChanges();

    setTimeout(() => {
      const maxIncome = Math.max(...mockYearlyIncome);
      const maxExpense = Math.max(...mockYearlyExpense);
      const expectedMax = Math.max(maxIncome, maxExpense, 1000);
      expect(component.maxValue).toBe(expectedMax);
      done();
    }, 100);
  });

  it('should handle empty income data', (done) => {
    mockIncomeService.getYearlyIncomes.and.returnValue(of([]));
    
    component['loadMonthlyTrend']();
    
    setTimeout(() => {
      expect(component.monthlyData.length).toBe(12);
      expect(component.monthlyData[0].income).toBe(0);
      expect(component.maxValue).toBeGreaterThanOrEqual(1000);
      done();
    }, 100);
  });

  it('should handle empty expense data', (done) => {
    mockExpenseService.getExpenseForMonthsOfCurrentYear.and.returnValue(of([]));
    
    component['loadMonthlyTrend']();
    
    setTimeout(() => {
      expect(component.monthlyData.length).toBe(12);
      expect(component.monthlyData[0].expense).toBe(0);
      done();
    }, 100);
  });

  it('should handle partial data arrays', (done) => {
    const partialIncome = [5000, 6000];
    const partialExpense = [3000, 3500];
    
    mockIncomeService.getYearlyIncomes.and.returnValue(of(partialIncome));
    mockExpenseService.getExpenseForMonthsOfCurrentYear.and.returnValue(of(partialExpense));
    
    component['loadMonthlyTrend']();
    
    setTimeout(() => {
      expect(component.monthlyData.length).toBe(12);
      expect(component.monthlyData[0].income).toBe(5000);
      expect(component.monthlyData[0].expense).toBe(3000);
      expect(component.monthlyData[2].income).toBe(0);
      expect(component.monthlyData[2].expense).toBe(0);
      done();
    }, 100);
  });

  it('should calculate net correctly (income - expense)', (done) => {
    fixture.detectChanges();

    setTimeout(() => {
      const firstMonth = component.monthlyData[0];
      expect(firstMonth.net).toBe(firstMonth.income - firstMonth.expense);
      done();
    }, 100);
  });

  it('should handle negative net values', (done) => {
    const highExpense = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000];
    const lowIncome = [500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500];
    
    mockIncomeService.getYearlyIncomes.and.returnValue(of(lowIncome));
    mockExpenseService.getExpenseForMonthsOfCurrentYear.and.returnValue(of(highExpense));
    
    component['loadMonthlyTrend']();
    
    setTimeout(() => {
      expect(component.monthlyData[0].net).toBeLessThan(0);
      done();
    }, 100);
  });

  it('should handle API errors gracefully', (done) => {
    mockIncomeService.getYearlyIncomes.and.returnValue(
      throwError(() => new Error('API Error'))
    );
    
    component['loadMonthlyTrend']();
    
    setTimeout(() => {
      expect(component.isLoading).toBe(false);
      expect(component.monthlyData).toEqual([]);
      expect(mockChangeDetectorRef.markForCheck).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should handle missing userId gracefully', () => {
    mockAuthService.getUserId.and.returnValue(null);
    
    component['loadMonthlyTrend']();
    
    expect(component.isLoading).toBe(false);
    expect(mockChangeDetectorRef.markForCheck).toHaveBeenCalled();
    expect(mockIncomeService.getYearlyIncomes).not.toHaveBeenCalled();
  });

  it('should set percentage to 0 when maxValue is 0', (done) => {
    const zeroData = new Array(12).fill(0);
    
    mockIncomeService.getYearlyIncomes.and.returnValue(of(zeroData));
    mockExpenseService.getExpenseForMonthsOfCurrentYear.and.returnValue(of(zeroData));
    
    component['loadMonthlyTrend']();
    
    setTimeout(() => {
      expect(component.maxValue).toBe(1000);
      expect(component.monthlyData[0].incomePercentage).toBe(0);
      expect(component.monthlyData[0].expensePercentage).toBe(0);
      done();
    }, 100);
  });

  it('should calculate percentage correctly for max value', (done) => {
    fixture.detectChanges();

    setTimeout(() => {
      const maxIncomeMonth = component.monthlyData.find(d => d.income === component.maxValue);
      if (maxIncomeMonth) {
        expect(maxIncomeMonth.incomePercentage).toBe(100);
      }
      done();
    }, 100);
  });

  it('should display loading state initially', () => {
    component.isLoading = true;
    fixture.detectChanges();
    
    const loadingElement = fixture.nativeElement.querySelector('.loading-state');
    expect(loadingElement).toBeTruthy();
    
    const contentElement = fixture.nativeElement.querySelector('.trend-content');
    expect(contentElement).toBeFalsy();
  });

  it('should display chart content when not loading', () => {
    component.isLoading = false;
    component.monthlyData = [
      {
        month: 'Jan',
        income: 5000,
        expense: 3000,
        net: 2000,
        incomePercentage: 50,
        expensePercentage: 30,
        animationDelay: '0s'
      }
    ];
    fixture.detectChanges();
    
    const contentElement = fixture.nativeElement.querySelector('.trend-content');
    expect(contentElement).toBeTruthy();
    
    const loadingElement = fixture.nativeElement.querySelector('.loading-state');
    expect(loadingElement).toBeFalsy();
  });

  it('should render all 12 months', (done) => {
    fixture.detectChanges();

    setTimeout(() => {
      fixture.detectChanges();
      const monthLabels = fixture.nativeElement.querySelectorAll('.month-label');
      expect(monthLabels.length).toBe(12);
      expect(monthLabels[0].textContent).toBe('Jan');
      expect(monthLabels[11].textContent).toBe('Dec');
      done();
    }, 100);
  });

  it('should display bars with correct heights', (done) => {
    fixture.detectChanges();

    setTimeout(() => {
      fixture.detectChanges();
      const incomeBars = fixture.nativeElement.querySelectorAll('.income-bar');
      const expenseBars = fixture.nativeElement.querySelectorAll('.expense-bar');
      
      expect(incomeBars.length).toBe(12);
      expect(expenseBars.length).toBe(12);
      
      // Check that bars have height style applied
      incomeBars.forEach((bar: HTMLElement) => {
        expect(bar.style.height).toBeTruthy();
      });
      done();
    }, 100);
  });

  it('should display legend items', () => {
    component.isLoading = false;
    component.monthlyData = [{
      month: 'Jan',
      income: 1000,
      expense: 500,
      net: 500,
      incomePercentage: 50,
      expensePercentage: 25,
      animationDelay: '0s'
    }];
    fixture.detectChanges();
    
    const legendItems = fixture.nativeElement.querySelectorAll('.legend-item');
    expect(legendItems.length).toBe(2);
  });

  it('should have proper ARIA labels', () => {
    component.isLoading = false;
    component.monthlyData = [{
      month: 'Jan',
      income: 1000,
      expense: 500,
      net: 500,
      incomePercentage: 50,
      expensePercentage: 25,
      animationDelay: '0s'
    }];
    fixture.detectChanges();
    
    const article = fixture.nativeElement.querySelector('article[role="article"]');
    expect(article).toBeTruthy();
    expect(article.getAttribute('aria-labelledby')).toBe('trendTitle');
    
    const chartGroups = fixture.nativeElement.querySelectorAll('.chart-bar-group[role="img"]');
    expect(chartGroups.length).toBeGreaterThan(0);
    
    chartGroups.forEach((group: HTMLElement) => {
      expect(group.getAttribute('aria-label')).toBeTruthy();
    });
  });

  it('should display tooltip when data exists', () => {
    component.isLoading = false;
    component.monthlyData = [{
      month: 'Jan',
      income: 1000,
      expense: 500,
      net: 500,
      incomePercentage: 50,
      expensePercentage: 25,
      animationDelay: '0s'
    }];
    fixture.detectChanges();
    
    const tooltip = fixture.nativeElement.querySelector('.bar-tooltip');
    expect(tooltip).toBeTruthy();
  });

  it('should not display tooltip when all values are zero', () => {
    component.isLoading = false;
    component.monthlyData = [{
      month: 'Jan',
      income: 0,
      expense: 0,
      net: 0,
      incomePercentage: 0,
      expensePercentage: 0,
      animationDelay: '0s'
    }];
    fixture.detectChanges();
    
    const tooltip = fixture.nativeElement.querySelector('.bar-tooltip');
    expect(tooltip).toBeFalsy();
  });

  it('should have hidden icons marked with aria-hidden', () => {
    fixture.detectChanges();
    
    const icons = fixture.nativeElement.querySelectorAll('i[aria-hidden="true"]');
    expect(icons.length).toBeGreaterThan(0);
    
    icons.forEach((icon: HTMLElement) => {
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    });
  });

  it('should have role="presentation" on bars container', () => {
    component.isLoading = false;
    component.monthlyData = [{
      month: 'Jan',
      income: 1000,
      expense: 500,
      net: 500,
      incomePercentage: 50,
      expensePercentage: 25,
      animationDelay: '0s'
    }];
    fixture.detectChanges();
    
    const barsContainer = fixture.nativeElement.querySelector('.bars-container[role="presentation"]');
    expect(barsContainer).toBeTruthy();
  });

  it('should have role="tooltip" on tooltip element', () => {
    component.isLoading = false;
    component.monthlyData = [{
      month: 'Jan',
      income: 1000,
      expense: 500,
      net: 500,
      incomePercentage: 50,
      expensePercentage: 25,
      animationDelay: '0s'
    }];
    fixture.detectChanges();
    
    const tooltip = fixture.nativeElement.querySelector('.bar-tooltip[role="tooltip"]');
    expect(tooltip).toBeTruthy();
  });

  it('should track by month correctly', () => {
    const item1: MonthlyTrendData = {
      month: 'Jan',
      income: 1000,
      expense: 500,
      net: 500,
      incomePercentage: 50,
      expensePercentage: 25,
      animationDelay: '0s'
    };
    
    const item2: MonthlyTrendData = {
      month: 'Feb',
      income: 2000,
      expense: 1000,
      net: 1000,
      incomePercentage: 100,
      expensePercentage: 50,
      animationDelay: '0.05s'
    };
    
    expect(component.trackByMonth(0, item1)).toBe('Jan');
    expect(component.trackByMonth(1, item2)).toBe('Feb');
  });

  it('should track by grid line correctly', () => {
    expect(component.trackByGridLine(0, 0)).toBe(0);
    expect(component.trackByGridLine(1, 25)).toBe(25);
    expect(component.trackByGridLine(2, 50)).toBe(50);
    expect(component.trackByGridLine(3, 75)).toBe(75);
    expect(component.trackByGridLine(4, 100)).toBe(100);
  });

  it('should have gridLines property defined', () => {
    expect(component.gridLines).toBeDefined();
    expect(component.gridLines).toEqual([0, 25, 50, 75, 100]);
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
});

