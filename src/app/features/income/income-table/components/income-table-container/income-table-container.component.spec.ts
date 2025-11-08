/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component IncomeTableContainerComponent
  @description Income table container component for displaying income data
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';

import { PaymentMethod } from '../../../../../enums/payment-method';
import { Income } from '../../../../../models/income.model';
import { IncomeTableContainerComponent } from './income-table-container.component';

describe('IncomeTableContainerComponent', () => {
  let component: IncomeTableContainerComponent;
  let fixture: ComponentFixture<IncomeTableContainerComponent>;
  let mockDataSource: MatTableDataSource<Income>;
  let mockFormGroup: FormGroup;

  beforeEach(async () => {
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
      }
    ];

    mockDataSource = new MatTableDataSource<Income>(mockIncomes);
    
    const fb = new FormBuilder();
    mockFormGroup = fb.group({
      search: [''],
      fromDate: [''],
      toDate: [''],
      method: [''],
      received: ['']
    });

    await TestBed.configureTestingModule({
      imports: [
        IncomeTableContainerComponent,
        ReactiveFormsModule
      ],
      providers: [FormBuilder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeTableContainerComponent);
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
    component.activeColumns = ['select', 'method', 'source', 'amount', 'date', 'description', 'actions'];
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

  it('should emit addIncome when called', () => {
    spyOn(component.addIncome, 'emit');
    component.onAddIncome();
    expect(component.addIncome.emit).toHaveBeenCalled();
  });

  it('should emit resetFilters when called', () => {
    spyOn(component.resetFilters, 'emit');
    component.onResetFilters();
    expect(component.resetFilters.emit).toHaveBeenCalled();
  });

  it('should emit modify when called', () => {
    spyOn(component.modify, 'emit');
    const mockIncome = mockDataSource.data[0];
    component.onModify(mockIncome);
    expect(component.modify.emit).toHaveBeenCalledWith(mockIncome);
  });

  it('should emit delete when called', () => {
    spyOn(component.delete, 'emit');
    component.onDelete(1);
    expect(component.delete.emit).toHaveBeenCalledWith(1);
  });

  it('should emit toggleRowExpand when called', () => {
    spyOn(component.toggleRowExpand, 'emit');
    const mockIncome = mockDataSource.data[0];
    component.onToggleRowExpand(mockIncome);
    expect(component.toggleRowExpand.emit).toHaveBeenCalledWith(mockIncome);
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
      received: 'true'
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
    expect(tableCard.getAttribute('aria-labelledby')).toBe('incomeBreakdownTitle');
  });

  it('should support keyboard navigation', () => {
    const headerComponent = fixture.debugElement.nativeElement.querySelector('app-income-table-header');
    expect(headerComponent).toBeTruthy();
  });

  it('should handle empty state correctly', () => {
    component.filteredCount = 0;
    fixture.detectChanges();
    
    const emptyComponent = fixture.debugElement.nativeElement.querySelector('app-income-table-empty');
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
    
    const desktopTable = fixture.debugElement.nativeElement.querySelector('app-income-table-desktop');
    const mobileTable = fixture.debugElement.nativeElement.querySelector('app-income-table-mobile');
    
    expect(desktopTable).toBeTruthy();
    expect(mobileTable).toBeFalsy();
  });

  it('should display mobile table when mobile', () => {
    component.isMobile = true;
    component.filteredCount = 1;
    fixture.detectChanges();
    
    const desktopTable = fixture.debugElement.nativeElement.querySelector('app-income-table-desktop');
    const mobileTable = fixture.debugElement.nativeElement.querySelector('app-income-table-mobile');
    
    expect(desktopTable).toBeFalsy();
    expect(mobileTable).toBeTruthy();
  });

  it('should pass correct props to child components', () => {
    component.filteredCount = 5;
    component.totalCount = 10;
    component.pageSize = 25;
    component.pageSizeOptions = [10, 25, 50];
    fixture.detectChanges();
    
    const summaryComponent = fixture.debugElement.nativeElement.querySelector('app-income-table-summary');
    const paginatorComponent = fixture.debugElement.nativeElement.querySelector('app-income-table-paginator');
    
    expect(summaryComponent).toBeTruthy();
    expect(paginatorComponent).toBeTruthy();
  });
});
