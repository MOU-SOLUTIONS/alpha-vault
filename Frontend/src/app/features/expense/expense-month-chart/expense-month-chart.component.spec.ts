/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseMonthChartComponent
  @description Expense month chart component for displaying monthly expense data
*/

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { NgChartsModule } from 'ng2-charts';
import { of, Subject, throwError } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { ExpenseService } from '../../../core/services/expense.service';
import { ExpenseMonthChartComponent } from './expense-month-chart.component';

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

describe('ExpenseMonthChartComponent', () => {
  let component: ExpenseMonthChartComponent;
  let fixture: ComponentFixture<ExpenseMonthChartComponent>;
  let mockExpenseService: jasmine.SpyObj<ExpenseService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockMeta: jasmine.SpyObj<Meta>;

  const mockUserId = 1;
  const mockMonthlyData = [100, 200, 150, 300, 250, 400, 350, 180, 220, 280, 320, 190]; // Total: 2940, Average: 245

  beforeEach(async () => {
    mockExpenseService = jasmine.createSpyObj('ExpenseService', ['getExpenseForMonthsOfCurrentYear']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getUserId'], {
      userId$: new Subject<number>()
    });
    mockMeta = jasmine.createSpyObj('Meta', ['addTags']);

    await TestBed.configureTestingModule({
      imports: [ExpenseMonthChartComponent, NgChartsModule],
      providers: [
        { provide: ExpenseService, useValue: mockExpenseService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Meta, useValue: mockMeta }
      ]
    })
    .overrideComponent(ExpenseMonthChartComponent, {
      remove: { imports: [NgChartsModule] },
      add: { imports: [MockChartComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseMonthChartComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.monthlyData).toEqual([]);
    expect(component.lazyLoad).toBeFalsy();
    expect(component.isLineChart()).toBeTruthy();
    expect(component.chartType()).toBe('line');
  });

  it('should have correct month labels', () => {
    expect(component.monthLabels).toEqual(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
  });

  it('should calculate monthly total correctly', () => {
    (component as any).monthlyDataSignal.set(mockMonthlyData);
    expect(component.monthlyTotal()).toBe(2940);
  });

  it('should calculate monthly average correctly', () => {
    (component as any).monthlyDataSignal.set(mockMonthlyData);
    expect(component.monthlyAverage()).toBe(245);
  });

  it('should handle empty data', () => {
    (component as any).monthlyDataSignal.set([]);
    expect(component.monthlyTotal()).toBe(0);
    expect(component.monthlyAverage()).toBe(0);
  });

  it('should handle partial data (less than 12 months)', () => {
    const partialData = [100, 200, 150];
    (component as any).monthlyDataSignal.set(partialData);
    expect(component.monthlyTotal()).toBe(450);
    expect(component.monthlyAverage()).toBe(150);
  });

  it('should generate correct chart data for line chart', () => {
    (component as any).monthlyDataSignal.set(mockMonthlyData);
    const chartData = component.chartData();
    
    expect(chartData.labels).toEqual(component.monthLabels);
    expect(chartData.datasets).toHaveSize(1);
    expect(chartData.datasets[0].label).toBe('Monthly Expenses');
    expect(chartData.datasets[0].data).toEqual(mockMonthlyData);
    expect('fill' in chartData.datasets[0] ? chartData.datasets[0].fill : undefined).toBeTruthy();
    expect(chartData.datasets[0].borderColor).toBe('rgba(63, 81, 181, 1)');
  });

  it('should generate correct chart data for bar chart', () => {
    (component as any).isLineChartSignal.set(false);
    (component as any).monthlyDataSignal.set(mockMonthlyData);
    const chartData = component.chartData();
    
    expect(chartData.labels).toEqual(component.monthLabels);
    expect(chartData.datasets).toHaveSize(1);
    expect(chartData.datasets[0].label).toBe('Monthly Expenses');
    expect(chartData.datasets[0].data).toEqual(mockMonthlyData);
    expect('fill' in chartData.datasets[0] ? chartData.datasets[0].fill : undefined).toBeFalsy();
    expect(chartData.datasets[0].borderColor).toBe('rgba(63, 81, 181, 1)');
  });

  it('should toggle chart type correctly', () => {
    expect(component.isLineChart()).toBeTruthy();
    expect(component.chartType()).toBe('line');
    
    component.toggleChartType();
    
    expect(component.isLineChart()).toBeFalsy();
    expect(component.chartType()).toBe('bar');
  });

  it('should handle keyboard events for toggle', () => {
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    spyOn(event, 'preventDefault');
    spyOn(component, 'toggleChartType');
    
    component.onToggleKeydown(event);
    
    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.toggleChartType).toHaveBeenCalled();
  });

  it('should handle space key for toggle', () => {
    const event = new KeyboardEvent('keydown', { key: ' ' });
    spyOn(event, 'preventDefault');
    spyOn(component, 'toggleChartType');
    
    component.onToggleKeydown(event);
    
    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.toggleChartType).toHaveBeenCalled();
  });

  it('should not handle other keys', () => {
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    spyOn(event, 'preventDefault');
    spyOn(component, 'toggleChartType');
    
    component.onToggleKeydown(event);
    
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(component.toggleChartType).not.toHaveBeenCalled();
  });

  it('should load data on init when not lazy loading', () => {
    mockExpenseService.getExpenseForMonthsOfCurrentYear.and.returnValue(of(mockMonthlyData));
    (mockAuthService.userId$ as Subject<number>).next(mockUserId);
    
    component.ngOnInit();
    
    expect(mockExpenseService.getExpenseForMonthsOfCurrentYear).toHaveBeenCalled();
  });

  it('should setup lazy loading when enabled', () => {
    component.lazyLoad = true;
    spyOn(component as any, 'setupLazyLoading');
    
    component.ngOnInit();
    
    expect((component as any).setupLazyLoading).toHaveBeenCalled();
  });

  it('should load monthly data from service', () => {
    mockExpenseService.getExpenseForMonthsOfCurrentYear.and.returnValue(of(mockMonthlyData));
    
    (component as any).loadMonthlyData(mockUserId);
    
    expect(mockExpenseService.getExpenseForMonthsOfCurrentYear).toHaveBeenCalled();
  });

  it('should handle service error gracefully', () => {
    mockExpenseService.getExpenseForMonthsOfCurrentYear.and.returnValue(throwError('Service error'));
    
    (component as any).loadMonthlyData(mockUserId);
    
    expect((component as any).monthlyDataSignal()).toEqual([]);
  });

  it('should update data on input changes', () => {
    const newData = [50, 100, 75];
    component.monthlyData = newData;
    
    component.ngOnChanges({
      monthlyData: {
        currentValue: newData,
        previousValue: [],
        firstChange: false,
        isFirstChange: () => false
      }
    });
    
    expect((component as any).monthlyDataSignal()).toEqual(newData);
  });

  it('should not update data on first change', () => {
    const newData = [50, 100, 75];
    component.monthlyData = newData;
    
    component.ngOnChanges({
      monthlyData: {
        currentValue: newData,
        previousValue: [],
        firstChange: true,
        isFirstChange: () => true
      }
    });
    
    expect((component as any).monthlyDataSignal()).toEqual([]);
  });

  it('should set empty data when user is not authenticated', () => {
    (mockAuthService.userId$ as Subject<number>).next(0);
    
    component.ngOnInit();
    
    expect((component as any).monthlyDataSignal()).toEqual([]);
  });

  it('should add meta tags on initialization', () => {
    component.ngOnInit();
    
    expect(mockMeta.addTags).toHaveBeenCalledWith([
      { name: 'description', content: 'Chart representing monthly expense distribution on Alpha Vault.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]);
  });

  it('should have correct chart options', () => {
    const options = component.chartOptions;
    
    expect(options.responsive).toBeTruthy();
    expect(options.maintainAspectRatio).toBeFalsy();
    expect(options.plugins?.legend?.display).toBeFalsy();
    expect(options.scales?.['x']?.grid?.display).toBeFalsy();
    expect(options.scales?.['y'] && 'beginAtZero' in options.scales['y'] ? options.scales['y'].beginAtZero : undefined).toBeTruthy();
  });

  it('should clean up on destroy', () => {
    const destroySpy = jasmine.createSpyObj('destroy$', ['next', 'complete']);
    (component as any).destroy$ = destroySpy;
    
    component.ngOnDestroy();
    
    expect(destroySpy.next).toHaveBeenCalled();
    expect(destroySpy.complete).toHaveBeenCalled();
  });

  it('should handle background colors correctly for bar chart', () => {
    (component as any).isLineChartSignal.set(false);
    (component as any).monthlyDataSignal.set([100, 200, 0, 300]);
    const chartData = component.chartData();
    
    expect(chartData.datasets[0].backgroundColor).toBeDefined();
    expect(Array.isArray(chartData.datasets[0].backgroundColor)).toBeTruthy();
  });

  it('should calculate background color opacity based on value', () => {
    (component as any).isLineChartSignal.set(false);
    (component as any).monthlyDataSignal.set([100, 200, 0, 300]);
    const chartData = component.chartData();
    const backgroundColors = chartData.datasets[0].backgroundColor as string[];
    
    // The highest value (300) should have the highest opacity
    const maxOpacityIndex = backgroundColors.findIndex(color => color.includes('0.5'));
    expect(maxOpacityIndex).toBe(3); // Index of 300
  });

  it('should handle keyboard navigation accessibility', () => {
    const button = fixture.debugElement.nativeElement.querySelector('.toggle-btn');
    expect(button).toBeTruthy();
    expect(button.getAttribute('aria-label')).toContain('Switch to');
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });

  it('should have proper chart canvas accessibility', () => {
    (component as any).monthlyDataSignal.set(mockMonthlyData);
    fixture.detectChanges();
    
    const canvas = fixture.debugElement.nativeElement.querySelector('canvas');
    expect(canvas).toBeTruthy();
    expect(canvas.getAttribute('role')).toBe('img');
    expect(canvas.getAttribute('aria-label')).toContain('Chart showing monthly expense data');
  });
});