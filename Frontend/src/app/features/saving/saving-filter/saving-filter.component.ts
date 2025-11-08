/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component SavingFilterComponent
  @description Saving filter component for filtering saving goals
*/

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { META_FRAGMENT } from '../../../core/seo/page-meta.model';
import { SAVING_GOAL_CATEGORY_OPTIONS, SAVING_GOAL_PRIORITY_OPTIONS, SavingGoalCategory, SavingGoalPriority } from '../../../enums/saving-goal';

@Component({
  standalone: true,
  selector: 'app-saving-filter',
  providers: [
    {
      provide: META_FRAGMENT,
      useValue: {
        description: 'Advanced filtering controls for saving goals by category and priority. Filter your saving goals dynamically with category selection, priority levels, and active filter indicators in Alpha Vault.'
      }
    }
  ],
  template: `
    <section class="filter-container" role="region" aria-labelledby="filterTitle">
      <div class="filter-header">
        <h3 id="filterTitle" class="filter-title">
          <i class="fa fa-filter me-2" aria-hidden="true"></i>Filter Goals
        </h3>
        <div class="active-filters" *ngIf="hasActiveFilters()">
          <mat-chip-set>
            <mat-chip 
              *ngIf="selectedCategory() !== 'ALL'" 
              (removed)="clearCategory()"
              color="primary"
              variant="outlined"
              aria-label="Remove category filter"
            >
              {{ categoryLabel() }}
              <mat-icon matChipRemove>cancel</mat-icon>
            </mat-chip>
            <mat-chip 
              *ngIf="selectedPriority() !== 'ALL'" 
              (removed)="clearPriority()"
              color="accent"
              variant="outlined"
              aria-label="Remove priority filter"
            >
              {{ priorityLabel() }}
              <mat-icon matChipRemove>cancel</mat-icon>
            </mat-chip>
          </mat-chip-set>
        </div>
      </div>

      <form class="filter-form" (ngSubmit)="applyFilters()">
        <div class="filter-grid">
          <div class="filter-item category-filter">
            <label class="custom-select-label" for="categorySelect">
              <i class="fa fa-tag me-2" aria-hidden="true"></i>Goal Category
            </label>
            <div class="custom-select-wrapper">
              <select
                id="categorySelect"
                [ngModel]="selectedCategory()"
                (ngModelChange)="selectedCategory.set($event); onCategoryChange()"
                name="category"
                class="custom-select"
                aria-label="Select goal category"
                aria-describedby="categoryDescription"
                (keydown.enter)="onCategoryChange()"
                (keydown.space)="onCategoryChange()"
              >
                <option value="ALL">All Categories</option>
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
            <div id="categoryDescription" class="sr-only">
              Select a category to filter saving goals. Choose "All Categories" to show all goals.
            </div>
          </div>

          <div class="filter-item priority-filter">
            <label class="custom-select-label" for="prioritySelect">
              <i class="fa fa-flag me-2" aria-hidden="true"></i>Priority Level
            </label>
            <div class="custom-select-wrapper">
              <select
                id="prioritySelect"
                [ngModel]="selectedPriority()"
                (ngModelChange)="selectedPriority.set($event); onPriorityChange()"
                name="priority"
                class="custom-select"
                aria-label="Select priority level"
                aria-describedby="priorityDescription"
                (keydown.enter)="onPriorityChange()"
                (keydown.space)="onPriorityChange()"
              >
                <option value="ALL">All Priorities</option>
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
            <div id="priorityDescription" class="sr-only">
              Select a priority level to filter saving goals. Choose "All Priorities" to show all goals.
            </div>
          </div>

          <div class="filter-actions">
            <button
              mat-stroked-button
              type="button"
              (click)="resetFilters()"
              class="reset-btn"
              matTooltip="Clear all filters"
              [disabled]="!hasActiveFilters()"
              aria-label="Reset all filters"
              (keydown.enter)="resetFilters()"
              (keydown.space)="resetFilters()"
            >
              <i class="fa fa-refresh me-2" aria-hidden="true"></i>Reset
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
  @Output() readonly filterChange = new EventEmitter<{
    category: SavingGoalCategory | 'ALL';
    priority: SavingGoalPriority | 'ALL';
  }>();

  readonly categories = Object.values(SAVING_GOAL_CATEGORY_OPTIONS);
  readonly priorities = Object.values(SAVING_GOAL_PRIORITY_OPTIONS);

  selectedCategory = signal<SavingGoalCategory | 'ALL'>('ALL');
  selectedPriority = signal<SavingGoalPriority | 'ALL'>('ALL');

  readonly hasActiveFilters = computed(() => 
    this.selectedCategory() !== 'ALL' || this.selectedPriority() !== 'ALL'
  );

  readonly categoryLabel = computed(() => {
    const value = this.selectedCategory();
    if (value === 'ALL') return 'All Categories';
    const category = this.categories.find(c => c.value === value);
    return category?.label || '';
  });

  readonly priorityLabel = computed(() => {
    const value = this.selectedPriority();
    if (value === 'ALL') return 'All Priorities';
    const priority = this.priorities.find(p => p.value === value);
    return priority?.label || '';
  });

  constructor() {
    // SEO fragment provided via META_FRAGMENT token
    // Parent component aggregates all fragments via SeoService
  }

  ngOnInit(): void {
  }

  onCategoryChange(): void {
    this.applyFilters();
  }

  onPriorityChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filterChange.emit({
      category: this.selectedCategory(),
      priority: this.selectedPriority(),
    });
  }

  resetFilters(): void {
    this.selectedCategory.set('ALL');
    this.selectedPriority.set('ALL');
    this.applyFilters();
  }

  clearCategory(): void {
    this.selectedCategory.set('ALL');
    this.applyFilters();
  }

  clearPriority(): void {
    this.selectedPriority.set('ALL');
    this.applyFilters();
  }

  trackByCategory(index: number, item: { value: string; label: string }): string {
    return item.value;
  }

  trackByPriority(index: number, item: { value: string; label: string }): string {
    return item.value;
  }
}
