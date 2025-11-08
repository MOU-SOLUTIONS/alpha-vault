/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component DebtCreditorChartComponent
  @description Main debt dashboard component tests for managing debt by creditor distribution
*/

import { DebugElement, PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { DebtCreditorChartComponent } from './debt-creditor-chart.component';

describe('DebtCreditorChartComponent', () => {
  let component: DebtCreditorChartComponent;
  let fixture: ComponentFixture<DebtCreditorChartComponent>;

  const mockCreditorData: Record<string, number> = {
    'Bank A': 5000,
    'Credit Card B': 3000,
    'Loan C': 2000
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebtCreditorChartComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DebtCreditorChartComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Rendering', () => {
    it('should render when no creditor data is provided', () => {
      component.creditorData = {};
      fixture.detectChanges();

      const noDataElement = fixture.debugElement.query(By.css('.no-data'));
      expect(noDataElement).toBeTruthy();
      
      const title = fixture.debugElement.query(By.css('.no-data-title'));
      expect(title.nativeElement.textContent.trim()).toBe('No Debt Data Available');
    });

    it('should render creditor list when data is provided', () => {
      component.creditorData = mockCreditorData;
      fixture.detectChanges();

      const creditorList = fixture.debugElement.query(By.css('.creditor-list'));
      expect(creditorList).toBeTruthy();

      const creditorItems = fixture.debugElement.queryAll(By.css('.creditor-item'));
      expect(creditorItems.length).toBe(3);
    });

    it('should display creditor count in header stats', () => {
      component.creditorData = mockCreditorData;
      fixture.detectChanges();

      const statValue = fixture.debugElement.query(By.css('.stat-value'));
      expect(statValue.nativeElement.textContent.trim()).toBe('3');
    });

    it('should display total debt in footer', () => {
      component.creditorData = mockCreditorData;
      fixture.detectChanges();

      const totalAmount = fixture.debugElement.query(By.css('.total-amount'));
      expect(totalAmount.nativeElement.textContent).toContain('10,000');
    });
  });

  describe('Data Transformation', () => {
    it('should sort creditors by amount descending', () => {
      component.creditorData = mockCreditorData;
      fixture.detectChanges();

      const creditorNames = fixture.debugElement
        .queryAll(By.css('.creditor-name'))
        .map((el: DebugElement) => el.nativeElement.textContent.trim());

      expect(creditorNames[0]).toBe('Bank A');
      expect(creditorNames[1]).toBe('Credit Card B');
      expect(creditorNames[2]).toBe('Loan C');
    });

    it('should calculate correct percentages', () => {
      component.creditorData = mockCreditorData;
      fixture.detectChanges();

      const percentages = fixture.debugElement
        .queryAll(By.css('.creditor-percentage'))
        .map((el: DebugElement) => parseFloat(el.nativeElement.textContent.replace('%', '')));

      expect(percentages[0]).toBeCloseTo(50, 1);
      expect(percentages[1]).toBeCloseTo(30, 1);
      expect(percentages[2]).toBeCloseTo(20, 1);
    });

    it('should identify top creditor correctly', () => {
      component.creditorData = mockCreditorData;
      fixture.detectChanges();

      const insightText = fixture.debugElement.query(By.css('.insight-text'));
      expect(insightText.nativeElement.textContent).toContain('Bank A');
      expect(insightText.nativeElement.textContent).toContain('50');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for creditor list', () => {
      component.creditorData = mockCreditorData;
      fixture.detectChanges();

      const creditorList = fixture.debugElement.query(By.css('.creditor-list'));
      expect(creditorList.nativeElement.getAttribute('role')).toBe('list');
      expect(creditorList.nativeElement.getAttribute('aria-label')).toBe('Creditor debt distribution list');
    });

    it('should have role="listitem" for creditor items', () => {
      component.creditorData = mockCreditorData;
      fixture.detectChanges();

      const creditorItems = fixture.debugElement.queryAll(By.css('.creditor-item'));
      creditorItems.forEach((item: DebugElement) => {
        expect(item.nativeElement.getAttribute('role')).toBe('listitem');
        expect(item.nativeElement.getAttribute('aria-label')).toBeTruthy();
      });
    });

    it('should have progressbar role with proper attributes', () => {
      component.creditorData = mockCreditorData;
      fixture.detectChanges();

      const progressBars = fixture.debugElement.queryAll(By.css('.creditor-bar'));
      progressBars.forEach((bar: DebugElement) => {
        expect(bar.nativeElement.getAttribute('role')).toBe('progressbar');
        expect(bar.nativeElement.getAttribute('aria-valuemin')).toBe('0');
        expect(bar.nativeElement.getAttribute('aria-valuemax')).toBe('100');
        expect(bar.nativeElement.getAttribute('aria-valuenow')).toBeTruthy();
        expect(bar.nativeElement.getAttribute('aria-label')).toBeTruthy();
      });
    });

    it('should have no tabindex on non-interactive elements', () => {
      component.creditorData = mockCreditorData;
      fixture.detectChanges();

      const articles = fixture.debugElement.queryAll(By.css('article'));
      const sections = fixture.debugElement.queryAll(By.css('section'));
      const allElements = [...articles, ...sections];

      allElements.forEach((el: DebugElement) => {
        expect(el.nativeElement.getAttribute('tabindex')).toBeNull();
      });
    });

    it('should replace emoji with accessible SVG icon', () => {
      component.creditorData = {};
      fixture.detectChanges();

      const noDataIcon = fixture.debugElement.query(By.css('.no-data-icon'));
      const svg = noDataIcon.query(By.css('svg'));
      expect(svg).toBeTruthy();
      expect(noDataIcon.nativeElement.getAttribute('aria-label')).toBe('Chart icon');
    });

    it('should have region role with proper labeling', () => {
      fixture.detectChanges();

      const container = fixture.debugElement.query(By.css('.creditor-chart-container'));
      expect(container.nativeElement.getAttribute('role')).toBe('region');
      expect(container.nativeElement.getAttribute('aria-labelledby')).toBe('creditorChartTitle');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty creditor data', () => {
      component.creditorData = {};
      fixture.detectChanges();

      expect(component.hasCreditorData).toBe(false);
      expect(component.creditorEntries.length).toBe(0);
      expect(component.totalDebt).toBe(0);
      expect(component.creditorCount).toBe(0);
    });

    it('should handle single creditor', () => {
      component.creditorData = { 'Single Creditor': 1000 };
      fixture.detectChanges();

      expect(component.hasCreditorData).toBe(true);
      expect(component.creditorEntries.length).toBe(1);
      expect(component.totalDebt).toBe(1000);
      expect(component.getCreditorPercentage(1000)).toBe(100);
    });

    it('should handle zero values correctly', () => {
      component.creditorData = { 'Zero Debt': 0 };
      fixture.detectChanges();

      expect(component.totalDebt).toBe(0);
      expect(component.getCreditorPercentage(0)).toBe(0);
    });

    it('should handle very large numbers', () => {
      const largeData = { 'Large Debt': 999999999 };
      component.creditorData = largeData;
      fixture.detectChanges();

      expect(component.totalDebt).toBe(999999999);
      expect(component.getCreditorPercentage(999999999)).toBe(100);
    });
  });

  describe('Performance - Caching', () => {
    it('should cache computed values', () => {
      component.creditorData = mockCreditorData;
      fixture.detectChanges();

      const firstEntries = component.creditorEntries;
      const firstTotal = component.totalDebt;

      const secondEntries = component.creditorEntries;
      const secondTotal = component.totalDebt;

      expect(firstEntries).toBe(secondEntries);
      expect(firstTotal).toBe(secondTotal);
    });

    it('should invalidate cache when data changes', () => {
      component.creditorData = mockCreditorData;
      fixture.detectChanges();

      const firstEntries = component.creditorEntries;

      component.creditorData = { 'New Creditor': 1000 };
      fixture.detectChanges();

      const secondEntries = component.creditorEntries;
      expect(firstEntries).not.toBe(secondEntries);
      expect(secondEntries.length).toBe(1);
    });
  });

  describe('TrackBy Function', () => {
    it('should return creditor key for trackBy', () => {
      const creditor = { key: 'Test Creditor', value: 1000 };
      expect(component.trackByCreditor(0, creditor)).toBe('Test Creditor');
    });
  });

  describe('SSR Safety', () => {
    it('should initialize without errors on server platform', async () => {
      TestBed.resetTestingModule();
      
      await TestBed.configureTestingModule({
        imports: [DebtCreditorChartComponent],
        providers: [
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      }).compileComponents();

      const serverFixture = TestBed.createComponent(DebtCreditorChartComponent);
      serverFixture.componentInstance.creditorData = mockCreditorData;
      
      expect(() => {
        serverFixture.componentInstance.ngOnInit();
        serverFixture.detectChanges();
      }).not.toThrow();
      
      expect(serverFixture.componentInstance).toBeTruthy();
    });
  });
});

