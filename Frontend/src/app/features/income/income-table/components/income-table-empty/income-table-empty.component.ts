/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component IncomeTableEmptyComponent
  @description Income table empty component for displaying income data
*/

/* ===== IMPORTS ===== */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/* ===== COMPONENT DECORATOR ===== */
@Component({
  selector: 'app-income-table-empty',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatIconModule
  ],
  template: `
    <div class="empty-state" role="status" aria-live="polite" aria-label="No income records found">
      <mat-icon class="empty-icon" aria-hidden="true">search_off</mat-icon>
      <h3>No income records found</h3>
      <p>Try adjusting your filters or add a new income record.</p>
    </div>
  `,
  styleUrls: ['./income-table-empty.component.scss']
})
export class IncomeTableEmptyComponent {}
