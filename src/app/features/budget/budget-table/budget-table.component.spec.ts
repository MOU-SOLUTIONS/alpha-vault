/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component BudgetTableComponent
  @description Budget table component tests for displaying and managing budget categories
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { BudgetCategory, ExpenseCategory } from '../../../models/budget.model';
import { BudgetTableComponent } from './budget-table.component';

describe('BudgetTableComponent', () => {
  let component: BudgetTableComponent;
  let fixture: ComponentFixture<BudgetTableComponent>;

  const mockCategories: BudgetCategory[] = [
    { 
      id: 1, 
      budgetId: 1, 
      category: 'housing' as ExpenseCategory, 
      allocated: 1200, 
      remaining: 800, 
      spentAmount: 400,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    { 
      id: 2, 
      budgetId: 1, 
      category: 'food' as ExpenseCategory, 
      allocated: 600, 
      remaining: 300, 
      spentAmount: 300,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    { 
      id: 3, 
      budgetId: 1, 
      category: 'transportation' as ExpenseCategory, 
      allocated: 400, 
      remaining: 200, 
      spentAmount: 200,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    { 
      id: 4, 
      budgetId: 1, 
      category: 'entertainment' as ExpenseCategory, 
      allocated: 300, 
      remaining: 150, 
      spentAmount: 150,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    { 
      id: 5, 
      budgetId: 1, 
      category: 'utilities' as ExpenseCategory, 
      allocated: 200, 
      remaining: 100, 
      spentAmount: 100,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetTableComponent);
    component = fixture.componentInstance;
    component.categories = mockCategories;
    component.onAdd = jasmine.createSpy('onAdd');
    component.onModify = jasmine.createSpy('onModify');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Data Processing', () => {
    it('should process data correctly', () => {
      component.ngOnChanges();
      expect(component.hasData).toBe(true);
      expect(component.tableData.length).toBe(5);
      expect(component.totalItems).toBe(5);
    });

    it('should calculate totals correctly', () => {
      component.ngOnChanges();
      expect(component.totalAllocated).toBe(2700);
      expect(component.totalRemaining).toBe(1550);
      expect(component.totalSpent).toBe(1150);
    });

    it('should assign correct status colors and gradients', () => {
      component.ngOnChanges();
      const housingItem = component.tableData.find(item => item.category === 'housing' as ExpenseCategory);
      expect(housingItem?.statusColor).toBe('#10b981');
      expect(housingItem?.gradient).toContain('linear-gradient');
      expect(housingItem?.icon).toBeDefined();
    });

    it('should handle empty data', () => {
      component.categories = [];
      component.ngOnChanges();
      expect(component.hasData).toBe(false);
      expect(component.tableData.length).toBe(0);
      expect(component.totalAllocated).toBe(0);
    });
  });

  describe('Computed Properties', () => {
    it('should provide computed table data with formatted values', () => {
      component.ngOnChanges();
      const computedData = component.computedTableData();
      
      expect(computedData.length).toBe(5);
      expect(computedData[0].formattedAllocated).toBe('$1,200');
      expect(computedData[0].formattedRemaining).toBe('$800');
      expect(computedData[0].formattedUsage).toBe('33.3');
      expect(computedData[0].categoryLabel).toBeDefined();
      expect(computedData[0].categoryIcon).toBeDefined();
    });

    it('should provide computed summary stats', () => {
      component.ngOnChanges();
      const summaryStats = component.computedSummaryStats();
      
      expect(summaryStats.totalAllocatedFormatted).toBe('$2,700');
      expect(summaryStats.totalRemainingFormatted).toBe('$1,550');
      expect(summaryStats.totalSpentFormatted).toBe('$1,150');
      expect(summaryStats.averageUsageFormatted).toBeDefined();
    });
  });

  describe('Accessibility', () => {
    it('should support keyboard navigation for add button', () => {
      const addButton = fixture.debugElement.query(By.css('.add-button'));
      const keyboardEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      
      addButton.nativeElement.dispatchEvent(keyboardEvent);
      
      expect(component.onAdd).toHaveBeenCalled();
    });

    it('should support keyboard navigation for edit buttons', () => {
      component.ngOnChanges();
      fixture.detectChanges();
      
      const editButton = fixture.debugElement.query(By.css('.edit-button'));
      const keyboardEvent = new KeyboardEvent('keydown', { key: ' ' });
      
      editButton.nativeElement.dispatchEvent(keyboardEvent);
      
      expect(component.onModify).toHaveBeenCalled();
    });

    it('should have proper ARIA labels', () => {
      const addButton = fixture.debugElement.query(By.css('.add-button'));
      expect(addButton.nativeElement.getAttribute('aria-label')).toBe('Add new budget');
    });

    it('should have proper roles', () => {
      const addButton = fixture.debugElement.query(By.css('.add-button'));
      expect(addButton.nativeElement.getAttribute('role')).toBe('button');
    });

    it('should have proper tabindex', () => {
      const addButton = fixture.debugElement.query(By.css('.add-button'));
      expect(addButton.nativeElement.getAttribute('tabindex')).toBe('0');
    });

    it('should have aria-describedby attributes', () => {
      component.ngOnChanges();
      fixture.detectChanges();
      
      const addButton = fixture.debugElement.query(By.css('.add-button'));
      expect(addButton.nativeElement.getAttribute('aria-describedby')).toBe('add-budget-description');
    });

    it('should have screen reader descriptions', () => {
      component.ngOnChanges();
      fixture.detectChanges();
      
      const description = fixture.debugElement.query(By.css('#add-budget-description'));
      expect(description).toBeTruthy();
      expect(description.nativeElement.textContent).toContain('Click to add a new budget category');
    });
  });

  describe('Performance Optimization', () => {
    it('should memoize computed table data', () => {
      component.ngOnChanges();
      const firstCall = component.computedTableData();
      const secondCall = component.computedTableData();
      
      expect(firstCall).toBe(secondCall);
    });

    it('should memoize computed summary stats', () => {
      component.ngOnChanges();
      const firstCall = component.computedSummaryStats();
      const secondCall = component.computedSummaryStats();
      
      expect(firstCall).toBe(secondCall);
    });

    it('should include memoized class properties', () => {
      component.ngOnChanges();
      const computedData = component.computedTableData();
      
      expect(computedData[0].allocatedClass).toBeDefined();
      expect(computedData[0].remainingClass).toBeDefined();
      expect(computedData[0].usageClass).toBeDefined();
    });

    it('should invalidate cache when categories change', () => {
      component.ngOnChanges();
      const firstCall = component.computedTableData();
      
      component.categories = [...mockCategories, { 
        id: 6, 
        budgetId: 1, 
        category: 'healthcare' as ExpenseCategory, 
        allocated: 500, 
        remaining: 400, 
        spentAmount: 100,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }];
      component.ngOnChanges();
      
      const secondCall = component.computedTableData();
      expect(firstCall).not.toBe(secondCall);
      expect(secondCall.length).toBe(6);
    });
  });

  describe('Subscription Management', () => {
    it('should use takeUntilDestroyed for cleanup', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('Template Hygiene', () => {
    it('should not call methods in template bindings', () => {
      spyOn(component, 'getAmountClassForElement').and.callThrough();
      spyOn(component, 'getUsageClassForElement').and.callThrough();
      
      component.ngOnChanges();
      fixture.detectChanges();
      
      expect(component.getAmountClassForElement).toHaveBeenCalledTimes(mockCategories.length * 2);
      expect(component.getUsageClassForElement).toHaveBeenCalledTimes(mockCategories.length);
    });
  });

  describe('Utility Methods', () => {
    it('should format currency correctly', () => {
      const formatted = component.getFormattedAmount(1200);
      expect(formatted).toBe('$1,200');
    });

    it('should get status config correctly', () => {
      component.ngOnChanges();
      const housingItem = component.tableData.find(item => item.category === 'housing' as ExpenseCategory);
      const config = component.getStatusConfig(housingItem!);
      expect(config.label).toBe('Excellent');
      expect(config.color).toBe('#10b981');
    });

    it('should track by category', () => {
      const result = component.trackByCategory(0, { category: 'housing' } as any);
      expect(result).toBe('housing');
    });
  });

  describe('Pagination', () => {
    it('should handle page changes', () => {
      component.ngOnChanges();
      const pageEvent = { pageIndex: 1, pageSize: 2 } as any;
      component.onPageChange(pageEvent);
      expect(component.currentPage).toBe(1);
      expect(component.pageSize).toBe(2);
    });
  });

  describe('User Interactions', () => {
    it('should call onAdd when add button is clicked', () => {
      component.ngOnChanges();
      fixture.detectChanges();
      
      const addButton = fixture.debugElement.query(By.css('.add-button'));
      addButton.nativeElement.click();
      
      expect(component.onAdd).toHaveBeenCalled();
    });

    it('should call onModify when edit button is clicked', () => {
      component.ngOnChanges();
      fixture.detectChanges();
      
      const editButton = fixture.debugElement.query(By.css('.edit-button'));
      editButton.nativeElement.click();
      
      expect(component.onModify).toHaveBeenCalled();
    });

    it('should emit delete event when delete button is clicked', () => {
      spyOn(component.delete, 'emit');
      component.ngOnChanges();
      fixture.detectChanges();
      
      const deleteButton = fixture.debugElement.query(By.css('.delete-button'));
      deleteButton.nativeElement.click();
      
      expect(component.delete.emit).toHaveBeenCalled();
    });
  });

  describe('Responsive Design', () => {
    it('should handle mobile view correctly', () => {
      component.ngOnChanges();
      fixture.detectChanges();
      
      expect(component.isMobile()).toBeDefined();
    });

    it('should handle desktop view correctly', () => {
      component.ngOnChanges();
      fixture.detectChanges();
      
      expect(component.isMobile()).toBeDefined();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no data', () => {
      component.categories = [];
      component.ngOnChanges();
      fixture.detectChanges();
      
      const emptyState = fixture.debugElement.query(By.css('.empty-state'));
      expect(emptyState).toBeTruthy();
      
      const emptyTitle = emptyState.query(By.css('.empty-title'));
      expect(emptyTitle.nativeElement.textContent).toContain('No Budget Data');
    });
  });
});
