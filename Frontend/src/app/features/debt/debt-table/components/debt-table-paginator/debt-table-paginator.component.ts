/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component DebtTablePaginatorComponent
  @description Paginator component for debt table with Material Design
*/

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-debt-table-paginator',
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
        aria-label="Debt table pagination">
      </mat-paginator>
    </div>
  `,
  styleUrls: ['./debt-table-paginator.component.scss']
})
export class DebtTablePaginatorComponent {
  @Input() totalCount = 0;
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 25, 50];
  
  @Output() pageChange = new EventEmitter<PageEvent>();

  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
  }
}

