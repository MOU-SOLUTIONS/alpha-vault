/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component CryptoComponent
  @description Crypto component for displaying crypto investments
*/

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';

import { SeoService } from '../../../core/seo/seo.service';
import { InvestmentService } from '../../../core/services/investment.service';
import { LoggingService } from '../../../core/services/logging.service';
import { NotificationService } from '../../../core/services/notification.service';
import { InvestmentType } from '../../../enums/investment-type';
import { Investment, InvestmentRequest } from '../../../models/investment.model';
import { CryptoDataGridComponent } from './crypto-data-grid/crypto-data-grid.component';
import { CryptoInvestmentFormComponent } from './crypto-investment-form/crypto-investment-form.component';
import { CryptoInvestmentTableComponent } from './crypto-investment-table/crypto-investment-table.component';
import { CryptoPortfolioChartComponent } from './crypto-portfolio-chart/crypto-portfolio-chart.component';
import { CryptoValueChartComponent } from './crypto-value-chart/crypto-value-chart.component';

@Component({
  selector: 'app-crypto',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    CryptoInvestmentTableComponent,
    CryptoInvestmentFormComponent,
    CryptoDataGridComponent,
    CryptoValueChartComponent,
    CryptoPortfolioChartComponent,
  ],
  templateUrl: './crypto.component.html',
  styleUrls: ['./crypto.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CryptoComponent implements OnInit {
  allCryptoInvestments: Investment[] = [];
  filteredInvestments: Investment[] = [];

  showAddForm = false;
  isModifyMode = false;
  selectedInvestment: Investment | null = null;

  isDeleteOverlayVisible = false;

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly svc: InvestmentService,
    private readonly notificationService: NotificationService,
    private readonly loggingService: LoggingService,
    private readonly seo: SeoService,
    private readonly cdr: ChangeDetectorRef,
  ) {
  }

  ngOnInit(): void {
    this.seo.set({
      title: 'Crypto Dashboard',
      description: 'Analyze, track, and manage your cryptocurrency portfolio with real-time insights, interactive charts, comprehensive analytics, and detailed investment tracking.',
      keywords: ['cryptocurrency', 'crypto investment', 'portfolio management', 'blockchain', 'crypto tracking', 'investment analytics'],
      robots: 'index,follow',
      canonicalUrl: 'https://alphavault.app/investment/crypto',
      og: {
        title: 'Crypto Dashboard | Alpha Vault',
        description: 'Analyze, track, and manage your cryptocurrency portfolio with real-time insights and elegant visualizations.',
        type: 'website',
        image: '/assets/og/default.png'
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Crypto Dashboard | Alpha Vault',
        description: 'Analyze, track, and manage your cryptocurrency portfolio with real-time insights and elegant visualizations.',
        image: '/assets/og/default.png'
      }
    }, 'Alpha Vault');

    this.svc.getAll().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((list) => {
      this.allCryptoInvestments = list.filter((i) => i.investmentType === InvestmentType.CRYPTO);
      this.filteredInvestments = [...this.allCryptoInvestments];
      this.cdr.markForCheck();
    });
  }

  get totalValue(): number {
    return this.filteredInvestments.reduce((total, investment) => total + Number(investment.currentValue || 0), 0);
  }

  onFilterChange(q: string): void {
    const term = q.trim().toLowerCase();
    this.filteredInvestments = this.allCryptoInvestments.filter((i) => i.name.toLowerCase().includes(term));
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm && !this.isModifyMode) {
      this.selectedInvestment = null;
    }
    this.cdr.markForCheck();
  }

  closeAddForm(): void {
    this.showAddForm = false;
    this.isModifyMode = false;
    this.selectedInvestment = null;
    this.cdr.markForCheck();
  }

  onAddInvestmentFromTable(): void {
    this.isModifyMode = false;
    this.selectedInvestment = null;
    this.showAddForm = true;
    this.cdr.markForCheck();
  }

  onModifyInvestment(inv: Investment): void {
    this.selectedInvestment = inv;
    this.isModifyMode = true;
    this.showAddForm = true;
    this.cdr.markForCheck();
  }

  onDeleteInvestment(inv: Investment): void {
    this.selectedInvestment = inv;
    this.isDeleteOverlayVisible = true;
    this.cdr.markForCheck();
  }

  handleSubmit(dto: InvestmentRequest): void {
    const op$ = this.isModifyMode && this.selectedInvestment
      ? this.svc.update(this.selectedInvestment.id, dto)
      : this.svc.create(dto);

    op$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (response) => {
        const investmentName = response?.name || dto.name;
        const amountInvested = response?.amountInvested || dto.amountInvested;

        if (this.isModifyMode) {
          this.notificationService.addInvestmentModifiedNotification(investmentName, amountInvested);
        } else {
          this.notificationService.addInvestmentCreatedNotification(investmentName, amountInvested);
        }

        this.closeAddForm();
        this.refreshInvestments();
      },
      error: (error) => {
        // Log detailed error for debugging (production-safe via LoggingService)
        this.loggingService.error('Error saving investment:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.error?.message || error.message
        });

        let errorMessage = 'An error occurred while saving the investment.';

        if (error.error) {
          if (error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error.error) {
            errorMessage = error.error.error;
          } else if (typeof error.error === 'string') {
            errorMessage = error.error;
          }
        }

        if (errorMessage.toLowerCase().includes('data integrity violation') ||
            errorMessage.toLowerCase().includes('integrity constraint')) {
          errorMessage = 'Cannot save this investment due to data integrity constraints. Please check the data and try again.';
        } else if (errorMessage.toLowerCase().includes('version') ||
                   errorMessage.toLowerCase().includes('optimistic')) {
          errorMessage = 'This investment has been modified by another user or process. Please refresh the page and try again.';
        } else if (errorMessage.toLowerCase().includes('unique constraint') ||
                   errorMessage.toLowerCase().includes('duplicate')) {
          errorMessage = 'An investment with this name already exists. Please use a different name.';
        } else if (errorMessage.toLowerCase().includes('validation')) {
          errorMessage = 'Please check that all required fields are filled correctly.';
        }

        if (errorMessage === 'An error occurred while saving the investment.') {
          if (error.status === 400) {
            errorMessage = 'Invalid data provided. Please check all fields and try again.';
          } else if (error.status === 404) {
            errorMessage = 'Investment not found. It may have been deleted.';
          } else if (error.status === 403) {
            errorMessage = 'You do not have permission to perform this action.';
          } else if (error.status === 409) {
            errorMessage = 'A conflict occurred. This investment may have been modified. Please refresh and try again.';
          } else if (error.message) {
            errorMessage = error.message;
          }
        }

        const action = this.isModifyMode ? 'modify' : 'create';
        this.notificationService.addInvestmentErrorNotification(action, errorMessage);
      }
    });
  }

  deleteInvestment(): void {
    if (!this.selectedInvestment) return;
    
    const investmentName = this.selectedInvestment.name;
    
    this.svc.delete(this.selectedInvestment.id).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.allCryptoInvestments = this.allCryptoInvestments.filter((x) => x.id !== this.selectedInvestment!.id);
        this.onFilterChange('');
        this.isDeleteOverlayVisible = false;
        this.selectedInvestment = null;
        this.cdr.markForCheck();
        
        this.notificationService.addInvestmentDeletedNotification(investmentName);
      },
      error: (error) => {
        // Log detailed error for debugging (production-safe via LoggingService)
        this.loggingService.error('Error deleting investment:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.error?.message || error.message
        });
        
        let errorMessage = 'An error occurred while deleting the investment.';
        
        if (error.error) {
          if (error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error.error) {
            errorMessage = error.error.error;
          } else if (typeof error.error === 'string') {
            errorMessage = error.error;
          }
        }
        
        if (errorMessage.toLowerCase().includes('data integrity violation') || 
            errorMessage.toLowerCase().includes('integrity constraint')) {
          errorMessage = 'Cannot delete this investment due to data integrity constraints. It may have active transactions, dependencies, or related records that must be handled first.';
        } else if (errorMessage.toLowerCase().includes('version') || 
                   errorMessage.toLowerCase().includes('optimistic')) {
          errorMessage = 'This investment has been modified by another user or process. Please refresh the page and try again.';
        } else if (errorMessage.toLowerCase().includes('foreign key') ||
                   errorMessage.toLowerCase().includes('constraint')) {
          errorMessage = 'Cannot delete this investment because it is referenced by other records in the system.';
        }
        
        if (errorMessage === 'An error occurred while deleting the investment.') {
          if (error.status === 409) {
            errorMessage = 'Cannot delete this investment. It may have active transactions, dependencies, or has been modified by another user. Please refresh and try again.';
          } else if (error.status === 404) {
            errorMessage = 'Investment not found. It may have already been deleted.';
          } else if (error.status === 403) {
            errorMessage = 'You do not have permission to delete this investment.';
          } else if (error.status === 400) {
            errorMessage = 'Invalid request. The investment cannot be deleted in its current state.';
          } else if (error.message) {
            errorMessage = error.message;
          }
        }
        
        this.notificationService.addInvestmentErrorNotification('delete', errorMessage);
      }
    });
  }

  closeOverlay(): void {
    this.isDeleteOverlayVisible = false;
    this.selectedInvestment = null;
    this.cdr.markForCheck();
  }

  private refreshInvestments(): void {
    this.svc.getAll().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((list) => {
      this.allCryptoInvestments = list.filter((i) => i.investmentType === InvestmentType.CRYPTO);
      this.filteredInvestments = [...this.allCryptoInvestments];
      this.cdr.markForCheck();
    });
  }
}
