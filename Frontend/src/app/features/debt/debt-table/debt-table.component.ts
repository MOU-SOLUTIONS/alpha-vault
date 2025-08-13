import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { Debt } from '../../../models/debt.model';

@Component({
  selector: 'app-debt-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './debt-table.component.html',
  styleUrls: ['./debt-table.component.scss']
})
export class DebtTableComponent {
  @Input() debts: Debt[] = [];
  
  @Output() onAdd = new EventEmitter<void>();
  @Output() onModify = new EventEmitter<Debt>();
  @Output() onDelete = new EventEmitter<number>();

  formatDate(dateStr: string): string {
    return formatDate(dateStr, 'MMM dd, yyyy', 'en-US');
  }

  isOverdue(dueDate: string): boolean {
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  }
}
