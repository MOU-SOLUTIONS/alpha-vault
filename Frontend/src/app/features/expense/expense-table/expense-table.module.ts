// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';

import { ScrollingModule } from '@angular/cdk/scrolling';

import { ExpenseTableComponent } from './expense-table.component';

import { TotalExpensePipe } from './pipes/total-expense.pipe';
import { ExpenseFilterPipe } from './pipes/expense-filter.pipe';

import { ExpenseApiService } from './services/expense-api.service';

const routes: Routes = [
  {
    path: '',
    component: ExpenseTableComponent
  }
];

@NgModule({
  declarations: [
    ExpenseTableComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    ScrollingModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    TotalExpensePipe,
    ExpenseFilterPipe
  ],
  exports: [
    ExpenseTableComponent
  ]
})
export class ExpenseTableModule { } 