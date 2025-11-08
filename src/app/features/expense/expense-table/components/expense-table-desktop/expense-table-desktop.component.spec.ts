/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseTableDesktopComponent
  @description Expense table desktop component for displaying expense data
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { PaymentMethod } from '../../../../../enums/payment-method';
import { Expense } from '../../../../../models/expense.model';
import { ExpenseTableDesktopComponent } from './expense-table-desktop.component';

describe('ExpenseTableDesktopComponent', () => {
  let component: ExpenseTableDesktopComponent;
  let fixture: ComponentFixture<ExpenseTableDesktopComponent>;
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
      imports: [
        ExpenseTableDesktopComponent,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule
      ],
      providers: [provideAnimationsAsync()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseTableDesktopComponent);
    component = fixture.componentInstance;
    component.dataSource = mockDataSource;
    component.activeColumns = ['method', 'category', 'amount', 'date', 'description', 'actions'];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit modify when edit button is clicked', () => {
    spyOn(component.modify, 'emit');
    
    const editButton = fixture.debugElement.nativeElement.querySelector('.edit-button');
    editButton.click();
    
    expect(component.modify.emit).toHaveBeenCalledWith(component.dataSource.data[0]);
  });

  it('should emit delete when delete button is clicked', () => {
    spyOn(component.delete, 'emit');
    
    const deleteButton = fixture.debugElement.nativeElement.querySelector('.delete-button');
    deleteButton.click();
    
    expect(component.delete.emit).toHaveBeenCalledWith(1);
  });

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

  it('should return correct amount class', () => {
    expect(component.getAmountClass(1000)).toBe('high-amount');
    expect(component.getAmountClass(500)).toBe('normal-amount');
  });

  it('should format date correctly', () => {
    const formattedDate = component.formatDate('2024-01-01');
    expect(formattedDate).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
  });

  it('should support keyboard navigation on action buttons', () => {
    spyOn(component.modify, 'emit');
    
    const editButton = fixture.debugElement.query(By.css('.edit-button'));
    editButton.triggerEventHandler('keydown.enter', new KeyboardEvent('keydown', { key: 'Enter' }));
    
    expect(component.modify.emit).toHaveBeenCalledWith(component.dataSource.data[0]);
  });

  it('should support space key navigation on action buttons', () => {
    spyOn(component.delete, 'emit');
    
    const deleteButton = fixture.debugElement.query(By.css('.delete-button'));
    deleteButton.triggerEventHandler('keydown.space', new KeyboardEvent('keydown', { key: ' ' }));
    
    expect(component.delete.emit).toHaveBeenCalledWith(1);
  });


  it('should have proper ARIA labels for payment method icons', () => {
    const methodIcons = fixture.debugElement.queryAll(By.css('.method-circle i'));
    expect(methodIcons[0].nativeElement.getAttribute('aria-label')).toContain('Payment method:');
    expect(methodIcons[1].nativeElement.getAttribute('aria-label')).toContain('Payment method:');
  });

  it('should have aria-hidden on decorative icons', () => {
    const decorativeIcons = fixture.debugElement.queryAll(By.css('.category-icon mat-icon'));
    expect(decorativeIcons[0].nativeElement.getAttribute('aria-hidden')).toBe('true');
  });

  it('should track by expense id for performance', () => {
    const expense1 = { id: 1 } as Expense;
    const expense2 = { id: 2 } as Expense;
    
    expect(component.trackByExpenseId(0, expense1)).toBe(1);
    expect(component.trackByExpenseId(1, expense2)).toBe(2);
  });

  it('should handle empty data source gracefully', () => {
    component.dataSource = new MatTableDataSource<Expense>([]);
    fixture.detectChanges();
    
    expect(component).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.mat-row'))).toBeFalsy();
  });

  it('should display correct payment method icons for different methods', () => {
    expect(component.getPaymentMethodIcon('cash')).toBe('fas fa-money-bill-wave');
    expect(component.getPaymentMethodIcon('card')).toBe('fas fa-credit-card');
    expect(component.getPaymentMethodIcon('bank')).toBe('fas fa-university');
    expect(component.getPaymentMethodIcon('check')).toBe('fas fa-money-check');
    expect(component.getPaymentMethodIcon('unknown')).toBe('fas fa-question-circle');
  });

  it('should apply correct CSS classes for amount ranges', () => {
    expect(component.getAmountClass(1000)).toBe('high-amount');
    expect(component.getAmountClass(500)).toBe('normal-amount');
    expect(component.getAmountClass(2000)).toBe('high-amount');
  });
});