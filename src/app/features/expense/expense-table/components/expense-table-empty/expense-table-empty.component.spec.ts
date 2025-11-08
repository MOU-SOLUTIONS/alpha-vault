/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseTableEmptyComponent
  @description Expense table empty component for displaying expense data
*/

/* ===== IMPORTS ===== */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';

import { ExpenseTableEmptyComponent } from './expense-table-empty.component';

/* ===== TEST SUITE ===== */
describe('ExpenseTableEmptyComponent', () => {
  let component: ExpenseTableEmptyComponent;
  let fixture: ComponentFixture<ExpenseTableEmptyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ExpenseTableEmptyComponent,
        MatIconModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseTableEmptyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /* ===== BASIC FUNCTIONALITY ===== */
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display empty state message', () => {
    const emptyIcon = fixture.debugElement.nativeElement.querySelector('.empty-icon');
    const emptyTitle = fixture.debugElement.nativeElement.querySelector('h3');
    const emptyDescription = fixture.debugElement.nativeElement.querySelector('p');
    
    expect(emptyIcon).toBeTruthy();
    expect(emptyIcon.textContent).toContain('search_off');
    expect(emptyTitle).toBeTruthy();
    expect(emptyTitle.textContent).toContain('No expense records found');
    expect(emptyDescription).toBeTruthy();
    expect(emptyDescription.textContent).toContain('Try adjusting your filters or add a new expense record.');
  });

  /* ===== ACCESSIBILITY ===== */
  it('should have proper ARIA attributes', () => {
    const emptyState = fixture.debugElement.query(By.css('.empty-state'));
    const emptyIcon = fixture.debugElement.query(By.css('.empty-icon'));
    
    expect(emptyState.nativeElement.getAttribute('role')).toBe('status');
    expect(emptyState.nativeElement.getAttribute('aria-live')).toBe('polite');
    expect(emptyState.nativeElement.getAttribute('aria-label')).toBe('No expense records found');
    expect(emptyIcon.nativeElement.getAttribute('aria-hidden')).toBe('true');
  });

  it('should have proper semantic structure', () => {
    const emptyState = fixture.debugElement.query(By.css('.empty-state'));
    const emptyIcon = fixture.debugElement.query(By.css('.empty-icon'));
    const emptyTitle = fixture.debugElement.query(By.css('h3'));
    const emptyDescription = fixture.debugElement.query(By.css('p'));
    
    expect(emptyState).toBeTruthy();
    expect(emptyIcon).toBeTruthy();
    expect(emptyTitle).toBeTruthy();
    expect(emptyDescription).toBeTruthy();
  });
});