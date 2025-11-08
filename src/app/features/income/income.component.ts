/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component IncomeComponent
  @description Main income dashboard component with comprehensive income management
*/

import { CommonModule, formatDate } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { debounceTime, distinctUntilChanged, forkJoin, Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { IncomeService } from '../../core/services/income.service';
import { LoggingService } from '../../core/services/logging.service';
import { PAYMENT_METHOD_OPTIONS } from '../../enums/payment-method';
import { Income } from '../../models/income.model';
import { OverlayContainerComponent } from '../../shared/components/overlay-container/overlay-container/overlay-container.component';
import { IncomeEvaluationComponent } from './income-evaluation/income-evaluation.component';
import { IncomeFormComponent } from './income-form/income-form/income-form.component';
import { IncomeMethodChartComponent } from './income-method-chart/income-method-chart.component';
import { IncomeMonthChartComponent } from './income-month-chart/income-month-chart.component';
import { IncomeSourceChartComponent } from './income-source-chart/income-source-chart.component';
import { IncomeTableSplitComponent } from './income-table/income-table-split.component';
import { IncomeTop5Component } from './income-top5/income-top5.component';
import { IncomeWeekChartComponent } from './income-week-chart/income-week-chart.component';
import { IncomeWidgetNewComponent } from './income-widget/income-widget-new.component';

@Component({
  standalone: true,
  selector: 'app-income',
  template: `
    <main class="parent-container" role="main">
      <h1 class="sr-only">Income Dashboard</h1>
      
      <section class="first-row row" aria-labelledby="incomeSummary">
        <h2 id="incomeSummary" class="sr-only">Income Summary</h2>
        <ng-container *ngFor="let trigger of [refreshTrigger]; trackBy: trackByRefresh">
          <app-income-widget-new 
            [dayIncome]="dayIncome"
            [weekIncome]="weekIncome" 
            [monthIncome]="monthIncome"
            [yearIncome]="yearIncome">
          </app-income-widget-new>
        </ng-container>
      </section>

      <section class="second-row row" aria-labelledby="incomeCharts">
        <h2 id="incomeCharts" class="sr-only">Income Charts</h2>
        <div class="weekly-chart col-12 col-md-6">
          <app-income-week-chart [weeklyData]="weeklyIncomeData" *ngIf="refreshTrigger >= 0"></app-income-week-chart>
        </div>
        <div class="monthly-chart col-12 col-md-6">
          <app-income-month-chart [monthlyData]="monthlyIncomeData" *ngIf="refreshTrigger >= 0"></app-income-month-chart>
        </div>
      </section>

      <section class="third-row row" aria-labelledby="incomeAnalytics">
        <h2 id="incomeAnalytics" class="sr-only">Income Analytics</h2>
        <div class="top-5-table col-12 col-md-6">
          <app-income-top5 [topIncomes]="topIncomes" *ngIf="refreshTrigger >= 0"></app-income-top5>
        </div>
        <div class="method-chart col-6 col-md-3">
          <app-income-method-chart [methodData]="paymentMethodData" *ngIf="refreshTrigger >= 0"></app-income-method-chart>
        </div>
        <div class="source-chart col-6 col-md-3">
          <app-income-source-chart [sourceData]="incomeSourceData" *ngIf="refreshTrigger >= 0"></app-income-source-chart>
        </div>
      </section>

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
          (addIncome)="onAddIncomeFromEvaluation()"
          *ngIf="refreshTrigger >= 0"
        ></app-income-evaluation>
      </section>

      <section class="fifth-row" aria-labelledby="incomeTable">
        <h2 id="incomeTable" class="sr-only">Income Management</h2>
        
        <div class="add-income-section" [class.expanded]="showAddForm">
          <div class="form-header" [class.modify-mode]="isModifyMode" (click)="toggleAddForm()" (keydown)="onFormHeaderKeydown($event)" 
               role="button" tabindex="0" [attr.aria-expanded]="showAddForm" 
               [attr.aria-label]="isModifyMode ? 'Toggle modify income form' : 'Toggle add income form'">
            <div class="form-header-content">
              <h3 class="form-title">
                <i class="fas" [ngClass]="isModifyMode ? 'fa-edit' : 'fa-plus-circle'"></i>
                {{ isModifyMode ? 'Modify Income' : 'Add New Income' }}
              </h3>
              <p class="form-subtitle">
                {{ isModifyMode ? 'Edit the selected income entry' : 'Click to add a new income entry' }}
              </p>
            </div>
            <div class="form-toggle">
              <i class="fas fa-chevron-down" [class.rotated]="showAddForm"></i>
            </div>
          </div>
          
          <div class="form-content" [class.visible]="showAddForm">
            <div class="form-wrapper">
              <app-income-form
                [formGroup]="incomeForm"
                [mode]="isModifyMode ? 'edit' : 'add'"
                [paymentMethods]="paymentMethods"
                (formSubmit)="isModifyMode ? modifyIncome() : addIncome()"
                (cancel)="closeAddForm()"
              />
            </div>
          </div>
        </div>

        <div class="income-table-section">
        <app-income-table-split
          [incomes]="incomes"
          [onAdd]="onAddIncomeFromTable.bind(this)"
          [onModify]="onModifyIncome.bind(this)"
          [onDelete]="onDeleteIncome.bind(this)"
          *ngIf="refreshTrigger >= 0"
        ></app-income-table-split>
          
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
              
              <div class="delete-modal-content">
                <p class="delete-text">
                  Are you sure you want to delete this income record?
                </p>
                <p class="delete-warning">
                  <i class="fas fa-info-circle"></i>
                  This action cannot be undone.
                </p>
              </div>
              
              <div class="delete-modal-actions">
                <button 
                  class="btn btn-secondary" 
                  (click)="closeOverlay()"
                  (keydown.enter)="closeOverlay()"
                  (keydown.space)="closeOverlay()">
                  Cancel
                </button>
                <button 
                  class="btn btn-danger" 
                  (click)="deleteIncome()"
                  (keydown.enter)="deleteIncome()"
                  (keydown.space)="deleteIncome()">
                  <i class="fas fa-trash"></i>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

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

  `,
  styleUrls: ['./income.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IncomeWidgetNewComponent,
    IncomeWeekChartComponent,
    IncomeMonthChartComponent,
    IncomeTop5Component,
    IncomeMethodChartComponent,
    IncomeSourceChartComponent,
    IncomeEvaluationComponent,
    IncomeTableSplitComponent,
    IncomeFormComponent,
    OverlayContainerComponent,
  ],
})
export class IncomeComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  private refreshSubject$ = new Subject<void>();
  private performanceMetrics = {
    dataLoadTime: 0,
    lastRefresh: 0,
    cacheHits: 0,
    totalRequests: 0
  };

  incomeForm!: FormGroup;
  selectedIncome!: Income;
  incomeId = 0;

  isModifyOverlayVisible = false;
  showAddForm = false;
  isDeleteOverlayVisible = false;
  isModifyMode = false;
  selectedIncomeForModify: Income | null = null;

  paymentMethods = PAYMENT_METHOD_OPTIONS;

  dayIncome = 0;
  weekIncome = 0;
  monthIncome = 0;
  yearIncome = 0;
  refreshTrigger = 0;

  weekEvolution = 0;
  monthEvolution = 0;
  yearEvolution = 0;

  incomeSourceData: Record<string, number> = {};
  paymentMethodData: Record<string, number> = {};
  weeklyIncomeData: number[] = [];
  monthlyIncomeData: number[] = [];

  topIncomes: { category: string; amount: number }[] = [];
  incomes: Income[] = [];
  userId = 0;

  private readonly fb = inject(FormBuilder);
  private readonly incomeService = inject(IncomeService);
  private readonly loggingService = inject(LoggingService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly authService = inject(AuthService);

  constructor() {
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
    this.refreshSubject$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loadAllIncomeData();
    });

    // Fix subscription leak: Add takeUntil to userId$ subscription
    this.authService.userId$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(userId => {
      this.userId = userId || 0;
      if (this.userId > 0) {
        this.refreshSubject$.next();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.incomeForm.reset({ isReceived: false });
    }
    this.cdr.markForCheck();
  }

  closeAddForm(): void {
    this.showAddForm = false;
    this.isModifyMode = false;
    this.selectedIncomeForModify = null;
    this.cdr.markForCheck();
  }

  onFormHeaderKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleAddForm();
    }
  }

  onAddIncomeFromTable(): void {
    this.isModifyMode = false;
    this.selectedIncomeForModify = null;
    this.incomeForm.reset({ isReceived: false });
    this.showAddForm = true;
    this.cdr.markForCheck();
  }

  onAddIncomeFromEvaluation(): void {
    this.isModifyMode = false;
    this.selectedIncomeForModify = null;
    this.incomeForm.reset({ isReceived: false });
    this.showAddForm = true;
    this.cdr.markForCheck();
  }

  onModifyIncome(income: Income): void {
    this.selectedIncome = income;
    this.incomeId = income.id;
    this.isModifyMode = true;
    this.selectedIncomeForModify = income;
    
    const mappedPaymentMethod = this.mapPaymentMethodValue(income.paymentMethod);
    
    this.incomeForm.reset();
    this.incomeForm.patchValue({
      source: income.source,
      amount: income.amount,
      paymentMethod: mappedPaymentMethod,
      date: this.toHtmlDateFormat(income.date),
      description: income.description ?? '',
      isReceived: Boolean(income.isReceived),
    });
    
    this.showAddForm = true;
    this.cdr.markForCheck();
  }

  onDeleteIncome(id: number): void {
    this.incomeId = id;
    this.isDeleteOverlayVisible = true;
    this.cdr.markForCheck();
  }

  addIncome(): void {
    if (this.incomeForm.invalid) {
      return;
    }
    
    const raw = this.incomeForm.value;
    const newIncome: Income = {
      id: 0,
      userId: this.userId,
      source: this.sanitizeInput(raw.source),
      amount: raw.amount,
      paymentMethod: raw.paymentMethod,
      date: this.formatDate(raw.date),
      description: this.sanitizeInput(raw.description ?? ''),
      isReceived: raw.isReceived,
      received: raw.isReceived,
    };

    this.incomeService.saveIncome(newIncome)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.refreshAllData();
          if (this.incomeForm) {
            this.incomeForm.reset();
          }
          this.closeAddForm();
        },
        error: (error) => {
          this.loggingService.error('Error adding income:', error);
          this.cdr.markForCheck();
        }
      });
  }

  modifyIncome(): void {
    if (this.incomeForm.invalid) {
      return;
    }
    
    const raw = this.incomeForm.value;
    const updatedIncome: Income = {
      id: this.incomeId,
      userId: this.userId,
      source: this.sanitizeInput(raw.source),
      amount: raw.amount,
      paymentMethod: raw.paymentMethod,
      date: this.formatDate(raw.date),
      description: this.sanitizeInput(raw.description ?? ''),
      isReceived: raw.isReceived,
      received: raw.isReceived,
    };

    this.incomeService.updateIncome(this.incomeId, updatedIncome)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.refreshAllData();
          if (this.incomeForm) {
            this.incomeForm.reset();
          }
          this.closeAddForm();
        },
        error: (error) => {
          this.loggingService.error('Error modifying income:', error);
          this.cdr.markForCheck();
        }
      });
  }

  deleteIncome(): void {
    this.incomeService.deleteIncome(this.incomeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.refreshAllData();
          if (this.incomeForm) {
            this.incomeForm.reset();
          }
          this.isDeleteOverlayVisible = false;
        },
        error: (error) => {
          this.loggingService.error('Error deleting income:', error);
          this.cdr.markForCheck();
        }
      });
  }

  closeOverlay(): void {
    this.isModifyOverlayVisible = false;
    this.isDeleteOverlayVisible = false;
    document.body.style.overflow = 'auto';
    this.cdr.markForCheck();
  }

  private refreshAllData(): void {
    this.refreshTrigger++;
    this.loadAllIncomeData();
    
    const timeoutId = setTimeout(() => {
      this.cdr.detectChanges();
    }, 200);
    
    this.destroy$.subscribe(() => {
      clearTimeout(timeoutId);
    });
  }

  private loadAllIncomeData(): void {
    if (!this.userId || this.userId <= 0) {
      return;
    }
    
    const startTime = performance.now();
    this.performanceMetrics.totalRequests++;
    
    forkJoin({
      today: this.incomeService.getTodayIncome(this.userId),
      week: this.incomeService.getWeekIncome(),
      month: this.incomeService.getMonthIncome(),
      year: this.incomeService.getYearIncome(),
      weekEvolution: this.incomeService.getWeeklyEvolution(this.userId),
      monthEvolution: this.incomeService.getMonthlyEvolution(this.userId),
      yearEvolution: this.incomeService.getYearlyEvolution(this.userId),
      top5: this.incomeService.getTop5IncomeThisMonth(),
      allIncomes: this.incomeService.getAllIncomes(),
      weeklyData: this.incomeService.getIncomeForWeeksOfCurrentMonth(),
      monthlyData: this.incomeService.getIncomeForMonthsOfCurrentYear(),
      paymentMethods: this.incomeService.getCurrentMonthPaymentMethodSummary(this.userId),
      sources: this.incomeService.getCurrentMonthSourceSummary(this.userId)
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        this.dayIncome = data.today || 0;
        this.weekIncome = data.week || 0;
        this.monthIncome = data.month || 0;
        this.yearIncome = data.year || 0;
        this.weekEvolution = data.weekEvolution || 0;
        this.monthEvolution = data.monthEvolution || 0;
        this.yearEvolution = data.yearEvolution || 0;
        
        this.topIncomes = Object.entries(data.top5 || {}).map(([category, amount]) => ({
          category,
          amount,
        }));
        
        this.incomes = (data.allIncomes || []).map(income => ({
          ...income,
          isReceived: income.received,
          received: income.received
        }));
        
        this.weeklyIncomeData = data.weeklyData || [];
        this.monthlyIncomeData = data.monthlyData || [];
        
        this.paymentMethodData = data.paymentMethods || {};
        this.incomeSourceData = data.sources || {};
        
        const endTime = performance.now();
        this.performanceMetrics.dataLoadTime = endTime - startTime;
        this.performanceMetrics.lastRefresh = Date.now();
        
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.loggingService.error('Error loading income data:', error);
        this.resetAllData();
        this.cdr.markForCheck();
      }
    });
  }

  private resetAllData(): void {
    this.dayIncome = 0;
    this.weekIncome = 0;
    this.monthIncome = 0;
    this.yearIncome = 0;
    this.weekEvolution = 0;
    this.monthEvolution = 0;
    this.yearEvolution = 0;
    this.topIncomes = [];
    this.incomes = [];
    this.weeklyIncomeData = [];
    this.monthlyIncomeData = [];
    this.paymentMethodData = {};
    this.incomeSourceData = {};
  }

  private formatDate(input: string | Date): string {
    return formatDate(input, 'MM/dd/yyyy', 'en-US');
  }

  private toHtmlDateFormat(dateStr: string): string {
    const [mm, dd, yyyy] = dateStr.split('/');
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }

  trackByRefresh(index: number, trigger: number): number {
    return trigger;
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

  private sanitizeInput(input: string): string {
    if (!input) return '';
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }
}
