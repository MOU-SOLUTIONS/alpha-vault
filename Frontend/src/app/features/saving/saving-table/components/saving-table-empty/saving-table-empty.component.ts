/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component SavingTableEmptyComponent
  @description Saving table empty component for displaying no data found state
*/

import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, inject, Output, PLATFORM_ID, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-saving-table-empty',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatIconModule
  ],
  template: `
    <div class="empty-state" role="status" aria-live="polite" aria-label="No saving goals found">
      <div class="empty-icon">
        <i class="fa fa-piggy-bank" aria-hidden="true"></i>
      </div>
      <h3>No Saving Goals Yet</h3>
      <p>Start your financial journey by creating your first saving goal</p>
      <button 
        #createButton
        class="btn-create-goal" 
        (click)="createNewGoal()"
        (keydown.enter)="createNewGoal()"
        (keydown.space)="createNewGoal()"
        aria-label="Create your first saving goal"
        tabindex="0"
      >
        <i class="fa fa-plus me-2" aria-hidden="true"></i>Create First Goal
      </button>
    </div>
  `,
  styleUrls: ['./saving-table-empty.component.scss']
})
export class SavingTableEmptyComponent implements AfterViewInit {
  @Output() readonly createGoal = new EventEmitter<void>();
  @ViewChild('createButton') createButton!: ElementRef<HTMLButtonElement>;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  ngAfterViewInit(): void {
    if (this.createButton?.nativeElement && this.isBrowser) {
      this.createButton.nativeElement.focus();
    }
  }

  createNewGoal(): void {
    this.createGoal.emit();
  }
}
