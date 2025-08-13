// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule, formatDate } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Title, Meta } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';

import { Debt, DebtRequest } from '../../models/debt.model';
import { DebtService } from '../../core/services/debt.service';

import { DebtWidgetComponent } from './debt-widget/debt-widget.component';
import { DebtProgressComponent } from './debt-progress/debt-progress.component';
import { DebtCreditorChartComponent } from './debt-creditor-chart/debt-creditor-chart.component';
import { DebtTop5Component } from './debt-top5/debt-top5.component';
import { DebtDueDateChartComponent } from './debt-due-date-chart/debt-due-date-chart.component';
import { DebtEvaluationComponent } from './debt-evaluation/debt-evaluation.component';
import { DebtTableComponent } from './debt-table/debt-table.component';
import { DebtFormComponent } from './debt-form/debt-form.component';

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
    DebtTop5Component,
    DebtDueDateChartComponent,
    DebtEvaluationComponent,
    DebtTableComponent,
    DebtFormComponent,
  ]
})
export class DebtComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  debtForm: FormGroup;
  selectedDebt!: Debt;
  debtId = 0;
  isModifyOverlayVisible = false;
  isAddOverlayVisible = false;
  isDeleteOverlayVisible = false;

  // Data properties
  totalDebt = 0;
  totalPaid = 0;
  totalMinPayments = 0;
  overdueDebts: Debt[] = [];
  creditorSummary: Record<string, number> = {};
  top5LargestDebts: { creditor: string; remainingAmount: number; dueDate: string }[] = [];
  debts: Debt[] = [];

  // New UI/UX properties
  isPaymentCalculatorVisible = false;
  isDebtSnowballVisible = false;
  
  calculatorData = {
    debtAmount: 0,
    interestRate: 0,
    monthlyPayment: 0
  };
  
  calculatorResults = {
    monthsToPayoff: 0,
    totalInterest: 0,
    totalAmount: 0
  };
  
  snowballData = {
    monthlyBudget: 0
  };
  
  snowballOrder: Array<{
    creditor: string;
    remainingAmount: number;
    recommendedPayment: number;
    priority: number;
  }> = [];

  constructor(
    private fb: FormBuilder,
    private debtService: DebtService,
    private cdr: ChangeDetectorRef,
    private title: Title,
    private meta: Meta,
  ) {
    this.debtForm = this.fb.group({
      creditorName: ['', Validators.required],
      totalAmount: [0, [Validators.required, Validators.min(0)]],
      remainingAmount: [0, [Validators.required, Validators.min(0)]],
      interestRate: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      dueDate: ['', Validators.required],
      minPayment: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    console.log('DebtComponent - ngOnInit started');
    console.log('DebtComponent - Initial c:', this.totalDebt);
    this.setPageMetadata();
    this.loadAllDebtData();
    this.subscribeToDebtUpdates();
    console.log('DebtComponent - ngOnInit completed');
    
    // Debug after a short delay to see the final state
    setTimeout(() => {
      this.debugTotalDebt();
    }, 1000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Event handlers
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
      totalAmount: debt.totalAmount,
      remainingAmount: debt.remainingAmount,
      interestRate: debt.interestRate,
      dueDate: this.toHtmlDateFormat(debt.dueDate),
      minPayment: debt.minPayment
    });
    
    this.cdr.markForCheck();
  }

  onDeleteDebt(id: number): void {
    this.selectedDebt = this.debts.find(d => d.id === id)!;
    this.debtId = id;
    this.isDeleteOverlayVisible = true;
    this.cdr.markForCheck();
  }

  // Form actions
  addDebt(debtData: DebtRequest): void {
    this.debtService.saveDebt(debtData).subscribe({
      next: () => {
        this.loadAllDebtData();
        this.closeOverlay();
        this.debtService.notifyDebtUpdated();
      },
      error: (error) => {
        console.error('Error adding debt:', error);
        // Handle error (show notification, etc.)
      }
    });
  }

  modifyDebt(debtData: DebtRequest): void {
    this.debtService.updateDebt(this.debtId, debtData).subscribe({
      next: () => {
        this.loadAllDebtData();
        this.closeOverlay();
        this.debtService.notifyDebtUpdated();
      },
      error: (error) => {
        console.error('Error updating debt:', error);
        // Handle error (show notification, etc.)
      }
    });
  }

  deleteDebt(): void {
    this.debtService.deleteDebt(this.debtId).subscribe({
      next: () => {
        this.loadAllDebtData();
        this.closeOverlay();
        this.debtService.notifyDebtUpdated();
      },
      error: (error) => {
        console.error('Error deleting debt:', error);
        // Handle error (show notification, etc.)
      }
    });
  }

  closeOverlay(): void {
    this.isAddOverlayVisible = false;
    this.isModifyOverlayVisible = false;
    this.isDeleteOverlayVisible = false;
    this.debtForm.reset();
    this.cdr.markForCheck();
  }

  // Private methods
  private setPageMetadata(): void {
    this.title.setTitle('Debt Management - Alpha Vault');
    this.meta.updateTag({ name: 'description', content: 'Manage your debts, track payments, and monitor your financial obligations with Alpha Vault.' });
  }

  private subscribeToDebtUpdates(): void {
    this.debtService.debtUpdated$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loadAllDebtData();
    });
  }

  private loadAllDebtData(): void {
    // Load all debts first - this is our primary source of truth
    this.debtService.getAllDebts().subscribe({
      next: (debts) => {
        this.debts = [...debts]; // Create new array reference for OnPush
        this.calculateTotalPaid();
        
        // Calculate total debt from the debts array - this is our ONLY source
        const calculatedTotal = debts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
        this.totalDebt = calculatedTotal;
        
        console.log('=== DEBTS LOADED ===');
        console.log('Loaded debts:', debts);
        console.log('Number of debts:', debts.length);
        console.log('Calculated total debt from debts array:', calculatedTotal);
        console.log('Set totalDebt to:', this.totalDebt);
        console.log('====================');
        
        this.cdr.markForCheck(); // Use markForCheck for OnPush strategy
      },
      error: (error) => {
        console.error('Error loading debts:', error);
      }
    });

    // Load overdue debts
    this.debtService.getOverdueDebts().subscribe({
      next: (overdue) => {
        this.overdueDebts = [...overdue]; // Create new array reference for OnPush
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading overdue debts:', error);
      }
    });

    // Load creditor summary
    this.debtService.getDebtCreditorSummary().subscribe({
      next: (summary) => {
        this.creditorSummary = { ...summary }; // Create new object reference for OnPush
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading creditor summary:', error);
      }
    });

    // Load top 5 largest debts
    this.debtService.getTop5LargestDebts().subscribe({
      next: (top5) => {
        this.top5LargestDebts = [...top5]; // Create new array reference for OnPush
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading top 5 debts:', error);
      }
    });

    // Load total minimum payments
    this.debtService.getTotalMinPayments().subscribe({
      next: (total) => {
        this.totalMinPayments = total;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading total min payments:', error);
      }
    });
  }

  private calculateTotalPaid(): void {
    this.totalPaid = this.debts.reduce((sum, debt) => sum + (debt.totalAmount - debt.remainingAmount), 0);
  }

  private toHtmlDateFormat(dateStr: string): string {
    const date = new Date(dateStr);
    return formatDate(date, 'yyyy-MM-dd', 'en-US');
  }

  getCreditorCount(): number {
    return this.creditorSummary ? Object.keys(this.creditorSummary).length : 0;
  }

  // Fallback method to calculate total debt from loaded debts
  calculateTotalDebtFromDebts(): number {
    if (!this.debts || this.debts.length === 0) return 0;
    return this.debts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
  }

  // Getter that always returns the correct total debt
  get calculatedTotalDebt(): number {
    // Always calculate from the current debts array for reliability
    const calculated = this.calculateTotalDebtFromDebts();
    console.log('calculatedTotalDebt getter called - returning:', calculated);
    return calculated;
  }

  // Debug method to manually recalculate and log total debt
  debugTotalDebt(): void {
    console.log('=== DEBUG TOTAL DEBT ===');
    console.log('this.totalDebt:', this.totalDebt);
    console.log('this.debts.length:', this.debts?.length);
    console.log('this.debts:', this.debts);
    console.log('calculateTotalDebtFromDebts():', this.calculateTotalDebtFromDebts());
    console.log('calculatedTotalDebt getter:', this.calculatedTotalDebt);
    console.log('========================');
  }

  // Method to manually recalculate total debt
  recalculateTotalDebt(): void {
    console.log('=== MANUAL RECALCULATION ===');
    const newTotal = this.calculateTotalDebtFromDebts();
    this.totalDebt = newTotal;
    console.log('Recalculated total debt:', newTotal);
    console.log('Updated totalDebt property:', this.totalDebt);
    this.cdr.markForCheck();
    console.log('===========================');
  }

  // Method to inspect the first debt record
  inspectFirstDebt(): void {
    console.log('=== INSPECT FIRST DEBT ===');
    if (this.debts && this.debts.length > 0) {
      const firstDebt = this.debts[0];
      console.log('First debt record:', firstDebt);
      console.log('Type of remainingAmount:', typeof firstDebt.remainingAmount);
      console.log('Value of remainingAmount:', firstDebt.remainingAmount);
      console.log('Is remainingAmount a number?', !isNaN(firstDebt.remainingAmount));
      console.log('Parsed remainingAmount:', parseFloat(firstDebt.remainingAmount as any));
    } else {
      console.log('No debts found in array');
    }
    console.log('==========================');
  }

  // New UI/UX methods
  exportDebtData(): void {
    console.log('Exporting debt data...');
    // Implementation for exporting debt data
    const dataToExport = {
      totalDebt: this.totalDebt,
      totalPaid: this.totalPaid,
      totalMinPayments: this.totalMinPayments,
      debts: this.debts,
      creditorSummary: this.creditorSummary,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debt-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  showDebtInsights(): void {
    console.log('Showing debt insights...');
    // This could open a modal or navigate to insights page
  }

  getDebtInsights(): Array<{ title: string; description: string }> {
    const insights: Array<{ title: string; description: string }> = [];
    
    if (this.debts.length === 0) {
      insights.push({
        title: 'No Debts Found',
        description: 'You currently have no active debts. Great job!'
      });
    } else {
      // Add insights based on debt data
      if (this.overdueDebts.length > 0) {
        insights.push({
          title: 'Overdue Debts',
          description: `You have ${this.overdueDebts.length} overdue debt(s) that need immediate attention.`
        });
      }
      
      if (this.totalDebt > 10000) {
        insights.push({
          title: 'High Debt Load',
          description: 'Your total debt is significant. Consider creating a debt payoff strategy.'
        });
      }
      
      if (this.getDebtReductionPercentage() > 50) {
        insights.push({
          title: 'Great Progress',
          description: `You've reduced your debt by ${this.getDebtReductionPercentage().toFixed(1)}%. Keep it up!`
        });
      }
      
      if (this.getPaymentConsistencyScore() > 80) {
        insights.push({
          title: 'Payment Consistency',
          description: 'You have excellent payment consistency. This will help improve your credit score.'
        });
      }
    }
    
    return insights;
  }

  showPaymentCalculator(): void {
    this.isPaymentCalculatorVisible = true;
    this.cdr.markForCheck();
  }

  calculatePayment(): void {
    const { debtAmount, interestRate, monthlyPayment } = this.calculatorData;
    
    if (debtAmount <= 0 || interestRate < 0 || monthlyPayment <= 0) {
      return;
    }
    
    const monthlyRate = interestRate / 100 / 12;
    let remainingBalance = debtAmount;
    let totalInterest = 0;
    let months = 0;
    
    while (remainingBalance > 0 && months < 600) { // Max 50 years
      const interest = remainingBalance * monthlyRate;
      totalInterest += interest;
      remainingBalance = remainingBalance + interest - monthlyPayment;
      months++;
      
      if (remainingBalance < 0) {
        remainingBalance = 0;
      }
    }
    
    this.calculatorResults = {
      monthsToPayoff: months,
      totalInterest: totalInterest,
      totalAmount: debtAmount + totalInterest
    };
    
    this.cdr.markForCheck();
  }

  closePaymentCalculator(): void {
    this.isPaymentCalculatorVisible = false;
    this.cdr.markForCheck();
  }

  showDebtSnowball(): void {
    this.isDebtSnowballVisible = true;
    this.generateSnowballStrategy();
    this.cdr.markForCheck();
  }

  generateSnowballStrategy(): void {
    if (!this.debts || this.debts.length === 0) {
      this.snowballOrder = [];
      return;
    }
    
    // Sort debts by remaining amount (smallest first for debt snowball)
    const sortedDebts = [...this.debts].sort((a, b) => a.remainingAmount - b.remainingAmount);
    
    this.snowballOrder = sortedDebts.map((debt, index) => ({
      creditor: debt.creditorName,
      remainingAmount: debt.remainingAmount,
      recommendedPayment: debt.minPayment,
      priority: index + 1
    }));
    
    // Calculate recommended payment for first debt (snowball method)
    if (this.snowballOrder.length > 0 && this.snowballData.monthlyBudget > 0) {
      const firstDebt = this.snowballOrder[0];
      const extraPayment = this.snowballData.monthlyBudget - this.snowballOrder.reduce((sum, debt) => sum + debt.recommendedPayment, 0);
      if (extraPayment > 0) {
        firstDebt.recommendedPayment += extraPayment;
      }
    }
  }

  closeDebtSnowball(): void {
    this.isDebtSnowballVisible = false;
    this.cdr.markForCheck();
  }

  getDebtReductionPercentage(): number {
    if (!this.debts || this.debts.length === 0) return 0;
    
    const totalOriginalAmount = this.debts.reduce((sum, debt) => sum + debt.totalAmount, 0);
    const totalRemaining = this.debts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
    
    if (totalOriginalAmount === 0) return 0;
    
    return ((totalOriginalAmount - totalRemaining) / totalOriginalAmount) * 100;
  }

  getPaymentConsistencyScore(): number {
    if (!this.debts || this.debts.length === 0) return 0;
    
    // Simple scoring based on debt management
    let score = 100;
    
    // Deduct points for overdue debts
    score -= this.overdueDebts.length * 10;
    
    // Deduct points for high debt-to-income ratio (simplified)
    if (this.totalDebt > 50000) score -= 20;
    else if (this.totalDebt > 25000) score -= 10;
    
    // Add points for good payment history
    if (this.totalPaid > 0) score += 10;
    
    return Math.max(0, Math.min(100, score));
  }
}
