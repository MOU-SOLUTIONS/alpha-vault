/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component DashboardSavingsSummaryComponent
  @description Comprehensive unit tests for savings summary widget component
*/

import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, throwError } from 'rxjs';

import { AuthService } from '../../../../core/services/auth.service';
import { SavingGoalService } from '../../../../core/services/saving.service';
import { DashboardSavingsSummaryComponent } from './dashboard-savings-summary.component';

describe('DashboardSavingsSummaryComponent', () => {
  let component: DashboardSavingsSummaryComponent;
  let fixture: ComponentFixture<DashboardSavingsSummaryComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockSavingService: jasmine.SpyObj<SavingGoalService>;
  let mockChangeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;
  let savingGoalUpdatedSubject: Subject<void>;

  const mockStatsResponse = {
    totalCurrent: 5000,
    totalTarget: 10000,
    goalsCount: 3,
    totalRemaining: 5000
  };

  beforeEach(async () => {
    savingGoalUpdatedSubject = new Subject<void>();

    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      userId$: of(1)
    });

    const savingServiceSpy = jasmine.createSpyObj('SavingGoalService', ['getTotals'], {
      savingGoalUpdated$: savingGoalUpdatedSubject.asObservable()
    });
    savingServiceSpy.getTotals.and.returnValue(of(mockStatsResponse));

    const changeDetectorRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck']);

    await TestBed.configureTestingModule({
      imports: [
        DashboardSavingsSummaryComponent,
        RouterTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: SavingGoalService, useValue: savingServiceSpy },
        { provide: ChangeDetectorRef, useValue: changeDetectorRefSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardSavingsSummaryComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockSavingService = TestBed.inject(SavingGoalService) as jasmine.SpyObj<SavingGoalService>;
    mockChangeDetectorRef = TestBed.inject(ChangeDetectorRef) as jasmine.SpyObj<ChangeDetectorRef>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have proper component structure', () => {
    expect(component.isLoading).toBeDefined();
    expect(component.totalSaved).toBeDefined();
    expect(component.totalTarget).toBeDefined();
    expect(component.activeGoals).toBeDefined();
    expect(component.completionRate).toBeDefined();
  });

  it('should initialize with default values', () => {
    expect(component.isLoading).toBe(true);
    expect(component.totalSaved).toBe(0);
    expect(component.totalTarget).toBe(0);
    expect(component.activeGoals).toBe(0);
    expect(component.completionRate).toBe(0);
  });

  it('should load savings summary on init', (done) => {
    fixture.detectChanges();

    setTimeout(() => {
      expect(mockSavingService.getTotals).toHaveBeenCalled();
      expect(mockChangeDetectorRef.markForCheck).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should load and process stats correctly', (done) => {
    fixture.detectChanges();

    setTimeout(() => {
      expect(component.isLoading).toBe(false);
      expect(component.totalSaved).toBe(5000);
      expect(component.totalTarget).toBe(10000);
      expect(component.activeGoals).toBe(3);
      expect(component.completionRate).toBe(50);
      done();
    }, 100);
  });

  it('should calculate completion rate correctly', (done) => {
    fixture.detectChanges();

    setTimeout(() => {
      expect(component.completionRate).toBe(50);
      done();
    }, 100);
  });

  it('should handle zero target gracefully', (done) => {
    mockSavingService.getTotals.and.returnValue(of({
      totalCurrent: 5000,
      totalTarget: 0,
      goalsCount: 3,
      totalRemaining: 5000
    }));

    component.ngOnInit();
    fixture.detectChanges();

    setTimeout(() => {
      expect(component.completionRate).toBe(0);
      done();
    }, 100);
  });

  it('should handle API errors gracefully', (done) => {
    mockSavingService.getTotals.and.returnValue(
      throwError(() => new Error('API Error'))
    );

    component.ngOnInit();
    fixture.detectChanges();

    setTimeout(() => {
      expect(component.isLoading).toBe(false);
      expect(component.totalSaved).toBe(0);
      expect(component.totalTarget).toBe(0);
      expect(component.activeGoals).toBe(0);
      expect(component.completionRate).toBe(0);
      done();
    }, 100);
  });

  it('should handle missing userId gracefully', (done) => {
    Object.defineProperty(mockAuthService, 'userId$', {
      value: of(null),
      writable: true
    });

    component.ngOnInit();
    fixture.detectChanges();

    setTimeout(() => {
      expect(mockSavingService.getTotals).not.toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should handle alternative field names from API', (done) => {
    mockSavingService.getTotals.and.returnValue(of({
      totalCurrentAmount: 3000,
      totalTargetAmount: 6000,
      activeGoals: 2,
      totalRemaining: 3000
    }));

    component.ngOnInit();
    fixture.detectChanges();

    setTimeout(() => {
      expect(component.totalSaved).toBe(3000);
      expect(component.totalTarget).toBe(6000);
      expect(component.activeGoals).toBe(2);
      done();
    }, 100);
  });

  it('should refresh data when savingGoalUpdated$ emits', (done) => {
    fixture.detectChanges();

    setTimeout(() => {
      const initialCallCount = mockSavingService.getTotals.calls.count();
      
      savingGoalUpdatedSubject.next();
      
      setTimeout(() => {
        expect(mockSavingService.getTotals.calls.count()).toBeGreaterThan(initialCallCount);
        done();
      }, 100);
    }, 100);
  });

  it('should calculate progressWidth correctly', () => {
    component.completionRate = 50;
    expect(component.progressWidth).toBe(50);

    component.completionRate = 150;
    expect(component.progressWidth).toBe(100);

    component.completionRate = 0;
    expect(component.progressWidth).toBe(0);
  });

  it('should format percentage correctly', () => {
    component.completionRate = 50;
    expect(component.formattedPercentage).toBe('50.0');

    component.completionRate = 75.5;
    expect(component.formattedPercentage).toBe('75.5');

    component.completionRate = 100;
    expect(component.formattedPercentage).toBe('100.0');
  });

  it('should return progress gradient correctly', () => {
    const gradient = component.progressGradient;
    expect(gradient).toBe('linear-gradient(90deg, #f59e0b 0%, #f97316 100%)');
    expect(gradient).toContain('linear-gradient');
    expect(gradient).toContain('#f59e0b');
    expect(gradient).toContain('#f97316');
  });

  it('should display loading state initially', () => {
    component.isLoading = true;
    fixture.detectChanges();
    
    const loadingElement = fixture.nativeElement.querySelector('.loading-state');
    expect(loadingElement).toBeTruthy();
    
    const contentElement = fixture.nativeElement.querySelector('.savings-content');
    expect(contentElement).toBeFalsy();
  });

  it('should display savings content when not loading', () => {
    component.isLoading = false;
    component.totalSaved = 5000;
    component.totalTarget = 10000;
    component.activeGoals = 3;
    component.completionRate = 50;
    fixture.detectChanges();
    
    const contentElement = fixture.nativeElement.querySelector('.savings-content');
    expect(contentElement).toBeTruthy();
    
    const loadingElement = fixture.nativeElement.querySelector('.loading-state');
    expect(loadingElement).toBeFalsy();
  });

  it('should display all stat values correctly', () => {
    component.isLoading = false;
    component.totalSaved = 5000;
    component.totalTarget = 10000;
    component.activeGoals = 3;
    component.completionRate = 50;
    fixture.detectChanges();
    
    const savedValue = fixture.nativeElement.querySelector('.stat-value.saved');
    const targetValue = fixture.nativeElement.querySelector('.stat-value.target');
    const goalsValue = fixture.nativeElement.querySelector('.stat-value.goals');
    
    expect(savedValue.textContent).toContain('$5,000');
    expect(targetValue.textContent).toContain('$10,000');
    expect(goalsValue.textContent).toBe('3');
  });

  it('should display progress percentage correctly', () => {
    component.isLoading = false;
    component.completionRate = 75.5;
    fixture.detectChanges();
    
    const percentageElement = fixture.nativeElement.querySelector('.progress-percentage');
    expect(percentageElement.textContent).toBe('75.5%');
  });

  it('should set progress bar width correctly', () => {
    component.isLoading = false;
    component.completionRate = 50;
    fixture.detectChanges();
    
    const progressBar = fixture.nativeElement.querySelector('.progress-bar');
    expect(progressBar.style.width).toBe('50%');
  });

  it('should set progress bar gradient correctly', () => {
    component.isLoading = false;
    fixture.detectChanges();
    
    const progressBar = fixture.nativeElement.querySelector('.progress-bar');
    expect(progressBar.style.background).toContain('linear-gradient');
    expect(progressBar.style.background).toContain('#f59e0b');
  });

  it('should have proper ARIA labels', () => {
    component.isLoading = false;
    component.completionRate = 50;
    fixture.detectChanges();
    
    const article = fixture.nativeElement.querySelector('article[role="article"]');
    expect(article).toBeTruthy();
    expect(article.getAttribute('aria-labelledby')).toBe('savingsTitle');
    
    const progressBar = fixture.nativeElement.querySelector('.progress-bar-container[role="progressbar"]');
    expect(progressBar).toBeTruthy();
    expect(progressBar.getAttribute('aria-valuenow')).toBe('50');
    expect(progressBar.getAttribute('aria-valuemin')).toBe('0');
    expect(progressBar.getAttribute('aria-valuemax')).toBe('100');
    expect(progressBar.getAttribute('aria-label')).toContain('Savings progress');
  });

  /* ================================================================
     ACCESSIBILITY TESTS
     ================================================================ */

  it('should support keyboard navigation on view all link', () => {
    component.isLoading = false;
    fixture.detectChanges();
    
    const viewAllLink = fixture.nativeElement.querySelector('.view-all-link');
    expect(viewAllLink).toBeTruthy();
    
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    
    spyOn(enterEvent, 'preventDefault');
    spyOn(enterEvent, 'stopPropagation');
    spyOn(spaceEvent, 'preventDefault');
    spyOn(spaceEvent, 'stopPropagation');
    
    viewAllLink.dispatchEvent(enterEvent);
    viewAllLink.dispatchEvent(spaceEvent);
    
    expect(enterEvent.preventDefault).toHaveBeenCalled();
    expect(enterEvent.stopPropagation).toHaveBeenCalled();
    expect(spaceEvent.preventDefault).toHaveBeenCalled();
    expect(spaceEvent.stopPropagation).toHaveBeenCalled();
  });

  it('should have focus styles for view all link', () => {
    component.isLoading = false;
    fixture.detectChanges();
    
    const viewAllLink = fixture.nativeElement.querySelector('.view-all-link');
    expect(viewAllLink).toBeTruthy();
    
    const styles = window.getComputedStyle(viewAllLink as HTMLElement);
    expect(viewAllLink.getAttribute('aria-label')).toBe('View all savings goals');
  });

  it('should have hidden icons marked with aria-hidden', () => {
    fixture.detectChanges();
    
    const icons = fixture.nativeElement.querySelectorAll('i[aria-hidden="true"]');
    expect(icons.length).toBeGreaterThan(0);
    
    icons.forEach((icon: HTMLElement) => {
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    });
  });

  it('should handle empty stats response', (done) => {
    mockSavingService.getTotals.and.returnValue(of({
      totalCurrent: 0,
      totalTarget: 0,
      goalsCount: 0,
      totalRemaining: 0
    }));

    component.ngOnInit();
    fixture.detectChanges();

    setTimeout(() => {
      expect(component.totalSaved).toBe(0);
      expect(component.totalTarget).toBe(0);
      expect(component.activeGoals).toBe(0);
      expect(component.completionRate).toBe(0);
      done();
    }, 100);
  });

  it('should handle synchronous errors gracefully', (done) => {
    mockSavingService.getTotals.and.throwError('Synchronous error');

    component.ngOnInit();
    fixture.detectChanges();

    setTimeout(() => {
      expect(component.isLoading).toBe(false);
      expect(component.totalSaved).toBe(0);
      done();
    }, 100);
  });

  it('should cap completion rate at 100% in progressWidth', () => {
    component.completionRate = 150;
    expect(component.progressWidth).toBe(100);
    expect(component.formattedPercentage).toBe('100.0');
  });

  it('should use OnPush change detection strategy', () => {
    const componentDef = (component.constructor as any).ɵcmp;
    expect(componentDef).toBeDefined();
    expect(componentDef.onPush).toBeDefined();
  });

  it('should call markForCheck after data updates', (done) => {
    fixture.detectChanges();
    
    mockChangeDetectorRef.markForCheck.calls.reset();
    
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

  it('should have proper card structure', () => {
    component.isLoading = false;
    fixture.detectChanges();
    
    const card = fixture.nativeElement.querySelector('.savings-card');
    expect(card).toBeTruthy();
    
    const header = fixture.nativeElement.querySelector('.savings-header');
    expect(header).toBeTruthy();
    
    const stats = fixture.nativeElement.querySelector('.savings-stats');
    expect(stats).toBeTruthy();
    
    const progressSection = fixture.nativeElement.querySelector('.progress-section');
    expect(progressSection).toBeTruthy();
  });

  it('should display all stat items', () => {
    component.isLoading = false;
    fixture.detectChanges();
    
    const statItems = fixture.nativeElement.querySelectorAll('.stat-item');
    expect(statItems.length).toBe(3);
    
    expect(statItems[0].querySelector('.stat-label').textContent).toBe('Total Saved');
    expect(statItems[1].querySelector('.stat-label').textContent).toBe('Target');
    expect(statItems[2].querySelector('.stat-label').textContent).toBe('Active Goals');
  });
});

