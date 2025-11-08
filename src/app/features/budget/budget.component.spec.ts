/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component BudgetComponent
  @description Main budget dashboard component tests for managing budget allocations
*/

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { BudgetService } from '../../core/services/budget.service';
import { Budget, BudgetResponseDTO, ExpenseCategory } from '../../models/budget.model';
import { BudgetComponent } from './budget.component';

describe('BudgetComponent', () => {
  let component: BudgetComponent;
  let fixture: ComponentFixture<BudgetComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let budgetService: jasmine.SpyObj<BudgetService>;

  const mockBudgetResponse: BudgetResponseDTO = {
    id: 1,
    userId: 1,
    month: 1,
    year: 2024,
    currency: 'USD',
    totalBudget: 5000,
    totalSpent: 3000,
    totalRemaining: 2000,
    rolloverEnabled: false,
    alertThresholdPercent: 80,
    categories: [
      {
        id: 1,
        category: ExpenseCategory.HOUSING,
        allocated: 2000,
        spentAmount: 1200,
        remaining: 800
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  const mockBudget: Budget = {
    id: 1,
    version: 1,
    userId: 1,
    month: 1,
    year: 2024,
    totalBudget: 5000,
    totalSpent: 3000,
    totalRemaining: 2000,
    currency: 'USD',
    rolloverEnabled: false,
    alertThresholdPercent: 80,
    categories: [
      {
        id: 1,
        budgetId: 1,
        category: ExpenseCategory.HOUSING,
        allocated: 2000,
        spentAmount: 1200,
        remaining: 800,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      userId$: of(1)
    });
    const budgetServiceSpy = jasmine.createSpyObj('BudgetService', [
      'getBudgetForMonth',
      'addOrUpdateCategory',
      'deleteCategory',
      'updateBudget'
    ]);

    await TestBed.configureTestingModule({
      imports: [BudgetComponent, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: BudgetService, useValue: budgetServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    budgetService = TestBed.inject(BudgetService) as jasmine.SpyObj<BudgetService>;
    
    budgetService.getBudgetForMonth.and.returnValue(of(mockBudgetResponse));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with proper validators', () => {
    expect(component.budgetForm).toBeDefined();
    expect(component.budgetForm.get('category')?.hasError('required')).toBeTruthy();
    expect(component.budgetForm.get('allocated')?.hasError('required')).toBeTruthy();
  });

  it('should load budget data on init', () => {
    expect(budgetService.getBudgetForMonth).toHaveBeenCalled();
    expect(component.budget).toEqual(mockBudget);
  });

  it('should handle add expense', () => {
    component.onAddExpense();
    expect(component.showAddForm).toBeTruthy();
    expect(component.isModifyMode).toBeFalsy();
  });

  it('should handle modify expense', () => {
    const budgetTableItem = {
      category: ExpenseCategory.HOUSING,
      allocated: 2000,
      spent: 1200,
      remaining: 800
    };

    component.onModifyExpense(budgetTableItem);
    expect(component.isModifyMode).toBeTruthy();
    expect(component.showAddForm).toBeTruthy();
    expect(component.selectedCategoryToModify).toBeDefined();
  });

  it('should show delete confirmation', () => {
    component.showDeleteConfirmation(ExpenseCategory.HOUSING);
    expect(component.isDeleteOverlayVisible).toBeTruthy();
    expect(component.selectedCategoryToDelete).toBe(ExpenseCategory.HOUSING);
  });

  it('should close add form', () => {
    component.showAddForm = true;
    component.isModifyMode = true;
    component.closeAddForm();
    expect(component.showAddForm).toBeFalsy();
    expect(component.isModifyMode).toBeFalsy();
  });

  it('should close overlay', () => {
    component.isDeleteOverlayVisible = true;
    component.closeOverlay();
    expect(component.isDeleteOverlayVisible).toBeFalsy();
  });

  it('should navigate to next month', () => {
    component.selectedMonth = 1;
    component.selectedYear = 2024;
    component.nextMonth();
    expect(component.selectedMonth).toBe(2);
    expect(component.selectedYear).toBe(2024);
  });

  it('should navigate to previous month', () => {
    component.selectedMonth = 2;
    component.selectedYear = 2024;
    component.prevMonth();
    expect(component.selectedMonth).toBe(1);
    expect(component.selectedYear).toBe(2024);
  });

  it('should handle year rollover for next month', () => {
    component.selectedMonth = 12;
    component.selectedYear = 2024;
    component.nextMonth();
    expect(component.selectedMonth).toBe(1);
    expect(component.selectedYear).toBe(2025);
  });

  it('should handle year rollover for previous month', () => {
    component.selectedMonth = 1;
    component.selectedYear = 2024;
    component.prevMonth();
    expect(component.selectedMonth).toBe(12);
    expect(component.selectedYear).toBe(2023);
  });

  it('should have proper accessibility attributes', () => {
    const mainElement = fixture.debugElement.query(By.css('main'));
    expect(mainElement.attributes['role']).toBe('main');
    expect(mainElement.attributes['aria-live']).toBe('polite');

    const formHeader = fixture.debugElement.query(By.css('.form-header'));
    expect(formHeader.attributes['role']).toBe('button');
    expect(formHeader.attributes['tabindex']).toBe('0');
  });

  it('should handle form submission for add mode', () => {
    budgetService.addOrUpdateCategory.and.returnValue(of(mockBudgetResponse));
    component.userId = 1;
    component.budgetForm.patchValue({
      category: ExpenseCategory.FOOD,
      allocated: 500
    });

    component.handleAddCategory();
    expect(budgetService.addOrUpdateCategory).toHaveBeenCalledWith(1, 1, 2024, ExpenseCategory.FOOD, 500, false);
  });

  it('should handle form submission for modify mode', () => {
    budgetService.addOrUpdateCategory.and.returnValue(of(mockBudgetResponse));
    component.userId = 1;
    component.isModifyMode = true;
    component.budgetForm.patchValue({
      category: ExpenseCategory.FOOD,
      allocated: 500
    });

    component.modifyBudget();
    expect(budgetService.addOrUpdateCategory).toHaveBeenCalledWith(1, 1, 2024, ExpenseCategory.FOOD, 500, true);
  });

  it('should handle delete budget', () => {
    budgetService.deleteCategory.and.returnValue(of(mockBudgetResponse));
    component.userId = 1;
    component.selectedCategoryToDelete = ExpenseCategory.HOUSING;
    component.selectedYear = 2024;
    component.selectedMonth = 1;

    component.deleteBudget();
    expect(budgetService.deleteCategory).toHaveBeenCalledWith(1, 2024, 1, ExpenseCategory.HOUSING);
  });

  it('should handle error when loading budget', () => {
    budgetService.getBudgetForMonth.and.returnValue(throwError(() => ({ status: 404 })));
    (component as any).loadBudget();
    expect(component.budget).toBeNull();
  });

  it('should update chart data when budget is loaded', () => {
    component.budget = mockBudget;
    (component as any).updateChartData();
    expect(component.barChartData.length).toBeGreaterThan(0);
    expect(component.pieChartData).toBeDefined();
  });

  it('should reset chart data when no budget', () => {
    component.budget = null;
    (component as any).resetChartData();
    expect(component.barChartData.length).toBe(0);
    expect(Object.keys(component.pieChartData).length).toBe(0);
  });

  it('should display main h1 heading', () => {
    const h1Element = fixture.debugElement.query(By.css('main h1'));
    expect(h1Element).toBeTruthy();
    expect(h1Element.nativeElement.textContent.trim()).toBe('Budget Dashboard');
  });
});
