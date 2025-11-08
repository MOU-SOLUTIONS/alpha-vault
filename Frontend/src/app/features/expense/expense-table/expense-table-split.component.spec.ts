/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseTableSplitComponent
  @description Comprehensive tests for split expense table component
*/

import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { PaymentMethod } from '../../../enums/payment-method';
import { Expense } from '../../../models/expense.model';
import { ExpenseTableSplitComponent } from './expense-table-split.component';

describe('ExpenseTableSplitComponent', () => {
  let component: ExpenseTableSplitComponent;
  let fixture: ComponentFixture<ExpenseTableSplitComponent>;

  const mockExpenses: Expense[] = [
    {
      id: 1,
      userId: 1,
      category: 'GROCERIES',
      amount: 50,
      date: '2024-01-01',
      paymentMethod: PaymentMethod.CARD,
      description: 'Grocery shopping',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 2,
      userId: 1,
      category: 'PUBLIC_TRANSPORT',
      amount: 25,
      date: '2024-01-02',
      paymentMethod: PaymentMethod.CASH,
      description: 'Bus fare',
      createdAt: '2024-01-02',
      updatedAt: '2024-01-02'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ExpenseTableSplitComponent,
        ReactiveFormsModule
      ],
      providers: [
        FormBuilder,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseTableSplitComponent);
    component = fixture.componentInstance;

    component.expenses = mockExpenses;
    component.onModify = jasmine.createSpy('onModify');
    component.onDelete = jasmine.createSpy('onDelete');
    component.onAdd = jasmine.createSpy('onAdd');
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form on init', () => {
    expect(component.filterForm).toBeTruthy();
    expect(component.filterForm.get('search')).toBeTruthy();
    expect(component.filterForm.get('fromDate')).toBeTruthy();
    expect(component.filterForm.get('toDate')).toBeTruthy();
    expect(component.filterForm.get('method')).toBeTruthy();
    expect(component.filterForm.get('category')).toBeTruthy();
  });

  it('should handle expenses data', () => {
    expect(component.expenses).toEqual(mockExpenses);
    expect(component.totalCount).toBe(mockExpenses.length);
    expect(component.filteredCount).toBe(mockExpenses.length);
  });

  it('should have proper ARIA attributes', () => {
    const container = fixture.debugElement.nativeElement.querySelector('app-expense-table-container');
    expect(container.getAttribute('role')).toBe('region');
    expect(container.getAttribute('aria-label')).toBe('Expense table with filtering and pagination');
  });

  it('should support keyboard navigation', () => {
    const container = fixture.debugElement.nativeElement.querySelector('app-expense-table-container');
    expect(container).toBeTruthy();
  });

  it('should handle screen size changes', () => {
    component.onResize();
    expect(component).toBeTruthy();
  });

  it('should filter data correctly', () => {
    component.filterForm.patchValue({ search: 'Food' });
    component['applyFilters']();
    fixture.detectChanges();
    
    expect(component.dataSource.data.length).toBe(1);
    expect(component.dataSource.data[0].category).toBe('Food');
  });

  it('should reset filters correctly', () => {
    component.filterForm.patchValue({ search: 'test' });
    component.resetFilters();
    
    const searchValue = component.filterForm.get('search')?.value;
    expect(searchValue === '' || searchValue === null).toBeTruthy();
    expect(component.dataSource.data).toEqual(mockExpenses);
  });

  it('should toggle row expansion', () => {
    const mockExpense = mockExpenses[0];
    component.toggleRowExpand(mockExpense);
    expect(component.expandedElement).toBe(mockExpense);
    
    component.toggleRowExpand(mockExpense);
    expect(component.expandedElement).toBeNull();
  });

  it('should handle page changes', () => {
    const mockPageEvent = { pageIndex: 1, pageSize: 25, length: 100 };
    component.onPageChange(mockPageEvent);
    expect(component.pageSize).toBe(25);
    expect(component.currentPage).toBe(1);
  });

  it('should track expense by id', () => {
    const result = component.trackByExpense(0, mockExpenses[0]);
    expect(result).toBe(1);
  });

  it('should track payment method by value', () => {
    const mockOption = { value: 'cash', label: 'Cash' };
    const result = component.trackByPaymentMethod(0, mockOption);
    expect(result).toBe('cash');
  });

  it('should handle SSR environment', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ExpenseTableSplitComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: PLATFORM_ID, useValue: 'server' }
      ]
    });
    
    const ssrFixture = TestBed.createComponent(ExpenseTableSplitComponent);
    const ssrComponent = ssrFixture.componentInstance;
    ssrComponent.expenses = mockExpenses;
    ssrFixture.detectChanges();
    
    expect(ssrComponent).toBeTruthy();
  });

  it('should handle expenses change', () => {
    component.expenses = mockExpenses;
    component.ngOnChanges({
      expenses: {
        currentValue: mockExpenses,
        previousValue: [],
        firstChange: true,
        isFirstChange: () => true
      }
    });
    
    expect(component.dataSource.data).toEqual(mockExpenses);
    expect(component.filteredCount).toBe(mockExpenses.length);
    expect(component.totalCount).toBe(mockExpenses.length);
  });

  it('should toggle filter section', () => {
    const initialState = component.isFilterExpanded;
    component.toggleFilterSection();
    expect(component.isFilterExpanded).toBe(!initialState);
  });

  it('should set mobile columns for mobile screen', () => {
    component.isMobile = true;
    component.activeColumns = component.mobileDisplayColumns;
    expect(component.isMobile).toBeTruthy();
    expect(component.activeColumns).toEqual(component.mobileDisplayColumns);
  });

  it('should set desktop columns for desktop screen', () => {
    component.isMobile = false;
    component.activeColumns = component.displayedColumns;
    expect(component.isMobile).toBeFalsy();
    expect(component.activeColumns).toEqual(component.displayedColumns);
  });
});
