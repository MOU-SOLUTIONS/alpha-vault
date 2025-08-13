// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { DecimalPipe } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-debt-widget',
  templateUrl: './debt-widget.component.html',
  styleUrls: ['./debt-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
})
export class DebtWidgetComponent implements OnInit {
  @Input() totalDebt: number = 0;
  @Input() totalMinPayments: number = 0;
  @Input() overdueDebts: number = 0;
  @Input() totalCreditors: number = 0;

  constructor(
    private meta: Meta
  ) {}

  ngOnInit(): void {
    this.setSEOMeta();
  }

  private setSEOMeta(): void {
    
    this.meta.addTags([
      { name: 'description', content: 'Track your total debt, minimum payments, overdue accounts, and creditor count with our comprehensive debt overview dashboard. Get real-time insights into your financial health.' },
      { name: 'keywords', content: 'debt dashboard, total debt, minimum payments, overdue debts, creditor count, financial overview, debt management, Alpha Vault' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'author', content: 'Alpha Vault' },
      { name: 'og:title', content: 'Debt Overview Dashboard | Alpha Vault' },
      { name: 'og:description', content: 'Comprehensive debt overview with real-time tracking of total debt, payments, and creditor information.' },
      { name: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: 'Debt Overview Dashboard | Alpha Vault' },
      { name: 'twitter:description', content: 'Track your financial health with our debt overview dashboard.' }
    ]);
  }
}
