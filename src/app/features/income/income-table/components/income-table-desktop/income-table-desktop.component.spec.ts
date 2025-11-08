/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component IncomeTableDesktopComponent
  @description Income table desktop component for displaying income data
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { PaymentMethod } from '../../../../../enums/payment-method';
import { Income } from '../../../../../models/income.model';
import { IncomeTableDesktopComponent } from './income-table-desktop.component';

describe('IncomeTableDesktopComponent', () => {
  let component: IncomeTableDesktopComponent;
  let fixture: ComponentFixture<IncomeTableDesktopComponent>;
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
        amount: 500,
        date: '2024-01-02',
        paymentMethod: PaymentMethod.CARD,
        isReceived: false,
        received: false,
        description: 'Web development project'
      }
    ];

    mockDataSource = new MatTableDataSource<Income>(mockIncomes);

    await TestBed.configureTestingModule({
      imports: [
        IncomeTableDesktopComponent,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule
      ],
      providers: [provideAnimationsAsync()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeTableDesktopComponent);
    component = fixture.componentInstance;
    component.dataSource = mockDataSource;
    component.activeColumns = ['select', 'method', 'source', 'amount', 'date', 'description', 'actions'];
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

  it('should have proper ARIA labels for status indicators', () => {
    const statusIcons = fixture.debugElement.queryAll(By.css('.status-circle mat-icon'));
    expect(statusIcons[0].nativeElement.getAttribute('aria-label')).toBe('Received');
    expect(statusIcons[1].nativeElement.getAttribute('aria-label')).toBe('Pending');
  });

  it('should have proper ARIA labels for payment method icons', () => {
    const methodIcons = fixture.debugElement.queryAll(By.css('.method-circle i'));
    expect(methodIcons[0].nativeElement.getAttribute('aria-label')).toContain('Payment method:');
    expect(methodIcons[1].nativeElement.getAttribute('aria-label')).toContain('Payment method:');
  });

  it('should have aria-hidden on decorative icons', () => {
    const decorativeIcons = fixture.debugElement.queryAll(By.css('.source-icon mat-icon'));
    expect(decorativeIcons[0].nativeElement.getAttribute('aria-hidden')).toBe('true');
  });

  it('should track by income id for performance', () => {
    const income1 = { id: 1 } as Income;
    const income2 = { id: 2 } as Income;
    
    expect(component.trackByIncomeId(0, income1)).toBe(1);
    expect(component.trackByIncomeId(1, income2)).toBe(2);
  });

  it('should handle empty data source gracefully', () => {
    component.dataSource = new MatTableDataSource<Income>([]);
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
