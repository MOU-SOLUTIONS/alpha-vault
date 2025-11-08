/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseTableSummaryComponent
  @description Expense table summary component for displaying expense data
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTableDataSource } from '@angular/material/table';
import { By } from '@angular/platform-browser';

import { PaymentMethod } from '../../../../../enums/payment-method';
import { Expense } from '../../../../../models/expense.model';
import { ExpenseTableSummaryComponent } from './expense-table-summary.component';

describe('ExpenseTableSummaryComponent', () => {
  let component: ExpenseTableSummaryComponent;
  let fixture: ComponentFixture<ExpenseTableSummaryComponent>;
  let mockDataSource: MatTableDataSource<Expense>;

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

    mockDataSource = new MatTableDataSource<Expense>(mockExpenses);

    await TestBed.configureTestingModule({
      imports: [ExpenseTableSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseTableSummaryComponent);
    component = fixture.componentInstance;
    component.dataSource = mockDataSource;
    component.filteredCount = 2;
    component.totalCount = 2;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display total expense amount', () => {
    const totalAmount = fixture.debugElement.nativeElement.querySelector('.total-amount');
    expect(totalAmount).toBeTruthy();
    expect(totalAmount.textContent).toContain('$75.00');
  });

  it('should show entries info when filteredCount differs from totalCount', () => {
    component.filteredCount = 1;
    component.totalCount = 2;
    fixture.detectChanges();
    
    // Debug: Check if the condition is working
    expect(component.filteredCount).toBe(1);
    expect(component.totalCount).toBe(2);
    expect(component.filteredCount !== component.totalCount).toBe(true);
    
    const entriesInfo = fixture.debugElement.nativeElement.querySelector('.entries-info');
    expect(entriesInfo).toBeTruthy();
    expect(entriesInfo.textContent).toContain('Filtered: 1 of 2');
  });

  it('should not show entries info when filteredCount equals totalCount', () => {
    component.filteredCount = 2;
    component.totalCount = 2;
    fixture.detectChanges();
    
    const entriesInfo = fixture.debugElement.nativeElement.querySelector('.entries-info');
    expect(entriesInfo).toBeFalsy();
  });

  it('should have proper ARIA attributes', () => {
    const summary = fixture.debugElement.query(By.css('.total-summary'));
    const badge = fixture.debugElement.query(By.css('.total-badge'));
    
    expect(summary.nativeElement.getAttribute('role')).toBe('region');
    expect(summary.nativeElement.getAttribute('aria-label')).toBe('Expense summary');
    expect(badge.nativeElement.getAttribute('role')).toBe('img');
    expect(badge.nativeElement.getAttribute('aria-label')).toBe('Total expense amount');
  });

  it('should have accessible live regions', () => {
    const totalAmount = fixture.debugElement.query(By.css('.total-amount'));
    
    expect(totalAmount.nativeElement.getAttribute('aria-live')).toBe('polite');
  });

  it('should have accessible entries info when shown', () => {
    component.filteredCount = 1;
    component.totalCount = 2;
    fixture.detectChanges();
    
    const entriesInfo = fixture.debugElement.nativeElement.querySelector('.entries-info');
    expect(entriesInfo).toBeTruthy();
    expect(entriesInfo.getAttribute('role')).toBe('status');
    expect(entriesInfo.getAttribute('aria-live')).toBe('polite');
  });

  it('should handle empty data source', () => {
    component.dataSource = new MatTableDataSource<Expense>([]);
    fixture.detectChanges();
    
    const totalAmount = fixture.debugElement.nativeElement.querySelector('.total-amount');
    expect(totalAmount.textContent).toContain('$0.00');
  });

  it('should handle null data source', () => {
    component.dataSource = null as unknown as MatTableDataSource<Expense>;
    fixture.detectChanges();
    
    const totalAmount = fixture.debugElement.nativeElement.querySelector('.total-amount');
    expect(totalAmount.textContent).toContain('$0.00');
  });

  it('should compute total expense correctly', () => {
    expect(component.getTotalExpenseAmount()).toBe(75);
  });

  it('should compute zero for empty data', () => {
    component.dataSource = new MatTableDataSource<Expense>([]);
    expect(component.getTotalExpenseAmount()).toBe(0);
  });

  it('should compute zero for null data', () => {
    component.dataSource = null as unknown as MatTableDataSource<Expense>;
    expect(component.getTotalExpenseAmount()).toBe(0);
  });

  it('should have proper semantic structure', () => {
    const summary = fixture.debugElement.query(By.css('.total-summary'));
    const badge = fixture.debugElement.query(By.css('.total-badge'));
    const label = fixture.debugElement.query(By.css('.total-label'));
    const amount = fixture.debugElement.query(By.css('.total-amount'));
    
    expect(summary).toBeTruthy();
    expect(badge).toBeTruthy();
    expect(label.nativeElement.textContent.trim()).toBe('Total Expense:');
    expect(amount).toBeTruthy();
  });
});