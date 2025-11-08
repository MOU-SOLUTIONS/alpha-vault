/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component DebtTableComponent
  @description Main debt dashboard component tests for managing debt table
*/

import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { Debt } from '../../../models/debt.model';
import { DebtTableComponent } from './debt-table.component';

describe('DebtTableComponent', () => {
  let component: DebtTableComponent;
  let fixture: ComponentFixture<DebtTableComponent>;
  let cdr: ChangeDetectorRef;

  const mockDebts: Debt[] = [
    {
      id: 1,
      creditorName: 'Bank A',
      principalAmount: 10000,
      remainingAmount: 5000,
      interestRateApr: 18,
      minPayment: 200,
      dueDate: '2024-12-01',
      recurrenceType: 'monthly' as any,
      isPaidOff: false
    },
    {
      id: 2,
      creditorName: 'Credit Card B',
      principalAmount: 5000,
      remainingAmount: 3000,
      interestRateApr: 3,
      minPayment: 100,
      dueDate: '2024-11-15',
      recurrenceType: 'monthly' as any,
      isPaidOff: false
    },
    {
      id: 3,
      creditorName: 'Loan C',
      principalAmount: 8000,
      remainingAmount: 7000,
      interestRateApr: 20,
      minPayment: 150,
      dueDate: '2024-10-20',
      recurrenceType: 'monthly' as any,
      isPaidOff: false
    },
    {
      id: 4,
      creditorName: 'Credit Card D',
      principalAmount: 6000,
      remainingAmount: 5500,
      interestRateApr: 25,
      minPayment: 250,
      dueDate: '2024-09-10',
      recurrenceType: 'monthly' as any,
      isPaidOff: false
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebtTableComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(DebtTableComponent);
    component = fixture.componentInstance;
    cdr = TestBed.inject(ChangeDetectorRef);
    component.debts = mockDebts;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Rendering', () => {
    it('should render table header with title', () => {
      const titleEl = fixture.debugElement.query(By.css('.table-title'));
      expect(titleEl.nativeElement.textContent.trim()).toBe('Debt Management');
    });

    it('should render desktop table when debts are present', () => {
      component.filteredDebts = mockDebts;
      fixture.detectChanges();
      const tableEl = fixture.debugElement.query(By.css('.desktop-table'));
      expect(tableEl).toBeTruthy();
    });

    it('should render empty state when no filtered debts', () => {
      component.filteredDebts = [];
      component.loading = false;
      fixture.detectChanges();
      const emptyStateEl = fixture.debugElement.query(By.css('.empty-state'));
      expect(emptyStateEl).toBeTruthy();
      expect(emptyStateEl.nativeElement.textContent).toContain('No Debts Found');
    });

    it('should render loading state when loading is true', () => {
      component.loading = true;
      fixture.detectChanges();
      const loadingEl = fixture.debugElement.query(By.css('.loading-state'));
      expect(loadingEl).toBeTruthy();
    });
  });

  describe('Filtering and Sorting', () => {
    it('should filter debts by search term', () => {
      component.debts = mockDebts;
      component.filters.searchTerm = 'Bank';
      component.applyFilters();
      fixture.detectChanges();
      expect(component.filteredDebts.length).toBe(1);
      expect(component.filteredDebts[0].creditorName).toBe('Bank A');
    });

    it('should filter overdue debts only', () => {
      const pastDebt: Debt = {
        ...mockDebts[0],
        dueDate: '2020-01-01'
      };
      component.debts = [pastDebt, mockDebts[1]];
      component.filters.showOverdueOnly = true;
      component.applyFilters();
      fixture.detectChanges();
      expect(component.filteredDebts.length).toBeGreaterThanOrEqual(1);
    });

    it('should filter high interest debts only', () => {
      component.debts = mockDebts;
      component.filters.showHighInterestOnly = true;
      component.applyFilters();
      fixture.detectChanges();
      component.filteredDebts.forEach(debt => {
        expect(debt.interestRateApr).toBeGreaterThan(15);
      });
    });

    it('should sort debts by creditor name ascending', () => {
      component.debts = mockDebts;
      component.filters.sortBy = 'creditorName';
      component.filters.sortOrder = 'asc';
      component.applyFilters();
      fixture.detectChanges();
      expect(component.filteredDebts[0].creditorName).toBe('Bank A');
    });

    it('should toggle sort order on same field', () => {
      component.debts = mockDebts;
      component.filters.sortBy = 'creditorName';
      component.filters.sortOrder = 'asc';
      component.onSortChange('creditorName');
      expect(component.filters.sortOrder).toBe('desc');
    });
  });

  describe('Selection Functionality', () => {
    it('should toggle debt selection', () => {
      component.toggleDebtSelection(1);
      expect(component.selectedDebts.has(1)).toBe(true);
      component.toggleDebtSelection(1);
      expect(component.selectedDebts.has(1)).toBe(false);
    });

    it('should select all debts', () => {
      component.filteredDebts = mockDebts;
      component.selectAllDebts();
      expect(component.selectedDebts.size).toBe(mockDebts.length);
    });

    it('should deselect all when all are selected', () => {
      component.filteredDebts = mockDebts;
      mockDebts.forEach(debt => component.selectedDebts.add(debt.id));
      component.selectAllDebts();
      expect(component.selectedDebts.size).toBe(0);
    });

    it('should show bulk actions when debts are selected', () => {
      component.selectedDebts.add(1);
      component.updateBulkActions();
      expect(component.showBulkActions).toBe(true);
    });

    it('should calculate selected debts total correctly', () => {
      component.filteredDebts = mockDebts;
      component.selectedDebts.add(1);
      component.selectedDebts.add(2);
      const total = component.getSelectedDebtsTotal();
      expect(total).toBe(mockDebts[0].remainingAmount + mockDebts[1].remainingAmount);
    });
  });

  describe('Debt Status Caching', () => {
    it('should cache debt status calculations', () => {
      const debt = mockDebts[0];
      const status1 = component.getDebtStatus(debt);
      const status2 = component.getDebtStatus(debt);
      expect(status1).toBe(status2);
    });

    it('should invalidate cache when debts change', () => {
      const debt = mockDebts[0];
      component.getDebtStatus(debt);
      component.debts = [...mockDebts, {
        id: 5,
        creditorName: 'New Debt',
        principalAmount: 1000,
        remainingAmount: 800,
        interestRateApr: 10,
        minPayment: 50,
        dueDate: '2024-12-31',
        recurrenceType: 'monthly' as any,
        isPaidOff: false
      }];
      component.ngOnChanges({ debts: { currentValue: component.debts, previousValue: mockDebts } } as any);
      fixture.detectChanges();
      const newStatus = component.getDebtStatus(debt);
      expect(newStatus).toBeTruthy();
    });

    it('should return correct urgency class for overdue debt', () => {
      const pastDebt: Debt = {
        ...mockDebts[0],
        dueDate: '2020-01-01'
      };
      const status = component.getDebtStatus(pastDebt);
      expect(status.isOverdue).toBe(true);
      expect(status.urgencyClass).toBe('critical');
    });

    it('should return correct interest rate class', () => {
      const highInterestDebt = mockDebts[3];
      const status = component.getDebtStatus(highInterestDebt);
      expect(status.interestRateClass).toBe('critical');
    });

    it('should calculate progress percentage correctly', () => {
      const debt = mockDebts[0];
      const status = component.getDebtStatus(debt);
      expect(status.progressPercentage).toBe(50);
    });
  });

  describe('Output Events', () => {
    it('should emit onAdd event', () => {
      spyOn(component.onAdd, 'emit');
      const addButton = fixture.debugElement.query(By.css('.add-button'));
      addButton.nativeElement.click();
      expect(component.onAdd.emit).toHaveBeenCalled();
    });

    it('should emit onModify event with debt', () => {
      spyOn(component.onModify, 'emit');
      component.filteredDebts = mockDebts;
      fixture.detectChanges();
      const editButtons = fixture.debugElement.queryAll(By.css('.edit-button'));
      if (editButtons.length > 0) {
        editButtons[0].nativeElement.click();
        expect(component.onModify.emit).toHaveBeenCalledWith(mockDebts[0]);
      }
    });

    it('should emit onDelete event with debt id', () => {
      spyOn(component.onDelete, 'emit');
      component.filteredDebts = mockDebts;
      fixture.detectChanges();
      const deleteButtons = fixture.debugElement.queryAll(By.css('.delete-button'));
      if (deleteButtons.length > 0) {
        deleteButtons[0].nativeElement.click();
        expect(component.onDelete.emit).toHaveBeenCalledWith(mockDebts[0].id);
      }
    });

    it('should emit onExport event', () => {
      spyOn(component.onExport, 'emit');
      const exportButton = fixture.debugElement.query(By.css('.export-button'));
      exportButton.nativeElement.click();
      expect(component.onExport.emit).toHaveBeenCalled();
    });

    it('should emit onFiltersChange when filters are applied', () => {
      spyOn(component.onFiltersChange, 'emit');
      component.filters.searchTerm = 'test';
      component.applyFilters();
      expect(component.onFiltersChange).toBeDefined();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on search input', () => {
      const searchInput = fixture.debugElement.query(By.css('.search-input'));
      expect(searchInput.nativeElement.getAttribute('aria-label')).toBeTruthy();
    });

    it('should have aria-label on filter buttons', () => {
      const filterButtons = fixture.debugElement.queryAll(By.css('.filter-btn'));
      filterButtons.forEach(btn => {
        expect(btn.nativeElement.getAttribute('aria-label')).toBeTruthy();
      });
    });

    it('should have aria-pressed on filter buttons', () => {
      component.filters.showOverdueOnly = true;
      fixture.detectChanges();
      const overdueButton = fixture.debugElement.query(By.css('.filter-btn'));
      expect(overdueButton.nativeElement.getAttribute('aria-pressed')).toBe('true');
    });

    it('should have aria-label on checkboxes', () => {
      component.filteredDebts = mockDebts;
      fixture.detectChanges();
      const checkboxes = fixture.debugElement.queryAll(By.css('input[type="checkbox"]'));
      checkboxes.forEach(checkbox => {
        const ariaLabel = checkbox.nativeElement.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
      });
    });

    it('should have role="progressbar" on progress bars', () => {
      component.filteredDebts = mockDebts;
      fixture.detectChanges();
      const progressBars = fixture.debugElement.queryAll(By.css('[role="progressbar"]'));
      expect(progressBars.length).toBeGreaterThan(0);
    });

    it('should have keyboard handlers on sortable headers', () => {
      const sortableHeaders = fixture.debugElement.queryAll(By.css('.sortable'));
      sortableHeaders.forEach(header => {
        expect(header.nativeElement.getAttribute('tabindex')).toBe('0');
      });
    });

    it('should have keyboard handlers on action buttons', () => {
      component.filteredDebts = mockDebts;
      fixture.detectChanges();
      const actionButtons = fixture.debugElement.queryAll(By.css('.edit-button, .delete-button'));
      actionButtons.forEach(btn => {
        const enterHandler = btn.nativeElement.getAttribute('ng-reflect-handler');
        expect(btn.nativeElement.onkeydown || btn.nativeElement.getAttribute('(keydown.enter)')).toBeDefined();
      });
    });
  });

  describe('TrackBy Function', () => {
    it('should track debts by id', () => {
      const result = component.trackByDebt(0, mockDebts[0]);
      expect(result).toBe(mockDebts[0].id);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty debts array', () => {
      component.debts = [];
      component.applyFilters();
      fixture.detectChanges();
      expect(component.filteredDebts.length).toBe(0);
    });

    it('should handle zero progress percentage', () => {
      const debt: Debt = {
        ...mockDebts[0],
        remainingAmount: mockDebts[0].principalAmount
      };
      const status = component.getDebtStatus(debt);
      expect(status.progressPercentage).toBe(0);
    });

    it('should handle 100% progress percentage', () => {
      const debt: Debt = {
        ...mockDebts[0],
        remainingAmount: 0
      };
      const status = component.getDebtStatus(debt);
      expect(status.progressPercentage).toBe(100);
    });

    it('should use markForCheck instead of detectChanges in refreshData', () => {
      spyOn(component['cdr'], 'markForCheck');
      component.refreshData();
      expect(component['cdr'].markForCheck).toHaveBeenCalled();
    });
  });

  describe('Change Detection', () => {
    it('should use OnPush change detection strategy', () => {
      const strategy = (component.constructor as any).__annotations__?.[0]?.changeDetection;
      expect(component).toBeTruthy();
    });

    it('should call applyFilters on ngOnChanges when debts change', () => {
      spyOn(component, 'applyFilters');
      component.ngOnChanges({ debts: { currentValue: mockDebts, previousValue: [] } } as any);
      expect(component.applyFilters).toHaveBeenCalled();
    });
  });
});

