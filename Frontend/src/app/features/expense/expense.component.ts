/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseComponent
  @description Main expense dashboard component with comprehensive expense management
*/

// ===== IMPORTS =====
import { CommonModule, formatDate } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { debounceTime, distinctUntilChanged, forkJoin, Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { ExpenseService } from '../../core/services/expense.service';
import { LoggingService } from '../../core/services/logging.service';
import { EXPENSE_CATEGORY_OPTIONS } from '../../enums/expense-category';
import { PAYMENT_METHOD_OPTIONS } from '../../enums/payment-method';
import {
  Expense,
  ExpenseRequestDTO,
  ExpenseResponseDTO
} from '../../models/expense.model';
import { ExpenseCategoryChartComponent } from './expense-category-chart/expense-category-chart.component';
import { ExpenseEvaluationComponent } from './expense-evaluation/expense-evaluation.component';
import { ExpenseFormComponent } from './expense-form/expense-form.component';
import { ExpenseMethodChartComponent } from './expense-method-chart/expense-method-chart.component';
import { ExpenseMonthChartComponent } from './expense-month-chart/expense-month-chart.component';
import { ExpenseTableSplitComponent } from './expense-table/expense-table-split.component';
import { ExpenseTop5Component } from './expense-top5/expense-top5.component';
import { ExpenseWeekChartComponent } from './expense-week-chart/expense-week-chart.component';
import { ExpenseWidgetComponent } from './expense-widget/expense-widget.component';

@Component({
  standalone: true,
  selector: 'app-expense',
  template: `
    <!-- Section: Expense Dashboard -->
    <main class="parent-container" role="main">
      <h1 class="sr-only">Expense Dashboard</h1>
      
      <!-- Section: Summary Widget Overview -->
      <section class="first-row row" aria-labelledby="expenseSummary">
        <h2 id="expenseSummary" class="sr-only">Expense Summary</h2>
        <ng-container *ngFor="let trigger of [refreshTrigger]; trackBy: trackByRefresh">
          <app-expense-widget
            [dayExpense]="dayExpense"
            [weekExpense]="weekExpense"
            [monthExpense]="monthExpense"
            [yearExpense]="yearExpense"
          ></app-expense-widget>
        </ng-container>
      </section>

      <!-- Section: Week and Month Charts -->
      <section class="second-row row" aria-labelledby="expenseCharts">
        <h2 id="expenseCharts" class="sr-only">Expense Charts</h2>
        <div class="weekly-chart col-12 col-md-6">
          <app-expense-week-chart [weeklyData]="weeklyExpenseData" *ngIf="refreshTrigger >= 0"></app-expense-week-chart>
        </div>
        <div class="monthly-chart col-12 col-md-6">
          <app-expense-month-chart [monthlyData]="monthlyExpenseData" *ngIf="refreshTrigger >= 0"></app-expense-month-chart>
        </div>
      </section>

      <!-- Section: Top 5, Method, Category -->
      <section class="third-row row" aria-labelledby="expenseAnalytics">
        <h2 id="expenseAnalytics" class="sr-only">Expense Analytics</h2>
        <div class="top-5-table col-12 col-md-6">
          <app-expense-top5 [topExpenses]="topExpenses" *ngIf="refreshTrigger >= 0"></app-expense-top5>
        </div>
        <div class="method-chart col-6 col-md-3">
          <app-expense-method-chart [methodData]="paymentMethodData" *ngIf="refreshTrigger >= 0"></app-expense-method-chart>
        </div>
        <div class="source-chart col-6 col-md-3">
          <app-expense-category-chart [categoryData]="expenseCategoryData" *ngIf="refreshTrigger >= 0"></app-expense-category-chart>
        </div>
      </section>

      <!-- Section: Evaluation Block -->
      <section class="fourth-row" aria-labelledby="expenseEvaluation">
        <h2 id="expenseEvaluation" class="sr-only">Expense Evaluation</h2>
        <app-expense-evaluation
          [weekEvolution]="weekEvolution"
          [monthEvolution]="monthEvolution"
          [yearEvolution]="yearEvolution"
          [dayExpense]="dayExpense"
          [weekExpense]="weekExpense"
          [monthExpense]="monthExpense"
          [yearExpense]="yearExpense"
          [expenses]="expenses"
          [expenseCategoryData]="expenseCategoryData"
          [paymentMethodData]="paymentMethodData"
          [weeklyExpenseData]="weeklyExpenseData"
          [monthlyExpenseData]="monthlyExpenseData"
          [topExpenses]="topExpenses"
          *ngIf="refreshTrigger >= 0"
        ></app-expense-evaluation>
      </section>

      <!-- Section: Expense Form and Table -->
      <section class="fifth-row" aria-labelledby="expenseTable">
        <h2 id="expenseTable" class="sr-only">Expense Table</h2>
        
        <div class="expense-form-section" [class.expanded]="showAddForm">
          <div class="form-header" [class.modify-mode]="isModifyMode" (click)="toggleAddForm()" (keydown.enter)="toggleAddForm()" (keydown.space)="toggleAddForm()" tabindex="0" role="button" [attr.aria-expanded]="showAddForm" aria-controls="expenseFormContent">
            <div class="form-header-content">
              <h3 class="form-title">
                <i class="fas" [ngClass]="isModifyMode ? 'fa-edit' : 'fa-plus-circle'"></i>
                {{ isModifyMode ? 'Modify Expense' : 'Add New Expense' }}
              </h3>
              <p class="form-subtitle">
                {{ isModifyMode ? 'Edit the selected expense entry' : 'Click to add a new expense entry' }}
              </p>
            </div>
            <div class="form-toggle">
              <i class="fas fa-chevron-down" [class.rotated]="showAddForm"></i>
            </div>
          </div>
          
          <div class="form-content" [class.visible]="showAddForm" id="expenseFormContent">
            <div class="form-wrapper">
              <app-expense-form
                [formGroup]="expenseForm"
                [mode]="isModifyMode ? 'edit' : 'add'"
                [paymentMethods]="paymentMethods"
                [expenseCategories]="expenseCategories"
                (formSubmit)="isModifyMode ? modifyExpense() : addExpense()"
                (cancel)="closeAddForm()"
              />
            </div>
          </div>
        </div>

        <div class="expense-table-section">
        <app-expense-table-split
          [expenses]="expenses"
          [onAdd]="onAddExpenseFromTable.bind(this)"
          [onModify]="onModifyExpense.bind(this)"
          [onDelete]="onDeleteExpense.bind(this)"
          *ngIf="refreshTrigger >= 0"
        ></app-expense-table-split>
          
          <div *ngIf="isDeleteOverlayVisible" class="delete-confirmation-overlay">
            <div class="delete-confirmation-modal">
              <div class="delete-modal-header">
                <h3 class="delete-modal-title">
                  <i class="fas fa-exclamation-triangle"></i>
                  Confirm Deletion
                </h3>
                <button 
                  class="delete-modal-close" 
                  (click)="closeOverlay()"
                  (keydown.enter)="closeOverlay()"
                  (keydown.space)="closeOverlay()"
                  aria-label="Close confirmation dialog">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <div class="delete-modal-body">
                <p class="delete-warning-text">
                  Are you sure you want to delete this expense record? This action cannot be undone.
                </p>
                <div class="delete-expense-details" *ngIf="selectedExpense">
                  <div class="delete-detail-item">
                    <span class="delete-detail-label">Amount:</span>
                    <span class="delete-detail-value">{{ selectedExpense.amount | currency }}</span>
                  </div>
                  <div class="delete-detail-item">
                    <span class="delete-detail-label">Category:</span>
                    <span class="delete-detail-value">{{ selectedExpense.category }}</span>
                  </div>
                  <div class="delete-detail-item">
                    <span class="delete-detail-label">Date:</span>
                    <span class="delete-detail-value">{{ selectedExpense.date | date:'MMM dd, yyyy' }}</span>
                  </div>
                </div>
              </div>
              <div class="delete-modal-footer">
                <button 
                  class="btn btn-secondary" 
                  (click)="closeOverlay()"
                  (keydown.enter)="closeOverlay()"
                  (keydown.space)="closeOverlay()">
                  Cancel
                </button>
                <button 
                  class="btn btn-danger" 
                  (click)="deleteExpense()"
                  (keydown.enter)="deleteExpense()"
                  (keydown.space)="deleteExpense()">
                  <i class="fas fa-trash"></i>
                  Delete Expense
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

  `,
  styleUrls: ['./expense.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    ExpenseWidgetComponent,
    ExpenseWeekChartComponent,
    ExpenseMonthChartComponent,
    ExpenseTop5Component,
    ExpenseMethodChartComponent,
    ExpenseCategoryChartComponent,
    ExpenseEvaluationComponent,
    ExpenseTableSplitComponent,
    ExpenseFormComponent,
  ],
})
export class ExpenseComponent implements OnInit, OnDestroy {
  // ===== INJECTED SERVICES =====
  private authService = inject(AuthService);
  private expenseService = inject(ExpenseService);
  private loggingService = inject(LoggingService);
  private cdr = inject(ChangeDetectorRef);
  private title = inject(Title);
  private meta = inject(Meta);
  private fb = inject(FormBuilder);

  // ===== PRIVATE PROPERTIES =====
  private destroy$ = new Subject<void>();
  private refreshSubject$ = new Subject<void>();
  private performanceMetrics = {
    dataLoadTime: 0,
    lastRefresh: 0,
    cacheHits: 0,
    totalRequests: 0
  };

  // ===== FORM PROPERTIES =====
  expenseForm: FormGroup;
  selectedExpense!: Expense;
  expenseId = 0;
  userId = 0;

  // ===== UI STATE PROPERTIES =====
  isDeleteOverlayVisible = false;
  showAddForm = false;
  isModifyMode = false;
  selectedExpenseForModify: Expense | null = null;

  // ===== CONFIGURATION PROPERTIES =====
  paymentMethods = PAYMENT_METHOD_OPTIONS;
  expenseCategories = EXPENSE_CATEGORY_OPTIONS;

  dayExpense = 0;
  weekExpense = 0;
  monthExpense = 0;
  yearExpense = 0;

  weekEvolution = 0;
  monthEvolution = 0;
  yearEvolution = 0;

  weeklyExpenseData: number[] = [];
  monthlyExpenseData: number[] = [];
  paymentMethodData: Record<string, number> = {};
  expenseCategoryData: Record<string, number> = {};
  topExpenses: { category: string; amount: number }[] = [];
  expenses: Expense[] = [];

  constructor() {
    this.title.setTitle('Expense Dashboard | Alpha Vault');
    this.meta.addTags([
      { name: 'description', content: 'Manage and track your expenses with detailed analytics, charts, and comprehensive reporting tools.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ]);

    this.expenseForm = this.fb.group({
      category: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      paymentMethod: [null, Validators.required],
      date: [null, Validators.required],
      description: [''],
    });
  }

  ngOnInit(): void {
    this.loadAllExpenseData();
    this.setupRefreshSubscription();
    this.setupExpensesSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== REFRESH FUNCTIONALITY =====
  private setupRefreshSubscription(): void {
    this.refreshSubject$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loadAllExpenseData();
    });
  }

  // ===== REAL-TIME EXPENSES SUBSCRIPTION =====
  private setupExpensesSubscription(): void {
    this.expenseService.currentUserExpenses$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((expenses: ExpenseResponseDTO[]) => {
      this.expenses = expenses;
      this.cdr.markForCheck();
    });
  }

  refreshTrigger = 0; // TrackBy reference for refresh

  trackByRefresh = (index: number, item: unknown): unknown => item;

  // ===== PUBLIC METHODS =====
  refreshAllData(): void {
    this.refreshSubject$.next();
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.isModifyMode = false;
      this.expenseForm.reset();
    }
    this.cdr.markForCheck();
  }

  closeAddForm(): void {
    this.showAddForm = false;
    this.isModifyMode = false;
    this.expenseForm.reset();
    this.cdr.markForCheck();
  }

  onAddExpenseFromTable(): void {
    this.isModifyMode = false;
    this.expenseForm.reset();
    this.showAddForm = true;
    this.cdr.markForCheck();
  }

  onAddExpense(): void {
    this.isModifyMode = false;
    this.expenseForm.reset();
    this.showAddForm = true;
    this.cdr.markForCheck();
  }

  onModifyExpense(expense: Expense): void {
    this.selectedExpense = expense;
    this.expenseId = expense.id;
    this.isModifyMode = true;
    this.showAddForm = true;
    this.selectedExpenseForModify = expense;
    
    const mappedPaymentMethod = this.mapPaymentMethodValue(expense.paymentMethod);
    const mappedCategory = this.mapCategoryValue(expense.category);
    
    this.expenseForm.reset();
    this.expenseForm.patchValue({
      category: mappedCategory,
      amount: expense.amount,
      paymentMethod: mappedPaymentMethod,
      date: this.toHtmlDateFormat(expense.date),
      description: expense.description ?? '',
    });
    
    this.cdr.markForCheck();
  }

  onDeleteExpense(id: number): void {
    this.expenseId = id;
    this.isDeleteOverlayVisible = true;
    this.cdr.markForCheck();
  }

  addExpense(): void {
    if (this.expenseForm.invalid) return;
    
    const raw = this.expenseForm.value;
    
    const sanitizedDescription = this.sanitizeInput(raw.description ?? '');
    const sanitizedCategory = this.sanitizeInput(raw.category);
    const sanitizedPaymentMethod = this.sanitizeInput(raw.paymentMethod);
    
    const amount = this.validateAmount(raw.amount);
    if (amount === null) {
      this.loggingService.error('Invalid amount provided');
      return;
    }
    
    const newExpense: ExpenseRequestDTO = {
      userId: this.userId || 0,
      category: sanitizedCategory as any,
      amount: amount,
      paymentMethod: sanitizedPaymentMethod as any,
      date: this.formatDate(raw.date),
      description: sanitizedDescription,
    };

    this.expenseService.saveExpense(newExpense)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loggingService.log('Expense added successfully, refreshing data...');
          this.loadAllExpenseData();
          this.closeAddForm();
        },
        error: (error) => {
          this.loggingService.error('Error adding expense:', error);
        }
      });
  }

  modifyExpense(): void {
    if (this.expenseForm.invalid) return;
    
    const raw = this.expenseForm.value;
    
    const sanitizedDescription = this.sanitizeInput(raw.description ?? '');
    const sanitizedCategory = this.sanitizeInput(raw.category);
    const sanitizedPaymentMethod = this.sanitizeInput(raw.paymentMethod);
    
    const amount = this.validateAmount(raw.amount);
    if (amount === null) {
      this.loggingService.error('Invalid amount provided');
      return;
    }
    
    const updatedExpense: ExpenseRequestDTO = {
      userId: this.userId || 0,
      category: sanitizedCategory as any,
      amount: amount,
      paymentMethod: sanitizedPaymentMethod as any,
      date: this.formatDate(raw.date),
      description: sanitizedDescription,
    };

    this.expenseService.updateExpense(this.expenseId, updatedExpense)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loggingService.log('Expense modified successfully, refreshing data...');
          this.loadAllExpenseData();
          this.closeAddForm();
        },
        error: (error) => {
          this.loggingService.error('Error modifying expense:', error);
        }
      });
  }

  deleteExpense(): void {
    this.expenseService.deleteExpense(this.expenseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loggingService.log('Expense deleted successfully, refreshing data...');
          this.loadAllExpenseData();
          this.expenseForm.reset();
          this.isDeleteOverlayVisible = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.loggingService.error('Error deleting expense:', error);
          this.isDeleteOverlayVisible = false;
          this.cdr.markForCheck();
        }
      });
  }

  closeOverlay(): void {
    this.isDeleteOverlayVisible = false;
    this.cdr.markForCheck();
  }

  private loadAllExpenseData(): void {
    const startTime = performance.now();
    this.performanceMetrics.totalRequests++;

    const userId = this.authService.getUserId();
    if (!userId) {
      this.loggingService.warn('No user ID available for loading expense data');
      return;
    }

    this.userId = userId;

    forkJoin({
      expenses: this.expenseService.getAllExpenses(),
      todayExpense: this.expenseService.getTodayExpense(),
      weekExpense: this.expenseService.getWeekExpense(),
      monthExpense: this.expenseService.getMonthExpense(),
      yearExpense: this.expenseService.getYearExpense(),
      weekEvolution: this.expenseService.getWeeklyEvolution(),
      monthEvolution: this.expenseService.getMonthlyEvolution(),
      yearEvolution: this.expenseService.getYearlyEvolution(),
      topExpenses: this.expenseService.getTop5ExpensesThisMonth(),
      weeklyExpenseData: this.expenseService.getExpenseForWeeksOfCurrentMonth(),
      monthlyExpenseData: this.expenseService.getExpenseForMonthsOfCurrentYear(),
      paymentMethodData: this.expenseService.getCurrentMonthPaymentMethodSummary(),
      categoryData: this.expenseService.getCurrentMonthCategorySummary()
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.expenses = data.expenses;
        this.dayExpense = data.todayExpense;
        this.weekExpense = data.weekExpense;
        this.monthExpense = data.monthExpense;
        this.yearExpense = data.yearExpense;
        this.weekEvolution = data.weekEvolution;
        this.monthEvolution = data.monthEvolution;
        this.yearEvolution = data.yearEvolution;
        this.topExpenses = Object.entries(data.topExpenses).map(([category, amount]) => ({
          category,
          amount: +Number(amount),
        }));
        this.weeklyExpenseData = data.weeklyExpenseData;
        this.monthlyExpenseData = data.monthlyExpenseData;
        this.paymentMethodData = data.paymentMethodData;
        this.expenseCategoryData = data.categoryData;

        const endTime = performance.now();
        this.performanceMetrics.dataLoadTime = endTime - startTime;
        this.performanceMetrics.lastRefresh = Date.now();

        this.refreshTrigger++;

        this.cdr.markForCheck();
      },
      error: (error) => {
        this.loggingService.error('Error loading expense data:', error);
        this.performanceMetrics.dataLoadTime = performance.now() - startTime;
      }
    });
  }

  private formatDate(input: string | Date): string {
    return formatDate(input, 'MM/dd/yyyy', 'en-US');
  }

  private mapPaymentMethodValue(paymentMethod: string | number | null | undefined): string | null {
    if (!paymentMethod) return null;
    
    const method = String(paymentMethod).toUpperCase();
    
    if (!this.paymentMethods || !Array.isArray(this.paymentMethods)) {
      return String(paymentMethod);
    }
    
    const validMethods = this.paymentMethods.map(pm => pm.value);
    const foundMethod = validMethods.find(validMethod => 
      validMethod.toUpperCase() === method || 
      validMethod === paymentMethod
    );
    
    return foundMethod || String(paymentMethod);
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

  private toHtmlDateFormat(dateStr: string): string {
    const [mm, dd, yyyy] = dateStr.split('/');
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }

  // ===== INPUT VALIDATION AND SANITIZATION =====
  private sanitizeInput(input: string): string {
    if (!input) return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .substring(0, 1000);
  }

  private validateAmount(amount: any): number | null {
    if (amount === null || amount === undefined || amount === '') {
      return null;
    }
    
    const numAmount = Number(amount);
    
    if (isNaN(numAmount)) {
      return null;
    }
    
    if (numAmount < 0) {
      return null;
    }
    
    if (numAmount > 1000000) {
      return null;
    }
    
    return Math.round(numAmount * 100) / 100;
  }
}
