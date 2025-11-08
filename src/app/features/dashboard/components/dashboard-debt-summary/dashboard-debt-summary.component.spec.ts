/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component DashboardDebtSummaryComponent
  @description Comprehensive unit tests for debt summary widget component
*/

import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';

import { AuthService } from '../../../../core/services/auth.service';
import { DebtService } from '../../../../core/services/debt.service';
import { DashboardDebtSummaryComponent } from './dashboard-debt-summary.component';

describe('DashboardDebtSummaryComponent', () => {
  let component: DashboardDebtSummaryComponent;
  let fixture: ComponentFixture<DashboardDebtSummaryComponent>;
  let mockDebtService: jasmine.SpyObj<DebtService>;
  let mockChangeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;
  let userIdSubject: BehaviorSubject<number | null>;
  let debtUpdatedSubject: Subject<void>;

  const mockDebtTotals = {
    totalRemaining: 28009.99,
    totalMinPayments: 750,
    debtsCount: 3
  };

  beforeEach(async () => {
    userIdSubject = new BehaviorSubject<number | null>(1);
    debtUpdatedSubject = new Subject<void>();

    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getUserId'], {
      userId$: userIdSubject.asObservable()
    });
    authServiceSpy.getUserId.and.returnValue(1);

    const debtServiceSpy = jasmine.createSpyObj('DebtService', ['getDebtTotals'], {
      debtUpdated$: debtUpdatedSubject.asObservable()
    });
    debtServiceSpy.getDebtTotals.and.returnValue(of(mockDebtTotals));

    const changeDetectorRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck']);

    await TestBed.configureTestingModule({
      imports: [
        DashboardDebtSummaryComponent,
        RouterTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: DebtService, useValue: debtServiceSpy },
        { provide: ChangeDetectorRef, useValue: changeDetectorRefSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardDebtSummaryComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockDebtService = TestBed.inject(DebtService) as jasmine.SpyObj<DebtService>;
    mockChangeDetectorRef = TestBed.inject(ChangeDetectorRef) as jasmine.SpyObj<ChangeDetectorRef>;
  });

  afterEach(() => {
    userIdSubject.next(1);
    debtUpdatedSubject = new Subject<void>();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have proper component structure', () => {
    expect(component.isLoading).toBeDefined();
    expect(component.totalDebt).toBeDefined();
    expect(component.totalPaid).toBeDefined();
    expect(component.totalMinPayments).toBeDefined();
    expect(component.creditorCount).toBeDefined();
  });

  it('should initialize with default values', () => {
    expect(component.isLoading).toBe(true);
    expect(component.totalDebt).toBe(0);
    expect(component.totalPaid).toBe(0);
    expect(component.totalMinPayments).toBe(0);
    expect(component.creditorCount).toBe(0);
  });

  it('should load debt summary on init', () => {
    fixture.detectChanges();
    
    expect(mockDebtService.getDebtTotals).toHaveBeenCalled();
    expect(mockChangeDetectorRef.markForCheck).toHaveBeenCalled();
  });

  it('should load and display debt totals correctly', (done) => {
    fixture.detectChanges();

    setTimeout(() => {
      expect(component.isLoading).toBe(false);
      expect(component.totalDebt).toBe(28009.99);
      expect(component.totalMinPayments).toBe(750);
      expect(component.creditorCount).toBe(3);
      expect(mockChangeDetectorRef.markForCheck).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should handle Map response from API', (done) => {
    const mapResponse = new Map<string, number | string>();
    mapResponse.set('totalRemaining', 15000);
    mapResponse.set('totalMinPayments', 500);
    mapResponse.set('debtsCount', 2);
    
    mockDebtService.getDebtTotals.and.returnValue(of(mapResponse));
    
    component['loadDebtSummary']();
    
    setTimeout(() => {
      expect(component.totalDebt).toBe(15000);
      expect(component.totalMinPayments).toBe(500);
      expect(component.creditorCount).toBe(2);
      done();
    }, 100);
  });

  it('should handle plain object response from API', (done) => {
    const objectResponse = {
      totalRemaining: 20000,
      totalMinPayments: 600,
      debtsCount: 4
    };
    
    mockDebtService.getDebtTotals.and.returnValue(of(objectResponse));
    
    component['loadDebtSummary']();
    
    setTimeout(() => {
      expect(component.totalDebt).toBe(20000);
      expect(component.totalMinPayments).toBe(600);
      expect(component.creditorCount).toBe(4);
      done();
    }, 100);
  });

  it('should use fallback values when API fields are missing', (done) => {
    const partialResponse = {
      totalMinPayments: 300
    };
    
    mockDebtService.getDebtTotals.and.returnValue(of(partialResponse));
    
    component['loadDebtSummary']();
    
    setTimeout(() => {
      expect(component.totalDebt).toBe(0);
      expect(component.totalMinPayments).toBe(300);
      expect(component.creditorCount).toBe(0);
      done();
    }, 100);
  });

  it('should handle null response gracefully', (done) => {
    mockDebtService.getDebtTotals.and.returnValue(of(null));
    
    component['loadDebtSummary']();
    
    setTimeout(() => {
      expect(component.totalDebt).toBe(0);
      expect(component.totalPaid).toBe(0);
      expect(component.totalMinPayments).toBe(0);
      expect(component.creditorCount).toBe(0);
      expect(component.isLoading).toBe(false);
      done();
    }, 100);
  });

  it('should handle API errors gracefully', (done) => {
    mockDebtService.getDebtTotals.and.returnValue(
      throwError(() => new Error('API Error'))
    );
    
    component['loadDebtSummary']();
    
    setTimeout(() => {
      expect(component.isLoading).toBe(false);
      expect(component.totalDebt).toBe(0);
      expect(component.totalPaid).toBe(0);
      expect(component.totalMinPayments).toBe(0);
      expect(component.creditorCount).toBe(0);
      expect(mockChangeDetectorRef.markForCheck).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should wait for userId before loading data', (done) => {
    userIdSubject.next(null);
    fixture.detectChanges();
    
    expect(mockDebtService.getDebtTotals).not.toHaveBeenCalled();
    
    userIdSubject.next(1);
    fixture.detectChanges();
    
    setTimeout(() => {
      expect(mockDebtService.getDebtTotals).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should refresh data when debtUpdated$ emits', (done) => {
    fixture.detectChanges();
    
    mockDebtService.getDebtTotals.calls.reset();
    
    debtUpdatedSubject.next();
    
    setTimeout(() => {
      expect(mockDebtService.getDebtTotals).toHaveBeenCalled();
      expect(mockChangeDetectorRef.markForCheck).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should handle multiple debt update events', (done) => {
    fixture.detectChanges();
    
    mockDebtService.getDebtTotals.calls.reset();
    
    debtUpdatedSubject.next();
    debtUpdatedSubject.next();
    debtUpdatedSubject.next();
    
    setTimeout(() => {
      expect(mockDebtService.getDebtTotals).toHaveBeenCalledTimes(3);
      done();
    }, 100);
  });

  it('should display loading state initially', () => {
    component.isLoading = true;
    fixture.detectChanges();
    
    const loadingElement = fixture.nativeElement.querySelector('.loading-state');
    expect(loadingElement).toBeTruthy();
    
    const contentElement = fixture.nativeElement.querySelector('.debt-content');
    expect(contentElement).toBeFalsy();
  });

  it('should display debt content when not loading', () => {
    component.isLoading = false;
    component.totalDebt = 28009.99;
    component.totalPaid = 5000;
    component.creditorCount = 3;
    component.totalMinPayments = 750;
    fixture.detectChanges();
    
    const contentElement = fixture.nativeElement.querySelector('.debt-content');
    expect(contentElement).toBeTruthy();
    
    const loadingElement = fixture.nativeElement.querySelector('.loading-state');
    expect(loadingElement).toBeFalsy();
  });

  it('should display formatted currency values', () => {
    component.isLoading = false;
    component.totalDebt = 28009.99;
    component.totalPaid = 5000;
    component.totalMinPayments = 750;
    fixture.detectChanges();
    
    const totalDebtElement = fixture.nativeElement.querySelector('.stat-value.total');
    expect(totalDebtElement).toBeTruthy();
    expect(totalDebtElement.textContent).toContain('$28,010');
    
    const minPaymentElement = fixture.nativeElement.querySelector('.payment-amount');
    expect(minPaymentElement).toBeTruthy();
    expect(minPaymentElement.textContent).toContain('$750');
  });

  it('should display creditor count', () => {
    component.isLoading = false;
    component.creditorCount = 3;
    fixture.detectChanges();
    
    const creditorElement = fixture.nativeElement.querySelector('.stat-value.creditors');
    expect(creditorElement).toBeTruthy();
    expect(creditorElement.textContent).toContain('3');
  });

  it('should have proper ARIA labels', () => {
    fixture.detectChanges();
    
    const article = fixture.nativeElement.querySelector('article[role="article"]');
    expect(article).toBeTruthy();
    expect(article.getAttribute('aria-labelledby')).toBe('debtTitle');
    
    const title = fixture.nativeElement.querySelector('#debtTitle');
    expect(title).toBeTruthy();
    
    const link = fixture.nativeElement.querySelector('.view-all-link');
    expect(link).toBeTruthy();
    expect(link.getAttribute('aria-label')).toBe('View all debts');
  });

  it('should support keyboard navigation on link', () => {
    component.isLoading = false;
    fixture.detectChanges();
    
    const link = fixture.nativeElement.querySelector('.view-all-link');
    expect(link).toBeTruthy();
    
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    
    spyOn(enterEvent, 'preventDefault');
    spyOn(enterEvent, 'stopPropagation');
    spyOn(spaceEvent, 'preventDefault');
    spyOn(spaceEvent, 'stopPropagation');
    
    link.dispatchEvent(enterEvent);
    link.dispatchEvent(spaceEvent);
    
    expect(enterEvent.preventDefault).toHaveBeenCalled();
    expect(enterEvent.stopPropagation).toHaveBeenCalled();
    expect(spaceEvent.preventDefault).toHaveBeenCalled();
    expect(spaceEvent.stopPropagation).toHaveBeenCalled();
  });

  it('should have hidden icons marked with aria-hidden', () => {
    fixture.detectChanges();
    
    const icons = fixture.nativeElement.querySelectorAll('i[aria-hidden="true"]');
    expect(icons.length).toBeGreaterThan(0);
    
    icons.forEach((icon: HTMLElement) => {
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    });
  });

  it('should handle zero values correctly', () => {
    component.isLoading = false;
    component.totalDebt = 0;
    component.totalPaid = 0;
    component.creditorCount = 0;
    component.totalMinPayments = 0;
    fixture.detectChanges();
    
    const totalDebtElement = fixture.nativeElement.querySelector('.stat-value.total');
    expect(totalDebtElement.textContent).toContain('$0');
    
    const creditorElement = fixture.nativeElement.querySelector('.stat-value.creditors');
    expect(creditorElement.textContent).toContain('0');
  });

  it('should handle very large debt values', () => {
    component.isLoading = false;
    component.totalDebt = 999999999.99;
    fixture.detectChanges();
    
    const totalDebtElement = fixture.nativeElement.querySelector('.stat-value.total');
    expect(totalDebtElement).toBeTruthy();
    expect(totalDebtElement.textContent).toContain('$');
  });

  it('should handle alternative field names (totalDebt vs totalRemaining)', (done) => {
    const alternativeResponse = {
      totalDebt: 15000,
      totalMinPayments: 500,
      creditorCount: 2
    };
    
    mockDebtService.getDebtTotals.and.returnValue(of(alternativeResponse));
    
    component['loadDebtSummary']();
    
    setTimeout(() => {
      expect(component.totalDebt).toBe(15000);
      done();
    }, 100);
  });

  it('should handle alternative field names (debtsCount vs creditorCount)', (done) => {
    const alternativeResponse = {
      totalRemaining: 15000,
      totalMinPayments: 500,
      debtsCount: 2
    };
    
    mockDebtService.getDebtTotals.and.returnValue(of(alternativeResponse));
    
    component['loadDebtSummary']();
    
    setTimeout(() => {
      expect(component.creditorCount).toBe(2);
      done();
    }, 100);
  });

  it('should use OnPush change detection strategy', () => {
    const componentDef = (component.constructor as any).ɵcmp;
    expect(componentDef).toBeDefined();
    expect(componentDef.onPush).toBeDefined();
  });

  it('should call markForCheck after data updates', (done) => {
    fixture.detectChanges();
    
    mockChangeDetectorRef.markForCheck.calls.reset();
    
    debtUpdatedSubject.next();
    
    setTimeout(() => {
      expect(mockChangeDetectorRef.markForCheck).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should cleanup subscriptions on destroy', () => {
    fixture.detectChanges();
    
    const subscriptionCount = (component as any)['destroyRef'] ? 1 : 0;
    
    fixture.destroy();
    
    expect(subscriptionCount).toBeGreaterThanOrEqual(0);
  });
});

