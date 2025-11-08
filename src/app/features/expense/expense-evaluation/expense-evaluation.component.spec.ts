/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseEvaluationComponent
  @description Expense evaluation component for displaying expense data
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { of } from 'rxjs';

import { ExpenseService } from '../../../core/services/expense.service';
import { Expense } from '../../../models/expense.model';
import { ExpenseEvaluationComponent } from './expense-evaluation.component';

describe('ExpenseEvaluationComponent', () => {
  let component: ExpenseEvaluationComponent;
  let fixture: ComponentFixture<ExpenseEvaluationComponent>;
  let mockExpenseService: jasmine.SpyObj<ExpenseService>;
  let mockMeta: jasmine.SpyObj<Meta>;

  const mockExpenses: Expense[] = [
    {
      id: 1,
      userId: 1,
      amount: 1000,
      description: 'Rent',
      date: '2024-01-15',
      paymentMethod: 'Bank Transfer' as any,
      category: 'RENT',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: 2,
      userId: 1,
      amount: 500,
      description: 'Groceries',
      date: '2024-01-20',
      paymentMethod: 'Credit Card' as any,
      category: 'GROCERIES',
      createdAt: '2024-01-20',
      updatedAt: '2024-01-20'
    }
  ];

  beforeEach(async () => {
    const expenseServiceSpy = jasmine.createSpyObj('ExpenseService', ['getAllExpenses']);
    const metaSpy = jasmine.createSpyObj('Meta', ['addTags', 'updateTag']);

    await TestBed.configureTestingModule({
      imports: [ExpenseEvaluationComponent],
      providers: [
        { provide: ExpenseService, useValue: expenseServiceSpy },
        { provide: Meta, useValue: metaSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseEvaluationComponent);
    component = fixture.componentInstance;
    mockExpenseService = TestBed.inject(ExpenseService) as jasmine.SpyObj<ExpenseService>;
    mockMeta = TestBed.inject(Meta) as jasmine.SpyObj<Meta>;

    mockExpenseService.getAllExpenses.and.returnValue(of(mockExpenses as any));
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    // Reset component to initial state
    component.expenses = [];
    component.monthExpense = 0;
    component.weekExpense = 0;
    component.yearExpense = 0;
    component.dayExpense = 0;
    component.weekEvolution = 0;
    component.monthEvolution = 0;
    component.yearEvolution = 0;
    component.expenseCategoryData = {};
    mockExpenseService.getAllExpenses.and.returnValue(of([]));
    
    component.ngOnInit();
    (component as any).updateSignals();
    fixture.detectChanges();

    expect(component.currentPeriod).toBe('month');
    expect(component.evolutionMetrics().totalExpense).toBe(0);
    expect(component.performanceMetrics().efficiency).toBe(0);
    expect(component.insights()).toEqual([]);
  });

  it('should process expense data correctly', () => {
    component.expenses = mockExpenses;
    component.monthExpense = 1500;
    component.weekExpense = 500;
    component.yearExpense = 18000;
    component.dayExpense = 100;
    component.weekEvolution = 5;
    component.monthEvolution = 10;
    component.yearEvolution = 15;
    component.expenseCategoryData = { 'Housing': 1000, 'Food': 500 };

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.evolutionMetrics().totalExpense).toBe(1500);
    expect(component.evolutionMetrics().monthlyGrowth).toBe(10);
    expect(component.evolutionMetrics().weeklyGrowth).toBe(5);
    expect(component.evolutionMetrics().yearlyGrowth).toBe(15);
  });

  it('should calculate performance metrics correctly', () => {
    component.expenses = mockExpenses;
    component.monthExpense = 1500;

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.performanceMetrics().efficiency).toBeGreaterThanOrEqual(0);
    expect(component.performanceMetrics().growthPotential).toBeGreaterThanOrEqual(0);
    expect(component.performanceMetrics().goalAlignment).toBeGreaterThanOrEqual(0);
    expect(component.performanceMetrics().stabilityIndex).toBeGreaterThanOrEqual(0);
  });

  it('should generate insights correctly', () => {
    component.expenses = mockExpenses;
    component.monthExpense = 1500;
    component.monthEvolution = 10;

    component.ngOnInit();
    fixture.detectChanges();

    const insights = component.insights();
    expect(insights).toBeDefined();
    expect(Array.isArray(insights)).toBe(true);
  });

  it('should detect when data is available', () => {
    component.expenses = mockExpenses;
    component.monthExpense = 1500;

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.hasData()).toBe(true);
  });

  it('should detect when no data is available', () => {
    // Reset component to initial state
    component.expenses = [];
    component.monthExpense = 0;
    component.weekExpense = 0;
    component.yearExpense = 0;
    component.dayExpense = 0;
    component.weekEvolution = 0;
    component.monthEvolution = 0;
    component.yearEvolution = 0;
    component.expenseCategoryData = {};
    mockExpenseService.getAllExpenses.and.returnValue(of([]));
    
    component.ngOnInit();
    (component as any).updateSignals();
    fixture.detectChanges();

    expect(component.hasData()).toBe(false);
  });

  it('should update signals when inputs change', () => {
    component.expenses = []; // Empty array so it uses monthExpense instead of sum of expenses
    component.monthExpense = 1000;

    component.ngOnInit();
    (component as any).updateSignals();
    fixture.detectChanges();

    const initialTotal = component.evolutionMetrics().totalExpense;

    // Update the input property and signals
    component.monthExpense = 2000;
    (component as any).updateSignals();
    fixture.detectChanges();

    // The computed signal should reflect the new value
    expect(component.evolutionMetrics().totalExpense).toBe(2000);
  });

  it('should have proper getter methods', () => {
    component.expenses = mockExpenses;
    component.monthExpense = 1500;
    component.weekExpense = 500;
    component.yearExpense = 18000;
    component.dayExpense = 100;

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.totalExpense()).toBe(1500);
    expect(component.growthRate()).toBeDefined();
    expect(component.achievementRate()).toBeDefined();
    expect(component.trend()).toBeDefined();
    expect(component.monthlyGrowth()).toBeDefined();
    expect(component.consistencyScore()).toBeDefined();
    expect(component.diversificationScore()).toBeDefined();
    expect(component.todayExpense()).toBe(100);
    expect(component.efficiency()).toBeDefined();
    expect(component.growthPotential()).toBeDefined();
    expect(component.goalAlignment()).toBeDefined();
    expect(component.stabilityIndex()).toBeDefined();
    expect(component.insightsList()).toBeDefined();
  });

  it('should handle edge cases in calculations', () => {
    // Reset component to initial state
    component.expenses = [];
    component.monthExpense = 0;
    component.weekExpense = 0;
    component.yearExpense = 0;
    component.dayExpense = 0;
    component.weekEvolution = 0;
    component.monthEvolution = 0;
    component.yearEvolution = 0;
    component.expenseCategoryData = {};
    mockExpenseService.getAllExpenses.and.returnValue(of([]));
    component.ngOnInit();
    (component as any).updateSignals();
    fixture.detectChanges();

    expect(component.evolutionMetrics().totalExpense).toBe(0);
    expect(component.performanceMetrics().efficiency).toBe(0);
    expect(component.insights().length).toBe(0);
  });

  it('should update meta tags on initialization', () => {
    component.ngOnInit();
    expect(mockMeta.addTags).toHaveBeenCalled();
  });

  it('should support keyboard navigation for add expense button', () => {
    // Reset component to initial state
    component.expenses = [];
    component.monthExpense = 0;
    component.weekExpense = 0;
    component.yearExpense = 0;
    component.dayExpense = 0;
    component.weekEvolution = 0;
    component.monthEvolution = 0;
    component.yearEvolution = 0;
    component.expenseCategoryData = {};
    mockExpenseService.getAllExpenses.and.returnValue(of([]));
    
    component.ngOnInit();
    (component as any).updateSignals();
    fixture.detectChanges();

    const addButton = fixture.debugElement.nativeElement.querySelector('.btn-secondary');
    expect(addButton).toBeTruthy();
    expect(addButton.getAttribute('aria-label')).toBe('Add new expense entry');

    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    
    spyOn(component, 'onAddExpense');
    
    addButton.dispatchEvent(enterEvent);
    expect(component.onAddExpense).toHaveBeenCalled();
    
    addButton.dispatchEvent(spaceEvent);
    expect(component.onAddExpense).toHaveBeenCalled();
  });

  it('should have proper ARIA attributes', () => {
    component.expenses = mockExpenses;
    component.monthExpense = 1500;
    component.ngOnInit();
    fixture.detectChanges();

    const main = fixture.debugElement.nativeElement.querySelector('main');
    expect(main.getAttribute('role')).toBe('main');

    const contentGrid = fixture.debugElement.nativeElement.querySelector('.content-grid');
    expect(contentGrid.getAttribute('role')).toBe('region');
    expect(contentGrid.getAttribute('aria-label')).toBe('Expense analysis dashboard');
  });

  it('should handle add expense action', () => {
    // Reset component to initial state
    component.expenses = [];
    component.monthExpense = 0;
    component.weekExpense = 0;
    component.yearExpense = 0;
    component.dayExpense = 0;
    component.weekEvolution = 0;
    component.monthEvolution = 0;
    component.yearEvolution = 0;
    component.expenseCategoryData = {};
    mockExpenseService.getAllExpenses.and.returnValue(of([]));
    
    component.ngOnInit();
    (component as any).updateSignals();
    fixture.detectChanges();

    spyOn(component, 'onAddExpense');
    
    const addButton = fixture.debugElement.nativeElement.querySelector('.btn-secondary');
    addButton.click();
    
    expect(component.onAddExpense).toHaveBeenCalled();
  });

  it('should have proper focus management', () => {
    component.expenses = mockExpenses;
    component.monthExpense = 1500;
    component.ngOnInit();
    fixture.detectChanges();

    const buttons = fixture.debugElement.nativeElement.querySelectorAll('button');
    buttons.forEach((button: any) => {
      expect(button.getAttribute('tabindex')).toBe('0');
    });
  });

  it('should have proper accessibility features', () => {
    component.expenses = mockExpenses;
    component.monthExpense = 1500;
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.totalExpense()).toBeDefined();
    expect(component.growthRate()).toBeDefined();
    expect(component.achievementRate()).toBeDefined();
    expect(component.trend()).toBeDefined();
    expect(component.monthlyGrowth()).toBeDefined();
    expect(component.weeklyGrowth()).toBeDefined();
    expect(component.yearlyGrowth()).toBeDefined();
    expect(component.consistencyScore()).toBeDefined();
    expect(component.diversificationScore()).toBeDefined();
    expect(component.todayExpense()).toBeDefined();
    expect(component.efficiency()).toBeDefined();
    expect(component.growthPotential()).toBeDefined();
    expect(component.goalAlignment()).toBeDefined();
    expect(component.stabilityIndex()).toBeDefined();
    expect(component.insightsList()).toBeDefined();
  });
});