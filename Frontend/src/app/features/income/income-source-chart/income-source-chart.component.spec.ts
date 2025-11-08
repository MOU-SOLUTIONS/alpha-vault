/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component IncomeSourceChartComponent
  @description Income source chart component for displaying income source distribution
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';

import { IncomeSourceChartComponent } from './income-source-chart.component';

describe('IncomeSourceChartComponent', () => {
  let component: IncomeSourceChartComponent;
  let fixture: ComponentFixture<IncomeSourceChartComponent>;
  let mockMeta: jasmine.SpyObj<Meta>;

  const mockSourceData = {
    'Salary': 5000,
    'Freelance': 2500,
    'Investment': 1200,
    'Rental': 800,
    'Side Business': 600
  };

  beforeEach(async () => {
    mockMeta = jasmine.createSpyObj('Meta', ['addTags']);

    await TestBed.configureTestingModule({
      imports: [IncomeSourceChartComponent],
      providers: [
        { provide: Meta, useValue: mockMeta }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IncomeSourceChartComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.sourceData).toEqual({});
    expect(component.rawData).toEqual({});
    expect(component.hasData).toBe(false);
    expect(component.pieChartLabels).toEqual([]);
    expect(component.colorPalette).toEqual(['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#93c5fd', '#bfdbfe']);
  });

  it('should setup meta tags in constructor', () => {
    expect(mockMeta.addTags).toHaveBeenCalledWith([
      { name: 'description', content: 'Visual breakdown of current month income categorized by source in Alpha Vault.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]);
  });

  it('should update chart data when sourceData input changes', () => {
    component.sourceData = mockSourceData;
    component.ngOnChanges({
      sourceData: {
        currentValue: mockSourceData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.rawData).toEqual(mockSourceData);
    expect(component.hasData).toBe(true);
    expect(component.pieChartLabels).toEqual(['Salary', 'Freelance', 'Investment', 'Rental', 'Side Business']);
  });

  it('should sort data by value in descending order', () => {
    component.sourceData = mockSourceData;
    component.ngOnChanges({
      sourceData: {
        currentValue: mockSourceData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.pieChartLabels[0]).toBe('Salary'); // Highest value
    expect(component.pieChartLabels[4]).toBe('Side Business'); // Lowest value
  });

  it('should handle empty data correctly', () => {
    component.sourceData = {};
    component.ngOnChanges({
      sourceData: {
        currentValue: {},
        previousValue: mockSourceData,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.hasData).toBe(false);
    expect(component.pieChartLabels).toEqual([]);
    expect(component.pieChartData.labels).toEqual([]);
    expect(component.pieChartData.datasets).toEqual([]);
  });

  it('should handle null data correctly', () => {
    component.sourceData = null as any;
    component.ngOnChanges({
      sourceData: {
        currentValue: null,
        previousValue: mockSourceData,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.rawData).toEqual({});
    expect(component.hasData).toBe(false);
  });

  it('should handle undefined data correctly', () => {
    component.sourceData = undefined as any;
    component.ngOnChanges({
      sourceData: {
        currentValue: undefined,
        previousValue: mockSourceData,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.rawData).toEqual({});
    expect(component.hasData).toBe(false);
  });

  it('should handle data with zero values correctly', () => {
    const zeroData = {
      'Source A': 0,
      'Source B': 0,
      'Source C': 0
    };

    component.sourceData = zeroData;
    component.ngOnChanges({
      sourceData: {
        currentValue: zeroData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.hasData).toBe(false);
    expect(component.pieChartLabels).toEqual([]);
  });

  it('should handle data with mixed zero and positive values', () => {
    const mixedData = {
      'Source A': 1000,
      'Source B': 0,
      'Source C': 500
    };

    component.sourceData = mixedData;
    component.ngOnChanges({
      sourceData: {
        currentValue: mixedData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.hasData).toBe(true);
    expect(component.pieChartLabels).toEqual(['Source A', 'Source C', 'Source B']);
  });

  it('should return correct background color for legend items', () => {
    expect(component.getBackgroundColor(0)).toBe('#6366f1');
    expect(component.getBackgroundColor(1)).toBe('#8b5cf6');
    expect(component.getBackgroundColor(6)).toBe('#bfdbfe');
    expect(component.getBackgroundColor(7)).toBe('#6366f1'); // Cycles back
  });

  it('should return correct value for label', () => {
    component.rawData = mockSourceData;
    
    expect(component.getValueForLabel('Salary')).toBe(5000);
    expect(component.getValueForLabel('Freelance')).toBe(2500);
    expect(component.getValueForLabel('Non-existent')).toBe(0);
  });

  it('should handle single source data', () => {
    const singleData = { 'Salary': 1000 };
    
    component.sourceData = singleData;
    component.ngOnChanges({
      sourceData: {
        currentValue: singleData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.hasData).toBe(true);
    expect(component.pieChartLabels).toEqual(['Salary']);
    expect(component.pieChartData.datasets[0].data).toEqual([1000]);
  });

  it('should handle large number of sources', () => {
    const largeData: Record<string, number> = {};
    for (let i = 1; i <= 10; i++) {
      largeData[`Source ${i}`] = i * 100;
    }

    component.sourceData = largeData;
    component.ngOnChanges({
      sourceData: {
        currentValue: largeData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.hasData).toBe(true);
    expect(component.pieChartLabels.length).toBe(10);
    expect(component.pieChartLabels[0]).toBe('Source 10'); // Highest value
    expect(component.pieChartLabels[9]).toBe('Source 1'); // Lowest value
  });

  it('should handle negative values correctly', () => {
    const negativeData = {
      'Source A': 1000,
      'Source B': -500,
      'Source C': 200
    };

    component.sourceData = negativeData;
    component.ngOnChanges({
      sourceData: {
        currentValue: negativeData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.hasData).toBe(true);
    expect(component.pieChartLabels).toEqual(['Source A', 'Source C', 'Source B']);
  });

  it('should maintain chart options configuration', () => {
    expect(component.pieChartOptions.responsive).toBe(true);
    expect(component.pieChartOptions.maintainAspectRatio).toBe(false);
    expect(component.pieChartOptions.plugins?.legend?.display).toBe(false);
  });

  it('should have proper chart dataset configuration', () => {
    component.sourceData = mockSourceData;
    component.ngOnChanges({
      sourceData: {
        currentValue: mockSourceData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    const dataset = component.pieChartData.datasets[0];
    expect(dataset.backgroundColor).toEqual(component.colorPalette);
    expect(dataset.borderWidth).toBe(2);
    expect(dataset.borderColor).toBe('#ffffff');
    expect(dataset.hoverOffset).toBe(7);
  });

  it('should display no-data message when no data available', () => {
    component.sourceData = {};
    fixture.detectChanges();

    const noDataMessage = fixture.debugElement.nativeElement.querySelector('.no-data-message');
    const noDataIcon = fixture.debugElement.nativeElement.querySelector('.no-data-icon');
    
    expect(noDataMessage).toBeTruthy();
    expect(noDataIcon).toBeTruthy();
    expect(noDataMessage.textContent).toContain('No source data available for this month');
    expect(noDataMessage.textContent).toContain('Add some incomes this month to see this chart');
    expect(noDataIcon.textContent).toBe('📈');
  });

  it('should display chart when data is available', () => {
    component.sourceData = mockSourceData;
    component.ngOnChanges({
      sourceData: {
        currentValue: mockSourceData,
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
    component.sourceData = mockSourceData;
    component.ngOnChanges({
      sourceData: {
        currentValue: mockSourceData,
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
    
    expect(legendLabel?.textContent).toBe('Salary');
    expect(legendValue?.textContent).toContain('$5,000');
  });

  it('should handle rapid data changes', () => {
    component.sourceData = mockSourceData;
    component.ngOnChanges({
      sourceData: {
        currentValue: mockSourceData,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    const newData = { 'New Source': 3000 };
    component.sourceData = newData;
    component.ngOnChanges({
      sourceData: {
        currentValue: newData,
        previousValue: mockSourceData,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.rawData).toEqual(newData);
    expect(component.pieChartLabels).toEqual(['New Source']);
  });
});
