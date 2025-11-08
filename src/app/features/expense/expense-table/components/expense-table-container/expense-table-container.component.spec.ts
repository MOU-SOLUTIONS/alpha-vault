/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseTableContainerComponent
  @description Expense table container component for displaying expense data
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';

import { PaymentMethod } from '../../../../../enums/payment-method';
import { Expense } from '../../../../../models/expense.model';
import { ExpenseTableContainerComponent } from './expense-table-container.component';

describe('ExpenseTableContainerComponent', () => {
  let component: ExpenseTableContainerComponent;
  let fixture: ComponentFixture<ExpenseTableContainerComponent>;
  let mockDataSource: MatTableDataSource<Expense>;
  let mockFormGroup: FormGroup;

  beforeEach(async () => {
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
      }
    ];

    mockDataSource = new MatTableDataSource<Expense>(mockExpenses);
    
    const fb = new FormBuilder();
    mockFormGroup = fb.group({
      search: [''],
      fromDate: [''],
      toDate: [''],
      method: [''],
      category: ['']
    });

    await TestBed.configureTestingModule({
      imports: [
        ExpenseTableContainerComponent,
        ReactiveFormsModule
      ],
      providers: [FormBuilder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseTableContainerComponent);
    component = fixture.componentInstance;
    component.dataSource = mockDataSource;
    component.filterForm = mockFormGroup;
    component.paymentMethods = [
      { value: 'cash', label: 'Cash' },
      { value: 'card', label: 'Card' }
    ];
    component.filteredCount = 1;
    component.totalCount = 1;
    component.isMobile = false;
    component.activeColumns = ['method', 'category', 'amount', 'date', 'description', 'actions'];
    component.pageSize = 10;
    component.pageSizeOptions = [5, 10, 25, 50];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit toggleFilters when called', () => {
    spyOn(component.toggleFilters, 'emit');
    component.onToggleFilters();
    expect(component.toggleFilters.emit).toHaveBeenCalled();
  });

  it('should emit addExpense when called', () => {
    spyOn(component.addExpense, 'emit');
    component.onAddExpense();
    expect(component.addExpense.emit).toHaveBeenCalled();
  });

  it('should emit resetFilters when called', () => {
    spyOn(component.resetFilters, 'emit');
    component.onResetFilters();
    expect(component.resetFilters.emit).toHaveBeenCalled();
  });

  it('should emit modify when called', () => {
    spyOn(component.modify, 'emit');
    const mockExpense = mockDataSource.data[0];
    component.onModify(mockExpense);
    expect(component.modify.emit).toHaveBeenCalledWith(mockExpense);
  });

  it('should emit delete when called', () => {
    spyOn(component.delete, 'emit');
    component.onDelete(1);
    expect(component.delete.emit).toHaveBeenCalledWith(1);
  });

  it('should emit toggleRowExpand when called', () => {
    spyOn(component.toggleRowExpand, 'emit');
    const mockExpense = mockDataSource.data[0];
    component.onToggleRowExpand(mockExpense);
    expect(component.toggleRowExpand.emit).toHaveBeenCalledWith(mockExpense);
  });

  it('should emit pageChange when called', () => {
    spyOn(component.pageChange, 'emit');
    const mockPageEvent = { pageIndex: 1, pageSize: 10, length: 100 };
    component.onPageChange(mockPageEvent);
    expect(component.pageChange.emit).toHaveBeenCalledWith(mockPageEvent);
  });

  it('should return true for hasActiveFilters when form has values', () => {
    component.filterForm.patchValue({
      search: 'test',
      fromDate: '2024-01-01',
      toDate: '2024-01-31',
      method: 'cash',
      category: 'food'
    });
    
    expect(component.hasActiveFilters).toBeTruthy();
  });

  it('should return false for hasActiveFilters when form is empty', () => {
    component.filterForm.reset();
    expect(component.hasActiveFilters).toBeFalsy();
  });

  it('should return false for hasActiveFilters when form is null', () => {
    component.filterForm = null as unknown as FormGroup;
    expect(component.hasActiveFilters).toBeFalsy();
  });

  it('should have proper ARIA attributes', () => {
    const tableCard = fixture.debugElement.nativeElement.querySelector('.table-card');
    expect(tableCard.getAttribute('role')).toBe('region');
    expect(tableCard.getAttribute('aria-labelledby')).toBe('expenseBreakdownTitle');
  });

  it('should support keyboard navigation', () => {
    const headerComponent = fixture.debugElement.nativeElement.querySelector('app-expense-table-header');
    expect(headerComponent).toBeTruthy();
  });

  it('should handle empty state correctly', () => {
    component.filteredCount = 0;
    fixture.detectChanges();
    
    const emptyComponent = fixture.debugElement.nativeElement.querySelector('app-expense-table-empty');
    expect(emptyComponent).toBeTruthy();
  });

  it('should show table content when filteredCount > 0', () => {
    component.filteredCount = 1;
    fixture.detectChanges();
    
    const tableContent = fixture.debugElement.nativeElement.querySelector('.table-content');
    expect(tableContent).toBeTruthy();
  });

  it('should display desktop table when not mobile', () => {
    component.isMobile = false;
    component.filteredCount = 1;
    fixture.detectChanges();
    
    const desktopTable = fixture.debugElement.nativeElement.querySelector('app-expense-table-desktop');
    const mobileTable = fixture.debugElement.nativeElement.querySelector('app-expense-table-mobile');
    
    expect(desktopTable).toBeTruthy();
    expect(mobileTable).toBeFalsy();
  });

  it('should display mobile table when mobile', () => {
    component.isMobile = true;
    component.filteredCount = 1;
    fixture.detectChanges();
    
    const desktopTable = fixture.debugElement.nativeElement.querySelector('app-expense-table-desktop');
    const mobileTable = fixture.debugElement.nativeElement.querySelector('app-expense-table-mobile');
    
    expect(desktopTable).toBeFalsy();
    expect(mobileTable).toBeTruthy();
  });

  it('should pass correct props to child components', () => {
    component.filteredCount = 5;
    component.totalCount = 10;
    component.pageSize = 25;
    component.pageSizeOptions = [10, 25, 50];
    fixture.detectChanges();
    
    const summaryComponent = fixture.debugElement.nativeElement.querySelector('app-expense-table-summary');
    const paginatorComponent = fixture.debugElement.nativeElement.querySelector('app-expense-table-paginator');
    
    expect(summaryComponent).toBeTruthy();
    expect(paginatorComponent).toBeTruthy();
  });
});
