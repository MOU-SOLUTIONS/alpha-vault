/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component SavingTableComponent
  @description Test suite for saving table component
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SavingGoalResponseDTO } from '../../../models/saving.model';
import { SavingTableEmptyComponent } from './components/saving-table-empty/saving-table-empty.component';
import { SavingTableComponent } from './saving-table.component';

describe('SavingTableComponent', () => {
  let component: SavingTableComponent;
  let fixture: ComponentFixture<SavingTableComponent>;

  const mockGoals: SavingGoalResponseDTO[] = [
    {
      id: 1,
      userId: 1,
      version: 1,
      name: 'Emergency Fund',
      category: 'EMERGENCY',
      priority: 'HIGH',
      status: 'ACTIVE',
      currency: 'USD',
      targetAmount: 10000,
      currentAmount: 5000,
      remainingAmount: 5000,
      progressPercent: 50,
      deadline: '2025-12-31',
      achievedAt: undefined,
      notes: 'Emergency fund for unexpected expenses',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      userId: 1,
      version: 1,
      name: 'Vacation',
      category: 'TRAVEL',
      priority: 'MEDIUM',
      status: 'COMPLETED',
      currency: 'USD',
      targetAmount: 5000,
      currentAmount: 5000,
      remainingAmount: 0,
      progressPercent: 100,
      deadline: '2024-06-30',
      achievedAt: '2024-06-30T00:00:00Z',
      notes: 'Summer vacation fund',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-06-30T00:00:00Z'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SavingTableComponent,
        SavingTableEmptyComponent,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MatPaginatorModule,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SavingTableComponent);
    component = fixture.componentInstance;
    component.goals = mockGoals;
    component.ngOnInit();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.goals).toEqual(mockGoals);
      expect(component.displayedColumns).toEqual(['name', 'target', 'current', 'priority', 'status', 'deadline', 'actions']);
      expect(component.dataSource).toBeDefined();
    });

    it('should display goals in table', () => {
      const tableRows = fixture.debugElement.queryAll(By.css('tr[mat-row]'));
      expect(tableRows.length).toBe(mockGoals.length);
    });
  });

  describe('Computed Properties', () => {
    it('should calculate completed count correctly', () => {
      expect(component.completedCount()).toBe(1);
    });

    it('should calculate active count correctly', () => {
      expect(component.activeCount()).toBe(1);
    });

    it('should calculate overdue count correctly', () => {
      expect(component.overdueCount()).toBe(0);
    });

    it('should calculate total saved correctly', () => {
      expect(component.totalSaved()).toBe(10000);
    });

    it('should return filtered goals', () => {
      expect(component.filteredGoals()).toEqual(mockGoals);
    });

    it('should show empty state when no goals exist', () => {
      component.goals = [];
      component.ngOnChanges();
      expect(component.showEmptyState()).toBe(true);
    });

    it('should not show empty state when goals exist', () => {
      component.goals = mockGoals;
      component.ngOnChanges();
      expect(component.showEmptyState()).toBe(false);
    });
  });

  describe('Utility Methods', () => {
    it('should get category label correctly', () => {
      expect(component.getCategoryLabel('EMERGENCY')).toBe('Emergency');
      expect(component.getCategoryLabel('TRAVEL')).toBe('Travel');
    });

    it('should get priority label correctly', () => {
      expect(component.getPriorityLabel('HIGH')).toBe('High');
      expect(component.getPriorityLabel('MEDIUM')).toBe('Medium');
    });

    it('should get status label correctly', () => {
      expect(component.getStatusLabel('ACTIVE')).toBe('Active');
      expect(component.getStatusLabel('COMPLETED')).toBe('Completed');
    });

    it('should format date correctly', () => {
      const formattedDate = component.formatDate('2025-12-31');
      expect(formattedDate).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it('should determine if goal is completed', () => {
      expect(component.isCompleted(mockGoals[0])).toBe(false);
      expect(component.isCompleted(mockGoals[1])).toBe(true);
    });

    it('should determine if goal is overdue', () => {
      expect(component.isOverdue(mockGoals[0])).toBe(false);
      expect(component.isOverdue(mockGoals[1])).toBe(false);
    });

    it('should get amount class correctly', () => {
      expect(component.getAmountClass(1000)).toBe('high-amount');
      expect(component.getAmountClass(500)).toBe('normal-amount');
    });
  });

  describe('Event Handling', () => {
    it('should emit modify event when onModify is called', () => {
      spyOn(component.modify, 'emit');
      component.onModify(mockGoals[0]);
      expect(component.modify.emit).toHaveBeenCalledWith(mockGoals[0]);
    });

    it('should emit delete event when onDelete is called', () => {
      spyOn(component.delete, 'emit');
      component.onDelete(mockGoals[0].id);
      expect(component.delete.emit).toHaveBeenCalledWith(mockGoals[0].id);
    });

    it('should emit add event when addGoal is called', () => {
      spyOn(component.add, 'emit');
      component.addGoal();
      expect(component.add.emit).toHaveBeenCalled();
    });

    it('should handle keyboard events correctly', () => {
      spyOn(component, 'addGoal');
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      component.onAddKeydown(event);
      expect(component.addGoal).toHaveBeenCalled();
    });
  });

  describe('Template Computed Properties', () => {
    it('should get amount class for element correctly', () => {
      expect(component.getAmountClassForElement(mockGoals[0], 'target')).toBe('high-amount');
      expect(component.getAmountClassForElement(mockGoals[0], 'current')).toBe('high-amount');
    });

    it('should get priority class for element correctly', () => {
      expect(component.getPriorityClassForElement(mockGoals[0])).toBe('high');
      expect(component.getPriorityClassForElement(mockGoals[1])).toBe('medium');
    });

    it('should get priority label for element correctly', () => {
      expect(component.getPriorityLabelForElement(mockGoals[0])).toBe('High');
      expect(component.getPriorityLabelForElement(mockGoals[1])).toBe('Medium');
    });

    it('should get status class for element correctly', () => {
      expect(component.getStatusClassForElement(mockGoals[0])).toBe('active');
      expect(component.getStatusClassForElement(mockGoals[1])).toBe('completed');
    });

    it('should get status label for element correctly', () => {
      expect(component.getStatusLabelForElement(mockGoals[0])).toBe('Active');
      expect(component.getStatusLabelForElement(mockGoals[1])).toBe('Completed');
    });

    it('should get deadline class for element correctly', () => {
      expect(component.getDeadlineClassForElement(mockGoals[0])).toBe('normal');
      expect(component.getDeadlineClassForElement(mockGoals[1])).toBe('normal');
    });

    it('should get formatted date for element correctly', () => {
      const formattedDate = component.getFormattedDateForElement(mockGoals[0]);
      expect(formattedDate).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });
  });

  describe('Performance Optimization', () => {
    it('should track by goal id correctly', () => {
      const trackByResult = component.trackByGoalId(0, mockGoals[0]);
      expect(trackByResult).toBe(mockGoals[0].id);
    });
  });

  describe('Template Integration', () => {
    it('should display summary section when goals exist', () => {
      const summarySection = fixture.debugElement.query(By.css('.summary-section'));
      expect(summarySection).toBeTruthy();
    });

    it('should display empty state when no goals exist', () => {
      component.goals = [];
      component.ngOnChanges();
      fixture.detectChanges();
      const emptyComponent = fixture.debugElement.query(By.css('app-saving-table-empty'));
      expect(emptyComponent).toBeTruthy();
    });

    it('should display table when goals exist', () => {
      const table = fixture.debugElement.query(By.css('table[mat-table]'));
      expect(table).toBeTruthy();
    });

    it('should display paginator when goals exist', () => {
      const paginator = fixture.debugElement.query(By.css('mat-paginator'));
      expect(paginator).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const table = fixture.debugElement.query(By.css('table[mat-table]'));
      expect(table.nativeElement.getAttribute('aria-label')).toBe('Saving goals data table');
    });

    it('should have proper roles', () => {
      const region = fixture.debugElement.query(By.css('[role="region"]'));
      expect(region).toBeTruthy();
      
      const main = fixture.debugElement.query(By.css('[role="main"]'));
      expect(main).toBeTruthy();
    });

    it('should support keyboard navigation', () => {
      const editButton = fixture.debugElement.query(By.css('.edit-button'));
      const keyboardEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      
      spyOn(component, 'onModify');
      editButton.nativeElement.dispatchEvent(keyboardEvent);
      expect(component.onModify).toHaveBeenCalled();
    });

    it('should have proper column headers', () => {
      const headers = fixture.debugElement.queryAll(By.css('th[role="columnheader"]'));
      expect(headers.length).toBe(7);
    });

    it('should have proper grid cells', () => {
      component.goals = mockGoals;
      component.ngOnChanges();
      fixture.detectChanges();
      
      const tableRows = fixture.debugElement.queryAll(By.css('tr[mat-row]'));
      expect(tableRows.length).toBeGreaterThan(0);
      
      const cells = fixture.debugElement.queryAll(By.css('td[mat-cell]'));
      expect(cells.length).toBeGreaterThan(0);
    });

    it('should have accessible buttons with proper labels', () => {
      const editButton = fixture.debugElement.query(By.css('.edit-button'));
      expect(editButton.nativeElement.getAttribute('aria-label')).toContain('Edit saving goal');
      
      const deleteButton = fixture.debugElement.query(By.css('.delete-button'));
      expect(deleteButton.nativeElement.getAttribute('aria-label')).toContain('Delete saving goal');
    });
  });
});




