/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component BudgetPieChartComponent
  @description Budget pie chart component tests for displaying budget data visualization
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetPieChartComponent } from './budget-pie-chart.component';

describe('BudgetPieChartComponent', () => {
  let component: BudgetPieChartComponent;
  let fixture: ComponentFixture<BudgetPieChartComponent>;

  const mockChartData = {
    'Housing': 1200,
    'Food': 800,
    'Transportation': 400,
    'Entertainment': 300,
    'Utilities': 200
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetPieChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetPieChartComponent);
    component = fixture.componentInstance;
    component.chartData = mockChartData;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should process chart data correctly', () => {
    expect(component.hasData).toBe(true);
    expect(component.totalBudget).toBe(2900);
    expect(component.categories.length).toBe(5);
  });

  it('should sort categories by amount descending', () => {
    const sortedCategories = component.categories;
    expect(sortedCategories[0].category).toBe('Housing');
    expect(sortedCategories[0].amount).toBe(1200);
    expect(sortedCategories[4].category).toBe('Utilities');
    expect(sortedCategories[4].amount).toBe(200);
  });

  it('should calculate percentages correctly', () => {
    const housingCategory = component.categories.find(c => c.category === 'Housing');
    expect(housingCategory?.percentage).toBeCloseTo(41.38, 1);
    
    const utilitiesCategory = component.categories.find(c => c.category === 'Utilities');
    expect(utilitiesCategory?.percentage).toBeCloseTo(6.90, 1);
  });

  it('should assign colors and gradients to categories', () => {
    component.categories.forEach(category => {
      expect(category.color).toBeTruthy();
      expect(category.gradient).toBeTruthy();
      expect(category.icon).toBeTruthy();
    });
  });

  it('should get top categories correctly', () => {
    const top3 = component.getTopCategories(3);
    expect(top3.length).toBe(3);
    expect(top3[0].category).toBe('Housing');
    expect(top3[1].category).toBe('Food');
    expect(top3[2].category).toBe('Transportation');
  });

  it('should format currency correctly', () => {
    expect(component.getTotalFormatted()).toBe('$2,900');
    expect(component.getCategoryAmount(component.categories[0])).toBe('$1,200');
  });

  it('should format percentage correctly', () => {
    const housingCategory = component.categories.find(c => c.category === 'Housing');
    expect(component.getCategoryPercentage(housingCategory!)).toBe('41.4');
  });

  it('should handle empty data gracefully', () => {
    component.chartData = {};
    component.ngOnChanges();
    fixture.detectChanges();
    
    expect(component.hasData).toBe(false);
    expect(component.totalBudget).toBe(0);
    expect(component.categories.length).toBe(0);
  });

  it('should handle null data gracefully', () => {
    component.chartData = null as any;
    component.ngOnChanges();
    fixture.detectChanges();
    
    expect(component.hasData).toBe(false);
    expect(component.totalBudget).toBe(0);
    expect(component.categories.length).toBe(0);
  });

  it('should have proper trackBy function', () => {
    const category = component.categories[0];
    expect(component.trackByCategory(0, category)).toBe(category.category);
  });

  it('should animate in after initialization', (done) => {
    component.isVisible = false;
    fixture.detectChanges();
    
    setTimeout(() => {
      expect(component.isVisible).toBe(true);
      done();
    }, 300);
  });

  it('should have proper ARIA attributes', () => {
    const section = fixture.debugElement.nativeElement.querySelector('section');
    expect(section.getAttribute('role')).toBe('region');
    expect(section.getAttribute('aria-label')).toBe('Budget Allocation Chart');
    expect(section.getAttribute('aria-live')).toBe('polite');
  });

  it('should have accessible chart canvas', () => {
    const canvas = fixture.debugElement.nativeElement.querySelector('canvas');
    expect(canvas.getAttribute('role')).toBe('img');
    expect(canvas.getAttribute('aria-label')).toBe('Pie chart showing budget allocation by category');
  });

  it('should display empty state when no data', () => {
    component.chartData = {};
    component.ngOnChanges();
    fixture.detectChanges();
    
    const emptyState = fixture.debugElement.nativeElement.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
    
    const emptyTitle = emptyState.querySelector('.empty-title');
    expect(emptyTitle.textContent).toBe('No Budget Data Available');
  });

  it('should have accessible action button in empty state', () => {
    component.chartData = {};
    component.ngOnChanges();
    fixture.detectChanges();
    
    const actionButton = fixture.debugElement.nativeElement.querySelector('.action-button');
    expect(actionButton.getAttribute('role')).toBe('button');
    expect(actionButton.getAttribute('tabindex')).toBe('0');
  });

  it('should show legend when showLegend is true', () => {
    component.showLegend = true;
    fixture.detectChanges();
    
    const legendSection = fixture.debugElement.nativeElement.querySelector('.legend-section');
    expect(legendSection).toBeTruthy();
  });

  it('should hide legend when showLegend is false', () => {
    component.showLegend = false;
    fixture.detectChanges();
    
    const legendSection = fixture.debugElement.nativeElement.querySelector('.legend-section');
    expect(legendSection).toBeFalsy();
  });

  it('should display correct number of legend items', () => {
    component.showLegend = true;
    fixture.detectChanges();
    
    const legendItems = fixture.debugElement.nativeElement.querySelectorAll('.legend-item');
    expect(legendItems.length).toBe(5);
  });

  it('should have proper chart options configured', () => {
    expect(component.pieChartOptions.responsive).toBe(true);
    expect(component.pieChartOptions.maintainAspectRatio).toBe(true);
    expect(component.pieChartOptions.plugins?.tooltip?.displayColors).toBe(true);
  });

  it('should use theme colors in chart data', () => {
    const backgroundColor = component.pieChartData.datasets[0].backgroundColor;
    expect(backgroundColor).toContain('#065f46');
    expect(backgroundColor).toContain('#047857');
  });

  it('should handle single category data', () => {
    component.chartData = { 'Single Category': 1000 };
    component.ngOnChanges();
    fixture.detectChanges();
    
    expect(component.hasData).toBe(true);
    expect(component.totalBudget).toBe(1000);
    expect(component.categories.length).toBe(1);
    expect(component.categories[0].percentage).toBe(100);
  });

  it('should handle zero amount categories', () => {
    component.chartData = { 'Category A': 1000, 'Category B': 0 };
    component.ngOnChanges();
    fixture.detectChanges();
    
    expect(component.hasData).toBe(true);
    expect(component.totalBudget).toBe(1000);
    expect(component.categories.length).toBe(2);
    expect(component.categories[1].percentage).toBe(0);
  });

  it('should have computed properties for template optimization', () => {
    expect(component.topCategoriesCount).toBe(5);
    expect(component.topCategories.length).toBe(5);
    expect(component.topCategories[0].category).toBe('Housing');
  });

  it('should handle keyboard activation of action button', () => {
    component.chartData = {};
    component.ngOnChanges();
    fixture.detectChanges();
    
    const actionButton = fixture.debugElement.nativeElement.querySelector('.action-button');
    spyOn(component, 'onActionButtonClick');
    
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    actionButton.dispatchEvent(enterEvent);
    
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    actionButton.dispatchEvent(spaceEvent);
    
    expect(component.onActionButtonClick).toHaveBeenCalledTimes(2);
  });

  it('should prevent default behavior on keyboard events', () => {
    component.chartData = {};
    component.ngOnChanges();
    fixture.detectChanges();
    
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    spyOn(enterEvent, 'preventDefault');
    
    component.onActionButtonKeydown(enterEvent);
    
    expect(enterEvent.preventDefault).toHaveBeenCalled();
  });

  it('should use requestAnimationFrame for animation', (done) => {
    spyOn(window, 'requestAnimationFrame').and.callFake((callback) => {
      callback(0);
      return 0;
    });
    
    component.ngOnInit();
    
    expect(window.requestAnimationFrame).toHaveBeenCalled();
    expect(component.isVisible).toBe(true);
    done();
  });
});
