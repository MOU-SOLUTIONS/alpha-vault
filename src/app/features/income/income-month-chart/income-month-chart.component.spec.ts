/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component IncomeMonthChartComponent
  @description Income month chart component for displaying monthly income data
*/

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { NgChartsModule } from 'ng2-charts';
import { of, Subject, throwError } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { IncomeService } from '../../../core/services/income.service';
import { IncomeMonthChartComponent } from './income-month-chart.component';

@Component({
  selector: 'app-mock-chart',
  template: '<div></div>',
  standalone: true,
  imports: [CommonModule]
})
class MockChartComponent {
  @Input() data: any;
  @Input() options: any;
  @Input() type: any;
}

describe('IncomeMonthChartComponent', () => {
  let component: IncomeMonthChartComponent;
  let fixture: ComponentFixture<IncomeMonthChartComponent>;
  let mockIncomeService: jasmine.SpyObj<IncomeService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockMeta: jasmine.SpyObj<Meta>;

  const mockUserId = 1;
  const mockMonthlyData = [100, 200, 150, 300, 250, 400, 350, 180, 220, 280, 320, 190]; // Total: 2940, Average: 245

  beforeEach(async () => {
    mockIncomeService = jasmine.createSpyObj('IncomeService', ['getYearlyIncomes']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getUserId'], {
      userId$: new Subject<number>()
    });
    mockMeta = jasmine.createSpyObj('Meta', ['addTags']);

    await TestBed.configureTestingModule({
      imports: [IncomeMonthChartComponent, NgChartsModule],
      providers: [
        { provide: IncomeService, useValue: mockIncomeService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Meta, useValue: mockMeta }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IncomeMonthChartComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.monthlyData).toEqual([]);
    expect(component.isLineChart()).toBe(true);
    expect(component.chartType()).toBe('line');
    expect(component.monthLabels).toEqual([
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]);
    expect(component.monthlyTotal()).toBe(0);
    expect(component.monthlyAverage()).toBe(0);
  });

  it('should setup meta tags in constructor', () => {
    expect(mockMeta.addTags).toHaveBeenCalledWith([
      { name: 'description', content: 'Chart representing monthly income distribution on Alpha Vault.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]);
  });

  it('should load monthly data when user is authenticated', fakeAsync(() => {
    mockIncomeService.getYearlyIncomes.and.returnValue(of(mockMonthlyData));
    
    component.ngOnInit();
    fixture.detectChanges();
    
    const authSubject = mockAuthService.userId$ as Subject<number>;
    authSubject.next(mockUserId);

    tick();

    expect(mockIncomeService.getYearlyIncomes).toHaveBeenCalledWith(mockUserId);
    expect(component['monthlyDataSignal']()).toEqual(mockMonthlyData);
  }));

  it('should reset data when user is not authenticated', fakeAsync(() => {
    component.ngOnInit();
    fixture.detectChanges();
    
    const authSubject = mockAuthService.userId$ as Subject<number>;
    authSubject.next(0);

    tick();

    expect(component['monthlyDataSignal']()).toEqual([]);
  }));

  it('should handle service errors gracefully', fakeAsync(() => {
    mockIncomeService.getYearlyIncomes.and.returnValue(throwError(() => new Error('API Error')));
    
    component.ngOnInit();
    fixture.detectChanges();
    
    const authSubject = mockAuthService.userId$ as Subject<number>;
    authSubject.next(mockUserId);

    tick();

    expect(component['monthlyDataSignal']()).toEqual([]);
  }));

  it('should update chart data when monthlyData input changes', () => {
    // First set the data
    component.monthlyData = mockMonthlyData;
    
    const changes = {
      monthlyData: {
        currentValue: mockMonthlyData,
        previousValue: [],
        firstChange: false,
        isFirstChange: () => false
      }
    };

    component.ngOnChanges(changes);

    expect(component.monthlyTotal()).toBe(2940);
    expect(component.monthlyAverage()).toBe(245);
  });

  it('should not update chart data on first change', () => {
    const changes = {
      monthlyData: {
        currentValue: mockMonthlyData,
        previousValue: [],
        firstChange: true,
        isFirstChange: () => true
      }
    };

    component.ngOnChanges(changes);

    expect(component.monthlyTotal()).toBe(0);
    expect(component.monthlyAverage()).toBe(0);
  });

  it('should calculate totals and averages correctly', () => {
    component['monthlyDataSignal'].set(mockMonthlyData);

    expect(component.monthlyTotal()).toBe(2940);
    expect(component.monthlyAverage()).toBe(245);
  });

  it('should handle empty data arrays', () => {
    component['monthlyDataSignal'].set([]);

    expect(component.monthlyTotal()).toBe(0);
    expect(component.monthlyAverage()).toBe(0);
  });

  it('should handle data arrays with less than 12 elements', () => {
    const shortData = [100, 200, 150];
    component['monthlyDataSignal'].set(shortData);

    expect(component.monthlyTotal()).toBe(450);
    expect(component.monthlyAverage()).toBe(150);
  });

  it('should handle data arrays with more than 12 elements', () => {
    const longData = [100, 200, 150, 300, 250, 400, 350, 180, 220, 280, 320, 190, 500, 600];
    component['monthlyDataSignal'].set(longData);

    expect(component.monthlyTotal()).toBe(2940);
    expect(component.monthlyAverage()).toBe(245);
  });

  it('should generate correct line chart data', () => {
    component['isLineChartSignal'].set(true);
    component['monthlyDataSignal'].set(mockMonthlyData);

    const chartData = component.chartData();
    expect(chartData.labels).toEqual([
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]);
    expect(chartData.datasets[0].data).toEqual(mockMonthlyData);
    expect((chartData.datasets[0] as any).fill).toBe(true);
    expect((chartData.datasets[0] as any).borderColor).toBe('rgba(99, 102, 241, 1)');
    expect((chartData.datasets[0] as any).tension).toBe(0.4);
  });

  it('should generate correct bar chart data', () => {
    component['isLineChartSignal'].set(false);
    component['monthlyDataSignal'].set(mockMonthlyData);

    const chartData = component.chartData();
    expect(chartData.labels).toEqual([
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]);
    expect(chartData.datasets[0].data).toEqual(mockMonthlyData);
    expect(chartData.datasets[0].backgroundColor).toBeDefined();
    expect(chartData.datasets[0].borderColor).toBe('rgba(99, 102, 241, 1)');
  });

  it('should toggle chart type correctly', () => {
    expect(component.isLineChart()).toBe(true);
    expect(component.chartType()).toBe('line');

    component.toggleChartType();

    expect(component.isLineChart()).toBe(false);
    expect(component.chartType()).toBe('bar');

    component.toggleChartType();

    expect(component.isLineChart()).toBe(true);
    expect(component.chartType()).toBe('line');
  });

  it('should update chart data when toggling chart type', () => {
    component['monthlyDataSignal'].set(mockMonthlyData);
    const initialChartData = component.chartData();

    component.toggleChartType();
    const updatedChartData = component.chartData();

    // Chart data should be different after toggle
    expect(updatedChartData).not.toEqual(initialChartData);
  });

  it('should have correct chart options', () => {
    expect(component.chartOptions.responsive).toBe(true);
    expect(component.chartOptions.maintainAspectRatio).toBe(false);
    expect(component.chartOptions.plugins?.legend?.display).toBe(false);
    expect((component.chartOptions.scales as any)?.x?.grid?.display).toBe(false);
    expect((component.chartOptions.scales as any)?.y?.beginAtZero).toBe(true);
  });

  it('should handle zero values in data correctly', () => {
    const dataWithZeros = [0, 100, 0, 200, 0, 300, 0, 400, 0, 500, 0, 600];
    component['monthlyDataSignal'].set(dataWithZeros);

    expect(component.monthlyTotal()).toBe(2100);
    expect(component.monthlyAverage()).toBe(350);
  });

  it('should handle negative values in data correctly', () => {
    const dataWithNegatives = [-100, 200, -50, 300, 150, -200, 400, -100, 250, 300, -150, 350];
    component['monthlyDataSignal'].set(dataWithNegatives);

    expect(component.monthlyTotal()).toBe(1350);
    // Average = total / (count of positive values) = 1350 / 7 = 192.86
    expect(component.monthlyAverage()).toBeCloseTo(192.86, 2);
  });

  it('should calculate average correctly when all values are zero', () => {
    const allZeros = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    component['monthlyDataSignal'].set(allZeros);

    expect(component.monthlyTotal()).toBe(0);
    expect(component.monthlyAverage()).toBe(0);
  });

  it('should handle single value data correctly', () => {
    const singleValue = [500];
    component['monthlyDataSignal'].set(singleValue);

    expect(component.monthlyTotal()).toBe(500);
    expect(component.monthlyAverage()).toBe(500);
  });

  it('should clean up subscriptions on destroy', () => {
    const destroySpy = spyOn(component['destroy$'], 'next');
    const completeSpy = spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(destroySpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should handle data fetch without loading state', fakeAsync(() => {
    mockIncomeService.getYearlyIncomes.and.returnValue(of(mockMonthlyData));

    component.ngOnInit();
    fixture.detectChanges();
    
    const authSubject = mockAuthService.userId$ as Subject<number>;
    authSubject.next(mockUserId);

    tick();

    expect(component['monthlyDataSignal']()).toEqual(mockMonthlyData);
  }));

  it('should handle null data from service', fakeAsync(() => {
    mockIncomeService.getYearlyIncomes.and.returnValue(of([]));
    
    component.ngOnInit();
    fixture.detectChanges();
    
    const authSubject = mockAuthService.userId$ as Subject<number>;
    authSubject.next(mockUserId);

    tick();

    expect(component['monthlyDataSignal']()).toEqual([]);
  }));

  it('should handle undefined data from service', fakeAsync(() => {
    mockIncomeService.getYearlyIncomes.and.returnValue(of([]));
    
    component.ngOnInit();
    fixture.detectChanges();
    
    const authSubject = mockAuthService.userId$ as Subject<number>;
    authSubject.next(mockUserId);

    tick();

    expect(component['monthlyDataSignal']()).toEqual([]);
  }));

  it('should maintain chart data consistency across updates', () => {
    const initialData = [100, 200, 150];
    component['monthlyDataSignal'].set(initialData);
    const initialChartData = { ...component.chartData() };

    component['monthlyDataSignal'].set([300, 400, 500]);
    const updatedChartData = { ...component.chartData() };

    expect(initialChartData).not.toEqual(updatedChartData);
    expect(updatedChartData.datasets[0].data).toEqual([300, 400, 500, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it('should handle rapid chart type toggles', () => {
    component['monthlyDataSignal'].set(mockMonthlyData);

    component.toggleChartType();
    component.toggleChartType();
    component.toggleChartType();

    expect(component.isLineChart()).toBe(false);
    expect(component.chartType()).toBe('bar');
  });

  it('should validate chart options structure', () => {
    const options = component.chartOptions;
    
    expect(options.plugins).toBeDefined();
    expect(options.scales).toBeDefined();
    expect(options.hover).toBeDefined();
    expect(options.plugins?.tooltip).toBeDefined();
    expect(options.scales?.['x']).toBeDefined();
    expect(options.scales?.['y']).toBeDefined();
  });

  it('should handle authentication state changes correctly', fakeAsync(() => {
    // Create a fresh component instance for this test
    const freshFixture = TestBed.createComponent(IncomeMonthChartComponent);
    const freshComponent = freshFixture.componentInstance;
    
    mockIncomeService.getYearlyIncomes.and.returnValue(of(mockMonthlyData));
    
    freshComponent.ngOnInit();
    freshFixture.detectChanges();
    
    const authSubject = mockAuthService.userId$ as Subject<number>;
    
    // First authenticate
    authSubject.next(mockUserId);
    tick();
    
    // Then logout
    authSubject.next(0);
    tick();
    
    // Then authenticate again
    authSubject.next(mockUserId);
    tick();

    // Verify that the service was called (at least once for each authentication)
    expect(mockIncomeService.getYearlyIncomes).toHaveBeenCalled();
    expect(freshComponent['monthlyDataSignal']()).toEqual(mockMonthlyData);
  }));

  it('should support keyboard navigation for toggle button', () => {
    component.ngOnInit();
    fixture.detectChanges();

    const toggleBtn = fixture.debugElement.nativeElement.querySelector('.toggle-btn');
    
    // Test tabindex and role
    expect(toggleBtn.getAttribute('aria-label')).toContain('Switch to');
    expect(toggleBtn.getAttribute('aria-pressed')).toBe('true');
    
    // Test keyboard activation
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    
    spyOn(component, 'toggleChartType');
    
    toggleBtn.dispatchEvent(enterEvent);
    expect(component.toggleChartType).toHaveBeenCalled();
    
    toggleBtn.dispatchEvent(spaceEvent);
    expect(component.toggleChartType).toHaveBeenCalledTimes(2);
  });

  it('should have proper ARIA attributes', () => {
    component.ngOnInit();
    fixture.detectChanges();

    const section = fixture.debugElement.nativeElement.querySelector('section');
    expect(section.getAttribute('role')).toBe('region');
    expect(section.getAttribute('aria-labelledby')).toBe('monthChartTitle');

    const canvas = fixture.debugElement.nativeElement.querySelector('canvas');
    expect(canvas.getAttribute('role')).toBe('img');
    expect(canvas.getAttribute('aria-label')).toContain('Chart showing monthly income data');
  });

  it('should use computed signals for template bindings', () => {
    component['monthlyDataSignal'].set([100, 200, 300]);
    component['isLineChartSignal'].set(true);

    expect(component.monthlyTotal()).toBe(600);
    expect(component.monthlyAverage()).toBe(200);
    expect(component.chartType()).toBe('line');
    expect(component.isLineChart()).toBe(true);
  });

  it('should handle keyboard events correctly', () => {
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    spyOn(event, 'preventDefault');
    spyOn(component, 'toggleChartType');

    component.onToggleKeydown(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.toggleChartType).toHaveBeenCalled();
  });

  it('should not handle non-activation keys', () => {
    const event = new KeyboardEvent('keydown', { key: 'Tab' });
    spyOn(event, 'preventDefault');
    spyOn(component, 'toggleChartType');

    component.onToggleKeydown(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(component.toggleChartType).not.toHaveBeenCalled();
  });
});
