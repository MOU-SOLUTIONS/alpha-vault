/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component IncomeTableMobileComponent
  @description Comprehensive tests for mobile income table component
*/

/* ===== IMPORTS ===== */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';

import { PaymentMethod } from '../../../../../enums/payment-method';
import { Income } from '../../../../../models/income.model';
import { IncomeTableMobileComponent } from './income-table-mobile.component';

/* ===== TEST SUITE ===== */
describe('IncomeTableMobileComponent', () => {
  let component: IncomeTableMobileComponent;
  let fixture: ComponentFixture<IncomeTableMobileComponent>;
  let mockDataSource: MatTableDataSource<Income>;

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

    await TestBed.configureTestingModule({
      imports: [
        IncomeTableMobileComponent,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeTableMobileComponent);
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
    const testIncome = component.dataSource.data[0];
    component.expandedElement = testIncome;
    fixture.detectChanges();
    
    const editButton = fixture.debugElement.query(By.css('.mobile-actions .edit-button'));
    expect(editButton).toBeTruthy();
    editButton.nativeElement.click();
    
    expect(component.modify.emit).toHaveBeenCalledWith(testIncome);
  });

  it('should emit delete when delete button is clicked', () => {
    spyOn(component.delete, 'emit');
    const testIncome = component.dataSource.data[0];
    component.expandedElement = testIncome;
    fixture.detectChanges();
    
    const deleteButton = fixture.debugElement.query(By.css('.mobile-actions .delete-button'));
    expect(deleteButton).toBeTruthy();
    deleteButton.nativeElement.click();
    
    expect(component.delete.emit).toHaveBeenCalledWith(1);
  });

  /* ===== TRACK BY FUNCTION ===== */
  it('should track income by id', () => {
    const result = component.trackByIncome(0, component.dataSource.data[0]);
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
    const testIncome = component.dataSource.data[0];
    component.expandedElement = testIncome;
    fixture.detectChanges();
    
    // Debug: Check if the expanded element is set correctly
    expect(component.expandedElement).toBe(testIncome);
    
    
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
    expect(mobileRow.nativeElement.getAttribute('aria-label')).toContain('Expand income details');
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
    const testIncome = component.dataSource.data[0];
    component.expandedElement = testIncome;
    fixture.detectChanges();
    
    const editButton = fixture.debugElement.query(By.css('.edit-button'));
    const deleteButton = fixture.debugElement.query(By.css('.delete-button'));
    
    expect(editButton).toBeTruthy();
    expect(deleteButton).toBeTruthy();
    expect(editButton.nativeElement.getAttribute('aria-label')).toBe('Edit income');
    expect(deleteButton.nativeElement.getAttribute('aria-label')).toBe('Delete income');
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
    const testIncome = component.dataSource.data[0];
    component.expandedElement = testIncome;
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
