/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseTop5Component
  @description Expense top 5 component for displaying expense data
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';

import { ExpenseTop5Component } from './expense-top5.component';

describe('ExpenseTop5Component', () => {
  let component: ExpenseTop5Component;
  let fixture: ComponentFixture<ExpenseTop5Component>;
  let mockMeta: jasmine.SpyObj<Meta>;

  const mockExpenseData = [
    { category: 'Food', amount: 500 },
    { category: 'Transportation', amount: 300 },
    { category: 'Entertainment', amount: 200 },
    { category: 'Utilities', amount: 150 },
    { category: 'Shopping', amount: 100 }
  ];

  beforeEach(async () => {
    mockMeta = jasmine.createSpyObj('Meta', ['addTags']);

    await TestBed.configureTestingModule({
      imports: [ExpenseTop5Component],
      providers: [
        { provide: Meta, useValue: mockMeta }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseTop5Component);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.topExpenses).toEqual([]);
    expect(component.shouldPulse()).toBeFalsy();
  });

  it('should sort expenses by amount in descending order', () => {
    component.topExpenses = mockExpenseData;
    component.ngOnChanges({
      topExpenses: {
        currentValue: mockExpenseData,
        previousValue: [],
        firstChange: false,
        isFirstChange: () => false
      }
    });

    const sorted = component.sortedExpenses();
    expect(sorted[0].amount).toBe(500); // Food
    expect(sorted[1].amount).toBe(300); // Transportation
    expect(sorted[2].amount).toBe(200); // Entertainment
    expect(sorted[3].amount).toBe(150); // Utilities
    expect(sorted[4].amount).toBe(100); // Shopping
  });

  it('should assign colors to categories', () => {
    component.topExpenses = mockExpenseData;
    component.ngOnChanges({
      topExpenses: {
        currentValue: mockExpenseData,
        previousValue: [],
        firstChange: false,
        isFirstChange: () => false
      }
    });

    const colors = component.categoryColors();
    expect(colors['Food']).toBeDefined();
    expect(colors['Transportation']).toBeDefined();
    expect(colors['Entertainment']).toBeDefined();
    expect(colors['Utilities']).toBeDefined();
    expect(colors['Shopping']).toBeDefined();
  });

  it('should return correct category color', () => {
    component.topExpenses = mockExpenseData;
    component.ngOnChanges({
      topExpenses: {
        currentValue: mockExpenseData,
        previousValue: [],
        firstChange: false,
        isFirstChange: () => false
      }
    });

    const color = component.getCategoryColor('Food');
    expect(color).toBeDefined();
    expect(color).not.toBe('#999999');
  });

  it('should return default color for unknown category', () => {
    const color = component.getCategoryColor('Unknown');
    expect(color).toBe('#999999');
  });

  it('should return category label as-is', () => {
    const label = component.getCategoryLabel('Food');
    expect(label).toBe('Food');
  });

  it('should track by category', () => {
    const item = { category: 'Food', amount: 500 };
    const trackBy = component.trackByCategory(0, item);
    expect(trackBy).toBe('Food');
  });

  it('should handle keyboard events', () => {
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    spyOn(event, 'preventDefault');
    const expense = { category: 'Food', amount: 500 };
    
    component.onRowKeydown(event, expense);
    
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should handle space key', () => {
    const event = new KeyboardEvent('keydown', { key: ' ' });
    spyOn(event, 'preventDefault');
    const expense = { category: 'Food', amount: 500 };
    
    component.onRowKeydown(event, expense);
    
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should not handle other keys', () => {
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    spyOn(event, 'preventDefault');
    const expense = { category: 'Food', amount: 500 };
    
    component.onRowKeydown(event, expense);
    
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should trigger pulse animation on data change', () => {
    component.topExpenses = mockExpenseData;
    component.ngOnChanges({
      topExpenses: {
        currentValue: mockExpenseData,
        previousValue: [],
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.shouldPulse()).toBeTruthy();
  });

  it('should not trigger pulse on first change', () => {
    component.topExpenses = mockExpenseData;
    component.ngOnChanges({
      topExpenses: {
        currentValue: mockExpenseData,
        previousValue: [],
        firstChange: true,
        isFirstChange: () => true
      }
    });

    expect(component.shouldPulse()).toBeFalsy();
  });

  it('should handle empty data', () => {
    component.topExpenses = [];
    component.ngOnChanges({
      topExpenses: {
        currentValue: [],
        previousValue: mockExpenseData,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.sortedExpenses()).toEqual([]);
  });

  it('should handle null/undefined data', () => {
    component.topExpenses = null as any;
    component.ngOnChanges({
      topExpenses: {
        currentValue: null,
        previousValue: mockExpenseData,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.sortedExpenses()).toEqual([]);
  });

  it('should add meta tags on initialization', () => {
    component.ngOnInit();
    
    expect(mockMeta.addTags).toHaveBeenCalledWith([
      { name: 'description', content: 'Top 5 expense categories ranked by amount in Alpha Vault.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]);
  });

  it('should use correct color palette', () => {
    component.topExpenses = mockExpenseData;
    component.ngOnChanges({
      topExpenses: {
        currentValue: mockExpenseData,
        previousValue: [],
        firstChange: false,
        isFirstChange: () => false
      }
    });

    const colors = component.categoryColors();
    const expectedPalette = ['#3f51b5', '#8b5cf6', '#34d399', '#f59e0b', '#ec4899'];
    
    const assignedColors = Object.values(colors);
    expectedPalette.forEach(expectedColor => {
      expect(assignedColors).toContain(expectedColor);
    });
  });

  it('should handle duplicate categories', () => {
    const duplicateData = [
      { category: 'Food', amount: 500 },
      { category: 'Food', amount: 300 },
      { category: 'Transportation', amount: 200 }
    ];

    component.topExpenses = duplicateData;
    component.ngOnChanges({
      topExpenses: {
        currentValue: duplicateData,
        previousValue: [],
        firstChange: false,
        isFirstChange: () => false
      }
    });

    const colors = component.categoryColors();
    expect(colors['Food']).toBeDefined();
    expect(colors['Transportation']).toBeDefined();
  });

  it('should maintain signal reactivity', () => {
    component.topExpenses = mockExpenseData;
    component.ngOnChanges({
      topExpenses: {
        currentValue: mockExpenseData,
        previousValue: [],
        firstChange: false,
        isFirstChange: () => false
      }
    });

    const initialSorted = component.sortedExpenses();
    expect(initialSorted.length).toBe(5);

    // Update data
    const newData = [...mockExpenseData, { category: 'Healthcare', amount: 400 }];
    component.topExpenses = newData;
    component.ngOnChanges({
      topExpenses: {
        currentValue: newData,
        previousValue: mockExpenseData,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    const updatedSorted = component.sortedExpenses();
    expect(updatedSorted.length).toBe(6);
    expect(updatedSorted[0].category).toBe('Food'); // Still highest
    expect(updatedSorted[1].category).toBe('Healthcare'); // New second highest
  });

  it('should handle zero amounts', () => {
    const zeroData = [
      { category: 'Food', amount: 0 },
      { category: 'Transportation', amount: 100 },
      { category: 'Entertainment', amount: 0 }
    ];

    component.topExpenses = zeroData;
    component.ngOnChanges({
      topExpenses: {
        currentValue: zeroData,
        previousValue: [],
        firstChange: false,
        isFirstChange: () => false
      }
    });

    const sorted = component.sortedExpenses();
    expect(sorted[0].amount).toBe(100); // Transportation
    expect(sorted[1].amount).toBe(0); // Food
    expect(sorted[2].amount).toBe(0); // Entertainment
  });

  it('should handle negative amounts', () => {
    const negativeData = [
      { category: 'Food', amount: -100 },
      { category: 'Transportation', amount: 200 },
      { category: 'Entertainment', amount: -50 }
    ];

    component.topExpenses = negativeData;
    component.ngOnChanges({
      topExpenses: {
        currentValue: negativeData,
        previousValue: [],
        firstChange: false,
        isFirstChange: () => false
      }
    });

    const sorted = component.sortedExpenses();
    expect(sorted[0].amount).toBe(200); // Transportation
    expect(sorted[1].amount).toBe(-50); // Entertainment
    expect(sorted[2].amount).toBe(-100); // Food
  });
});