/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component IncomeMethodChartComponent
  @description Income method chart component for displaying payment method distribution
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';

import { IncomeMethodChartComponent } from './income-method-chart.component';

describe('IncomeMethodChartComponent', () => {
  let component: IncomeMethodChartComponent;
  let fixture: ComponentFixture<IncomeMethodChartComponent>;
  let mockMeta: jasmine.SpyObj<Meta>;

  const mockMethodData = {
    'Credit Card': 2500,
    'Bank Transfer': 1800,
    'Cash': 1200,
    'PayPal': 800,
    'Cryptocurrency': 500
  };

  beforeEach(async () => {
    mockMeta = jasmine.createSpyObj('Meta', ['addTags']);

    await TestBed.configureTestingModule({
      imports: [IncomeMethodChartComponent],
      providers: [
        { provide: Meta, useValue: mockMeta }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IncomeMethodChartComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.methodData).toEqual({});
    expect(component.rawData()).toEqual({});
    expect(component.hasData()).toBe(false);
    expect(component.pieChartLabels()).toEqual([]);
    expect(component.colorPalette).toEqual(['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#93c5fd', '#bfdbfe']);
  });

  it('should setup meta tags in constructor', () => {
    expect(mockMeta.addTags).toHaveBeenCalledWith([
      { name: 'description', content: 'Visual breakdown of current month income categorized by payment method in Alpha Vault.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]);
  });

  it('should update chart data when methodData input changes', () => {
    component.methodData = mockMethodData;
    component.ngOnChanges({
      methodData: {
        currentValue: mockMethodData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.rawData()).toEqual(mockMethodData);
    expect(component.hasData()).toBe(true);
    expect(component.pieChartLabels()).toEqual(['Credit Card', 'Bank Transfer', 'Cash', 'PayPal', 'Cryptocurrency']);
  });

  it('should sort data by value in descending order', () => {
    component.methodData = mockMethodData;
    component.ngOnChanges({
      methodData: {
        currentValue: mockMethodData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.pieChartLabels()[0]).toBe('Credit Card'); // Highest value
    expect(component.pieChartLabels()[4]).toBe('Cryptocurrency'); // Lowest value
  });

  it('should handle empty data correctly', () => {
    component.methodData = {};
    component.ngOnChanges({
      methodData: {
        currentValue: {},
        previousValue: mockMethodData,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.hasData()).toBe(false);
    expect(component.pieChartLabels()).toEqual([]);
    expect(component.pieChartData().labels).toEqual([]);
    expect(component.pieChartData().datasets).toEqual([]);
  });

  it('should handle null data correctly', () => {
    component.methodData = null as any;
    component.ngOnChanges({
      methodData: {
        currentValue: null,
        previousValue: mockMethodData,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.rawData()).toEqual({});
    expect(component.hasData()).toBe(false);
  });

  it('should handle undefined data correctly', () => {
    component.methodData = undefined as any;
    component.ngOnChanges({
      methodData: {
        currentValue: undefined,
        previousValue: mockMethodData,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.rawData()).toEqual({});
    expect(component.hasData()).toBe(false);
  });

  it('should handle data with zero values correctly', () => {
    const zeroData = {
      'Method A': 0,
      'Method B': 0,
      'Method C': 0
    };

    component.methodData = zeroData;
    component.ngOnChanges({
      methodData: {
        currentValue: zeroData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.hasData()).toBe(false);
    expect(component.pieChartLabels()).toEqual([]);
  });

  it('should handle data with mixed zero and positive values', () => {
    const mixedData = {
      'Method A': 1000,
      'Method B': 0,
      'Method C': 500
    };

    component.methodData = mixedData;
    component.ngOnChanges({
      methodData: {
        currentValue: mixedData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.hasData()).toBe(true);
    expect(component.pieChartLabels()).toEqual(['Method A', 'Method C', 'Method B']);
  });

  it('should return correct background color for legend items', () => {
    expect(component.getBackgroundColor(0)).toBe('#6366f1');
    expect(component.getBackgroundColor(1)).toBe('#8b5cf6');
    expect(component.getBackgroundColor(6)).toBe('#bfdbfe');
    expect(component.getBackgroundColor(7)).toBe('#6366f1'); // Cycles back
  });

  it('should return correct value for label', () => {
    component.methodData = mockMethodData;
    component.ngOnChanges({
      methodData: {
        currentValue: mockMethodData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });
    
    expect(component.getValueForLabel('Credit Card')).toBe(2500);
    expect(component.getValueForLabel('Bank Transfer')).toBe(1800);
    expect(component.getValueForLabel('Non-existent')).toBe(0);
  });

  it('should handle single method data', () => {
    const singleData = { 'Credit Card': 1000 };
    
    component.methodData = singleData;
    component.ngOnChanges({
      methodData: {
        currentValue: singleData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.hasData()).toBe(true);
    expect(component.pieChartLabels()).toEqual(['Credit Card']);
    expect(component.pieChartData().datasets[0].data).toEqual([1000]);
  });

  it('should handle large number of methods', () => {
    const largeData: Record<string, number> = {};
    for (let i = 1; i <= 10; i++) {
      largeData[`Method ${i}`] = i * 100;
    }

    component.methodData = largeData;
    component.ngOnChanges({
      methodData: {
        currentValue: largeData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.hasData()).toBe(true);
    expect(component.pieChartLabels().length).toBe(10);
    expect(component.pieChartLabels()[0]).toBe('Method 10'); // Highest value
    expect(component.pieChartLabels()[9]).toBe('Method 1'); // Lowest value
  });

  it('should handle negative values correctly', () => {
    const negativeData = {
      'Method A': 1000,
      'Method B': -500,
      'Method C': 200
    };

    component.methodData = negativeData;
    component.ngOnChanges({
      methodData: {
        currentValue: negativeData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.hasData()).toBe(true);
    expect(component.pieChartLabels()).toEqual(['Method A', 'Method C', 'Method B']);
  });

  it('should maintain chart options configuration', () => {
    expect(component.pieChartOptions.responsive).toBe(true);
    expect(component.pieChartOptions.maintainAspectRatio).toBe(false);
    expect(component.pieChartOptions.cutout).toBe('70%');
    expect(component.pieChartOptions.plugins?.legend?.display).toBe(false);
  });

  it('should have proper chart dataset configuration', () => {
    component.methodData = mockMethodData;
    component.ngOnChanges({
      methodData: {
        currentValue: mockMethodData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    const dataset = component.pieChartData().datasets[0];
    expect(dataset.backgroundColor).toEqual(component.colorPalette);
    expect(dataset.borderWidth).toBe(2);
    expect(dataset.borderColor).toBe('#ffffff');
    expect(dataset.hoverOffset).toBe(7);
  });

  it('should display no-data message when no data available', () => {
    component.methodData = {};
    fixture.detectChanges();

    const noDataMessage = fixture.debugElement.nativeElement.querySelector('.no-data-message');
    const noDataIcon = fixture.debugElement.nativeElement.querySelector('.no-data-icon');
    
    expect(noDataMessage).toBeTruthy();
    expect(noDataIcon).toBeTruthy();
    expect(noDataMessage.textContent).toContain('No income method data available for this month');
    expect(noDataMessage.textContent).toContain('Add some incomes this month to see this chart');
    expect(noDataIcon.textContent).toBe('💰');
  });

  it('should display chart when data is available', () => {
    component.methodData = mockMethodData;
    component.ngOnChanges({
      methodData: {
        currentValue: mockMethodData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });
    fixture.detectChanges();

    const chartCanvas = fixture.debugElement.nativeElement.querySelector('canvas');
    const legendContainer = fixture.debugElement.nativeElement.querySelector('.legend-container');
    const noDataMessage = fixture.debugElement.nativeElement.querySelector('.no-data-message');
    
    expect(chartCanvas).toBeTruthy();
    expect(legendContainer).toBeTruthy();
    expect(noDataMessage).toBeFalsy();
  });

  it('should display legend items correctly', () => {
    component.methodData = mockMethodData;
    component.ngOnChanges({
      methodData: {
        currentValue: mockMethodData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });
    fixture.detectChanges();

    const legendItems = fixture.debugElement.nativeElement.querySelectorAll('.legend-item');
    expect(legendItems.length).toBe(5);

    const firstLegendItem = legendItems[0];
    const legendLabel = firstLegendItem.querySelector('.legend-label');
    const legendValue = firstLegendItem.querySelector('.legend-value');
    
    expect(legendLabel?.textContent).toBe('Credit Card');
    expect(legendValue?.textContent).toContain('$2,500');
  });

  it('should handle rapid data changes', () => {
    component.methodData = mockMethodData;
    component.ngOnChanges({
      methodData: {
        currentValue: mockMethodData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    const newData = { 'New Method': 3000 };
    component.methodData = newData;
    component.ngOnChanges({
      methodData: {
        currentValue: newData,
        previousValue: mockMethodData,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.rawData()).toEqual(newData);
    expect(component.pieChartLabels()).toEqual(['New Method']);
  });

  it('should support keyboard navigation for legend items', () => {
    component.methodData = mockMethodData;
    component.ngOnChanges({
      methodData: {
        currentValue: mockMethodData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });
    fixture.detectChanges();

    const legendItems = fixture.debugElement.nativeElement.querySelectorAll('.legend-item');
    const firstItem = legendItems[0];
    
    // Test tabindex and role
    expect(firstItem.getAttribute('tabindex')).toBe('0');
    expect(firstItem.getAttribute('role')).toBe('listitem');
    
    // Test keyboard activation
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    
    spyOn(component, 'onLegendItemActivate');
    
    firstItem.dispatchEvent(enterEvent);
    expect(component.onLegendItemActivate).toHaveBeenCalled();
    
    firstItem.dispatchEvent(spaceEvent);
    expect(component.onLegendItemActivate).toHaveBeenCalledTimes(2);
  });

  it('should have proper ARIA attributes', () => {
    component.methodData = mockMethodData;
    component.ngOnChanges({
      methodData: {
        currentValue: mockMethodData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });
    fixture.detectChanges();

    const section = fixture.debugElement.nativeElement.querySelector('section');
    expect(section.getAttribute('role')).toBe('region');
    expect(section.getAttribute('aria-labelledby')).toBe('incomeMethodChartTitle');

    const canvas = fixture.debugElement.nativeElement.querySelector('canvas');
    expect(canvas.getAttribute('role')).toBe('img');
    expect(canvas.getAttribute('aria-label')).toContain('Current month income distribution');

    const legendContainer = fixture.debugElement.nativeElement.querySelector('.legend-container');
    expect(legendContainer.getAttribute('role')).toBe('list');
    expect(legendContainer.getAttribute('aria-label')).toBe('Payment method legend');
  });

  it('should use computed signals for template bindings', () => {
    component.methodData = mockMethodData;
    component.ngOnChanges({
      methodData: {
        currentValue: mockMethodData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.hasData()).toBe(true);
    expect(component.pieChartLabels()).toEqual(['Credit Card', 'Bank Transfer', 'Cash', 'PayPal', 'Cryptocurrency']);
    expect(component.rawData()).toEqual(mockMethodData);
  });

  it('should handle keyboard events correctly', () => {
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    spyOn(event, 'preventDefault');
    spyOn(console, 'log');

    component.onLegendItemActivate(event, 'Credit Card');

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should not handle non-activation keys', () => {
    const event = new KeyboardEvent('keydown', { key: 'Tab' });
    spyOn(event, 'preventDefault');
    spyOn(console, 'log');

    component.onLegendItemActivate(event, 'Credit Card');

    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should handle click events correctly', () => {
    const event = new MouseEvent('click');
    spyOn(console, 'log');

    component.onLegendItemActivate(event, 'Credit Card');

  });
});
