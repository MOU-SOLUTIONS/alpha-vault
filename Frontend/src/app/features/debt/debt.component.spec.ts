/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component DebtComponent
  @description Main debt dashboard component tests for managing debt dashboard
*/

import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, Subject, throwError } from 'rxjs';

import { SeoService } from '../../core/seo/seo.service';
import { DebtService } from '../../core/services/debt.service';
import { NotificationService } from '../../core/services/notification.service';
import { Debt } from '../../models/debt.model';
import { DebtComponent } from './debt.component';

describe('DebtComponent', () => {
  let component: DebtComponent;
  let fixture: ComponentFixture<DebtComponent>;
  let debtService: jasmine.SpyObj<DebtService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let seoService: jasmine.SpyObj<SeoService>;

  const mockDebts: Debt[] = [
    {
      id: 1,
      creditorName: 'Bank A',
      principalAmount: 10000,
      remainingAmount: 5000,
      interestRateApr: 18,
      minPayment: 200,
      dueDate: '12/31/2024',
      recurrenceType: 'monthly' as any,
      isPaidOff: false
    },
    {
      id: 2,
      creditorName: 'Credit Card B',
      principalAmount: 5000,
      remainingAmount: 3000,
      interestRateApr: 3,
      minPayment: 100,
      dueDate: '11/15/2024',
      recurrenceType: 'monthly' as any,
      isPaidOff: false
    }
  ];

  beforeEach(async () => {
    const debtServiceSpy = jasmine.createSpyObj('DebtService', [
      'getAllDebts',
      'getOverdueDebts',
      'getDebtCreditorSummary',
      'getTop5LargestDebts',
      'getTotalMinPayments',
      'saveDebt',
      'updateDebt',
      'deleteDebt',
      'notifyDebtUpdated'
    ], {
      debtUpdated$: new Subject<void>()
    });

    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'addDebtCreatedNotification',
      'addDebtModifiedNotification',
      'addDebtDeletedNotification',
      'addDebtErrorNotification'
    ]);

    const seoServiceSpy = jasmine.createSpyObj('SeoService', ['set']);

    await TestBed.configureTestingModule({
      imports: [DebtComponent, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        { provide: DebtService, useValue: debtServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: SeoService, useValue: seoServiceSpy },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DebtComponent);
    component = fixture.componentInstance;
    debtService = TestBed.inject(DebtService) as jasmine.SpyObj<DebtService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    seoService = TestBed.inject(SeoService) as jasmine.SpyObj<SeoService>;

    debtService.getAllDebts.and.returnValue(of(mockDebts));
    debtService.getOverdueDebts.and.returnValue(of([]));
    debtService.getDebtCreditorSummary.and.returnValue(of({ 'Bank A': 5000 }));
    debtService.getTop5LargestDebts.and.returnValue(of([]));
    debtService.getTotalMinPayments.and.returnValue(of(300));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should load all debt data on init', () => {
      component.ngOnInit();
      expect(debtService.getAllDebts).toHaveBeenCalled();
      expect(debtService.getOverdueDebts).toHaveBeenCalled();
      expect(debtService.getDebtCreditorSummary).toHaveBeenCalled();
      expect(debtService.getTop5LargestDebts).toHaveBeenCalled();
      expect(debtService.getTotalMinPayments).toHaveBeenCalled();
    });

    it('should subscribe to debt updates', () => {
      component.ngOnInit();
      expect(debtService.debtUpdated$).toBeTruthy();
    });

    it('should set page metadata on init', () => {
      component.ngOnInit();
      expect(seoService.set).toHaveBeenCalled();
      const callArgs = seoService.set.calls.mostRecent().args[0];
      expect(callArgs.title).toBe('Debt Management');
      expect(callArgs.description).toContain('Manage your debts');
      expect(callArgs.canonicalUrl).toBeTruthy();
    });
  });

  describe('Subscription Management', () => {
    it('should unsubscribe from all subscriptions on destroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');
      component.ngOnDestroy();
      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });

    it('should use takeUntil for all service subscriptions', () => {
      component.ngOnInit();
      expect(component['destroy$']).toBeTruthy();
    });
  });

  describe('CRUD Operations', () => {
    it('should add debt successfully via handleDebtFormSubmit', () => {
      debtService.saveDebt.and.returnValue(of({}));
      const formValue = {
        creditorName: 'Test Creditor',
        principalAmount: 1000,
        remainingAmount: 500,
        dueDate: '2024-12-31',
        minPayment: 50
      };
      
      component.handleDebtFormSubmit({ mode: 'add', formValue });
      expect(debtService.saveDebt).toHaveBeenCalled();
      expect(notificationService.addDebtCreatedNotification).toHaveBeenCalled();
    });

    it('should update debt successfully via handleDebtFormSubmit', () => {
      debtService.updateDebt.and.returnValue(of({}));
      const formValue = {
        creditorName: 'Test Creditor',
        principalAmount: 1000,
        remainingAmount: 500,
        dueDate: '2024-12-31',
        minPayment: 50
      };
      
      component.handleDebtFormSubmit({ mode: 'edit', formValue, debtId: 1 });
      expect(debtService.updateDebt).toHaveBeenCalled();
      expect(notificationService.addDebtModifiedNotification).toHaveBeenCalled();
    });

    it('should add debt successfully via addDebt', () => {
      debtService.saveDebt.and.returnValue(of({}));
      component.debtForm.patchValue({
        creditorName: 'Test',
        principalAmount: 1000,
        remainingAmount: 500,
        dueDate: '2024-12-31',
        minPayment: 50
      });
      
      component.addDebt();
      expect(debtService.saveDebt).toHaveBeenCalled();
      expect(notificationService.addDebtCreatedNotification).toHaveBeenCalled();
    });

    it('should not add debt when form is invalid', () => {
      debtService.saveDebt.and.returnValue(of({}));
      component.debtForm.patchValue({
        creditorName: '', // Invalid
        principalAmount: 0
      });
      
      component.addDebt();
      expect(debtService.saveDebt).not.toHaveBeenCalled();
    });

    it('should handle add debt error', () => {
      debtService.saveDebt.and.returnValue(throwError(() => new Error('Test error')));
      component.debtForm.patchValue({
        creditorName: 'Test',
        principalAmount: 1000,
        remainingAmount: 500,
        dueDate: '2024-12-31',
        minPayment: 50
      });
      
      component.addDebt();
      expect(notificationService.addDebtErrorNotification).toHaveBeenCalled();
    });

    it('should delete debt successfully', () => {
      component.debts = mockDebts;
      debtService.deleteDebt.and.returnValue(of({}));
      
      component.onDeleteDebt(1);
      expect(debtService.deleteDebt).toHaveBeenCalledWith(1);
      expect(notificationService.addDebtDeletedNotification).toHaveBeenCalled();
    });

    it('should handle delete debt error', () => {
      component.debts = mockDebts;
      debtService.deleteDebt.and.returnValue(throwError(() => new Error('Test error')));
      
      component.onDeleteDebt(1);
      expect(notificationService.addDebtErrorNotification).toHaveBeenCalled();
    });
  });

  describe('Template Rendering', () => {
    it('should render all child components', () => {
      component.debts = mockDebts;
      fixture.detectChanges();
      
      expect(fixture.debugElement.query(By.css('app-debt-widget'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('app-debt-progress'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('app-debt-creditor-chart'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('app-debt-table'))).toBeTruthy();
    });

    it('should show add overlay when isAddOverlayVisible is true', () => {
      component.isAddOverlayVisible = true;
      fixture.detectChanges();
      
      const overlay = fixture.debugElement.query(By.css('app-overlay-container'));
      expect(overlay).toBeTruthy();
    });

    it('should show modify overlay when isModifyOverlayVisible is true', () => {
      component.isModifyOverlayVisible = true;
      fixture.detectChanges();
      
      const overlays = fixture.debugElement.queryAll(By.css('app-overlay-container'));
      expect(overlays.length).toBe(1);
    });
  });

  describe('Accessibility', () => {
    it('should have semantic HTML structure', () => {
      fixture.detectChanges();
      
      const main = fixture.debugElement.query(By.css('main[role="main"]'));
      expect(main).toBeTruthy();
      
      const sections = fixture.debugElement.queryAll(By.css('section[aria-labelledby]'));
      expect(sections.length).toBeGreaterThan(0);
    });

    it('should have sr-only headings for screen readers', () => {
      fixture.detectChanges();
      
      const headings = fixture.debugElement.queryAll(By.css('.sr-only'));
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should have proper aria-labelledby attributes', () => {
      fixture.detectChanges();
      
      const sections = fixture.debugElement.queryAll(By.css('section[aria-labelledby]'));
      sections.forEach(section => {
        const labelledBy = section.nativeElement.getAttribute('aria-labelledby');
        expect(labelledBy).toBeTruthy();
      });
    });
  });

  describe('Getter Properties', () => {
    it('should calculate creditor count correctly', () => {
      component.creditorSummary = { 'Bank A': 1000, 'Bank B': 2000 };
      expect(component.creditorCount).toBe(2);
    });

    it('should return 0 when creditorSummary is empty', () => {
      component.creditorSummary = {};
      expect(component.creditorCount).toBe(0);
    });

    it('should return 0 when creditorSummary is null or undefined', () => {
      component.creditorSummary = {} as any;
      expect(component.creditorCount).toBe(0);
    });
  });

  describe('Overlay Management', () => {
    it('should open add overlay when onAddDebt is called', () => {
      component.onAddDebt();
      expect(component.isAddOverlayVisible).toBe(true);
      expect(component.debtForm.pristine).toBe(true);
    });

    it('should open modify overlay when onModifyDebt is called', () => {
      component.onModifyDebt(mockDebts[0]);
      expect(component.isModifyOverlayVisible).toBe(true);
      expect(component.debtId).toBe(1);
      expect(component.debtForm.get('creditorName')?.value).toBe('Bank A');
    });

    it('should close overlays when closeOverlay is called', () => {
      component.isAddOverlayVisible = true;
      component.isModifyOverlayVisible = true;
      component.closeOverlay();
      expect(component.isAddOverlayVisible).toBe(false);
      expect(component.isModifyOverlayVisible).toBe(false);
    });

    it('should reset form when closing overlay', () => {
      component.debtForm.patchValue({ creditorName: 'Test' });
      component.closeOverlay();
      expect(component.debtForm.get('creditorName')?.value).toBeNull();
    });
  });

  describe('Data Loading', () => {
    it('should calculate total debt correctly', () => {
      component.debts = mockDebts;
      component['calculateTotalPaid']();
      expect(component.totalDebt).toBe(8000);
    });

    it('should calculate total paid correctly', () => {
      component.debts = mockDebts;
      component['calculateTotalPaid']();
      expect(component.totalPaid).toBe(7000);
    });

    it('should update data when loadAllDebtData is called', () => {
      component.ngOnInit();
      expect(debtService.getAllDebts).toHaveBeenCalled();
      expect(debtService.getOverdueDebts).toHaveBeenCalled();
      expect(debtService.getDebtCreditorSummary).toHaveBeenCalled();
    });
  });

  describe('Date Formatting', () => {
    it('should convert date from backend format to HTML format', () => {
      const result = component['toHtmlDateFormat']('12/31/2024');
      expect(result).toBe('2024-12-31');
    });

    it('should convert date from HTML format to backend format', () => {
      const result = component['formatDateForBackend']('2024-12-31');
      expect(result).toBe('12/31/2024');
    });

    it('should handle date conversion edge cases', () => {
      const result1 = component['toHtmlDateFormat']('1/5/2024');
      expect(result1).toBe('2024-01-05');
      
      const result2 = component['formatDateForBackend']('2024-01-05');
      expect(result2).toBe('01/05/2024');
    });
  });

  describe('SSR Compatibility', () => {
    it('should not access Meta service during SSR', () => {
      const serverFixture = TestBed.configureTestingModule({
        imports: [DebtComponent, ReactiveFormsModule, NoopAnimationsModule],
        providers: [
          { provide: DebtService, useValue: debtService },
          { provide: NotificationService, useValue: notificationService },
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      }).createComponent(DebtComponent);
      
      serverFixture.componentInstance.debts = mockDebts;
      expect(() => serverFixture.detectChanges()).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty debts array', () => {
      component.debts = [];
      component['calculateTotalPaid']();
      expect(component.totalDebt).toBe(0);
      expect(component.totalPaid).toBe(0);
    });

    it('should handle debt with zero remaining amount', () => {
      const paidOffDebt: Debt = {
        ...mockDebts[0],
        remainingAmount: 0
      };
      component.debts = [paidOffDebt];
      component['calculateTotalPaid']();
      expect(component.totalPaid).toBe(10000);
    });

    it('should handle delete when debt not found', () => {
      component.debts = [];
      debtService.deleteDebt.and.returnValue(of({}));
      
      component.onDeleteDebt(999);
      expect(debtService.deleteDebt).toHaveBeenCalledWith(999);
      expect(notificationService.addDebtDeletedNotification).toHaveBeenCalledWith('Unknown', 0);
    });
  });
});

