// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, formatDate } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Title, Meta } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';

import { Expense } from '../../models/expense.model';
import { ExpenseService } from '../../core/services/expense.service';
import { PAYMENT_METHOD_OPTIONS } from '../../enums/payment-method';
import { EXPENSE_CATEGORY_OPTIONS } from '../../enums/expense-category';

import { ExpenseWidgetComponent } from './expense-widget/expense-widget.component';
import { ExpenseWeekChartComponent } from './expense-week-chart/expense-week-chart.component';
import { ExpenseMonthChartComponent } from './expense-month-chart/expense-month-chart.component';
import { ExpenseTop5Component } from './expense-top5/expense-top5.component';
import { ExpenseMethodChartComponent } from './expense-method-chart/expense-method-chart.component';
import { ExpenseCategoryChartComponent } from './expense-category-chart/expense-category-chart.component';
import { ExpenseEvaluationComponent } from './expense-evaluation/expense-evaluation.component';
import { ExpenseTableModule } from './expense-table/expense-table.module';
import { ExpenseFormComponent } from './expense-form/expense-form.component';
import { OverlayContainerComponent } from '../../shared/components/overlay-container/overlay-container/overlay-container.component';

@Component({
  standalone: true,
  selector: 'app-expense',
  template: `
    <!-- Section: Expense Dashboard -->
    <main class="parent-container" role="main">
      <h1 class="sr-only">Expense Dashboard</h1>
      
      <!-- Section: Summary Widget Overview -->
      <section class="first-row" aria-labelledby="expenseSummary">
        <h2 id="expenseSummary" class="sr-only">Expense Summary</h2>
        <app-expense-widget
          [dayExpense]="dayExpense"
          [weekExpense]="weekExpense"
          [monthExpense]="monthExpense"
          [yearExpense]="yearExpense"
        ></app-expense-widget>
      </section>

      <!-- Section: Week and Month Charts -->
      <section class="second-row row" aria-labelledby="expenseCharts">
        <h2 id="expenseCharts" class="sr-only">Expense Charts</h2>
        <div class="weekly-chart col-12 col-md-6">
          <app-expense-week-chart [weeklyData]="weeklyExpenseData"></app-expense-week-chart>
        </div>
        <div class="monthly-chart col-12 col-md-6">
          <app-expense-month-chart [monthlyData]="monthlyExpenseData"></app-expense-month-chart>
        </div>
      </section>

      <!-- Section: Top 5, Method, Category -->
      <section class="third-row row" aria-labelledby="expenseAnalytics">
        <h2 id="expenseAnalytics" class="sr-only">Expense Analytics</h2>
        <div class="top-5-table col-12 col-md-6">
          <app-expense-top5 [topExpenses]="topExpenses"></app-expense-top5>
        </div>
        <div class="method-chart col-6 col-md-3">
          <app-expense-method-chart [methodData]="paymentMethodData"></app-expense-method-chart>
        </div>
        <div class="source-chart col-6 col-md-3">
          <app-expense-category-chart [categoryData]="expenseCategoryData"></app-expense-category-chart>
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
        ></app-expense-evaluation>
      </section>

      <!-- Section: Expense Table -->
      <section class="fifth-row" aria-labelledby="expenseTable">
        <h2 id="expenseTable" class="sr-only">Expense Table</h2>
        <app-expense-table
          [expenses]="expenses"
          [onAdd]="onAddExpense.bind(this)"
          [onModify]="onModifyExpense.bind(this)"
          [onDelete]="onDeleteExpense.bind(this)"
        ></app-expense-table>
      </section>
    </main>

    <!-- Section: Add Overlay -->
    <app-overlay-container
      *ngIf="isAddOverlayVisible"
      [title]="'Add Expense'"
      [theme]="'add'"
      (cancel)="closeOverlay()"
    >
      <app-expense-form
        [formGroup]="expenseForm"
        [mode]="'add'"
        (formSubmit)="addExpense()"
        (cancel)="closeOverlay()"
      />
    </app-overlay-container>

    <!-- Section: Modify Overlay -->
    <app-overlay-container
      *ngIf="isModifyOverlayVisible"
      [title]="'Modify Expense'"
      [theme]="'modify'"
      (cancel)="closeOverlay()"
    >
      <app-expense-form
        [formGroup]="expenseForm"
        [mode]="'modify'"
        (formSubmit)="modifyExpense()"
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
        Are you sure you want to delete this expense record?
      </p>
      <div class="delete-button-group d-flex justify-content-end gap-2">
        <button class="btn btn-secondary" (click)="closeOverlay()">Cancel</button>
        <button class="btn btn-danger" (click)="deleteExpense()">Delete</button>
      </div>
    </app-overlay-container>
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
    ExpenseTableModule,
    ExpenseFormComponent,
    OverlayContainerComponent,
  ],
})
export class ExpenseComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  expenseForm: FormGroup;
  selectedExpense!: Expense;
  expenseId = 0;

  isModifyOverlayVisible = false;
  isAddOverlayVisible = false;
  isDeleteOverlayVisible = false;

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
  paymentMethodData: { [key: string]: number } = {};
  expenseCategoryData: { [key: string]: number } = {};
  topExpenses: { category: string; amount: number }[] = [];
  expenses: Expense[] = [];

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private cdr: ChangeDetectorRef,
    private title: Title,
    private meta: Meta,
  ) {
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
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onAddExpense(): void {
    this.expenseForm.reset();
    this.isAddOverlayVisible = true;
    document.body.style.overflow = 'hidden';
    this.cdr.markForCheck();
  }

  onModifyExpense(expense: Expense): void {
    this.selectedExpense = expense;
    this.expenseId = expense.id;
    this.expenseForm.reset();
    this.isModifyOverlayVisible = true;
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      this.expenseForm.patchValue({
        category: expense.category,
        amount: expense.amount,
        paymentMethod: expense.paymentMethod,
        date: this.toHtmlDateFormat(expense.date),
        description: expense.description ?? '',
      });
      this.cdr.markForCheck();
    }, 0);
  }

  onDeleteExpense(id: number): void {
    this.expenseId = id;
    this.isDeleteOverlayVisible = true;
    this.cdr.markForCheck();
  }

  addExpense(): void {
    if (this.expenseForm.invalid) return;
    
    const raw = this.expenseForm.value;
    const newExpense: Expense = {
      id: 0,
      userId: 0,
      category: raw.category,
      amount: raw.amount,
      paymentMethod: raw.paymentMethod,
      date: this.formatDate(raw.date),
      description: raw.description ?? '',
    };

    this.expenseService.saveExpense(newExpense)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadAllExpenseData();
        this.expenseForm.reset();
        this.isAddOverlayVisible = false;
        this.cdr.markForCheck();
      });
  }

  modifyExpense(): void {
    if (this.expenseForm.invalid) return;
    
    const raw = this.expenseForm.value;
    const updatedExpense: Expense = {
      id: this.expenseId,
      userId: 0,
      category: raw.category,
      amount: raw.amount,
      paymentMethod: raw.paymentMethod,
      date: this.formatDate(raw.date),
      description: raw.description ?? '',
    };

    this.expenseService.updateExpense(this.expenseId, updatedExpense)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadAllExpenseData();
        this.expenseForm.reset();
        this.isModifyOverlayVisible = false;
        this.cdr.markForCheck();
      });
  }

  deleteExpense(): void {
    this.expenseService.deleteExpense(this.expenseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadAllExpenseData();
        this.expenseForm.reset();
        this.isDeleteOverlayVisible = false;
        this.cdr.markForCheck();
      });
  }

  closeOverlay(): void {
    this.isAddOverlayVisible = false;
    this.isModifyOverlayVisible = false;
    this.isDeleteOverlayVisible = false;
    document.body.style.overflow = 'auto';
    this.cdr.markForCheck();
  }

  private loadAllExpenseData(): void {
    this.expenseService.getTodayExpense()
      .pipe(takeUntil(this.destroy$))
      .subscribe((v) => {
        this.dayExpense = v;
        this.cdr.markForCheck();
      });

    this.expenseService.getWeekExpense()
      .pipe(takeUntil(this.destroy$))
      .subscribe((v) => {
        this.weekExpense = v;
        this.cdr.markForCheck();
      });

    this.expenseService.getMonthExpense()
      .pipe(takeUntil(this.destroy$))
      .subscribe((v) => {
        this.monthExpense = v;
        this.cdr.markForCheck();
      });

    this.expenseService.getYearExpense()
      .pipe(takeUntil(this.destroy$))
      .subscribe((v) => {
        this.yearExpense = v;
        this.cdr.markForCheck();
      });

    this.expenseService.getWeeklyEvolution()
      .pipe(takeUntil(this.destroy$))
      .subscribe((v) => {
        this.weekEvolution = v;
        this.cdr.markForCheck();
      });

    this.expenseService.getMonthlyEvolution()
      .pipe(takeUntil(this.destroy$))
      .subscribe((v) => {
        this.monthEvolution = v;
        this.cdr.markForCheck();
      });

    this.expenseService.getYearlyEvolution()
      .pipe(takeUntil(this.destroy$))
      .subscribe((v) => {
        this.yearEvolution = v;
        this.cdr.markForCheck();
      });

    this.expenseService.getTop5ExpensesThisMonth()
      .pipe(takeUntil(this.destroy$))
      .subscribe((list) => {
        this.topExpenses = list.map((item) => ({
          category: item.category,
          amount: +item.amount,
        }));
        this.cdr.markForCheck();
      });

    this.expenseService.getAllExpenses()
      .pipe(takeUntil(this.destroy$))
      .subscribe((list) => {
        this.expenses = list;
        this.cdr.markForCheck();
      });

    this.expenseService.getExpenseForWeeksOfCurrentMonth()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.weeklyExpenseData = data;
        this.cdr.markForCheck();
      });

    this.expenseService.getExpenseForTwelveMonthsOfCurrentYear()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.monthlyExpenseData = data;
        this.cdr.markForCheck();
      });

    this.expenseService.getPaymentMethodSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.paymentMethodData = data;
        this.cdr.markForCheck();
      });

    this.expenseService.getExpenseCategorySummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.expenseCategoryData = data;
        this.cdr.markForCheck();
      });
  }

  private formatDate(input: string | Date): string {
    return formatDate(input, 'MM/dd/yyyy', 'en-US');
  }

  private toHtmlDateFormat(dateStr: string): string {
    const [mm, dd, yyyy] = dateStr.split('/');
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }
}
