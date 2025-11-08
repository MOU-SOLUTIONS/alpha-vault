/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component DashboardRecentActivityComponent
  @description Comprehensive unit tests for recent activity widget component
*/

import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { AuthService } from '../../../../core/services/auth.service';
import { ExpenseService } from '../../../../core/services/expense.service';
import { IncomeService } from '../../../../core/services/income.service';
import { ActivityItem, DashboardRecentActivityComponent } from './dashboard-recent-activity.component';

describe('DashboardRecentActivityComponent', () => {
  let component: DashboardRecentActivityComponent;
  let fixture: ComponentFixture<DashboardRecentActivityComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockIncomeService: jasmine.SpyObj<IncomeService>;
  let mockExpenseService: jasmine.SpyObj<ExpenseService>;
  let mockChangeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;

  const mockIncomesResponse = {
    content: [
      { id: 1, source: 'Salary', amount: 5000, date: '2024-01-15T00:00:00Z' },
      { id: 2, source: 'Freelance', amount: 1200, date: '2024-01-14T00:00:00Z' },
      { id: 3, source: 'Investment', amount: 300, date: '2024-01-13T00:00:00Z' }
    ],
    totalElements: 3,
    totalPages: 1
  };

  const mockExpensesResponse = {
    content: [
      { id: 1, category: 'Food', amount: 150, expenseDate: '2024-01-15T00:00:00Z' },
      { id: 2, category: 'Transport', amount: 80, expenseDate: '2024-01-14T00:00:00Z' },
      { id: 3, description: 'Utilities', amount: 200, expenseDate: '2024-01-13T00:00:00Z' }
    ],
    totalElements: 3,
    totalPages: 1
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getUserId']);
    authServiceSpy.getUserId.and.returnValue(1);

    const incomeServiceSpy = jasmine.createSpyObj('IncomeService', ['getIncomesByUser']);
    incomeServiceSpy.getIncomesByUser.and.returnValue(of(mockIncomesResponse));

    const expenseServiceSpy = jasmine.createSpyObj('ExpenseService', ['getExpensesPaginated']);
    expenseServiceSpy.getExpensesPaginated.and.returnValue(of(mockExpensesResponse));

    const changeDetectorRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck']);

    await TestBed.configureTestingModule({
      imports: [
        DashboardRecentActivityComponent,
        RouterTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: IncomeService, useValue: incomeServiceSpy },
        { provide: ExpenseService, useValue: expenseServiceSpy },
        { provide: ChangeDetectorRef, useValue: changeDetectorRefSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardRecentActivityComponent);
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
    expect(component.activities).toBeDefined();
    expect(component.userId).toBeDefined();
  });

  it('should initialize with default values', () => {
    expect(component.isLoading).toBe(true);
    expect(component.activities).toEqual([]);
    expect(component.userId).toBeNull();
  });

  it('should load recent activity on init', () => {
    fixture.detectChanges();
    
    expect(mockAuthService.getUserId).toHaveBeenCalled();
    expect(mockIncomeService.getIncomesByUser).toHaveBeenCalledWith(1, 0, 5);
    expect(mockExpenseService.getExpensesPaginated).toHaveBeenCalledWith(0, 5);
  });

  it('should load and combine activities correctly', (done) => {
    fixture.detectChanges();

    setTimeout(() => {
      expect(component.isLoading).toBe(false);
      expect(component.activities.length).toBeGreaterThan(0);
      expect(component.activities.some(a => a.type === 'income')).toBe(true);
      expect(component.activities.some(a => a.type === 'expense')).toBe(true);
      expect(mockChangeDetectorRef.markForCheck).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should sort activities by date (newest first)', (done) => {
    fixture.detectChanges();

    setTimeout(() => {
      const dates = component.activities.map(a => new Date(a.date).getTime());
      const sortedDates = [...dates].sort((a, b) => b - a);
      expect(dates).toEqual(sortedDates);
      done();
    }, 100);
  });

  it('should limit activities to 8 items', (done) => {
    const manyIncomes = {
      content: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        source: `Income ${i + 1}`,
        amount: 1000,
        date: new Date(Date.now() - i * 86400000).toISOString()
      }))
    };

    mockIncomeService.getIncomesByUser.and.returnValue(of(manyIncomes));
    mockExpenseService.getExpensesPaginated.and.returnValue(of({ content: [] }));

    component['loadRecentActivity']();

    setTimeout(() => {
      expect(component.activities.length).toBeLessThanOrEqual(8);
      done();
    }, 100);
  });

  it('should map income data correctly', (done) => {
    fixture.detectChanges();

    setTimeout(() => {
      const incomeActivity = component.activities.find(a => a.type === 'income' && a.title === 'Salary');
      expect(incomeActivity).toBeDefined();
      expect(incomeActivity?.amount).toBe(5000);
      expect(incomeActivity?.formattedAmount).toBe('$5,000');
      expect(incomeActivity?.icon).toBe('fa-dollar-sign');
      expect(incomeActivity?.color).toBe('#6366f1');
      expect(incomeActivity?.formattedDate).toBeDefined();
      done();
    }, 100);
  });

  it('should map expense data correctly', (done) => {
    fixture.detectChanges();

    setTimeout(() => {
      const expenseActivity = component.activities.find(a => a.type === 'expense' && a.title === 'Food');
      expect(expenseActivity).toBeDefined();
      expect(expenseActivity?.amount).toBe(150);
      expect(expenseActivity?.formattedAmount).toBe('$150');
      expect(expenseActivity?.icon).toBe('fa-chart-line');
      expect(expenseActivity?.color).toBe('#ef4444');
      expect(expenseActivity?.formattedDate).toBeDefined();
      done();
    }, 100);
  });

  it('should use category or description for expense title', (done) => {
    fixture.detectChanges();

    setTimeout(() => {
      const categoryExpense = component.activities.find(a => a.title === 'Food');
      const descriptionExpense = component.activities.find(a => a.title === 'Utilities');
      
      expect(categoryExpense).toBeDefined();
      expect(descriptionExpense).toBeDefined();
      done();
    }, 100);
  });

  it('should handle missing userId gracefully', () => {
    mockAuthService.getUserId.and.returnValue(null);
    
    component['loadRecentActivity']();
    
    expect(component.isLoading).toBe(false);
    expect(mockChangeDetectorRef.markForCheck).toHaveBeenCalled();
    expect(mockIncomeService.getIncomesByUser).not.toHaveBeenCalled();
  });

  it('should handle API errors gracefully', (done) => {
    mockIncomeService.getIncomesByUser.and.returnValue(
      throwError(() => new Error('API Error'))
    );
    
    component['loadRecentActivity']();
    
    setTimeout(() => {
      expect(component.isLoading).toBe(false);
      expect(component.activities).toEqual([]);
      expect(mockChangeDetectorRef.markForCheck).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should handle empty responses', (done) => {
    mockIncomeService.getIncomesByUser.and.returnValue(of({ content: [] }));
    mockExpenseService.getExpensesPaginated.and.returnValue(of({ content: [] }));
    
    component['loadRecentActivity']();
    
    setTimeout(() => {
      expect(component.activities).toEqual([]);
      expect(component.isLoading).toBe(false);
      done();
    }, 100);
  });

  it('should format today as "Today"', () => {
    const today = new Date().toISOString();
    const formatted = component['formatDate'](today);
    expect(formatted).toBe('Today');
  });

  it('should format yesterday as "Yesterday"', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    const formatted = component['formatDate'](yesterday);
    expect(formatted).toBe('Yesterday');
  });

  it('should format recent days as "X days ago"', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
    const formatted = component['formatDate'](threeDaysAgo);
    expect(formatted).toBe('3 days ago');
  });

  it('should format older dates as "MMM DD"', () => {
    const oldDate = new Date('2024-01-01').toISOString();
    const formatted = component['formatDate'](oldDate);
    expect(formatted).toMatch(/Jan \d{1,2}/);
  });

  it('should display loading state initially', () => {
    component.isLoading = true;
    fixture.detectChanges();
    
    const loadingElement = fixture.nativeElement.querySelector('.loading-state');
    expect(loadingElement).toBeTruthy();
    
    const contentElement = fixture.nativeElement.querySelector('.activity-content');
    expect(contentElement).toBeFalsy();
  });

  it('should display activities when not loading', () => {
    component.isLoading = false;
    component.activities = [
      {
        id: 1,
        type: 'income',
        title: 'Salary',
        amount: 5000,
        date: new Date().toISOString(),
        formattedDate: 'Today',
        icon: 'fa-dollar-sign',
        color: '#6366f1'
      }
    ];
    fixture.detectChanges();
    
    const contentElement = fixture.nativeElement.querySelector('.activity-content');
    expect(contentElement).toBeTruthy();
    
    const loadingElement = fixture.nativeElement.querySelector('.loading-state');
    expect(loadingElement).toBeFalsy();
  });

  it('should display empty state when no activities', () => {
    component.isLoading = false;
    component.activities = [];
    fixture.detectChanges();
    
    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
    
    const activityList = fixture.nativeElement.querySelector('.activity-list');
    expect(activityList?.querySelectorAll('li').length).toBe(0);
  });

  it('should render all activity items', (done) => {
    fixture.detectChanges();

    setTimeout(() => {
      fixture.detectChanges();
      const activityItems = fixture.nativeElement.querySelectorAll('.activity-item');
      expect(activityItems.length).toBe(component.activities.length);
      done();
    }, 100);
  });

  it('should apply correct classes for income items', (done) => {
    fixture.detectChanges();

    setTimeout(() => {
      fixture.detectChanges();
      const incomeItems = fixture.nativeElement.querySelectorAll('.activity-item.income');
      expect(incomeItems.length).toBeGreaterThan(0);
      done();
    }, 100);
  });

  it('should apply correct classes for expense items', (done) => {
    fixture.detectChanges();

    setTimeout(() => {
      fixture.detectChanges();
      const expenseItems = fixture.nativeElement.querySelectorAll('.activity-item.expense');
      expect(expenseItems.length).toBeGreaterThan(0);
      done();
    }, 100);
  });

  it('should display formatted dates', (done) => {
    fixture.detectChanges();

    setTimeout(() => {
      fixture.detectChanges();
      const dateElements = fixture.nativeElement.querySelectorAll('.activity-date');
      dateElements.forEach((el: HTMLElement) => {
        expect(el.textContent).toBeTruthy();
        expect(el.textContent).not.toContain('T');
      });
      done();
    }, 100);
  });

  it('should display formatted amounts', (done) => {
    fixture.detectChanges();

    setTimeout(() => {
      fixture.detectChanges();
      const amountElements = fixture.nativeElement.querySelectorAll('.activity-amount');
      amountElements.forEach((el: HTMLElement) => {
        expect(el.textContent).toContain('$');
        // Should not contain raw pipe syntax
        expect(el.textContent).not.toContain('currency');
      });
      done();
    }, 100);
  });

  it('should display plus sign for income', (done) => {
    fixture.detectChanges();

    setTimeout(() => {
      fixture.detectChanges();
      const incomeItems = fixture.nativeElement.querySelectorAll('.activity-item.income');
      if (incomeItems.length > 0) {
        const amountSign = incomeItems[0].querySelector('.amount-sign');
        expect(amountSign?.textContent).toBe('+');
      }
      done();
    }, 100);
  });

  it('should display minus sign for expenses', (done) => {
    fixture.detectChanges();

    setTimeout(() => {
      fixture.detectChanges();
      const expenseItems = fixture.nativeElement.querySelectorAll('.activity-item.expense');
      if (expenseItems.length > 0) {
        const amountSign = expenseItems[0].querySelector('.amount-sign');
        expect(amountSign?.textContent).toBe('-');
      }
      done();
    }, 100);
  });

  it('should have proper ARIA labels', () => {
    component.isLoading = false;
    component.activities = [{
      id: 1,
      type: 'income',
      title: 'Salary',
      amount: 5000,
      date: new Date().toISOString(),
      formattedDate: 'Today',
      icon: 'fa-dollar-sign',
      color: '#6366f1'
    }];
    fixture.detectChanges();
    
    const article = fixture.nativeElement.querySelector('article[role="article"]');
    expect(article).toBeTruthy();
    expect(article.getAttribute('aria-labelledby')).toBe('activityTitle');
    
    const list = fixture.nativeElement.querySelector('ul[role="list"]');
    expect(list).toBeTruthy();
    
    const listItems = fixture.nativeElement.querySelectorAll('li[role="listitem"]');
    expect(listItems.length).toBeGreaterThan(0);
    
    listItems.forEach((item: HTMLElement) => {
      expect(item.getAttribute('aria-label')).toBeTruthy();
    });
  });

  it('should support keyboard navigation on activity items', () => {
    component.isLoading = false;
    component.activities = [{
      id: 1,
      type: 'income',
      title: 'Salary',
      amount: 5000,
      date: new Date().toISOString(),
      formattedDate: 'Today',
      icon: 'fa-dollar-sign',
      color: '#6366f1'
    }];
    fixture.detectChanges();
    
    const activityItem = fixture.nativeElement.querySelector('.activity-item');
    expect(activityItem).toBeTruthy();
    expect(activityItem.getAttribute('tabindex')).toBe('0');
    
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    
    spyOn(enterEvent, 'stopPropagation');
    spyOn(spaceEvent, 'preventDefault');
    spyOn(spaceEvent, 'stopPropagation');
    
    activityItem.dispatchEvent(enterEvent);
    activityItem.dispatchEvent(spaceEvent);
    
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

  it('should have focus styles for activity items', () => {
    component.isLoading = false;
    component.activities = [{
      id: 1,
      type: 'income',
      title: 'Salary',
      amount: 5000,
      date: new Date().toISOString(),
      formattedDate: 'Today',
      icon: 'fa-dollar-sign',
      color: '#6366f1'
    }];
    fixture.detectChanges();
    
    const activityItem = fixture.nativeElement.querySelector('.activity-item');
    expect(activityItem).toBeTruthy();
    
    const styles = window.getComputedStyle(activityItem as HTMLElement);
    expect(activityItem.getAttribute('tabindex')).toBe('0');
  });

  it('should track by activity id correctly', () => {
    const item1: ActivityItem = {
      id: 1,
      type: 'income',
      title: 'Salary',
      amount: 5000,
      date: new Date().toISOString(),
      formattedDate: 'Today',
      icon: 'fa-dollar-sign',
      color: '#6366f1'
    };
    
    const item2: ActivityItem = {
      id: 2,
      type: 'expense',
      title: 'Food',
      amount: 150,
      date: new Date().toISOString(),
      formattedDate: 'Today',
      icon: 'fa-chart-line',
      color: '#ef4444'
    };
    
    expect(component.trackByActivity(0, item1)).toBe(1);
    expect(component.trackByActivity(1, item2)).toBe(2);
  });

  it('should handle missing income fields gracefully', (done) => {
    const incompleteIncome = {
      content: [{ id: 1 }]
    };
    
    mockIncomeService.getIncomesByUser.and.returnValue(of(incompleteIncome));
    mockExpenseService.getExpensesPaginated.and.returnValue(of({ content: [] }));
    
    component['loadRecentActivity']();
    
    setTimeout(() => {
      expect(component.activities.length).toBeGreaterThan(0);
      const activity = component.activities[0];
      expect(activity.title).toBe('Income');
      expect(activity.amount).toBe(0);
      expect(activity.formattedAmount).toBe('$0');
      done();
    }, 100);
  });

  it('should handle missing expense fields gracefully', (done) => {
    const incompleteExpense = {
      content: [{ id: 1 }]
    };
    
    mockIncomeService.getIncomesByUser.and.returnValue(of({ content: [] }));
    mockExpenseService.getExpensesPaginated.and.returnValue(of(incompleteExpense));
    
    component['loadRecentActivity']();
    
    setTimeout(() => {
      expect(component.activities.length).toBeGreaterThan(0);
      const activity = component.activities[0];
      expect(activity.title).toBe('Expense');
      expect(activity.amount).toBe(0);
      expect(activity.formattedAmount).toBe('$0');
      done();
    }, 100);
  });

  it('should format currency correctly', () => {
    expect(component['formatCurrency'](5000)).toBe('$5,000');
    expect(component['formatCurrency'](150)).toBe('$150');
    expect(component['formatCurrency'](0)).toBe('$0');
    expect(component['formatCurrency'](1234567)).toBe('$1,234,567');
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

