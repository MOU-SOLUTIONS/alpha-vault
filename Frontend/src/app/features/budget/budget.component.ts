// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';

import { Budget, BudgetCategory } from '../../models/budget.model';
import { BudgetService } from '../../core/services/budget.service';
import { AuthService } from '../../core/services/auth.service';

import { BudgetPeriodFilterComponent } from './budget-period-filter/budget-period-filter.component';
import { BudgetProgressComponent } from './budget-progress/budget-progress.component';
import { BudgetPieChartComponent } from './budget-pie-chart/budget-pie-chart.component';
import { BudgetBarChartComponent } from './budget-bar-chart/budget-bar-chart.component';
import { BudgetTableComponent } from './budget-table/budget-table.component';
import { BudgetFormComponent } from './budget-form/budget-form.component';
import { OverlayContainerComponent } from '../../shared/components/overlay-container/overlay-container/overlay-container.component';

@Component({
  standalone: true,
  selector: 'app-budget',
  template: `
    <!-- Section: Budget Dashboard -->
    <main class="parent-container" role="main">
      <h1 class="sr-only">Budget Dashboard</h1>
      
      <!-- Section: Period Filter -->
      <section class="first-row" aria-labelledby="budgetFilter">
        <h2 id="budgetFilter" class="sr-only">Budget Period Filter</h2>
        <app-budget-period-filter
          (dateChanged)="onDateChanged($event)"
          (prev)="prevMonth()"
          (next)="nextMonth()"
        ></app-budget-period-filter>
      </section>

      <!-- Section: Progress Overview -->
      <section class="second-row" aria-labelledby="budgetProgress">
        <h2 id="budgetProgress" class="sr-only">Budget Progress</h2>
        <app-budget-progress
          [totalBudget]="budget?.totalBudget || 0"
          [totalRemaining]="budget?.totalRemaining || 0"
        ></app-budget-progress>
      </section>

      <!-- Section: Charts -->
      <section class="third-row" aria-labelledby="budgetCharts">
        <h2 id="budgetCharts" class="sr-only">Budget Charts</h2>
        <div class="charts-container">
          <div class="chart-item pie-chart">
            <app-budget-pie-chart [chartData]="pieChartData"></app-budget-pie-chart>
          </div>
          <div class="chart-item bar-chart">
            <app-budget-bar-chart [chartData]="barChartData"></app-budget-bar-chart>
          </div>
        </div>
      </section>

      <!-- Section: Budget Table -->
      <section class="fourth-row" aria-labelledby="budgetTable">
        <h2 id="budgetTable" class="sr-only">Budget Categories</h2>
        <app-budget-table
          [categories]="budget?.categories || []"
          [onAdd]="onAddExpense.bind(this)"
          [onModify]="onModifyExpense.bind(this)"
          [onDelete]="onDeleteExpense.bind(this)"
        ></app-budget-table>
      </section>
    </main>

    <!-- Section: Add Overlay -->
    <app-overlay-container
      *ngIf="isAddOverlayVisible"
      [title]="'Add Budget'"
      [theme]="'add'"
      (cancel)="closeOverlay()"
    >
      <app-budget-form
        [mode]="'add'"
        [alreadyUsedCategories]="usedCategories"
        (formSubmit)="handleAddCategory($event)"
        (cancel)="closeOverlay()"
      />
    </app-overlay-container>

    <!-- Section: Modify Overlay -->
    <app-overlay-container
      *ngIf="isModifyOverlayVisible"
      [title]="'Modify Budget'"
      [theme]="'modify'"
      (cancel)="closeOverlay()"
    >
      <app-budget-form
        [mode]="'modify'"
        [initialData]="selectedCategoryToModify"
        [alreadyUsedCategories]="[]"
        (formSubmit)="modifyBudget($event)"
        (cancel)="closeOverlay()"
      />
    </app-overlay-container>

    <!-- Section: Delete Confirmation Overlay -->
    <app-overlay-container
      *ngIf="isDeleteOverlayVisible"
      [title]="'Confirm Deletion'"
      [theme]="'delete'"
      (cancel)="closeOverlay()"
    >
      <p class="delete-text">
        Are you sure you want to delete this budget record?
      </p>
      <div class="delete-button-group d-flex justify-content-end gap-2">
        <button class="btn btn-secondary" (click)="closeOverlay()">Cancel</button>
        <button class="btn btn-danger" (click)="deleteBudget()">Delete</button>
      </div>
    </app-overlay-container>
  `,
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
    OverlayContainerComponent,
  ],
})
export class BudgetComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  userId: number | null = null;
  budget: Budget | null = null;
  selectedCategoryToModify: BudgetCategory | null = null;
  selectedCategoryToDelete: string | null = null;

  isAddOverlayVisible = false;
  isModifyOverlayVisible = false;
  isDeleteOverlayVisible = false;

  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();

  barChartData: { category: string; allocated: number; remaining: number }[] = [];
  pieChartData: Record<string, number> = {};

  constructor(
    private budgetService: BudgetService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private title: Title,
    private meta: Meta,
  ) {
    this.title.setTitle('Budget Dashboard | Alpha Vault');
    this.meta.addTags([
      { name: 'description', content: 'Manage and track your budget allocations with detailed analytics, charts, and comprehensive reporting tools.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ]);
  }

  ngOnInit(): void {
    this.authService.userId$.pipe(takeUntil(this.destroy$)).subscribe((id) => {
      this.userId = id;
      this.loadBudget();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get usedCategories(): string[] {
    return this.budget?.categories.map((c) => c.category) || [];
  }

  onAddExpense(): void {
    this.isAddOverlayVisible = true;
    this.cdr.markForCheck();
  }

  onModifyExpense(category: BudgetCategory): void {
    this.selectedCategoryToModify = { ...category };
    this.isModifyOverlayVisible = true;
    this.cdr.markForCheck();
  }

  onDeleteExpense(categoryName: string): void {
    this.selectedCategoryToDelete = categoryName;
    this.isDeleteOverlayVisible = true;
    this.cdr.markForCheck();
  }

  handleAddCategory(newCategory: Partial<BudgetCategory>): void {
    if (!this.userId || !newCategory.category || newCategory.allocated === undefined) return;

    this.budgetService
      .addOrUpdateCategory(
        this.userId,
        this.selectedMonth,
        this.selectedYear,
        newCategory.category,
        newCategory.allocated
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadBudget();
          this.closeOverlay();
        },
        error: (err) => console.error('Add failed:', err),
      });
  }

  modifyBudget(updated: Partial<BudgetCategory>): void {
    if (!this.budget || !this.selectedCategoryToModify) return;

    const index = this.budget.categories.findIndex(
      (c) => c.category === this.selectedCategoryToModify?.category
    );

    if (index !== -1) {
      const current = this.budget.categories[index];
      this.budget.categories[index] = {
        ...current,
        allocated: updated.allocated!,
      };
    }
    this.updateBudgetBackend();
    this.closeOverlay();
  }

  deleteBudget(): void {
    if (!this.budget || !this.selectedCategoryToDelete) return;

    this.budget.categories = this.budget.categories.filter(
      (c) => c.category !== this.selectedCategoryToDelete
    );

    this.updateBudgetBackend();
    this.closeOverlay();
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

  closeOverlay(): void {
    this.isAddOverlayVisible = false;
    this.isModifyOverlayVisible = false;
    this.isDeleteOverlayVisible = false;
    this.selectedCategoryToModify = null;
    this.selectedCategoryToDelete = null;
    this.cdr.markForCheck();
  }

  private loadBudget(): void {
    if (this.userId === null) return;

    this.budgetService
      .getBudgetForMonth(this.selectedMonth, this.selectedYear)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (budget) => {
          this.budget = budget;
          this.updateChartData();
          this.cdr.markForCheck();
        },
        error: (err) => {
          if (err.status === 404) {
            this.resetChartData();
            this.budget = null;
          } else {
            console.error('Unexpected error:', err);
          }
          this.cdr.markForCheck();
        },
      });
  }

  private updateBudgetBackend(): void {
    if (!this.budget) return;

    this.budgetService.updateBudget(this.budget.id, this.budget)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadBudget();
        },
        error: (err) => {
          console.error('Failed to update budget', err);
        },
      });
  }

  private updateChartData(): void {
    if (!this.budget) return;

    this.barChartData = this.budget.categories.map((c) => ({
      category: c.category,
      allocated: c.allocated,
      remaining: c.remaining,
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
