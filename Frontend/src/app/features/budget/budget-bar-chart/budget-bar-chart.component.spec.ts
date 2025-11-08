/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component BudgetBarChartComponent
  @description Budget bar chart component tests for displaying budget data visualization
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetBarChartComponent } from './budget-bar-chart.component';

describe('BudgetBarChartComponent', () => {
  let component: BudgetBarChartComponent;
  let fixture: ComponentFixture<BudgetBarChartComponent>;

  const mockChartData = [
    { category: 'Housing', allocated: 1200, remaining: 800 },
    { category: 'Food', allocated: 600, remaining: 300 },
    { category: 'Transportation', allocated: 400, remaining: 200 },
    { category: 'Entertainment', allocated: 300, remaining: 150 },
    { category: 'Utilities', allocated: 200, remaining: 100 }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetBarChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetBarChartComponent);
    component = fixture.componentInstance;
    component.chartData = mockChartData;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should process chart data correctly', () => {
    expect(component.hasData).toBe(true);
    expect(component.totalAllocated).toBe(2700);
    expect(component.totalRemaining).toBe(1550);
    expect(component.totalSpent).toBe(1150);
    expect(component.budgetData.length).toBe(5);
  });

  it('should calculate spent amounts correctly', () => {
    const housingData = component.budgetData.find(item => item.category === 'Housing');
    expect(housingData?.spent).toBe(400);
    
    const foodData = component.budgetData.find(item => item.category === 'Food');
    expect(foodData?.spent).toBe(300);
  });

  it('should calculate percentages correctly', () => {
    const housingData = component.budgetData.find(item => item.category === 'Housing');
    expect(housingData?.percentage).toBeCloseTo(33.33, 1);
    
    const utilitiesData = component.budgetData.find(item => item.category === 'Utilities');
    expect(utilitiesData?.percentage).toBeCloseTo(50, 1);
  });

  it('should assign colors, gradients, and icons to categories', () => {
    component.budgetData.forEach(category => {
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
    expect(component.getTotalAllocatedFormatted()).toBe('$2,700');
    expect(component.getTotalRemainingFormatted()).toBe('$1,550');
    expect(component.getTotalSpentFormatted()).toBe('$1,150');
    
    const housingData = component.budgetData.find(item => item.category === 'Housing');
    expect(component.getCategoryAllocated(housingData!)).toBe('$1,200');
    expect(component.getCategoryRemaining(housingData!)).toBe('$800');
  });

  it('should format percentage correctly', () => {
    const housingData = component.budgetData.find(item => item.category === 'Housing');
    expect(component.getCategoryPercentage(housingData!)).toBe('33.3');
  });

  it('should handle empty data gracefully', () => {
    component.chartData = [];
    component.ngOnChanges();
    fixture.detectChanges();
    
    expect(component.hasData).toBe(false);
    expect(component.totalAllocated).toBe(0);
    expect(component.totalRemaining).toBe(0);
    expect(component.totalSpent).toBe(0);
    expect(component.budgetData.length).toBe(0);
  });

  it('should handle null data gracefully', () => {
    component.chartData = null as any;
    component.ngOnChanges();
    fixture.detectChanges();
    
    expect(component.hasData).toBe(false);
    expect(component.totalAllocated).toBe(0);
    expect(component.totalRemaining).toBe(0);
    expect(component.totalSpent).toBe(0);
    expect(component.budgetData.length).toBe(0);
  });

  it('should respect maxBars limit', () => {
    component.maxBars = 3;
    component.ngOnChanges();
    fixture.detectChanges();
    
    expect(component.budgetData.length).toBe(3);
    expect(component.budgetData[0].category).toBe('Housing');
    expect(component.budgetData[1].category).toBe('Food');
    expect(component.budgetData[2].category).toBe('Transportation');
  });

  it('should have proper trackBy function', () => {
    const category = component.budgetData[0];
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
    expect(section.getAttribute('aria-label')).toBe('Budget Allocation Bar Chart');
    expect(section.getAttribute('aria-live')).toBe('polite');
  });

  it('should have accessible chart canvas', () => {
    const canvas = fixture.debugElement.nativeElement.querySelector('canvas');
    expect(canvas.getAttribute('role')).toBe('img');
    expect(canvas.getAttribute('aria-label')).toBe('Bar chart showing budget allocation vs remaining by category');
  });

  it('should display empty state when no data', () => {
    component.chartData = [];
    component.ngOnChanges();
    fixture.detectChanges();
    
    const emptyState = fixture.debugElement.nativeElement.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
    
    const emptyTitle = emptyState.querySelector('.empty-title');
    expect(emptyTitle.textContent).toBe('No Budget Data Available');
  });

  it('should have accessible action button in empty state', () => {
    component.chartData = [];
    component.ngOnChanges();
    fixture.detectChanges();
    
    const actionButton = fixture.debugElement.nativeElement.querySelector('.action-button');
    expect(actionButton.getAttribute('role')).toBe('button');
    expect(actionButton.getAttribute('tabindex')).toBe('0');
  });

  it('should show breakdown when showLegend is true', () => {
    component.showLegend = true;
    fixture.detectChanges();
    
    const breakdownSection = fixture.debugElement.nativeElement.querySelector('.breakdown-section');
    expect(breakdownSection).toBeTruthy();
  });

  it('should hide breakdown when showLegend is false', () => {
    component.showLegend = false;
    fixture.detectChanges();
    
    const breakdownSection = fixture.debugElement.nativeElement.querySelector('.breakdown-section');
    expect(breakdownSection).toBeFalsy();
  });

  it('should display correct number of breakdown items', () => {
    component.showLegend = true;
    fixture.detectChanges();
    
    const breakdownItems = fixture.debugElement.nativeElement.querySelectorAll('.breakdown-item');
    expect(breakdownItems.length).toBe(5);
  });

  it('should have proper chart options configured', () => {
    expect(component.barChartOptions.responsive).toBe(true);
    expect(component.barChartOptions.maintainAspectRatio).toBe(true);
    expect(component.barChartOptions.plugins?.tooltip?.displayColors).toBe(true);
  });

  it('should use theme colors in chart data', () => {
    const allocatedDataset = component.barChartData.datasets[0];
    const remainingDataset = component.barChartData.datasets[1];
    
    expect(allocatedDataset.backgroundColor).toBe('#065f46');
    expect(allocatedDataset.borderColor).toBe('#047857');
    expect(remainingDataset.backgroundColor).toBe('#10b981');
    expect(remainingDataset.borderColor).toBe('#059669');
  });

  it('should handle single category data', () => {
    component.chartData = [{ category: 'Single Category', allocated: 1000, remaining: 500 }];
    component.ngOnChanges();
    fixture.detectChanges();
    
    expect(component.hasData).toBe(true);
    expect(component.totalAllocated).toBe(1000);
    expect(component.totalRemaining).toBe(500);
    expect(component.totalSpent).toBe(500);
    expect(component.budgetData.length).toBe(1);
    expect(component.budgetData[0].percentage).toBe(50);
  });

  it('should handle zero remaining amounts', () => {
    component.chartData = [{ category: 'Fully Spent', allocated: 1000, remaining: 0 }];
    component.ngOnChanges();
    fixture.detectChanges();
    
    expect(component.hasData).toBe(true);
    expect(component.budgetData[0].spent).toBe(1000);
    expect(component.budgetData[0].percentage).toBe(100);
  });

  it('should handle zero allocated amounts', () => {
    component.chartData = [{ category: 'No Budget', allocated: 0, remaining: 0 }];
    component.ngOnChanges();
    fixture.detectChanges();
    
    expect(component.hasData).toBe(true);
    expect(component.budgetData[0].spent).toBe(0);
    expect(component.budgetData[0].percentage).toBe(0);
  });

  it('should display stat cards with proper data', () => {
    const statCards = fixture.debugElement.nativeElement.querySelectorAll('.stat-card');
    expect(statCards.length).toBe(3);
    
    const allocatedCard = statCards[0];
    const remainingCard = statCards[1];
    const spentCard = statCards[2];
    
    expect(allocatedCard.classList.contains('allocated')).toBe(true);
    expect(remainingCard.classList.contains('remaining')).toBe(true);
    expect(spentCard.classList.contains('spent')).toBe(true);
  });

  it('should have category icons with gradients', () => {
    component.showLegend = true;
    fixture.detectChanges();
    
    const categoryIcons = fixture.debugElement.nativeElement.querySelectorAll('.category-icon');
    expect(categoryIcons.length).toBe(5);
    
    categoryIcons.forEach((icon: any) => {
      expect(icon.style.background).toContain('linear-gradient');
    });
  });

  it('should have computed properties for template optimization', () => {
    expect(component.topCategoriesCount).toBe(5);
    expect(component.topCategories.length).toBe(5);
    expect(component.topCategories[0].category).toBe('Housing');
  });

  it('should handle keyboard activation of action button', () => {
    component.chartData = [];
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
    component.chartData = [];
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
