/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component DebtWidgetComponent
  @description Main debt dashboard component for managing debt summary
*/

import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { META_FRAGMENT } from '../../../core/seo/page-meta.model';

@Component({
  standalone: true,
  selector: 'app-debt-widget',
  templateUrl: './debt-widget.component.html',
  styleUrls: ['./debt-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
  providers: [
    {
      provide: META_FRAGMENT,
      useValue: {
        description: 'Track your total debt, minimum payments, overdue accounts, and creditor count with our comprehensive debt overview dashboard. Get real-time insights into your financial health in Alpha Vault.'
      }
    }
  ],
})
export class DebtWidgetComponent {
  /**
   * Total outstanding debt amount
   */
  @Input() totalDebt = 0;
  
  /**
   * Total minimum monthly payments required
   */
  @Input() totalMinPayments = 0;
  
  /**
   * Number of overdue debt accounts
   */
  @Input() overdueDebts = 0;
  
  /**
   * Total number of active creditors
   */
  @Input() totalCreditors = 0;
}
