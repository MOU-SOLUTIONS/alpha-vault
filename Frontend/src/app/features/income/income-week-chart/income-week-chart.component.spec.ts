/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component IncomeWeekChartComponent
  @description Income week chart component for displaying income data
*/

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { NgChartsModule } from 'ng2-charts';
import { of, Subject, throwError } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { IncomeService } from '../../../core/services/income.service';
import { IncomeWeekChartComponent } from './income-week-chart.component';

@Component({
  selector: 'app-mock-chart',
  template: '<div></div>',
  standalone: true,
  imports: [CommonModule]
})
class MockChartComponent {  @Input() data: any;
  @Input() options: any;
  @Input() type: any;
}

describe('IncomeWeekChartComponent', () => {
  let component: IncomeWeekChartComponent;
  let fixture: ComponentFixture<IncomeWeekChartComponent>;
  let mockIncomeService: jasmine.SpyObj<IncomeService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockMeta: jasmine.SpyObj<Meta>;

  const mockUserId = 1;
  const mockWeeklyData = [100, 200, 150, 300, 250];

  beforeEach(async () => {
    mockIncomeService = jasmine.createSpyObj('IncomeService', ['getWeeklyIncomes']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getUserId'], {
      userId$: new Subject<number>()
    });
    mockMeta = jasmine.createSpyObj('Meta', ['addTags']);

    await TestBed.configureTestingModule({
      imports: [IncomeWeekChartComponent, NgChartsModule],
      providers: [
        { provide: IncomeService, useValue: mockIncomeService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Meta, useValue: mockMeta }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IncomeWeekChartComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.weeklyData).toEqual([]);
    expect(component.isLineChart()).toBe(false);
    expect(component.chartType()).toBe('bar');
    expect(component.weekLabels).toEqual(['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5']);
    expect(component.weeklyTotal()).toBe(0);
    expect(component.weeklyAverage()).toBe(0);
  });

  it('should setup meta tags in constructor', () => {
    expect(mockMeta.addTags).toHaveBeenCalledWith([
      { name: 'description', content: 'Chart representing weekly income distribution on Alpha Vault.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]);
  });

  it('should load weekly data when user is authenticated', fakeAsync(() => {
    mockIncomeService.getWeeklyIncomes.and.returnValue(of(mockWeeklyData));
    
    component.ngOnInit();
    fixture.detectChanges();
    
    const authSubject = mockAuthService.userId$ as Subject<number>;
    authSubject.next(mockUserId);

    tick();

    expect(mockIncomeService.getWeeklyIncomes).toHaveBeenCalledWith(mockUserId);
    expect(component['weeklyDataSignal']()).toEqual(mockWeeklyData);
  }));

  it('should reset data when user is not authenticated', fakeAsync(() => {
    component.ngOnInit();
    fixture.detectChanges();
    
    const authSubject = mockAuthService.userId$ as Subject<number>;
    authSubject.next(0);

    tick();

    expect(component['weeklyDataSignal']()).toEqual([]);
  }));

  it('should handle service errors gracefully', fakeAsync(() => {
    mockIncomeService.getWeeklyIncomes.and.returnValue(throwError(() => new Error('API Error')));
    
    component.ngOnInit();
    fixture.detectChanges();
    
    const authSubject = mockAuthService.userId$ as Subject<number>;
    authSubject.next(mockUserId);

    tick();

    expect(component['weeklyDataSignal']()).toEqual([]);
  }));

  it('should update chart data when weeklyData input changes', () => {
    component.weeklyData = mockWeeklyData;
    
    const changes = {
      weeklyData: {
        currentValue: mockWeeklyData,
        previousValue: [],
        firstChange: false,
        isFirstChange: () => false
      }
    };

    component.ngOnChanges(changes);

    expect(component.weeklyTotal()).toBe(1000);
    expect(component.weeklyAverage()).toBe(200);
  });

  it('should not update chart data on first change', () => {
    const changes = {
      weeklyData: {
        currentValue: mockWeeklyData,
        previousValue: [],
        firstChange: true,
        isFirstChange: () => true
      }
    };

    component.ngOnChanges(changes);

    expect(component.weeklyTotal()).toBe(0);
    expect(component.weeklyAverage()).toBe(0);
  });

  it('should calculate totals and averages correctly', () => {
    component['weeklyDataSignal'].set(mockWeeklyData);

    expect(component.weeklyTotal()).toBe(1000);
    expect(component.weeklyAverage()).toBe(200);
  });

  it('should handle empty data arrays', () => {
    component['weeklyDataSignal'].set([]);

    expect(component.weeklyTotal()).toBe(0);
    expect(component.weeklyAverage()).toBe(0);
  });

  it('should handle data arrays with less than 5 elements', () => {
    const shortData = [100, 200];
    component['weeklyDataSignal'].set(shortData);

    expect(component.weeklyTotal()).toBe(300);
    expect(component.weeklyAverage()).toBe(150);
  });

  it('should handle data arrays with more than 5 elements', () => {
    const longData = [100, 200, 150, 300, 250, 400, 350];
    component['weeklyDataSignal'].set(longData);

    expect(component.weeklyTotal()).toBe(1000);
    expect(component.weeklyAverage()).toBe(200);
  });

  it('should generate correct bar chart data', () => {
    component['isLineChartSignal'].set(false);
    component['weeklyDataSignal'].set(mockWeeklyData);

    const chartData = component.chartData();
    expect(chartData.labels).toEqual(['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5']);
    expect(chartData.datasets[0].data).toEqual([100, 200, 150, 300, 250]);
    expect(chartData.datasets[0].backgroundColor).toBeDefined();
    expect(chartData.datasets[0].borderColor).toBe('rgba(99, 102, 241, 1)');
  });

  it('should generate correct line chart data', () => {
    component['isLineChartSignal'].set(true);
    component['weeklyDataSignal'].set(mockWeeklyData);

    const chartData = component.chartData();
    expect(chartData.labels).toEqual(['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5']);
    expect(chartData.datasets[0].data).toEqual([100, 200, 150, 300, 250]);
    expect((chartData.datasets[0] as any).fill).toBe(true);
    expect((chartData.datasets[0] as any).borderColor).toBe('rgba(99, 102, 241, 1)');
    expect((chartData.datasets[0] as any).tension).toBe(0.4);
  });

  it('should toggle chart type correctly', () => {
    expect(component.isLineChart()).toBe(false);
    expect(component.chartType()).toBe('bar');

    component.toggleChartType();

    expect(component.isLineChart()).toBe(true);
    expect(component.chartType()).toBe('line');

    component.toggleChartType();

    expect(component.isLineChart()).toBe(false);
    expect(component.chartType()).toBe('bar');
  });

  it('should update chart data when toggling chart type', () => {
    component.weeklyData = mockWeeklyData;
    component['weeklyDataSignal'].set(mockWeeklyData);

    const initialChartData = component.chartData();
    component.toggleChartType();
    const updatedChartData = component.chartData();

    expect(initialChartData).not.toEqual(updatedChartData);
  });

  it('should have correct chart options', () => {
    expect(component.chartOptions.responsive).toBe(true);
    expect(component.chartOptions.maintainAspectRatio).toBe(false);
    expect(component.chartOptions.plugins?.legend?.display).toBe(false);
    expect((component.chartOptions.scales as any)?.x?.grid?.display).toBe(false);
    expect((component.chartOptions.scales as any)?.y?.beginAtZero).toBe(true);
  });

  it('should handle zero values in data correctly', () => {
    const dataWithZeros = [0, 100, 0, 200, 0];
    component['weeklyDataSignal'].set(dataWithZeros);

    expect(component.weeklyTotal()).toBe(300);
    expect(component.weeklyAverage()).toBe(150);
  });

  it('should handle negative values in data correctly', () => {
    const dataWithNegatives = [-100, 200, -50, 300, 150];
    component['weeklyDataSignal'].set(dataWithNegatives);

    expect(component.weeklyTotal()).toBe(500);
    expect(component.weeklyAverage()).toBeCloseTo(166.67, 2);
  });

  it('should calculate average correctly when all values are zero', () => {
    const allZeros = [0, 0, 0, 0, 0];
    component['weeklyDataSignal'].set(allZeros);

    expect(component.weeklyTotal()).toBe(0);
    expect(component.weeklyAverage()).toBe(0);
  });

  it('should handle single value data correctly', () => {
    const singleValue = [500];
    component['weeklyDataSignal'].set(singleValue);

    expect(component.weeklyTotal()).toBe(500);
    expect(component.weeklyAverage()).toBe(500);
  });

  it('should clean up subscriptions on destroy', () => {
    const destroySpy = spyOn(component['destroy$'], 'next');
    const completeSpy = spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(destroySpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should handle data fetch without loading state', fakeAsync(() => {
    mockIncomeService.getWeeklyIncomes.and.returnValue(of(mockWeeklyData));

    component.ngOnInit();
    fixture.detectChanges();
    
    const authSubject = mockAuthService.userId$ as Subject<number>;
    authSubject.next(mockUserId);

    tick();

    expect(component['weeklyDataSignal']()).toEqual(mockWeeklyData);
  }));

  it('should handle null data from service', fakeAsync(() => {
    mockIncomeService.getWeeklyIncomes.and.returnValue(of([]));
    
    component.ngOnInit();
    fixture.detectChanges();
    
    const authSubject = mockAuthService.userId$ as Subject<number>;
    authSubject.next(mockUserId);

    tick();

    expect(component['weeklyDataSignal']()).toEqual([]);
  }));

  it('should handle undefined data from service', fakeAsync(() => {
    mockIncomeService.getWeeklyIncomes.and.returnValue(of([]));
    
    component.ngOnInit();
    fixture.detectChanges();
    
    const authSubject = mockAuthService.userId$ as Subject<number>;
    authSubject.next(mockUserId);

    tick();

    expect(component['weeklyDataSignal']()).toEqual([]);
  }));

  it('should maintain chart data consistency across updates', () => {
    const initialData = [100, 200];
    component['weeklyDataSignal'].set(initialData);
    const initialChartData = { ...component.chartData() };

    component['weeklyDataSignal'].set([300, 400]);
    const updatedChartData = { ...component.chartData() };

    expect(initialChartData).not.toEqual(updatedChartData);
    expect(updatedChartData.datasets[0].data).toEqual([300, 400, 0, 0, 0]);
  });

  it('should handle rapid chart type toggles', () => {
    component.weeklyData = mockWeeklyData;
    component['weeklyDataSignal'].set(mockWeeklyData);

    component.toggleChartType();
    component.toggleChartType();
    component.toggleChartType();

    expect(component.isLineChart()).toBe(true);
    expect(component.chartType()).toBe('line');
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
    const freshFixture = TestBed.createComponent(IncomeWeekChartComponent);
    const freshComponent = freshFixture.componentInstance;
    
    mockIncomeService.getWeeklyIncomes.and.returnValue(of(mockWeeklyData));
    
    freshComponent.ngOnInit();
    freshFixture.detectChanges();
    
    const authSubject = mockAuthService.userId$ as Subject<number>;
    
    authSubject.next(mockUserId);
    tick();
    
    authSubject.next(0);
    tick();
    
    authSubject.next(mockUserId);
    tick();

    expect(mockIncomeService.getWeeklyIncomes).toHaveBeenCalled();
    expect(freshComponent['weeklyDataSignal']()).toEqual(mockWeeklyData);
  }));

  it('should support keyboard navigation for toggle button', () => {
    component.ngOnInit();
    fixture.detectChanges();

    const toggleBtn = fixture.debugElement.nativeElement.querySelector('.toggle-btn');
    
    expect(toggleBtn.getAttribute('aria-label')).toContain('Switch to');
    expect(toggleBtn.getAttribute('aria-pressed')).toBe('false');
    
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
    expect(section.getAttribute('aria-labelledby')).toBe('weekChartTitle');

    const canvas = fixture.debugElement.nativeElement.querySelector('canvas');
    expect(canvas.getAttribute('role')).toBe('img');
    expect(canvas.getAttribute('aria-label')).toContain('Chart showing weekly income data');
  });

  it('should use computed signals for template bindings', () => {
    component['weeklyDataSignal'].set([100, 200, 300]);
    component['isLineChartSignal'].set(true);

    expect(component.weeklyTotal()).toBe(600);
    expect(component.weeklyAverage()).toBe(200);
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
