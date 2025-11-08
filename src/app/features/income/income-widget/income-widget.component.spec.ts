/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component IncomeWidgetComponent
  @description Income widget component for displaying income statistics across different time periods
*/


import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { of, Subject } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { IncomeService } from '../../../core/services/income.service';
import { IncomeWidgetComponent } from './income-widget.component';



describe('IncomeWidgetComponent', () => {
  let component: IncomeWidgetComponent;
  let fixture: ComponentFixture<IncomeWidgetComponent>;
  let mockIncomeService: any;
  let mockAuthService: any;
  let mockMeta: any;

  const mockUserId = 1;

  beforeEach(async () => {
    mockIncomeService = {
      getTodayIncome: jasmine.createSpy('getTodayIncome'),
      getCurrentWeekIncome: jasmine.createSpy('getCurrentWeekIncome'),
      getCurrentMonthIncome: jasmine.createSpy('getCurrentMonthIncome'),
      getCurrentYearIncome: jasmine.createSpy('getCurrentYearIncome')
    };

    mockAuthService = {
      getUserId: jasmine.createSpy('getUserId'),
      userId$: new Subject<number>()
    };

    mockMeta = {
      addTag: jasmine.createSpy('addTag')
    };

     
    await TestBed.configureTestingModule({
      imports: [IncomeWidgetComponent],
      providers: [
        { provide: IncomeService, useValue: mockIncomeService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Meta, useValue: mockMeta }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IncomeWidgetComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.dayIncome).toBe(0);
    expect(component.weekIncome).toBe(0);
    expect(component.monthIncome).toBe(0);
    expect(component.yearIncome).toBe(0);
    expect(component.currency).toBe('USD');
    expect(component.seoDescription).toBeUndefined();
  });

  it('should have correct cards configuration', () => {
    expect(component.cards).toHaveSize(4);
    expect(component.cards[0]).toEqual({ label: 'Today', icon: 'fa-calendar-day', key: 'dayIncome', class: 'today' });
    expect(component.cards[1]).toEqual({ label: 'This Week', icon: 'fa-calendar-week', key: 'weekIncome', class: 'week' });
    expect(component.cards[2]).toEqual({ label: 'This Month', icon: 'fa-calendar-alt', key: 'monthIncome', class: 'month' });
    expect(component.cards[3]).toEqual({ label: 'This Year', icon: 'fa-calendar', key: 'yearIncome', class: 'year' });
  });

  it('should load income data when user is authenticated', fakeAsync(() => {
    mockAuthService.getUserId.and.returnValue(mockUserId);
    mockIncomeService.getTodayIncome.and.returnValue(of(100));
    mockIncomeService.getCurrentWeekIncome.and.returnValue(of(500));
    mockIncomeService.getCurrentMonthIncome.and.returnValue(of(2000));
    mockIncomeService.getCurrentYearIncome.and.returnValue(of(25000));

    // Trigger ngOnInit
    component.ngOnInit();
    
    const authSubject = mockAuthService.userId$ as Subject<number>;
    authSubject.next(mockUserId);

    tick();
    fixture.detectChanges();

    expect(mockIncomeService.getTodayIncome).toHaveBeenCalledWith(mockUserId);
    expect(mockIncomeService.getCurrentWeekIncome).toHaveBeenCalledWith(mockUserId);
    expect(mockIncomeService.getCurrentMonthIncome).toHaveBeenCalledWith(mockUserId);
    expect(mockIncomeService.getCurrentYearIncome).toHaveBeenCalledWith(mockUserId);
  }));

  it('should reset income values when user is not authenticated', fakeAsync(() => {
    component.ngOnInit();
    
    const authSubject = mockAuthService.userId$ as Subject<number>;
    authSubject.next(0);

    tick();
    fixture.detectChanges();

    expect(component.dayIncome).toBe(0);
    expect(component.weekIncome).toBe(0);
    expect(component.monthIncome).toBe(0);
    expect(component.yearIncome).toBe(0);
  }));

  it('should handle income service errors gracefully', fakeAsync(() => {
    mockAuthService.getUserId.and.returnValue(mockUserId);
    mockIncomeService.getTodayIncome.and.returnValue(of(100));
    mockIncomeService.getCurrentWeekIncome.and.returnValue(of(500));
    mockIncomeService.getCurrentMonthIncome.and.returnValue(of(2000));
    mockIncomeService.getCurrentYearIncome.and.returnValue(of(25000));

    component.ngOnInit();
    
    const authSubject = mockAuthService.userId$ as Subject<number>;
    authSubject.next(mockUserId);

    tick();
    fixture.detectChanges();

    expect(component.dayIncome).toBe(100);
    expect(component.weekIncome).toBe(500);
    expect(component.monthIncome).toBe(2000);
    expect(component.yearIncome).toBe(25000);
  }));



  it('should start auto-refresh when user is authenticated', fakeAsync(() => {
    mockAuthService.getUserId.and.returnValue(mockUserId);
    mockIncomeService.getTodayIncome.and.returnValue(of(100));
    mockIncomeService.getCurrentWeekIncome.and.returnValue(of(500));
    mockIncomeService.getCurrentMonthIncome.and.returnValue(of(2000));
    mockIncomeService.getCurrentYearIncome.and.returnValue(of(25000));

    component.ngOnInit();
    
    const authSubject = mockAuthService.userId$ as Subject<number>;
    authSubject.next(mockUserId);

    tick();
    fixture.detectChanges();

    // Verify initial calls were made
    expect(mockIncomeService.getTodayIncome).toHaveBeenCalledWith(mockUserId);
    expect(mockIncomeService.getCurrentWeekIncome).toHaveBeenCalledWith(mockUserId);
    expect(mockIncomeService.getCurrentMonthIncome).toHaveBeenCalledWith(mockUserId);
    expect(mockIncomeService.getCurrentYearIncome).toHaveBeenCalledWith(mockUserId);
  }));

  it('should return correct income values for getIncomeValue method', () => {
    component.dayIncome = 100;
    component.weekIncome = 500;
    component.monthIncome = 2000;
    component.yearIncome = 25000;

    expect(component.getIncomeValue('dayIncome')).toBe(100);
    expect(component.getIncomeValue('weekIncome')).toBe(500);
    expect(component.getIncomeValue('monthIncome')).toBe(2000);
    expect(component.getIncomeValue('yearIncome')).toBe(25000);
    expect(component.getIncomeValue('invalid')).toBe(0);
  });

  it('should track items correctly with trackByKey method', () => {
    const mockItem = { key: 'dayIncome', label: 'Today', icon: 'fa-calendar-day', class: 'today' };
    const result = component.trackByKey(0, mockItem);
    expect(result).toBe('dayIncome');
  });

  it('should refresh data manually when refreshData is called', fakeAsync(() => {
    mockAuthService.getUserId.and.returnValue(mockUserId);
    mockIncomeService.getTodayIncome.and.returnValue(of(100));
    mockIncomeService.getCurrentWeekIncome.and.returnValue(of(500));
    mockIncomeService.getCurrentMonthIncome.and.returnValue(of(2000));
    mockIncomeService.getCurrentYearIncome.and.returnValue(of(25000));

    // Trigger ngOnInit to load data
    component.ngOnInit();
    tick();

    expect(mockIncomeService.getTodayIncome).toHaveBeenCalledWith(mockUserId);
    expect(mockIncomeService.getCurrentWeekIncome).toHaveBeenCalledWith(mockUserId);
    expect(mockIncomeService.getCurrentMonthIncome).toHaveBeenCalledWith(mockUserId);
    expect(mockIncomeService.getCurrentYearIncome).toHaveBeenCalledWith(mockUserId);
  }));

  it('should setup meta tags when seoDescription is provided', () => {
    component.seoDescription = 'Test description';
    component['setupMetaTags']();

    expect(mockMeta.addTag).toHaveBeenCalledWith({
      name: 'description',
      content: 'Test description'
    });
  });

  it('should not setup meta tags when seoDescription is not provided', () => {
    component.seoDescription = undefined;
    component['setupMetaTags']();

    expect(mockMeta.addTag).not.toHaveBeenCalled();
  });

  it('should support keyboard navigation', () => {
    component.ngOnInit();
    fixture.detectChanges();

    const incomeBoxes = fixture.debugElement.nativeElement.querySelectorAll('.income-box');
    const firstBox = incomeBoxes[0];
    
    // Test tabindex
    expect(firstBox.getAttribute('tabindex')).toBe('0');
    expect(firstBox.getAttribute('role')).toBe('button');
    
    // Test keyboard activation
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    
    spyOn(component, 'onCardClick');
    
    firstBox.dispatchEvent(enterEvent);
    expect(component.onCardClick).toHaveBeenCalledWith(component.cards[0]);
    
    firstBox.dispatchEvent(spaceEvent);
    expect(component.onCardClick).toHaveBeenCalledWith(component.cards[0]);
  });

  it('should have proper ARIA attributes', () => {
    component.ngOnInit();
    fixture.detectChanges();

    const section = fixture.debugElement.nativeElement.querySelector('section');
    expect(section.getAttribute('role')).toBe('region');
    expect(section.getAttribute('aria-label')).toBe('Income statistics dashboard');

    const incomeBoxes = fixture.debugElement.nativeElement.querySelectorAll('.income-box');
    incomeBoxes.forEach((box: any, index: number) => {
      expect(box.getAttribute('role')).toBe('button');
      expect(box.getAttribute('tabindex')).toBe('0');
      expect(box.getAttribute('aria-labelledby')).toBe(component.cards[index].key + 'Label');
    });
  });

  it('should handle card click events', () => {
    component.ngOnInit();
    fixture.detectChanges();

    spyOn(component, 'onCardClick');
    
    const firstBox = fixture.debugElement.nativeElement.querySelector('.income-box');
    firstBox.click();
    
    expect(component.onCardClick).toHaveBeenCalledWith(component.cards[0]);
  });

  it('should use computed signals for income values', () => {
    component.dayIncome = 100;
    component.weekIncome = 500;
    component.monthIncome = 2000;
    component.yearIncome = 25000;

    expect(component.getIncomeValue('dayIncome')).toBe(100);
    expect(component.getIncomeValue('weekIncome')).toBe(500);
    expect(component.getIncomeValue('monthIncome')).toBe(2000);
    expect(component.getIncomeValue('yearIncome')).toBe(25000);
    expect(component.getIncomeValue('invalid')).toBe(0);
  });

  it('should handle null income values correctly', fakeAsync(() => {
    mockAuthService.getUserId.and.returnValue(mockUserId);
    mockIncomeService.getTodayIncome.and.returnValue(of(0));
    mockIncomeService.getCurrentWeekIncome.and.returnValue(of(0));
    mockIncomeService.getCurrentMonthIncome.and.returnValue(of(0));
    mockIncomeService.getCurrentYearIncome.and.returnValue(of(0));

    const authSubject = mockAuthService.userId$ as Subject<number>;
    authSubject.next(mockUserId);

    tick();

    expect(component.dayIncome).toBe(0);
    expect(component.weekIncome).toBe(0);
    expect(component.monthIncome).toBe(0);
    expect(component.yearIncome).toBe(0);
  }));

  it('should handle undefined income values correctly', fakeAsync(() => {
    mockAuthService.getUserId.and.returnValue(mockUserId);
    mockIncomeService.getTodayIncome.and.returnValue(of(0));
    mockIncomeService.getCurrentWeekIncome.and.returnValue(of(0));
    mockIncomeService.getCurrentMonthIncome.and.returnValue(of(0));
    mockIncomeService.getCurrentYearIncome.and.returnValue(of(0));

    const authSubject = mockAuthService.userId$ as Subject<number>;
    authSubject.next(mockUserId);

    tick();

    expect(component.dayIncome).toBe(0);
    expect(component.weekIncome).toBe(0);
    expect(component.monthIncome).toBe(0);
    expect(component.yearIncome).toBe(0);
  }));
});
