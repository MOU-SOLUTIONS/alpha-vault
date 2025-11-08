/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseTablePaginatorComponent
  @description Paginator component for expense table with Material Design
*/

/* ===== IMPORTS ===== */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

/* ===== COMPONENT DECORATOR ===== */
@Component({
  selector: 'app-expense-table-paginator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatPaginatorModule
  ],
  template: `
    <div class="paginator-container">
      <mat-paginator
        [length]="totalCount"
        [pageSize]="pageSize"
        [pageSizeOptions]="pageSizeOptions"
        (page)="onPageChange($event)"
        aria-label="Expense table pagination">
      </mat-paginator>
    </div>
  `,
  styleUrls: ['./expense-table-paginator.component.scss']
})
export class ExpenseTablePaginatorComponent {
  /* ===== INPUTS ===== */
  @Input() totalCount = 0;
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 25, 50];
  
  /* ===== OUTPUTS ===== */
  @Output() pageChange = new EventEmitter<PageEvent>();

  /* ===== METHODS ===== */
  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
  }
}