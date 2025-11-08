/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component BudgetComponent
  @description Main budget dashboard component for managing budget allocations
*/

import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { SeoService } from '../../core/seo/seo.service';
import { AuthService } from '../../core/services/auth.service';
import { BudgetService } from '../../core/services/budget.service';
import { LoggingService } from '../../core/services/logging.service';
import { EXPENSE_CATEGORY_OPTIONS } from '../../enums/expense-category';
import { Budget, BudgetCategory, ExpenseCategory } from '../../models/budget.model';
import { BudgetBarChartComponent } from './budget-bar-chart/budget-bar-chart.component';
import { BudgetFormComponent } from './budget-form/budget-form.component';
import { BudgetPeriodFilterComponent } from './budget-period-filter/budget-period-filter.component';
import { BudgetPieChartComponent } from './budget-pie-chart/budget-pie-chart.component';
import { BudgetProgressComponent } from './budget-progress/budget-progress.component';
import { BudgetTableComponent } from './budget-table/budget-table.component';

@Component({
  standalone: true,
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BudgetPeriodFilterComponent,
    BudgetProgressComponent,
    BudgetPieChartComponent,
    BudgetBarChartComponent,
    BudgetTableComponent,
    BudgetFormComponent,
  ],
})
export class BudgetComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly seo = inject(SeoService);
  private readonly loggingService = inject(LoggingService);

  userId: number | null = null;
  budget: Budget | null = null;
  selectedCategoryToModify: BudgetCategory | null = null;

  showAddForm = false;
  isModifyMode = false;
  budgetForm!: FormGroup;
  
  isDeleteOverlayVisible = false;
  selectedCategoryToDelete: ExpenseCategory | null = null;
  budgetCategoryId = 0;

  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();
  
  expenseCategories = EXPENSE_CATEGORY_OPTIONS;

  barChartData: { category: string; allocated: number; remaining: number }[] = [];
  pieChartData: Record<string, number> = {};

  constructor(
    private budgetService: BudgetService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupSEO();
    this.authService.userId$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((id) => {
      this.userId = id;
      this.loadBudget();
    });
  }

  private setupSEO(): void {
    const title = 'Budget Dashboard';
    const description = 'Manage and track your budget allocations with detailed analytics, charts, and comprehensive reporting tools. Plan, monitor, and optimize your financial budget across all categories.';
    
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                       'july', 'august', 'september', 'october', 'november', 'december'];
    const monthName = monthNames[this.selectedMonth - 1];
    const year = this.selectedYear;
    const canonicalPath = `/budget/${monthName}-${year}`;
    
    let canonical = 'https://alphavault.app/budget';
    if (this.isBrowser && typeof window !== 'undefined' && window.location) {
      canonical = `${window.location.origin}${canonicalPath}`;
    } else {
      canonical = `https://alphavault.app${canonicalPath}`;
    }

    this.seo.set({
      title,
      description,
      canonicalUrl: canonical,
      keywords: ['budget', 'financial planning', 'expense tracking', 'budget management', 'analytics', 'Alpha Vault'],
      og: {
        title: 'Budget Dashboard - Manage Your Finances',
        description,
        image: '/assets/og/default.png',
        type: 'website'
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Budget Dashboard',
        description
      },
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: title,
        description,
        url: canonical
      }
    });
  }

  private initializeForm(): void {
    this.budgetForm = this.fb.group({
      category: [null, [Validators.required]],
      allocated: [null, [Validators.required, Validators.min(0.01)]],
    });
  }


  get usedCategories(): string[] {
    return this.budget?.categories.map((c) => c.category) || [];
  }

  onAddExpense(): void {
    this.isModifyMode = false;
    this.selectedCategoryToModify = null;
    this.showAddForm = true;
    this.cdr.markForCheck();
  }

  onModifyExpense(budgetTableItem: any): void {
    this.selectedCategoryToModify = {
      id: 0,
      budgetId: this.budget?.id || 0,
      category: budgetTableItem.category,
      allocated: budgetTableItem.allocated,
      spentAmount: budgetTableItem.spent,
      createdAt: '',
      updatedAt: '',
      remaining: budgetTableItem.remaining
    };
    
    this.isModifyMode = true;
    this.showAddForm = true;
    
    const mappedCategory = this.mapCategoryValue(budgetTableItem.category);
      
      this.budgetForm.reset();
      this.budgetForm.patchValue({
        category: mappedCategory,
        allocated: budgetTableItem.allocated,
      });
      
      this.cdr.markForCheck();
  }

  showDeleteConfirmation(categoryName: string): void {
    this.selectedCategoryToDelete = categoryName as ExpenseCategory;
    this.budgetCategoryId = 1;
    this.isDeleteOverlayVisible = true;
    this.cdr.markForCheck();
  }

  handleAddCategory(): void {
    if (!this.userId || this.budgetForm.invalid) return;

    const formData = this.budgetForm.value;

    this.budgetService
      .addOrUpdateCategory(
        this.userId,
        this.selectedMonth,
        this.selectedYear,
        formData.category,
        formData.allocated,
        false
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadBudget();
          this.closeAddForm();
        },
        error: (err: any) => {
          // Error handling - notification service will show user-friendly message
          // Detailed error logged via browser console in development only
        },
      });
  }

  modifyBudget(): void {
    if (!this.budget || !this.selectedCategoryToModify || this.budgetForm.invalid) return;

    const formData = this.budgetForm.value;

    this.budgetService
      .addOrUpdateCategory(
        this.userId!,
        this.selectedMonth,
        this.selectedYear,
        formData.category,
        formData.allocated,
        true
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadBudget();
          this.closeAddForm();
        },
        error: (err: any) => {
          this.loggingService.error('Modify failed:', err);
        },
      });
  }


  nextMonth(): void {
    if (this.selectedMonth === 12) {
      this.selectedMonth = 1;
      this.selectedYear++;
    } else {
      this.selectedMonth++;
    }
    this.loadBudget();
  }

  prevMonth(): void {
    if (this.selectedMonth === 1) {
      this.selectedMonth = 12;
      this.selectedYear--;
    } else {
      this.selectedMonth--;
    }
    this.loadBudget();
  }

  onDateChanged(date: { month: number; year: number }): void {
    this.selectedMonth = date.month;
    this.selectedYear = date.year;
    this.loadBudget();
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.isModifyMode = false;
      this.selectedCategoryToModify = null;
    }
    this.cdr.markForCheck();
  }

  deleteBudget(): void {
    if (!this.selectedCategoryToDelete || !this.userId) return;

    const categoryToDelete = this.selectedCategoryToDelete.toUpperCase() as ExpenseCategory;

    this.budgetService
      .deleteCategory(this.userId, this.selectedYear, this.selectedMonth, categoryToDelete)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadBudget();
          this.budgetForm.reset();
          this.isDeleteOverlayVisible = false;
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.loggingService.error('Error deleting budget category:', err);
          this.isDeleteOverlayVisible = false;
          this.cdr.markForCheck();
        }
      });
  }

  closeAddForm(): void {
    this.showAddForm = false;
    this.isModifyMode = false;
    this.selectedCategoryToModify = null;
    this.budgetForm.reset();
    this.cdr.markForCheck();
  }

  closeOverlay(): void {
    this.isDeleteOverlayVisible = false;
    this.cdr.markForCheck();
  }

  private mapCategoryValue(category: string | null | undefined): string | null {
    if (!category) return null;
    
    const categoryStr = String(category).toUpperCase();
    
    if (!this.expenseCategories || !Array.isArray(this.expenseCategories)) {
      return String(category);
    }
    
    const validCategories = this.expenseCategories.map(ec => ec.value);
    const foundCategory = validCategories.find(validCategory => 
      validCategory.toUpperCase() === categoryStr || 
      validCategory === category
    );
    
    return foundCategory || String(category);
  }


  private loadBudget(): void {
    if (this.userId === null) return;

    this.budgetService
      .getBudgetForMonth(this.selectedMonth, this.selectedYear, this.userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (budget: any) => {
          // Handle null response (404) - budget doesn't exist yet for this month
          if (budget === null) {
            this.resetChartData();
            this.budget = null;
          } else {
            this.budget = budget;
            this.updateChartData();
          }
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          // Only log unexpected errors (non-404)
          if (err.status !== 404) {
            this.loggingService.error('Unexpected error:', err);
          }
          this.resetChartData();
          this.budget = null;
          this.cdr.markForCheck();
        },
      });
  }

  private updateBudgetBackend(): void {
    if (!this.budget) return;

    this.budgetService.updateBudget(this.budget.id, this.budget)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadBudget();
        },
        error: (err) => {
          this.loggingService.error('Failed to update budget', err);
        },
      });
  }

  private updateChartData(): void {
    if (!this.budget) return;

    this.barChartData = this.budget.categories.map((c) => ({
      category: c.category,
      allocated: c.allocated,
      remaining: c.remaining ?? 0,
    }));

    this.pieChartData = {};
    this.budget.categories.forEach((cat) => {
      this.pieChartData[cat.category] = cat.allocated;
    });
  }

  private resetChartData(): void {
    this.barChartData = [];
    this.pieChartData = {};
  }
}
