/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component IncomeTableSummaryComponent
  @description Income table summary component for displaying income data
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTableDataSource } from '@angular/material/table';
import { By } from '@angular/platform-browser';

import { PaymentMethod } from '../../../../../enums/payment-method';
import { Income } from '../../../../../models/income.model';
import { IncomeTableSummaryComponent } from './income-table-summary.component';

describe('IncomeTableSummaryComponent', () => {
  let component: IncomeTableSummaryComponent;
  let fixture: ComponentFixture<IncomeTableSummaryComponent>;
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

    mockDataSource = new MatTableDataSource<Income>(mockIncomes);

    await TestBed.configureTestingModule({
      imports: [IncomeTableSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeTableSummaryComponent);
    component = fixture.componentInstance;
    component.dataSource = mockDataSource;
    component.filteredCount = 2;
    component.totalCount = 2;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display total income amount', () => {
    const totalAmount = fixture.debugElement.nativeElement.querySelector('.total-amount');
    expect(totalAmount).toBeTruthy();
    expect(totalAmount.textContent).toContain('$6,000.00');
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
    expect(summary.nativeElement.getAttribute('aria-label')).toBe('Income summary');
    expect(badge.nativeElement.getAttribute('role')).toBe('img');
    expect(badge.nativeElement.getAttribute('aria-label')).toBe('Total income amount');
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
    component.dataSource = new MatTableDataSource<Income>([]);
    fixture.detectChanges();
    
    const totalAmount = fixture.debugElement.nativeElement.querySelector('.total-amount');
    expect(totalAmount.textContent).toContain('$0.00');
  });

  it('should handle null data source', () => {
    component.dataSource = null as unknown as MatTableDataSource<Income>;
    fixture.detectChanges();
    
    const totalAmount = fixture.debugElement.nativeElement.querySelector('.total-amount');
    expect(totalAmount.textContent).toContain('$0.00');
  });

  it('should compute total income correctly', () => {
    expect(component.getTotalIncomeAmount()).toBe(6000);
  });

  it('should compute zero for empty data', () => {
    component.dataSource = new MatTableDataSource<Income>([]);
    expect(component.getTotalIncomeAmount()).toBe(0);
  });

  it('should compute zero for null data', () => {
    component.dataSource = null as unknown as MatTableDataSource<Income>;
    expect(component.getTotalIncomeAmount()).toBe(0);
  });

  it('should have proper semantic structure', () => {
    const summary = fixture.debugElement.query(By.css('.total-summary'));
    const badge = fixture.debugElement.query(By.css('.total-badge'));
    const label = fixture.debugElement.query(By.css('.total-label'));
    const amount = fixture.debugElement.query(By.css('.total-amount'));
    
    expect(summary).toBeTruthy();
    expect(badge).toBeTruthy();
    expect(label.nativeElement.textContent.trim()).toBe('Total Income:');
    expect(amount).toBeTruthy();
  });
});
