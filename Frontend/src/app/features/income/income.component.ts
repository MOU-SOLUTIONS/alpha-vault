// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, formatDate } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';

import { Income } from '../../models/income.model';
import { IncomeService } from '../../core/services/income.service';
import { PAYMENT_METHOD_OPTIONS } from '../../enums/payment-method';

import { IncomeWidgetComponent } from './income-widget/income-widget.component';
import { IncomeWeekChartComponent } from './income-week-chart/income-week-chart.component';
import { IncomeMonthChartComponent } from './income-month-chart/income-month-chart.component';
import { IncomeTop5Component } from './income-top5/income-top5.component';
import { IncomeMethodChartComponent } from './income-method-chart/income-method-chart.component';
import { IncomeSourceChartComponent } from './income-source-chart/income-source-chart.component';
import { IncomeEvaluationComponent } from './income-evaluation/income-evaluation.component';
import { IncomeTableModule } from './income-table/income-table.module';
import { IncomeFormComponent } from './income-form/income-form/income-form.component';
import { OverlayContainerComponent } from '../../shared/components/overlay-container/overlay-container/overlay-container.component';

@Component({
  standalone: true,
  selector: 'app-income',
  template: `
    <!-- Section: Income Dashboard -->
    <main class="parent-container" role="main">
      <h1 class="sr-only">Income Dashboard</h1>
      
      <!-- Section: Summary Widget Overview -->
      <section class="first-row row" aria-labelledby="incomeSummary">
        <h2 id="incomeSummary" class="sr-only">Income Summary</h2>
        <app-income-widget
          [dayIncome]="dayIncome"
          [weekIncome]="weekIncome"
          [monthIncome]="monthIncome"
          [yearIncome]="yearIncome"
        ></app-income-widget>
      </section>

      <!-- Section: Week and Month Charts -->
      <section class="second-row row" aria-labelledby="incomeCharts">
        <h2 id="incomeCharts" class="sr-only">Income Charts</h2>
        <div class="weekly-chart col-12 col-md-6">
          <app-income-week-chart [weeklyData]="weeklyIncomeData"></app-income-week-chart>
        </div>
        <div class="monthly-chart col-12 col-md-6">
          <app-income-month-chart [monthlyData]="monthlyIncomeData"></app-income-month-chart>
        </div>
      </section>

      <!-- Section: Top 5, Method, Source -->
      <section class="third-row row" aria-labelledby="incomeAnalytics">
        <h2 id="incomeAnalytics" class="sr-only">Income Analytics</h2>
        <div class="top-5-table col-12 col-md-6">
          <app-income-top5 [topIncomes]="topIncomes"></app-income-top5>
        </div>
        <div class="method-chart col-6 col-md-3">
          <app-income-method-chart [methodData]="paymentMethodData"></app-income-method-chart>
        </div>
        <div class="source-chart col-6 col-md-3">
          <app-income-source-chart [sourceData]="incomeSourceData"></app-income-source-chart>
        </div>
      </section>

      <!-- Section: Evaluation Block -->
      <section class="fourth-row" aria-labelledby="incomeEvaluation">
        <h2 id="incomeEvaluation" class="sr-only">Income Evaluation</h2>
        <app-income-evaluation
          [weekEvolution]="weekEvolution"
          [monthEvolution]="monthEvolution"
          [yearEvolution]="yearEvolution"
          [dayIncome]="dayIncome"
          [weekIncome]="weekIncome"
          [monthIncome]="monthIncome"
          [yearIncome]="yearIncome"
          [incomes]="incomes"
          [incomeSourceData]="incomeSourceData"
          [paymentMethodData]="paymentMethodData"
          [weeklyIncomeData]="weeklyIncomeData"
          [monthlyIncomeData]="monthlyIncomeData"
          [topIncomes]="topIncomes"
        ></app-income-evaluation>
      </section>

      <!-- Section: Income Table -->
      <section class="fifth-row" aria-labelledby="incomeTable">
        <h2 id="incomeTable" class="sr-only">Income Table</h2>
        <app-income-table
          [incomes]="incomes"
          [onAdd]="onAddIncome.bind(this)"
          [onModify]="onModifyIncome.bind(this)"
          [onDelete]="onDeleteIncome.bind(this)"
        ></app-income-table>
      </section>
    </main>

    <!-- Section: Add Overlay -->
    <app-overlay-container
      *ngIf="isAddOverlayVisible"
      [title]="'Add Income'"
      [theme]="'add'"
      (cancel)="closeOverlay()"
    >
      <app-income-form
        [formGroup]="incomeForm"
        [mode]="'add'"
        [paymentMethods]="paymentMethods"
        (formSubmit)="addIncome()"
        (cancel)="closeOverlay()"
      />
    </app-overlay-container>

    <!-- Section: Modify Overlay -->
    <app-overlay-container
      *ngIf="isModifyOverlayVisible"
      [title]="'Modify Income'"
      [theme]="'modify'"
      (cancel)="closeOverlay()"
    >
      <app-income-form
        [formGroup]="incomeForm"
        [mode]="'edit'"
        [paymentMethods]="paymentMethods"
        (formSubmit)="modifyIncome()"
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
        Are you sure you want to delete this income record?
      </p>
      <div class="delete-button-group d-flex justify-content-end gap-2">
        <button class="btn btn-secondary" (click)="closeOverlay()">Cancel</button>
        <button class="btn btn-danger" (click)="deleteIncome()">Delete</button>
      </div>
    </app-overlay-container>
  `,
  styleUrls: ['./income.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IncomeWidgetComponent,
    IncomeWeekChartComponent,
    IncomeMonthChartComponent,
    IncomeTop5Component,
    IncomeMethodChartComponent,
    IncomeSourceChartComponent,
    IncomeEvaluationComponent,
    IncomeTableModule,
    IncomeFormComponent,
    OverlayContainerComponent,
  ],
})
export class IncomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  incomeForm: FormGroup;
  selectedIncome!: Income;
  incomeId = 0;

  isModifyOverlayVisible = false;
  isAddOverlayVisible = false;
  isDeleteOverlayVisible = false;

  paymentMethods = PAYMENT_METHOD_OPTIONS;

  dayIncome = 0;
  weekIncome = 0;
  monthIncome = 0;
  yearIncome = 0;

  weekEvolution = 0;
  monthEvolution = 0;
  yearEvolution = 0;

  incomeSourceData: { [key: string]: number } = {};
  paymentMethodData: { [key: string]: number } = {};
  weeklyIncomeData: number[] = [];
  monthlyIncomeData: number[] = [];

  topIncomes: { category: string; amount: number }[] = [];
  incomes: Income[] = [];

  constructor(
    private fb: FormBuilder,
    private incomeService: IncomeService,
    private cdr: ChangeDetectorRef,
    private title: Title,
    private meta: Meta,
  ) {
    this.title.setTitle('Income Dashboard | Alpha Vault');
    this.meta.addTags([
      { name: 'description', content: 'Track and manage your income with detailed analytics, charts, and comprehensive reporting tools.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ]);

    this.incomeForm = this.fb.group({
      source: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      paymentMethod: [null, Validators.required],
      date: [null, Validators.required],
      description: [''],
      isReceived: [false],
    });
  }

  ngOnInit(): void {
    this.loadAllIncomeData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onAddIncome(): void {
    this.incomeForm.reset({ isReceived: false });
    this.isAddOverlayVisible = true;
    document.body.style.overflow = 'hidden';
    this.cdr.markForCheck();
  }

  onModifyIncome(income: Income): void {
    this.selectedIncome = income;
    this.incomeId = income.id;
    this.incomeForm.reset();
    this.isModifyOverlayVisible = true;
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      this.incomeForm.patchValue({
        source: income.source,
        amount: income.amount,
        paymentMethod: income.paymentMethod,
        date: this.toHtmlDateFormat(income.date),
        description: income.description ?? '',
        isReceived: Boolean(income.isReceived),
      });
      this.cdr.markForCheck();
    }, 0);
  }

  onDeleteIncome(id: number): void {
    this.incomeId = id;
    this.isDeleteOverlayVisible = true;
    this.cdr.markForCheck();
  }

  addIncome(): void {
    if (this.incomeForm.invalid) return;
    
    const raw = this.incomeForm.value;
    const newIncome: Income = {
      id: 0,
      userId: 0,
      source: raw.source,
      amount: raw.amount,
      paymentMethod: raw.paymentMethod,
      date: this.formatDate(raw.date),
      description: raw.description ?? '',
      isReceived: raw.isReceived,
    };

    this.incomeService.saveIncome(newIncome)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadAllIncomeData();
        this.incomeForm.reset();
        this.isAddOverlayVisible = false;
        this.cdr.markForCheck();
      });
  }

  modifyIncome(): void {
    if (this.incomeForm.invalid) return;
    
    const raw = this.incomeForm.value;
    const updatedIncome: Income = {
      id: this.incomeId,
      userId: 0,
      source: raw.source,
      amount: raw.amount,
      paymentMethod: raw.paymentMethod,
      date: this.formatDate(raw.date),
      description: raw.description ?? '',
      isReceived: raw.isReceived,
    };

    this.incomeService.updateIncome(this.incomeId, updatedIncome)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadAllIncomeData();
        this.incomeForm.reset();
        this.isModifyOverlayVisible = false;
        this.cdr.markForCheck();
      });
  }

  deleteIncome(): void {
    this.incomeService.deleteIncome(this.incomeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadAllIncomeData();
        this.incomeForm.reset();
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

  private loadAllIncomeData(): void {
    this.incomeService.getTodayIncome()
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this.dayIncome = val;
        this.cdr.markForCheck();
      });

    this.incomeService.getWeekIncome()
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this.weekIncome = val;
        this.cdr.markForCheck();
      });

    this.incomeService.getMonthIncome()
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this.monthIncome = val;
        this.cdr.markForCheck();
      });

    this.incomeService.getYearIncome()
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this.yearIncome = val;
        this.cdr.markForCheck();
      });

    this.incomeService.getWeeklyEvolution()
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this.weekEvolution = val;
        this.cdr.markForCheck();
      });

    this.incomeService.getMonthlyEvolution()
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this.monthEvolution = val;
        this.cdr.markForCheck();
      });

    this.incomeService.getYearlyEvolution()
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this.yearEvolution = val;
        this.cdr.markForCheck();
      });

    this.incomeService.getTop5IncomeThisMonth()
      .pipe(takeUntil(this.destroy$))
      .subscribe((source) => {
        this.topIncomes = Object.entries(source).map(([category, amount]) => ({
          category,
          amount,
        }));
        this.cdr.markForCheck();
      });

    this.incomeService.getAllIncomes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this.incomes = val;
        this.cdr.markForCheck();
      });

    this.incomeService.getIncomeForWeeksOfCurrentMonth()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.weeklyIncomeData = data;
        this.cdr.markForCheck();
      });

    this.incomeService.getIncomeForMonthsOfCurrentYear()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.monthlyIncomeData = data;
        this.cdr.markForCheck();
      });

    this.incomeService.getPaymentMethodSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (!data || Object.keys(data).length === 0) {
          this.paymentMethodData = {};
        } else {
          this.paymentMethodData = data;
        }
        this.cdr.markForCheck();
      });

    this.incomeService.getIncomeSourceSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe((source) => {
        if (!source || Object.keys(source).length === 0) {
          this.incomeSourceData = {};
        } else {
          this.incomeSourceData = source;
        }
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
