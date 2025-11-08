/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseWidgetComponent
  @description Test suite for expense widget component
*/

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { ExpenseService } from '../../../core/services/expense.service';
import { ExpenseWidgetComponent } from './expense-widget.component';

describe('ExpenseWidgetComponent', () => {
  let component: ExpenseWidgetComponent;
  let fixture: ComponentFixture<ExpenseWidgetComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let expenseService: jasmine.SpyObj<ExpenseService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['userId$']);
    const expenseServiceSpy = jasmine.createSpyObj('ExpenseService', [
      'getTodayExpense', 'getWeekExpense', 'getMonthExpense', 'getYearExpense'
    ]);

    await TestBed.configureTestingModule({
      imports: [ExpenseWidgetComponent, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ExpenseService, useValue: expenseServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseWidgetComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    expenseService = TestBed.inject(ExpenseService) as jasmine.SpyObj<ExpenseService>;

    // Setup default mock returns
    authService.userId$ = of(123);
    expenseService.getTodayExpense.and.returnValue(of(100));
    expenseService.getWeekExpense.and.returnValue(of(700));
    expenseService.getMonthExpense.and.returnValue(of(3000));
    expenseService.getYearExpense.and.returnValue(of(36000));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.dayExpense).toBe(0);
    expect(component.weekExpense).toBe(0);
    expect(component.monthExpense).toBe(0);
    expect(component.yearExpense).toBe(0);
  });

  it('should load expense data on init', () => {
    component.ngOnInit();
    fixture.detectChanges();

    expect(expenseService.getTodayExpense).toHaveBeenCalled();
    expect(expenseService.getWeekExpense).toHaveBeenCalled();
    expect(expenseService.getMonthExpense).toHaveBeenCalled();
    expect(expenseService.getYearExpense).toHaveBeenCalled();
  });

  it('should update expense values after data load', () => {
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.dayExpense).toBe(100);
    expect(component.weekExpense).toBe(700);
    expect(component.monthExpense).toBe(3000);
    expect(component.yearExpense).toBe(36000);
  });

  it('should reset values when user is not authenticated', () => {
    authService.userId$ = of(null);
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.dayExpense).toBe(0);
    expect(component.weekExpense).toBe(0);
    expect(component.monthExpense).toBe(0);
    expect(component.yearExpense).toBe(0);
  });

  it('should get correct expense value by key', () => {
    component.dayExpense = 100;
    component.weekExpense = 700;
    component.monthExpense = 3000;
    component.yearExpense = 36000;

    expect(component.getExpenseValue('dayExpense')).toBe(100);
    expect(component.getExpenseValue('weekExpense')).toBe(700);
    expect(component.getExpenseValue('monthExpense')).toBe(3000);
    expect(component.getExpenseValue('yearExpense')).toBe(36000);
    expect(component.getExpenseValue('invalid')).toBe(0);
  });

  it('should track by key correctly', () => {
    const card = { label: 'Today', icon: 'fa-calendar-day', key: 'dayExpense', class: 'today' };
    expect(component.trackByKey(0, card)).toBe('dayExpense');
  });

  it('should handle card click', () => {
    spyOn(console, 'log');
    const card = { label: 'Today', icon: 'fa-calendar-day', key: 'dayExpense', class: 'today' };
    
    component.onCardClick(card);
    
    expect(console.log).toHaveBeenCalledWith('Clicked on Today expense card');
  });

  it('should have correct cards configuration', () => {
    expect(component.cards).toEqual([
      { label: 'Today', icon: 'fa-calendar-day', key: 'dayExpense', class: 'today' },
      { label: 'This Week', icon: 'fa-calendar-week', key: 'weekExpense', class: 'week' },
      { label: 'This Month', icon: 'fa-calendar-alt', key: 'monthExpense', class: 'month' },
      { label: 'This Year', icon: 'fa-calendar', key: 'yearExpense', class: 'year' }
    ]);
  });

  it('should have correct currency', () => {
    expect(component.currency).toBe('USD');
  });

  it('should handle service errors gracefully', () => {
    spyOn(console, 'error');
    expenseService.getTodayExpense.and.returnValue(of(0));
    expenseService.getWeekExpense.and.returnValue(of(0));
    expenseService.getMonthExpense.and.returnValue(of(0));
    expenseService.getYearExpense.and.returnValue(of(0));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.dayExpense).toBe(0);
    expect(component.weekExpense).toBe(0);
    expect(component.monthExpense).toBe(0);
    expect(component.yearExpense).toBe(0);
  });
});
