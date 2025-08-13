// ====================================================================
//             Coded by Mohamed Dhaoui for Alpha Vault
// ====================================================================

import { Component, EventEmitter, Output, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Meta } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import { SAVING_GOAL_CATEGORY_OPTIONS, SavingGoalCategory } from '../../../enums/saving-goal';
import { PRIORITY_LEVEL_OPTIONS, PriorityLevel } from '../../../enums/priority-level';

@Component({
  standalone: true,
  selector: 'app-saving-filter',
  template: `
    <!-- Section: Saving Filter -->
    <section class="filter-container" role="region" aria-labelledby="filterTitle">
      <div class="filter-header">
        <h3 id="filterTitle" class="filter-title">
          <i class="fa fa-filter me-2" aria-hidden="true"></i>Filter Goals
        </h3>
        <div class="active-filters" *ngIf="hasActiveFilters">
          <mat-chip-set>
            <mat-chip 
              *ngIf="selectedCategory" 
              (removed)="clearCategory()"
              color="primary"
              variant="outlined"
            >
              {{ getCategoryLabel(selectedCategory) }}
              <mat-icon matChipRemove>cancel</mat-icon>
            </mat-chip>
            <mat-chip 
              *ngIf="selectedPriority" 
              (removed)="clearPriority()"
              color="accent"
              variant="outlined"
            >
              {{ getPriorityLabel(selectedPriority) }}
              <mat-icon matChipRemove>cancel</mat-icon>
            </mat-chip>
          </mat-chip-set>
        </div>
      </div>

      <form class="filter-form" (ngSubmit)="applyFilters()">
        <div class="filter-grid">
          <!-- Section: Category Filter -->
          <div class="filter-item category-filter">
            <label class="custom-select-label" for="categorySelect">
              <i class="fa fa-tag me-2" aria-hidden="true"></i>Goal Category
            </label>
            <div class="custom-select-wrapper">
              <select
                id="categorySelect"
                [(ngModel)]="selectedCategory"
                name="category"
                (change)="onCategoryChange()"
                class="custom-select"
                aria-label="Select goal category"
              >
                <option [value]="null">All Categories</option>
                <option 
                  *ngFor="let option of categories; trackBy: trackByCategory" 
                  [value]="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
              <div class="select-arrow" aria-hidden="true">
                <i class="fa fa-chevron-down"></i>
              </div>
            </div>
          </div>

          <!-- Section: Priority Filter -->
          <div class="filter-item priority-filter">
            <label class="custom-select-label" for="prioritySelect">
              <i class="fa fa-flag me-2" aria-hidden="true"></i>Priority Level
            </label>
            <div class="custom-select-wrapper">
              <select
                id="prioritySelect"
                [(ngModel)]="selectedPriority"
                name="priority"
                (change)="onPriorityChange()"
                class="custom-select"
                aria-label="Select priority level"
              >
                <option [value]="null">All Priorities</option>
                <option 
                  *ngFor="let option of priorities; trackBy: trackByPriority" 
                  [value]="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
              <div class="select-arrow" aria-hidden="true">
                <i class="fa fa-chevron-down"></i>
              </div>
            </div>
          </div>

          <!-- Section: Action Buttons -->
          <div class="filter-actions">
            <button
              mat-stroked-button
              type="button"
              (click)="resetFilters()"
              class="reset-btn"
              matTooltip="Clear all filters"
              [disabled]="!hasActiveFilters"
              aria-label="Reset all filters"
            >
              <i class="fa fa-refresh me-2" aria-hidden="true"></i>Reset
            </button>
            
            <button
              mat-raised-button
              color="primary"
              type="button"
              (click)="onAdd()"
              class="add-btn"
              matTooltip="Add new saving goal"
              aria-label="Add new saving goal"
            >
              <i class="fa fa-plus me-2" aria-hidden="true"></i>Add Goal
            </button>
          </div>
        </div>
      </form>
    </section>
  `,
  styleUrls: ['./saving-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatChipsModule,
  ],
})
export class SavingFilterComponent implements OnInit {
  @Output() filterChange = new EventEmitter<{
    category: SavingGoalCategory | null;
    priority: PriorityLevel | null;
  }>();
  @Output() addGoal = new EventEmitter<void>();

  readonly categories = Object.values(SAVING_GOAL_CATEGORY_OPTIONS);
  readonly priorities = Object.values(PRIORITY_LEVEL_OPTIONS);

  selectedCategory: SavingGoalCategory | null = null;
  selectedPriority: PriorityLevel | null = null;

  constructor(
    private meta: Meta,
  ) {
    this.meta.addTags([
      { name: 'description', content: 'Filter and manage your saving goals by category and priority level with intuitive controls.' },
      { name: 'robots', content: 'index,follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ]);
  }

  ngOnInit(): void {
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return this.selectedCategory !== null || this.selectedPriority !== null;
  }

  onCategoryChange(): void {
    this.applyFilters();
  }

  onPriorityChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filterChange.emit({
      category: this.selectedCategory,
      priority: this.selectedPriority,
    });
  }

  resetFilters(): void {
    this.selectedCategory = null;
    this.selectedPriority = null;
    this.applyFilters();
  }

  clearCategory(): void {
    this.selectedCategory = null;
    this.applyFilters();
  }

  clearPriority(): void {
    this.selectedPriority = null;
    this.applyFilters();
  }

  onAdd(): void {
    this.addGoal.emit();
  }

  getCategoryLabel(value: SavingGoalCategory): string {
    const category = this.categories.find(c => c.value === value);
    return category?.label || '';
  }

  getPriorityLabel(value: PriorityLevel): string {
    const priority = this.priorities.find(p => p.value === value);
    return priority?.label || '';
  }

  trackByCategory(index: number, item: { value: string; label: string }): string {
    return item.value;
  }

  trackByPriority(index: number, item: { value: string; label: string }): string {
    return item.value;
  }
}
