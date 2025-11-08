/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component IncomeComponent
  @description Test suite for main income dashboard component
*/

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { of } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { IncomeService } from '../../core/services/income.service';
import { NotificationService } from '../../core/services/notification.service';
import { PaymentMethod } from '../../enums/payment-method';
import { IncomeComponent } from './income.component';

describe('IncomeComponent', () => {
  let component: IncomeComponent;
  let fixture: ComponentFixture<IncomeComponent>;
  let incomeService: jasmine.SpyObj<IncomeService>;
  let authService: jasmine.SpyObj<AuthService>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    const incomeServiceSpy = jasmine.createSpyObj('IncomeService', [
      'getTodayIncome', 'getWeekIncome', 'getMonthIncome', 'getYearIncome',
      'getWeeklyEvolution', 'getMonthlyEvolution', 'getYearlyEvolution',
      'getTop5IncomeThisMonth', 'getAllIncomes', 'getIncomeForWeeksOfCurrentMonth',
      'getIncomeForMonthsOfCurrentYear', 'getCurrentMonthPaymentMethodSummary',
      'getCurrentMonthSourceSummary', 'saveIncome', 'updateIncome', 'deleteIncome'
    ]);

    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getUserId', 'userId$']);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'addIncomeCreatedNotification', 'addIncomeModifiedNotification', 'addIncomeDeletedNotification'
    ]);

    await TestBed.configureTestingModule({
      imports: [IncomeComponent, HttpClientTestingModule],
      providers: [
        provideAnimationsAsync(),
        { provide: IncomeService, useValue: incomeServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeComponent);
    component = fixture.componentInstance;
    incomeService = TestBed.inject(IncomeService) as jasmine.SpyObj<IncomeService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;

    authService.userId$ = of(123);
    incomeService.getTodayIncome.and.returnValue(of(100));
    incomeService.getWeekIncome.and.returnValue(of(500));
    incomeService.getMonthIncome.and.returnValue(of(2000));
    incomeService.getYearIncome.and.returnValue(of(24000));
    incomeService.getWeeklyEvolution.and.returnValue(of(10));
    incomeService.getMonthlyEvolution.and.returnValue(of(15));
    incomeService.getYearlyEvolution.and.returnValue(of(20));
    incomeService.getTop5IncomeThisMonth.and.returnValue(of({}));
    incomeService.getAllIncomes.and.returnValue(of([]));
    incomeService.getIncomeForWeeksOfCurrentMonth.and.returnValue(of([]));
    incomeService.getIncomeForMonthsOfCurrentYear.and.returnValue(of([]));
    incomeService.getCurrentMonthPaymentMethodSummary.and.returnValue(of({}));
    incomeService.getCurrentMonthSourceSummary.and.returnValue(of({}));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Performance Features', () => {
    it('should initialize performance metrics', () => {
      expect(component['performanceMetrics']).toBeDefined();
      expect(component['performanceMetrics'].dataLoadTime).toBe(0);
      expect(component['performanceMetrics'].lastRefresh).toBe(0);
      expect(component['performanceMetrics'].cacheHits).toBe(0);
      expect(component['performanceMetrics'].totalRequests).toBe(0);
    });

    it('should track data load time', () => {
      component.userId = 123;
      component['performanceMetrics'].totalRequests = 0;
      
      component['loadAllIncomeData']();
      
      expect(component['performanceMetrics'].totalRequests).toBe(1);
    });

    it('should have debounced refresh functionality', () => {
      expect(component['refreshSubject$']).toBeDefined();
      spyOn(component as any, 'loadAllIncomeData');
      
      component['refreshSubject$'].next();
      component['refreshSubject$'].next();
      component['refreshSubject$'].next();
      
      setTimeout(() => {
        expect((component as any).loadAllIncomeData).toHaveBeenCalledTimes(1);
      }, 400);
    });
  });

  describe('Form Management', () => {
    it('should initialize form with correct validators', () => {
      expect(component.incomeForm.get('source')?.hasError('required')).toBeTruthy();
      expect(component.incomeForm.get('amount')?.hasError('required')).toBeTruthy();
      expect(component.incomeForm.get('paymentMethod')?.hasError('required')).toBeTruthy();
      expect(component.incomeForm.get('date')?.hasError('required')).toBeTruthy();
    });

    it('should toggle add form correctly', () => {
      expect(component.showAddForm).toBeFalsy();
      
      component.toggleAddForm();
      expect(component.showAddForm).toBeTruthy();
      
      component.toggleAddForm();
      expect(component.showAddForm).toBeFalsy();
    });

    it('should handle form submission for add income', () => {
      component.incomeForm.patchValue({
        source: 'Test Source',
        amount: 1000,
        paymentMethod: 'CASH',
        date: '2023-01-01',
        description: 'Test description',
        isReceived: true
      });

      const mockIncomeResponse = {
        id: 1,
        userId: 123,
        source: 'Test Source',
        amount: 1000,
        paymentMethod: PaymentMethod.CASH,
        date: '2023-01-01',
        description: 'Test description',
        received: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      };
      incomeService.saveIncome.and.returnValue(of(mockIncomeResponse));
      spyOn(component as any, 'refreshAllData');

      component.addIncome();

      expect(incomeService.saveIncome).toHaveBeenCalled();
    });
  });

  describe('Data Loading', () => {
    it('should load all income data on init', () => {
      spyOn(component as any, 'loadAllIncomeData');
      
      component.ngOnInit();
      
      setTimeout(() => {
        expect((component as any).loadAllIncomeData).toHaveBeenCalled();
      }, 400);
    });

    it('should reset all data on error', () => {
      component.dayIncome = 100;
      component.weekIncome = 500;
      component.monthIncome = 2000;
      
      component['resetAllData']();
      
      expect(component.dayIncome).toBe(0);
      expect(component.weekIncome).toBe(0);
      expect(component.monthIncome).toBe(0);
    });
  });

  describe('Utility Methods', () => {
    it('should sanitize input correctly', () => {
      const maliciousInput = '<script>alert("xss")</script>';
      const sanitized = component['sanitizeInput'](maliciousInput);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('</script>');
    });

    it('should format date correctly', () => {
      const dateString = '2023-01-01';
      const formatted = component['formatDate'](dateString);
      
      expect(formatted).toBe('01/01/2023');
    });

    it('should map payment method values correctly', () => {
      const mapped = component['mapPaymentMethodValue']('CASH');
      expect(mapped).toBe('CASH');
    });
  });
});
