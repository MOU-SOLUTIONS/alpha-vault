/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component SavingFilterComponent
  @description Saving filter component tests for filtering saving goals
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SavingFilterComponent } from './saving-filter.component';

describe('SavingFilterComponent', () => {
  let component: SavingFilterComponent;
  let fixture: ComponentFixture<SavingFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavingFilterComponent, NoopAnimationsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavingFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Filter Functionality', () => {
    it('should emit filter change when category changes', () => {
      spyOn(component.filterChange, 'emit');
      
      component.selectedCategory.set('HEALTH');
      component.onCategoryChange();
      
      expect(component.filterChange.emit).toHaveBeenCalledWith({
        category: 'HEALTH',
        priority: 'ALL'
      });
    });

    it('should emit filter change when priority changes', () => {
      spyOn(component.filterChange, 'emit');
      
      component.selectedPriority.set('HIGH');
      component.onPriorityChange();
      
      expect(component.filterChange.emit).toHaveBeenCalledWith({
        category: 'ALL',
        priority: 'HIGH'
      });
    });

    it('should reset filters correctly', () => {
      spyOn(component.filterChange, 'emit');
      
      component.selectedCategory.set('HEALTH');
      component.selectedPriority.set('HIGH');
      component.resetFilters();
      
      expect(component.selectedCategory()).toBe('ALL');
      expect(component.selectedPriority()).toBe('ALL');
      expect(component.filterChange.emit).toHaveBeenCalledWith({
        category: 'ALL',
        priority: 'ALL'
      });
    });

    it('should clear category filter correctly', () => {
      spyOn(component.filterChange, 'emit');
      
      component.selectedCategory.set('HEALTH');
      component.clearCategory();
      
      expect(component.selectedCategory()).toBe('ALL');
      expect(component.filterChange.emit).toHaveBeenCalledWith({
        category: 'ALL',
        priority: 'ALL'
      });
    });

    it('should clear priority filter correctly', () => {
      spyOn(component.filterChange, 'emit');
      
      component.selectedPriority.set('HIGH');
      component.clearPriority();
      
      expect(component.selectedPriority()).toBe('ALL');
      expect(component.filterChange.emit).toHaveBeenCalledWith({
        category: 'ALL',
        priority: 'ALL'
      });
    });
  });

  describe('Computed Properties', () => {
    it('should correctly identify active filters', () => {
      expect(component.hasActiveFilters()).toBe(false);
      
      component.selectedCategory.set('HEALTH');
      expect(component.hasActiveFilters()).toBe(true);
      
      component.selectedCategory.set('ALL');
      component.selectedPriority.set('HIGH');
      expect(component.hasActiveFilters()).toBe(true);
    });

    it('should return correct category labels', () => {
      expect(component.categoryLabel()).toBe('All Categories');
      
      component.selectedCategory.set('HEALTH');
      expect(component.categoryLabel()).toBe('Health');
      
      component.selectedCategory.set('EDUCATION');
      expect(component.categoryLabel()).toBe('Education');
    });

    it('should return correct priority labels', () => {
      expect(component.priorityLabel()).toBe('All Priorities');
      
      component.selectedPriority.set('HIGH');
      expect(component.priorityLabel()).toBe('High');
      
      component.selectedPriority.set('MEDIUM');
      expect(component.priorityLabel()).toBe('Medium');
      
      component.selectedPriority.set('LOW');
      expect(component.priorityLabel()).toBe('Low');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const categorySelect = fixture.debugElement.query(By.css('#categorySelect'));
      const prioritySelect = fixture.debugElement.query(By.css('#prioritySelect'));
      const resetButton = fixture.debugElement.query(By.css('.reset-btn'));
      
      expect(categorySelect.attributes['aria-label']).toBe('Select goal category');
      expect(prioritySelect.attributes['aria-label']).toBe('Select priority level');
      expect(resetButton.attributes['aria-label']).toBe('Reset all filters');
    });

    it('should have proper ARIA descriptions', () => {
      const categoryDescription = fixture.debugElement.query(By.css('#categoryDescription'));
      const priorityDescription = fixture.debugElement.query(By.css('#priorityDescription'));
      
      expect(categoryDescription).toBeTruthy();
      expect(priorityDescription).toBeTruthy();
      expect(categoryDescription.nativeElement.textContent.trim()).toContain('Select a category to filter saving goals');
      expect(priorityDescription.nativeElement.textContent.trim()).toContain('Select a priority level to filter saving goals');
    });

    it('should support keyboard navigation', () => {
      const categorySelect = fixture.debugElement.query(By.css('#categorySelect'));
      const prioritySelect = fixture.debugElement.query(By.css('#prioritySelect'));
      const resetButton = fixture.debugElement.query(By.css('.reset-btn'));
      
      expect(categorySelect.listeners.some(l => l.name === 'keydown.enter')).toBe(true);
      expect(prioritySelect.listeners.some(l => l.name === 'keydown.enter')).toBe(true);
      expect(resetButton.listeners.some(l => l.name === 'keydown.enter')).toBe(true);
    });

    it('should have proper chip ARIA labels when filters are active', () => {
      component.selectedCategory.set('HEALTH');
      component.selectedPriority.set('HIGH');
      fixture.detectChanges();
      
      const categoryChip = fixture.debugElement.query(By.css('mat-chip[aria-label="Remove category filter"]'));
      const priorityChip = fixture.debugElement.query(By.css('mat-chip[aria-label="Remove priority filter"]'));
      
      expect(categoryChip).toBeTruthy();
      expect(priorityChip).toBeTruthy();
    });
  });

  describe('TrackBy Functions', () => {
    it('should track categories by value', () => {
      const mockCategory = { value: 'HEALTH', label: 'Health' };
      expect(component.trackByCategory(0, mockCategory)).toBe('HEALTH');
    });

    it('should track priorities by value', () => {
      const mockPriority = { value: 'HIGH', label: 'High' };
      expect(component.trackByPriority(0, mockPriority)).toBe('HIGH');
    });
  });

  describe('Template Integration', () => {
    it('should display active filters when filters are applied', () => {
      component.selectedCategory.set('HEALTH');
      fixture.detectChanges();
      
      const activeFilters = fixture.debugElement.query(By.css('.active-filters'));
      expect(activeFilters).toBeTruthy();
    });

    it('should hide active filters when no filters are applied', () => {
      expect(component.hasActiveFilters()).toBe(false);
      fixture.detectChanges();
      
      const activeFilters = fixture.debugElement.query(By.css('.active-filters'));
      expect(activeFilters).toBeFalsy();
    });

    it('should disable reset button when no filters are active', () => {
      expect(component.hasActiveFilters()).toBe(false);
      fixture.detectChanges();
      
      const resetButton = fixture.debugElement.query(By.css('.reset-btn'));
      expect(resetButton.attributes['disabled']).toBeDefined();
    });

    it('should enable reset button when filters are active', () => {
      component.selectedCategory.set('HEALTH');
      fixture.detectChanges();
      
      const resetButton = fixture.debugElement.query(By.css('.reset-btn'));
      expect(resetButton.attributes['disabled']).toBeFalsy();
    });
  });

  describe('Form Integration', () => {
    it('should update selectedCategory when select value changes', () => {
      const categorySelect = fixture.debugElement.query(By.css('#categorySelect'));
      
      categorySelect.nativeElement.value = 'HEALTH';
      categorySelect.nativeElement.dispatchEvent(new Event('change'));
      
      expect(component.selectedCategory()).toBe('HEALTH');
    });

    it('should update selectedPriority when select value changes', () => {
      const prioritySelect = fixture.debugElement.query(By.css('#prioritySelect'));
      
      prioritySelect.nativeElement.value = 'HIGH';
      prioritySelect.nativeElement.dispatchEvent(new Event('change'));
      
      expect(component.selectedPriority()).toBe('HIGH');
    });
  });
});
