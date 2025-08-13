// ====================================================================
//      Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Meta, Title } from '@angular/platform-browser';

import { Investment, InvestmentRequest } from '../../../models/investment.model';
import { InvestmentService } from '../../../core/services/investment.service';
import { InvestmentType } from '../../../enums/investment-type';

import { CryptoInvestmentTableComponent } from './crypto-investment-table/crypto-investment-table.component';
import { CryptoInvestmentFormComponent } from './crypto-investment-form/crypto-investment-form.component';
import { CryptoDataGridComponent } from './crypto-data-grid/crypto-data-grid.component';
import { CryptoValueChartComponent } from './crypto-value-chart/crypto-value-chart.component';
import { CryptoPortfolioChartComponent } from './crypto-portfolio-chart/crypto-portfolio-chart.component';
import { OverlayContainerComponent } from '../../../shared/components/overlay-container/overlay-container/overlay-container.component';

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
    OverlayContainerComponent,
  ],
  templateUrl: './crypto.component.html',
  styleUrls: ['./crypto.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CryptoComponent implements OnInit {
  allCryptoInvestments: Investment[] = [];
  filteredInvestments: Investment[] = [];

  isOverlayVisible = false;
  mode: 'add' | 'modify' = 'add';
  selectedInvestment: Investment | null = null;

  constructor(
    private readonly svc: InvestmentService,
    private readonly title: Title,
    private readonly meta: Meta,
  ) {
    this.title.setTitle('Crypto Dashboard | Alpha Vault');
    this.meta.addTags([
      { name: 'description', content: 'Analyze, track, and manage your cryptocurrency portfolio with real-time insights and elegant visualizations.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ]);
  }

  ngOnInit(): void {
    this.svc.getAll().subscribe((list) => {
      this.allCryptoInvestments = list.filter((i) => i.investmentType === InvestmentType.CRYPTO);
      this.filteredInvestments = [...this.allCryptoInvestments];
    });
  }

  getTotalValue(): number {
    return this.filteredInvestments.reduce((total, investment) => total + Number(investment.currentValue || 0), 0);
  }

  onFilterChange(q: string): void {
    const term = q.trim().toLowerCase();
    this.filteredInvestments = this.allCryptoInvestments.filter((i) => i.name.toLowerCase().includes(term));
  }

  openAdd(): void {
    this.selectedInvestment = null;
    this.mode = 'add';
    this.isOverlayVisible = true;
  }

  openModify(inv: Investment): void {
    this.selectedInvestment = inv;
    this.mode = 'modify';
    this.isOverlayVisible = true;
  }

  remove(inv: Investment): void {
    this.svc.delete(inv.id).subscribe(() => {
      this.allCryptoInvestments = this.allCryptoInvestments.filter((x) => x.id !== inv.id);
      this.onFilterChange('');
    });
  }

  handleSubmit(dto: InvestmentRequest): void {
    const op$ = this.mode === 'add'
      ? this.svc.create(dto)
      : this.svc.update(this.selectedInvestment!.id, dto);

    op$.subscribe(() => {
      this.isOverlayVisible = false;
      this.ngOnInit();
    });
  }

  closeOverlay(): void {
    this.isOverlayVisible = false;
  }
}
