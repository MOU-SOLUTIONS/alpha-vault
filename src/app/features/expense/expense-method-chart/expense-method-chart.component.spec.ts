/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseMethodChartComponent
  @description Expense method chart component for displaying expense data
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';

import { ExpenseMethodChartComponent } from './expense-method-chart.component';

describe('ExpenseMethodChartComponent', () => {
  let component: ExpenseMethodChartComponent;
  let fixture: ComponentFixture<ExpenseMethodChartComponent>;
  let mockMeta: jasmine.SpyObj<Meta>;

  const mockMethodData = {
    'Credit Card': 500,
    'Cash': 300,
    'Bank Transfer': 200,
    'PayPal': 150
  };

  beforeEach(async () => {
    mockMeta = jasmine.createSpyObj('Meta', ['addTags']);

    await TestBed.configureTestingModule({
      imports: [ExpenseMethodChartComponent],
      providers: [
        { provide: Meta, useValue: mockMeta }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseMethodChartComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.methodData).toEqual({});
    expect(component.hasData()).toBeFalsy();
  });

  it('should detect data presence correctly', () => {
    component.methodData = mockMethodData;
    component.ngOnChanges({
      methodData: {
        currentValue: mockMethodData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.hasData()).toBeTruthy();
  });

  it('should detect no data correctly', () => {
    component.methodData = {};
    component.ngOnChanges({
      methodData: {
        currentValue: {},
        previousValue: mockMethodData,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.hasData()).toBeFalsy();
  });

  it('should detect no data with zero values', () => {
    component.methodData = { 'Credit Card': 0, 'Cash': 0 };
    component.ngOnChanges({
      methodData: {
        currentValue: { 'Credit Card': 0, 'Cash': 0 },
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.hasData()).toBeFalsy();
  });

  it('should sort labels by value in descending order', () => {
    component.methodData = mockMethodData;
    component.ngOnChanges({
      methodData: {
        currentValue: mockMethodData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    const labels = component.pieChartLabels();
    expect(labels[0]).toBe('Credit Card'); // 500
    expect(labels[1]).toBe('Cash'); // 300
    expect(labels[2]).toBe('Bank Transfer'); // 200
    expect(labels[3]).toBe('PayPal'); // 150
  });

  it('should generate correct chart data', () => {
    component.methodData = mockMethodData;
    component.ngOnChanges({
      methodData: {
        currentValue: mockMethodData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    const chartData = component.pieChartData();
    expect(chartData.labels).toEqual(['Credit Card', 'Cash', 'Bank Transfer', 'PayPal']);
    expect(chartData.datasets).toHaveSize(1);
    expect(chartData.datasets[0].data).toEqual([500, 300, 200, 150]);
    expect(chartData.datasets[0].backgroundColor).toEqual(component.colorPalette);
  });

  it('should return empty data when no data available', () => {
    component.methodData = {};
    component.ngOnChanges({
      methodData: {
        currentValue: {},
        previousValue: mockMethodData,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    const chartData = component.pieChartData();
    expect(chartData.labels).toEqual([]);
    expect(chartData.datasets).toEqual([]);
  });

  it('should return correct background color for index', () => {
    const color = component.getBackgroundColor(0);
    expect(color).toBe(component.colorPalette[0]);
  });

  it('should cycle through color palette', () => {
    const color1 = component.getBackgroundColor(0);
    const color2 = component.getBackgroundColor(component.colorPalette.length);
    expect(color1).toBe(color2);
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

    expect(component.getValueForLabel('Credit Card')).toBe(500);
    expect(component.getValueForLabel('Cash')).toBe(300);
    expect(component.getValueForLabel('Unknown')).toBe(0);
  });

  it('should track by label correctly', () => {
    const trackBy = component.trackByLabel(0, 'Credit Card');
    expect(trackBy).toBe('Credit Card');
  });

  it('should handle keyboard events for legend items', () => {
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    spyOn(event, 'preventDefault');
    
    component.onLegendItemActivate(event, 'Credit Card');
    
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should handle space key for legend items', () => {
    const event = new KeyboardEvent('keydown', { key: ' ' });
    spyOn(event, 'preventDefault');
    
    component.onLegendItemActivate(event, 'Credit Card');
    
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should not handle other keys', () => {
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    spyOn(event, 'preventDefault');
    
    component.onLegendItemActivate(event, 'Credit Card');
    
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should handle click events for legend items', () => {
    const event = new MouseEvent('click');
    spyOn(event, 'preventDefault');
    
    component.onLegendItemActivate(event, 'Credit Card');
    
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should add meta tags on initialization', () => {
    component.ngOnInit();
    
    expect(mockMeta.addTags).toHaveBeenCalledWith([
      { name: 'description', content: 'Visual breakdown of current month expenses categorized by payment method in Alpha Vault.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]);
  });

  it('should have correct color palette', () => {
    const expectedPalette = ['#3f51b5', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#93c5fd', '#bfdbfe'];
    expect(component.colorPalette).toEqual(expectedPalette);
  });

  it('should have correct chart options', () => {
    const options = component.pieChartOptions;
    
    expect(options.responsive).toBeTruthy();
    expect(options.maintainAspectRatio).toBeFalsy();
    expect(options.cutout).toBe('70%');
    expect(options.plugins?.legend?.display).toBeFalsy();
    expect(options.animation && typeof options.animation === 'object' && 'animateScale' in options.animation ? options.animation.animateScale : false).toBeTruthy();
    expect(options.animation && typeof options.animation === 'object' && 'animateRotate' in options.animation ? options.animation.animateRotate : false).toBeTruthy();
  });

  it('should adjust brightness correctly', () => {
    const originalColor = '#3f51b5';
    const adjustedColor = (component as any).adjustBrightness(originalColor, 20);
    
    expect(adjustedColor).toMatch(/^#[0-9a-f]{6}$/i);
    expect(adjustedColor).not.toBe(originalColor);
  });

  it('should handle null/undefined methodData', () => {
    component.methodData = null as any;
    component.ngOnChanges({
      methodData: {
        currentValue: null,
        previousValue: mockMethodData,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.hasData()).toBeFalsy();
    expect(component.pieChartLabels()).toEqual([]);
  });

  it('should maintain signal reactivity', () => {
    component.methodData = mockMethodData;
    component.ngOnChanges({
      methodData: {
        currentValue: mockMethodData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    const initialLabels = component.pieChartLabels();
    expect(initialLabels.length).toBe(4);

    // Update data
    const newData = { ...mockMethodData, 'Debit Card': 100 };
    component.methodData = newData;
    component.ngOnChanges({
      methodData: {
        currentValue: newData,
        previousValue: mockMethodData,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    const updatedLabels = component.pieChartLabels();
    expect(updatedLabels.length).toBe(5);
    expect(updatedLabels).toContain('Debit Card');
  });

  it('should handle single payment method', () => {
    const singleData = { 'Credit Card': 500 };
    component.methodData = singleData;
    component.ngOnChanges({
      methodData: {
        currentValue: singleData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.hasData()).toBeTruthy();
    expect(component.pieChartLabels()).toEqual(['Credit Card']);
    expect(component.pieChartData().datasets[0].data).toEqual([500]);
  });

  it('should handle large number of payment methods', () => {
    const largeData: Record<string, number> = {};
    for (let i = 0; i < 10; i++) {
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

    expect(component.hasData()).toBeTruthy();
    expect(component.pieChartLabels().length).toBe(10);
    expect(component.pieChartLabels()[0]).toBe('Method 9'); // Highest value
  });
});