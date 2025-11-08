/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component IncomeTop5Component
  @description Income top 5 component for displaying top income categories
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';

import { IncomeTop5Component } from './income-top5.component';

describe('IncomeTop5Component', () => {
  let component: IncomeTop5Component;
  let fixture: ComponentFixture<IncomeTop5Component>;
  let mockMeta: jasmine.SpyObj<Meta>;

  const mockTopIncomes = [
    { category: 'Salary', amount: 5000 },
    { category: 'Freelance', amount: 2500 },
    { category: 'Investment', amount: 1200 },
    { category: 'Bonus', amount: 800 },
    { category: 'Side Hustle', amount: 600 }
  ];

  beforeEach(async () => {
    mockMeta = jasmine.createSpyObj('Meta', ['addTags']);

    await TestBed.configureTestingModule({
      imports: [IncomeTop5Component],
      providers: [
        { provide: Meta, useValue: mockMeta }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IncomeTop5Component);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.topIncomes).toEqual([]);
    expect(component.shouldPulse()).toBe(false);
  });

  it('should setup meta tags in constructor', () => {
    expect(mockMeta.addTags).toHaveBeenCalledWith([
      { name: 'description', content: 'Top 5 income categories ranked by amount in Alpha Vault.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]);
  });

  it('should sort incomes by amount in descending order', () => {
    const unsortedIncomes = [
      { category: 'Bonus', amount: 800 },
      { category: 'Salary', amount: 5000 },
      { category: 'Freelance', amount: 2500 }
    ];

    component.topIncomes = unsortedIncomes;
    component.ngOnChanges({
      topIncomes: {
        currentValue: unsortedIncomes,
        previousValue: [],
        firstChange: false,
        isFirstChange: () => false
      }
    });

    const sortedIncomes = component.sortedIncomes();
    expect(sortedIncomes[0].amount).toBe(5000);
    expect(sortedIncomes[1].amount).toBe(2500);
    expect(sortedIncomes[2].amount).toBe(800);
  });

  it('should assign dynamic colors to categories', () => {
    component.topIncomes = mockTopIncomes;
    component.ngOnChanges({
      topIncomes: {
        currentValue: mockTopIncomes,
        previousValue: [],
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.getCategoryColor('Salary')).toBe('#6366f1');
    expect(component.getCategoryColor('Freelance')).toBe('#8b5cf6');
    expect(component.getCategoryColor('Investment')).toBe('#34d399');
  });

  it('should return default color for unknown category', () => {
    expect(component.getCategoryColor('Unknown')).toBe('#999999');
  });

  it('should return category label as is', () => {
    expect(component.getCategoryLabel('Salary')).toBe('Salary');
    expect(component.getCategoryLabel('Freelance Work')).toBe('Freelance Work');
  });

  it('should trigger pulse animation on data change', (done) => {
    component.topIncomes = [];
    component.ngOnChanges({
      topIncomes: {
        currentValue: mockTopIncomes,
        previousValue: [],
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.shouldPulse()).toBe(true);

    setTimeout(() => {
      expect(component.shouldPulse()).toBe(false);
      done();
    }, 1100);
  });

  it('should not trigger pulse animation on first change', () => {
    component.topIncomes = mockTopIncomes;
    component.ngOnChanges({
      topIncomes: {
        currentValue: mockTopIncomes,
        previousValue: [],
        firstChange: true,
        isFirstChange: () => true
      }
    });

    expect(component.shouldPulse()).toBe(false);
  });

  it('should handle empty income array', () => {
    component.topIncomes = [];
    component.ngOnChanges({
      topIncomes: {
        currentValue: [],
        previousValue: mockTopIncomes,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.topIncomes).toEqual([]);
    expect(component.shouldPulse()).toBe(true);
  });

  it('should handle null income array', () => {
    component.topIncomes = null as unknown as { category: string; amount: number }[];
    component.ngOnChanges({
      topIncomes: {
        currentValue: null,
        previousValue: mockTopIncomes,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.topIncomes).toBeNull();
  });

  it('should handle undefined income array', () => {
    component.topIncomes = undefined as unknown as { category: string; amount: number }[];
    component.ngOnChanges({
      topIncomes: {
        currentValue: undefined,
        previousValue: mockTopIncomes,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.topIncomes).toBeUndefined();
  });

  it('should handle single income item', () => {
    const singleIncome = [{ category: 'Salary', amount: 5000 }];
    component.topIncomes = singleIncome;
    component.ngOnChanges({
      topIncomes: {
        currentValue: singleIncome,
        previousValue: [],
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.topIncomes).toEqual(singleIncome);
    expect(component.getCategoryColor('Salary')).toBe('#6366f1');
  });

  it('should handle duplicate categories', () => {
    const duplicateIncomes = [
      { category: 'Salary', amount: 5000 },
      { category: 'Salary', amount: 3000 },
      { category: 'Bonus', amount: 1000 }
    ];

    component.topIncomes = duplicateIncomes;
    component.ngOnChanges({
      topIncomes: {
        currentValue: duplicateIncomes,
        previousValue: [],
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.topIncomes.length).toBe(3);
    expect(component.getCategoryColor('Salary')).toBe('#6366f1');
    expect(component.getCategoryColor('Bonus')).toBe('#34d399');
  });

  it('should handle more than 5 income items', () => {
    const manyIncomes = [
      { category: 'Salary', amount: 5000 },
      { category: 'Freelance', amount: 2500 },
      { category: 'Investment', amount: 1200 },
      { category: 'Bonus', amount: 800 },
      { category: 'Side Hustle', amount: 600 },
      { category: 'Rental', amount: 400 },
      { category: 'Dividends', amount: 300 }
    ];

    component.topIncomes = manyIncomes;
    component.ngOnChanges({
      topIncomes: {
        currentValue: manyIncomes,
        previousValue: [],
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.topIncomes.length).toBe(7);
    expect(component.topIncomes[0].amount).toBe(5000);
    expect(component.topIncomes[6].amount).toBe(300);
  });

  it('should handle zero amounts', () => {
    const zeroIncomes = [
      { category: 'Salary', amount: 0 },
      { category: 'Bonus', amount: 1000 }
    ];

    component.topIncomes = zeroIncomes;
    component.ngOnChanges({
      topIncomes: {
        currentValue: zeroIncomes,
        previousValue: [],
        firstChange: false,
        isFirstChange: () => false
      }
    });

    const sortedIncomes = component.sortedIncomes();
    expect(sortedIncomes[0].amount).toBe(1000);
    expect(sortedIncomes[1].amount).toBe(0);
  });

  it('should handle negative amounts', () => {
    const negativeIncomes = [
      { category: 'Salary', amount: 5000 },
      { category: 'Loss', amount: -1000 },
      { category: 'Bonus', amount: 800 }
    ];

    component.topIncomes = negativeIncomes;
    component.ngOnChanges({
      topIncomes: {
        currentValue: negativeIncomes,
        previousValue: [],
        firstChange: false,
        isFirstChange: () => false
      }
    });

    const sortedIncomes = component.sortedIncomes();
    expect(sortedIncomes[0].amount).toBe(5000);
    expect(sortedIncomes[1].amount).toBe(800);
    expect(sortedIncomes[2].amount).toBe(-1000);
  });

  it('should track by category correctly', () => {
    const income1 = { category: 'Salary', amount: 5000 };
    const income2 = { category: 'Freelance', amount: 2500 };
    
    expect(component.trackByCategory(0, income1)).toBe('Salary');
    expect(component.trackByCategory(1, income2)).toBe('Freelance');
  });

  it('should display no-data message when no incomes provided', () => {
    component.topIncomes = [];
    fixture.detectChanges();

    const noDataMessage = fixture.debugElement.nativeElement.querySelector('.no-data-message');
    expect(noDataMessage).toBeTruthy();
    expect(noDataMessage.textContent).toContain('No income data available for this month');
    expect(noDataMessage.textContent).toContain('Add some income sources to see your top categories here');
  });

  it('should not display no-data message when incomes are provided', () => {
    component.topIncomes = mockTopIncomes;
    component.ngOnChanges({
      topIncomes: {
        currentValue: mockTopIncomes,
        previousValue: [],
        firstChange: false,
        isFirstChange: () => false
      }
    });
    fixture.detectChanges();

    const noDataMessage = fixture.debugElement.nativeElement.querySelector('.no-data-message');
    const tableWrapper = fixture.debugElement.nativeElement.querySelector('.top5-table-wrapper');
    
    expect(noDataMessage).toBeFalsy();
    expect(tableWrapper).toBeTruthy();
  });

  it('should maintain color consistency across updates', () => {
    component.topIncomes = mockTopIncomes;
    component.ngOnChanges({
      topIncomes: {
        currentValue: mockTopIncomes,
        previousValue: [],
        firstChange: false,
        isFirstChange: () => false
      }
    });

    const firstColor = component.getCategoryColor('Salary');

    // Update with same data
    component.ngOnChanges({
      topIncomes: {
        currentValue: mockTopIncomes,
        previousValue: mockTopIncomes,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    const secondColor = component.getCategoryColor('Salary');
    expect(firstColor).toBe(secondColor);
  });

  it('should handle rapid data changes', () => {
    // First change
    component.topIncomes = mockTopIncomes;
    component.ngOnChanges({
      topIncomes: {
        currentValue: mockTopIncomes,
        previousValue: [],
        firstChange: false,
        isFirstChange: () => false
      }
    });

    // Second change before pulse completes
    const newIncomes = [{ category: 'New', amount: 1000 }];
    component.topIncomes = newIncomes;
    component.ngOnChanges({
      topIncomes: {
        currentValue: newIncomes,
        previousValue: mockTopIncomes,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.shouldPulse()).toBe(true);
    expect(component.topIncomes).toEqual(newIncomes);
    expect(component.topIncomes[0].category).toBe('New');
  });

  it('should use computed signals for sorted incomes', () => {
    component['topIncomesSignal'].set(mockTopIncomes);
    
    const sortedIncomes = component.sortedIncomes();
    expect(sortedIncomes[0].amount).toBe(5000);
    expect(sortedIncomes[1].amount).toBe(2500);
    expect(sortedIncomes[2].amount).toBe(1200);
  });

  it('should use computed signals for category colors', () => {
    component['topIncomesSignal'].set(mockTopIncomes);
    
    const colors = component.categoryColors();
    expect(colors['Salary']).toBe('#6366f1');
    expect(colors['Freelance']).toBe('#8b5cf6');
    expect(colors['Investment']).toBe('#34d399');
  });

  it('should support keyboard navigation for table rows', () => {
    component.topIncomes = mockTopIncomes;
    component.ngOnChanges({
      topIncomes: {
        currentValue: mockTopIncomes,
        previousValue: [],
        firstChange: false,
        isFirstChange: () => false
      }
    });
    fixture.detectChanges();

    const tableRows = fixture.debugElement.nativeElement.querySelectorAll('tbody tr');
    const firstRow = tableRows[0];
    
    // Test tabindex and role
    expect(firstRow.getAttribute('tabindex')).toBe('0');
    expect(firstRow.getAttribute('role')).toBe('row');
    
    // Test keyboard activation
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    
    spyOn(component, 'onRowKeydown');
    
    firstRow.dispatchEvent(enterEvent);
    expect(component.onRowKeydown).toHaveBeenCalled();
    
    firstRow.dispatchEvent(spaceEvent);
    expect(component.onRowKeydown).toHaveBeenCalledTimes(2);
  });

  it('should have proper ARIA attributes', () => {
    component.topIncomes = mockTopIncomes;
    component.ngOnChanges({
      topIncomes: {
        currentValue: mockTopIncomes,
        previousValue: [],
        firstChange: false,
        isFirstChange: () => false
      }
    });
    fixture.detectChanges();

    const table = fixture.debugElement.nativeElement.querySelector('table');
    expect(table.getAttribute('role')).toBe('table');
    expect(table.getAttribute('aria-describedby')).toBe('top5Title');

    const tableRows = fixture.debugElement.nativeElement.querySelectorAll('tbody tr');
    tableRows.forEach((row: any, index: number) => {
      expect(row.getAttribute('role')).toBe('row');
      expect(row.getAttribute('aria-rowindex')).toBe((index + 2).toString());
    });

    const noDataMessage = fixture.debugElement.nativeElement.querySelector('.no-data-message');
    if (noDataMessage) {
      expect(noDataMessage.getAttribute('role')).toBe('status');
      expect(noDataMessage.getAttribute('aria-live')).toBe('polite');
    }
  });

  it('should handle keyboard events correctly', () => {
    const income = { category: 'Salary', amount: 5000 };
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    spyOn(event, 'preventDefault');
    spyOn(console, 'log');

    component.onRowKeydown(event, income);

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should not handle non-activation keys', () => {
    const income = { category: 'Salary', amount: 5000 };
    const event = new KeyboardEvent('keydown', { key: 'Tab' });
    spyOn(event, 'preventDefault');
    spyOn(console, 'log');

    component.onRowKeydown(event, income);

    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
