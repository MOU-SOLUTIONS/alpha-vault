/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component DebtComponent
  @description Main debt dashboard component for managing debt summary
*/  

import { CommonModule, formatDate, isPlatformBrowser } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { SeoService } from '../../core/seo/seo.service';
import { DebtService } from '../../core/services/debt.service';
import { LoggingService } from '../../core/services/logging.service';
import { NotificationService } from '../../core/services/notification.service';
import { Debt, DebtRequest, RecurrenceType } from '../../models/debt.model';
import { OverlayContainerComponent } from '../../shared/components/overlay-container/overlay-container/overlay-container.component';
import { DebtCreditorChartComponent } from './debt-creditor-chart/debt-creditor-chart.component';
import { DebtDueDateChartComponent } from './debt-due-date-chart/debt-due-date-chart.component';
import { DebtEvaluationComponent } from './debt-evaluation/debt-evaluation.component';
import { DebtFormComponent } from './debt-form/debt-form.component';
import { DebtProgressComponent } from './debt-progress/debt-progress.component';
import { DebtTableComponent } from './debt-table/debt-table.component';
import { DebtWidgetComponent } from './debt-widget/debt-widget.component';

@Component({
  standalone: true,
  selector: 'app-debt',
  templateUrl: './debt.component.html',
  styleUrls: ['./debt.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    DebtWidgetComponent,
    DebtProgressComponent,
    DebtCreditorChartComponent,
    DebtDueDateChartComponent,
    DebtEvaluationComponent,
    DebtTableComponent,
    DebtFormComponent,
    OverlayContainerComponent,
  ],
})
export class DebtComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  debtForm: FormGroup;
  selectedDebt!: Debt;
  debtId = 0;
  isModifyOverlayVisible = false;
  isAddOverlayVisible = false;

  totalDebt = 0;
  totalPaid = 0;
  totalMinPayments = 0;
  overdueDebts: Debt[] = [];
  creditorSummary: Record<string, number> = {};
  top5LargestDebts: { creditor: string; remainingAmount: number; dueDate: string }[] = [];
  debts: Debt[] = [];


  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly seo = inject(SeoService);
  private readonly fb = inject(FormBuilder);
  private readonly debtService = inject(DebtService);
  private readonly loggingService = inject(LoggingService);
  private readonly notificationService = inject(NotificationService);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    this.debtForm = this.fb.group({
      creditorName: ['', Validators.required],
      principalAmount: [0, [Validators.required, Validators.min(0.01)]],
      remainingAmount: [0, [Validators.required, Validators.min(0)]],
      interestRateApr: [0, [Validators.min(0), Validators.max(999.9999)]],
      dueDate: ['', Validators.required],
      minPayment: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.setupSEO();
    this.loadAllDebtData();
    this.subscribeToDebtUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onAddDebt(): void {
    this.isAddOverlayVisible = true;
    this.debtForm.reset();
    this.cdr.markForCheck();
  }

  onModifyDebt(debt: Debt): void {
    this.selectedDebt = debt;
    this.debtId = debt.id;
    this.isModifyOverlayVisible = true;
    
    this.debtForm.patchValue({
      creditorName: debt.creditorName,
      principalAmount: debt.principalAmount,
      remainingAmount: debt.remainingAmount,
      interestRateApr: debt.interestRateApr,
      billingCycle: debt.billingCycle || RecurrenceType.MONTHLY,
      dueDate: this.toHtmlDateFormat(debt.dueDate),
      minPayment: debt.minPayment,
      accountRef: debt.accountRef || '',
      currency: debt.currency || '',
      notes: debt.notes || '',
    });
    
    this.cdr.markForCheck();
  }

  onDeleteDebt(id: number): void {
    const debtToDelete = this.debts.find(d => d.id === id);
    const creditorName = debtToDelete?.creditorName || 'Unknown';
    const amount = debtToDelete?.principalAmount || 0;
    
    this.debtService.deleteDebt(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.loadAllDebtData();
        this.debtService.notifyDebtUpdated();
        this.notificationService.addDebtDeletedNotification(creditorName, amount);
      },
        error: (error) => {
          this.loggingService.error('Error deleting debt:', error);
          this.notificationService.addDebtErrorNotification('delete', error.message || 'Unknown error');
        },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleDebtFormSubmit(event: { mode: 'add' | 'edit'; formValue: any; debtId?: number }): void {
    const formValue = event.formValue;
    const formattedDate = this.formatDateForBackend(formValue.dueDate as string);
    
    const debtRequest: DebtRequest = {
      userId: 0,
      creditorName: formValue.creditorName,
      principalAmount: formValue.principalAmount,
      remainingAmount: formValue.remainingAmount || formValue.principalAmount,
      interestRateApr: formValue.interestRateApr || 0,
      billingCycle: formValue.billingCycle || RecurrenceType.MONTHLY,
      dueDate: formattedDate,
      minPayment: formValue.minPayment,
      accountRef: formValue.accountRef || null,
      currency: formValue.currency || null,
      notes: formValue.notes || null,
    };

    if (event.mode === 'add') {
      this.debtService.saveDebt(debtRequest).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.loadAllDebtData();
          this.debtService.notifyDebtUpdated();
          this.notificationService.addDebtCreatedNotification(
            debtRequest.creditorName,
            debtRequest.principalAmount
          );
        },
        error: (error) => {
          this.loggingService.error('Error adding debt:', error);
          this.notificationService.addDebtErrorNotification('add', error.message || 'Unknown error');
        },
      });
    } else if (event.mode === 'edit' && event.debtId) {
      this.debtId = event.debtId;
      this.debtService.updateDebt(this.debtId, debtRequest).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.loadAllDebtData();
          this.debtService.notifyDebtUpdated();
          this.notificationService.addDebtModifiedNotification(
            debtRequest.creditorName,
            debtRequest.principalAmount
          );
        },
        error: (error) => {
          this.loggingService.error('Error updating debt:', error);
          this.notificationService.addDebtErrorNotification('update', error.message || 'Unknown error');
        },
      });
    }
  }

  addDebt(): void {
    if (this.debtForm.valid) {
      const formValue = this.debtForm.value;
      const formattedDate = this.formatDateForBackend(formValue.dueDate);
      
      const debtRequest: DebtRequest = {
        userId: 0,
        creditorName: formValue.creditorName,
        principalAmount: formValue.principalAmount,
        remainingAmount: formValue.remainingAmount || formValue.principalAmount,
        interestRateApr: formValue.interestRateApr,
        billingCycle: formValue.billingCycle || RecurrenceType.MONTHLY,
        dueDate: formattedDate,
        minPayment: formValue.minPayment,
        accountRef: formValue.accountRef || null,
        currency: formValue.currency || null,
        notes: formValue.notes || null,
      };

      this.debtService.saveDebt(debtRequest).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.loadAllDebtData();
          this.closeOverlay();
          this.debtService.notifyDebtUpdated();
          this.notificationService.addDebtCreatedNotification(
            debtRequest.creditorName,
            debtRequest.principalAmount
          );
        },
        error: (error) => {
          this.loggingService.error('Error adding debt:', error);
          this.notificationService.addDebtErrorNotification('add', error.message || 'Unknown error');
        },
      });
    }
  }

  modifyDebt(): void {
    if (this.debtForm.valid) {
      const formValue = this.debtForm.value;
      const formattedDate = this.formatDateForBackend(formValue.dueDate);
      
      const debtRequest: DebtRequest = {
        userId: 0,
        creditorName: formValue.creditorName,
        principalAmount: formValue.principalAmount,
        remainingAmount: formValue.remainingAmount,
        interestRateApr: formValue.interestRateApr,
        billingCycle: formValue.billingCycle || RecurrenceType.MONTHLY,
        dueDate: formattedDate,
        minPayment: formValue.minPayment,
        accountRef: formValue.accountRef || null,
        currency: formValue.currency || null,
        notes: formValue.notes || null,
      };

      this.debtService.updateDebt(this.debtId, debtRequest).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.loadAllDebtData();
          this.closeOverlay();
          this.debtService.notifyDebtUpdated();
          this.notificationService.addDebtModifiedNotification(
            debtRequest.creditorName,
            debtRequest.principalAmount
          );
        },
        error: (error) => {
          this.loggingService.error('Error updating debt:', error);
          this.notificationService.addDebtErrorNotification('update', error.message || 'Unknown error');
        },
      });
    }
  }

  closeOverlay(): void {
    this.isAddOverlayVisible = false;
    this.isModifyOverlayVisible = false;
    this.debtForm.reset();
    this.cdr.markForCheck();
  }

  get creditorCount(): number {
    return this.creditorSummary ? Object.keys(this.creditorSummary).length : 0;
  }

  private setupSEO(): void {
    const title = 'Debt Management';
    const description = 'Manage your debts, track payments, and monitor your financial obligations with Alpha Vault. Comprehensive debt tracking with detailed analytics, payment schedules, and financial health insights.';
    
    let canonical = 'https://alphavault.app/debt';
    if (this.isBrowser && typeof window !== 'undefined' && window.location) {
      canonical = `${window.location.origin}/debt`;
    }

    this.seo.set({
      title,
      description,
      canonicalUrl: canonical,
      keywords: ['debt management', 'debt tracking', 'financial obligations', 'payment schedule', 'debt analytics', 'Alpha Vault'],
      og: {
        title: 'Debt Management - Track Your Financial Obligations',
        description,
        image: '/assets/og/default.png',
        type: 'website'
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Debt Management',
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

  private subscribeToDebtUpdates(): void {
    this.debtService.debtUpdated$.pipe(
      takeUntil(this.destroy$),
    ).subscribe(() => {
      this.loadAllDebtData();
    });
  }

  private loadAllDebtData(): void {
    this.debtService.getAllDebts().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (debts) => {
        this.debts = [...debts];
        this.calculateTotalPaid();
        
        const calculatedTotal = debts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
        this.totalDebt = calculatedTotal;
        
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.loggingService.error('Error loading debts:', error);
      },
    });

    this.debtService.getOverdueDebts().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (overdue) => {
        this.overdueDebts = [...overdue];
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.loggingService.error('Error loading overdue debts:', error);
      },
    });

    this.debtService.getDebtCreditorSummary().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (summary) => {
        this.creditorSummary = { ...summary };
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.loggingService.error('Error loading creditor summary:', error);
      },
    });

    this.debtService.getTop5LargestDebts().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (top5) => {
        this.top5LargestDebts = [...top5];
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.loggingService.error('Error loading top 5 debts:', error);
      },
    });

    this.debtService.getTotalMinPayments().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (total) => {
        this.totalMinPayments = total;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.loggingService.error('Error loading total min payments:', error);
      },
    });
  }

  private calculateTotalPaid(): void {
    this.totalPaid = this.debts.reduce((sum, debt) => sum + (debt.principalAmount - debt.remainingAmount), 0);
  }

  private toHtmlDateFormat(dateStr: string): string {
    if (dateStr.includes('/')) {
      const [month, day, year] = dateStr.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    const date = new Date(dateStr);
    return formatDate(date, 'yyyy-MM-dd', 'en-US');
  }

  private formatDateForBackend(dateStr: string): string {
    if (dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-');
      return `${month}/${day}/${year}`;
    }
    return dateStr;
  }
}
