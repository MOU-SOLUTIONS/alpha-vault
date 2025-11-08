/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseCategoryChartComponent
  @description Expense category chart component for displaying expense data
*/

import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';

import { ExpenseCategoryChartComponent } from './expense-category-chart.component';

describe('ExpenseCategoryChartComponent', () => {
  let component: ExpenseCategoryChartComponent;
  let fixture: ComponentFixture<ExpenseCategoryChartComponent>;
  let mockMeta: jasmine.SpyObj<Meta>;
  let mockCdr: jasmine.SpyObj<ChangeDetectorRef>;

  const mockCategoryData = {
    'Food': 500,
    'Transportation': 300,
    'Entertainment': 200,
    'Utilities': 150
  };

  beforeEach(async () => {
    mockMeta = jasmine.createSpyObj('Meta', ['addTags']);
    mockCdr = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck']);

    await TestBed.configureTestingModule({
      imports: [ExpenseCategoryChartComponent],
      providers: [
        { provide: Meta, useValue: mockMeta },
        { provide: ChangeDetectorRef, useValue: mockCdr }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseCategoryChartComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.categoryData).toEqual({});
    expect(component.hasData).toBeFalsy();
    expect(component.rawData).toEqual({});
    expect(component.pieChartLabels).toEqual([]);
  });

  it('should detect data presence correctly', () => {
    component.categoryData = mockCategoryData;
    component.ngOnChanges({
      categoryData: {
        currentValue: mockCategoryData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.hasData).toBeTruthy();
    expect(mockCdr.markForCheck).toHaveBeenCalled();
  });

  it('should detect no data correctly', () => {
    component.categoryData = {};
    component.ngOnChanges({
      categoryData: {
        currentValue: {},
        previousValue: mockCategoryData,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.hasData).toBeFalsy();
    expect(mockCdr.markForCheck).toHaveBeenCalled();
  });

  it('should detect no data with zero values', () => {
    component.categoryData = { 'Food': 0, 'Transportation': 0 };
    component.ngOnChanges({
      categoryData: {
        currentValue: { 'Food': 0, 'Transportation': 0 },
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.hasData).toBeFalsy();
  });

  it('should sort labels by value in descending order', () => {
    component.categoryData = mockCategoryData;
    component.ngOnChanges({
      categoryData: {
        currentValue: mockCategoryData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    const labels = component.pieChartLabels;
    expect(labels[0]).toBe('Food'); // 500
    expect(labels[1]).toBe('Transportation'); // 300
    expect(labels[2]).toBe('Entertainment'); // 200
    expect(labels[3]).toBe('Utilities'); // 150
  });

  it('should generate correct chart data', () => {
    component.categoryData = mockCategoryData;
    component.ngOnChanges({
      categoryData: {
        currentValue: mockCategoryData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    const chartData = component.pieChartData;
    expect(chartData.labels).toEqual(['Food', 'Transportation', 'Entertainment', 'Utilities']);
    expect(chartData.datasets).toHaveSize(1);
    expect(chartData.datasets[0].data).toEqual([500, 300, 200, 150]);
    expect(chartData.datasets[0].backgroundColor).toEqual(component.colorPalette);
  });

  it('should return empty data when no data available', () => {
    component.categoryData = {};
    component.ngOnChanges({
      categoryData: {
        currentValue: {},
        previousValue: mockCategoryData,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    const chartData = component.pieChartData;
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
    component.categoryData = mockCategoryData;
    component.ngOnChanges({
      categoryData: {
        currentValue: mockCategoryData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.getValueForLabel('Food')).toBe(500);
    expect(component.getValueForLabel('Transportation')).toBe(300);
    expect(component.getValueForLabel('Unknown')).toBe(0);
  });

  it('should add meta tags on initialization', () => {
    component.ngOnInit();
    
    expect(mockMeta.addTags).toHaveBeenCalledWith([
      { name: 'description', content: 'Visual breakdown of current month expenses categorized by category in Alpha Vault.' },
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

  it('should handle null/undefined categoryData', () => {
    component.categoryData = null as any;
    component.ngOnChanges({
      categoryData: {
        currentValue: null,
        previousValue: mockCategoryData,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.hasData).toBeFalsy();
    expect(component.pieChartLabels).toEqual([]);
  });

  it('should handle single category', () => {
    const singleData = { 'Food': 500 };
    component.categoryData = singleData;
    component.ngOnChanges({
      categoryData: {
        currentValue: singleData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.hasData).toBeTruthy();
    expect(component.pieChartLabels).toEqual(['Food']);
    expect(component.pieChartData.datasets[0].data).toEqual([500]);
  });

  it('should handle large number of categories', () => {
    const largeData: Record<string, number> = {};
    for (let i = 0; i < 10; i++) {
      largeData[`Category ${i}`] = i * 100;
    }

    component.categoryData = largeData;
    component.ngOnChanges({
      categoryData: {
        currentValue: largeData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.hasData).toBeTruthy();
    expect(component.pieChartLabels.length).toBe(10);
    expect(component.pieChartLabels[0]).toBe('Category 9'); // Highest value
  });

  it('should call markForCheck after updateChart', () => {
    component.categoryData = mockCategoryData;
    component.updateChart();
    
    expect(mockCdr.markForCheck).toHaveBeenCalled();
  });

  it('should not call updateChart when categoryData does not change', () => {
    spyOn(component, 'updateChart');
    
    component.ngOnChanges({
      otherProperty: {
        currentValue: 'test',
        previousValue: 'old',
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.updateChart).not.toHaveBeenCalled();
  });

  it('should handle empty string labels', () => {
    const dataWithEmptyLabels = { '': 100, 'Valid Category': 200 };
    component.categoryData = dataWithEmptyLabels;
    component.ngOnChanges({
      categoryData: {
        currentValue: dataWithEmptyLabels,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.hasData).toBeTruthy();
    expect(component.pieChartLabels).toContain('');
    expect(component.pieChartLabels).toContain('Valid Category');
  });

  it('should maintain data integrity after multiple updates', () => {
    // First update
    component.categoryData = { 'A': 100, 'B': 200 };
    component.ngOnChanges({
      categoryData: {
        currentValue: { 'A': 100, 'B': 200 },
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.hasData).toBeTruthy();
    expect(component.pieChartLabels).toEqual(['B', 'A']);

    // Second update
    component.categoryData = { 'C': 300, 'D': 400 };
    component.ngOnChanges({
      categoryData: {
        currentValue: { 'C': 300, 'D': 400 },
        previousValue: { 'A': 100, 'B': 200 },
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.hasData).toBeTruthy();
    expect(component.pieChartLabels).toEqual(['D', 'C']);
    expect(component.rawData).toEqual({ 'C': 300, 'D': 400 });
  });
});