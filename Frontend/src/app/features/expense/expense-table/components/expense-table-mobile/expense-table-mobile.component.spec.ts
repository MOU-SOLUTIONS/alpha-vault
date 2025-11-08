/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseTableMobileComponent
  @description Comprehensive tests for mobile expense table component
*/

/* ===== IMPORTS ===== */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';

import { PaymentMethod } from '../../../../../enums/payment-method';
import { Expense } from '../../../../../models/expense.model';
import { ExpenseTableMobileComponent } from './expense-table-mobile.component';

/* ===== TEST SUITE ===== */
describe('ExpenseTableMobileComponent', () => {
  let component: ExpenseTableMobileComponent;
  let fixture: ComponentFixture<ExpenseTableMobileComponent>;
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
      }
    ];

    mockDataSource = new MatTableDataSource<Expense>(mockExpenses);

    await TestBed.configureTestingModule({
      imports: [
        ExpenseTableMobileComponent,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseTableMobileComponent);
    component = fixture.componentInstance;
    component.dataSource = mockDataSource;
    fixture.detectChanges();
  });

  /* ===== BASIC FUNCTIONALITY ===== */
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit toggleRowExpand when row is clicked', () => {
    spyOn(component.toggleRowExpand, 'emit');
    
    const mobileRow = fixture.debugElement.nativeElement.querySelector('.mobile-row');
    mobileRow.click();
    
    expect(component.toggleRowExpand.emit).toHaveBeenCalledWith(component.dataSource.data[0]);
  });

  it('should emit modify when edit button is clicked', () => {
    spyOn(component.modify, 'emit');
    const testExpense = component.dataSource.data[0];
    component.expandedElement = testExpense;
    fixture.detectChanges();
    
    const editButton = fixture.debugElement.query(By.css('.mobile-actions .edit-button'));
    expect(editButton).toBeTruthy();
    editButton.nativeElement.click();
    
    expect(component.modify.emit).toHaveBeenCalledWith(testExpense);
  });

  it('should emit delete when delete button is clicked', () => {
    spyOn(component.delete, 'emit');
    const testExpense = component.dataSource.data[0];
    component.expandedElement = testExpense;
    fixture.detectChanges();
    
    const deleteButton = fixture.debugElement.query(By.css('.mobile-actions .delete-button'));
    expect(deleteButton).toBeTruthy();
    deleteButton.nativeElement.click();
    
    expect(component.delete.emit).toHaveBeenCalledWith(1);
  });

  /* ===== TRACK BY FUNCTION ===== */
  it('should track expense by id', () => {
    const result = component.trackByExpense(0, component.dataSource.data[0]);
    expect(result).toBe(1);
  });

  /* ===== PAYMENT METHOD METHODS ===== */
  it('should return correct payment method class', () => {
    expect(component.getPaymentMethodClass('cash')).toBe('cash');
    expect(component.getPaymentMethodClass('CARD')).toBe('card');
  });

  it('should return correct payment method icon', () => {
    expect(component.getPaymentMethodIcon('cash')).toBe('fas fa-money-bill-wave');
    expect(component.getPaymentMethodIcon('card')).toBe('fas fa-credit-card');
    expect(component.getPaymentMethodIcon('bank')).toBe('fas fa-university');
    expect(component.getPaymentMethodIcon('unknown')).toBe('fas fa-question-circle');
  });

  it('should return correct payment method label', () => {
    expect(component.getPaymentLabel('cash')).toBe('Cash');
    expect(component.getPaymentLabel('card')).toBe('Card');
    expect(component.getPaymentLabel('bank')).toBe('Bank Transfer');
    expect(component.getPaymentLabel('unknown')).toBe('Other');
  });

  it('should return correct category icon', () => {
    // Test enum values
    expect(component.getCategoryIcon('GROCERIES')).toBe('shopping_cart');
    expect(component.getCategoryIcon('RESTAURANTS')).toBe('restaurant');
    expect(component.getCategoryIcon('FUEL')).toBe('local_gas_station');
    
    // Test common labels
    expect(component.getCategoryIcon('Housing')).toBe('home');
    expect(component.getCategoryIcon('Food')).toBe('restaurant');
    expect(component.getCategoryIcon('Transport')).toBe('directions_car');
    expect(component.getCategoryIcon('Healthcare')).toBe('medical_services');
    
    // Test fallback
    expect(component.getCategoryIcon('UNKNOWN')).toBe('category');
  });

  /* ===== AMOUNT AND DATE METHODS ===== */
  it('should return correct amount class', () => {
    expect(component.getAmountClass(1000)).toBe('high-amount');
    expect(component.getAmountClass(500)).toBe('normal-amount');
  });

  it('should format date correctly', () => {
    const formattedDate = component.getFormattedDate('2024-01-01');
    expect(formattedDate).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
  });

  /* ===== EXPANSION STATE ===== */
  it('should show expanded content when expandedElement matches', () => {
    const testExpense = component.dataSource.data[0];
    component.expandedElement = testExpense;
    fixture.detectChanges();
    
    // Debug: Check if the expanded element is set correctly
    expect(component.expandedElement).toBe(testExpense);
    
    
    const mobileRow = fixture.debugElement.query(By.css('.mobile-row'));
    expect(mobileRow).toBeTruthy();
    
    expect(mobileRow.nativeElement.classList.contains('expanded')).toBeTruthy();
    
    const detailSection = fixture.debugElement.query(By.css('.mobile-row-detail'));
    expect(detailSection).toBeTruthy();
    
    const actionsSection = fixture.debugElement.query(By.css('.mobile-actions'));
    expect(actionsSection).toBeTruthy();
  });

  /* ===== ACCESSIBILITY ===== */
  it('should have proper ARIA attributes', () => {
    const mobileRow = fixture.debugElement.query(By.css('.mobile-row'));
    expect(mobileRow.nativeElement.getAttribute('role')).toBe('button');
    expect(mobileRow.nativeElement.getAttribute('aria-expanded')).toBe('false');
    expect(mobileRow.nativeElement.getAttribute('aria-label')).toContain('Expand expense details');
  });

  it('should support keyboard navigation', () => {
    const mobileRow = fixture.debugElement.query(By.css('.mobile-row'));
    const emitSpy = spyOn(component.toggleRowExpand, 'emit');
    
    mobileRow.triggerEventHandler('keydown.enter', {});
    expect(emitSpy).toHaveBeenCalled();
    
    emitSpy.calls.reset();
    mobileRow.triggerEventHandler('keydown.space', {});
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should have proper button ARIA attributes', () => {
    const testExpense = component.dataSource.data[0];
    component.expandedElement = testExpense;
    fixture.detectChanges();
    
    const editButton = fixture.debugElement.query(By.css('.edit-button'));
    const deleteButton = fixture.debugElement.query(By.css('.delete-button'));
    
    expect(editButton).toBeTruthy();
    expect(deleteButton).toBeTruthy();
    expect(editButton.nativeElement.getAttribute('aria-label')).toBe('Edit expense');
    expect(deleteButton.nativeElement.getAttribute('aria-label')).toBe('Delete expense');
  });

  it('should handle focus management', () => {
    const mobileRow = fixture.debugElement.query(By.css('.mobile-row'));
    expect(mobileRow.nativeElement.getAttribute('tabindex')).toBe('0');
  });

  it('should support screen reader navigation', () => {
    const mobileRow = fixture.debugElement.query(By.css('.mobile-row'));
    expect(mobileRow.nativeElement.getAttribute('aria-expanded')).toBe('false');
    
    component.expandedElement = component.dataSource.data[0];
    fixture.detectChanges();
    
    expect(mobileRow.nativeElement.getAttribute('aria-expanded')).toBe('true');
  });

  it('should support keyboard activation on buttons', () => {
    const testExpense = component.dataSource.data[0];
    component.expandedElement = testExpense;
    fixture.detectChanges();
    
    const editButton = fixture.debugElement.query(By.css('.edit-button'));
    const deleteButton = fixture.debugElement.query(By.css('.delete-button'));
    
    spyOn(component.modify, 'emit');
    spyOn(component.delete, 'emit');
    
    const mockEvent = { stopPropagation: jasmine.createSpy('stopPropagation') };
    
    editButton.triggerEventHandler('keydown.enter', mockEvent);
    expect(component.modify.emit).toHaveBeenCalled();
    
    deleteButton.triggerEventHandler('keydown.space', mockEvent);
    expect(component.delete.emit).toHaveBeenCalled();
  });
});