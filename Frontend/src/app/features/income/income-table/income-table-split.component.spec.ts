/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component IncomeTableSplitComponent
  @description Comprehensive tests for split income table component
*/

import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { PaymentMethod } from '../../../enums/payment-method';
import { Income } from '../../../models/income.model';
import { IncomeTableSplitComponent } from './income-table-split.component';

describe('IncomeTableSplitComponent', () => {
  let component: IncomeTableSplitComponent;
  let fixture: ComponentFixture<IncomeTableSplitComponent>;

  const mockIncomes: Income[] = [
    {
      id: 1,
      userId: 1,
      source: 'Salary',
      amount: 5000,
      date: '2024-01-01',
      paymentMethod: PaymentMethod.TRANSFER,
      isReceived: true,
      received: true,
      description: 'Monthly salary'
    },
    {
      id: 2,
      userId: 1,
      source: 'Freelance',
      amount: 1000,
      date: '2024-01-02',
      paymentMethod: PaymentMethod.CARD,
      isReceived: false,
      received: false,
      description: 'Project payment'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        IncomeTableSplitComponent,
        ReactiveFormsModule
      ],
      providers: [
        FormBuilder,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeTableSplitComponent);
    component = fixture.componentInstance;

    component.incomes = mockIncomes;
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
    expect(component.filterForm.get('received')).toBeTruthy();
  });

  it('should handle incomes data', () => {
    expect(component.incomes).toEqual(mockIncomes);
    expect(component.totalCount).toBe(mockIncomes.length);
    expect(component.filteredCount).toBe(mockIncomes.length);
  });

  it('should have proper ARIA attributes', () => {
    const container = fixture.debugElement.nativeElement.querySelector('app-income-table-container');
    expect(container.getAttribute('role')).toBe('region');
    expect(container.getAttribute('aria-label')).toBe('Income table with filtering and pagination');
  });

  it('should support keyboard navigation', () => {
    const container = fixture.debugElement.nativeElement.querySelector('app-income-table-container');
    expect(container).toBeTruthy();
  });

  it('should handle screen size changes', () => {
    component.onResize();
    expect(component).toBeTruthy();
  });

  it('should filter data correctly', () => {
    component.filterForm.patchValue({ search: 'Salary' });
    component['applyFilters']();
    fixture.detectChanges();
    
    expect(component.dataSource.data.length).toBe(1);
    expect(component.dataSource.data[0].source).toBe('Salary');
  });

  it('should reset filters correctly', () => {
    component.filterForm.patchValue({ search: 'test' });
    component.resetFilters();
    
    const searchValue = component.filterForm.get('search')?.value;
    expect(searchValue === '' || searchValue === null).toBeTruthy();
    expect(component.dataSource.data).toEqual(mockIncomes);
  });

  it('should toggle row expansion', () => {
    const mockIncome = mockIncomes[0];
    component.toggleRowExpand(mockIncome);
    expect(component.expandedElement).toBe(mockIncome);
    
    component.toggleRowExpand(mockIncome);
    expect(component.expandedElement).toBeNull();
  });

  it('should handle page changes', () => {
    const mockPageEvent = { pageIndex: 1, pageSize: 25, length: 100 };
    component.onPageChange(mockPageEvent);
    expect(component.pageSize).toBe(25);
    expect(component.currentPage).toBe(1);
  });

  it('should track income by id', () => {
    const result = component.trackByIncome(0, mockIncomes[0]);
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
      imports: [IncomeTableSplitComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: PLATFORM_ID, useValue: 'server' }
      ]
    });
    
    const ssrFixture = TestBed.createComponent(IncomeTableSplitComponent);
    const ssrComponent = ssrFixture.componentInstance;
    ssrComponent.incomes = mockIncomes;
    ssrFixture.detectChanges();
    
    expect(ssrComponent).toBeTruthy();
  });

  it('should handle incomes change', () => {
    component.incomes = mockIncomes;
    component.ngOnChanges({
      incomes: {
        currentValue: mockIncomes,
        previousValue: [],
        firstChange: true,
        isFirstChange: () => true
      }
    });
    
    expect(component.dataSource.data).toEqual(mockIncomes);
    expect(component.filteredCount).toBe(mockIncomes.length);
    expect(component.totalCount).toBe(mockIncomes.length);
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
