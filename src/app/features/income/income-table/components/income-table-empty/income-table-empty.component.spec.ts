/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component IncomeTableEmptyComponent
  @description Income table empty component for displaying income data
*/

/* ===== IMPORTS ===== */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';

import { IncomeTableEmptyComponent } from './income-table-empty.component';

/* ===== TEST SUITE ===== */
describe('IncomeTableEmptyComponent', () => {
  let component: IncomeTableEmptyComponent;
  let fixture: ComponentFixture<IncomeTableEmptyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        IncomeTableEmptyComponent,
        MatIconModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeTableEmptyComponent);
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
    expect(emptyTitle.textContent).toContain('No income records found');
    expect(emptyDescription).toBeTruthy();
    expect(emptyDescription.textContent).toContain('Try adjusting your filters or add a new income record.');
  });

  /* ===== ACCESSIBILITY ===== */
  it('should have proper ARIA attributes', () => {
    const emptyState = fixture.debugElement.query(By.css('.empty-state'));
    const emptyIcon = fixture.debugElement.query(By.css('.empty-icon'));
    
    expect(emptyState.nativeElement.getAttribute('role')).toBe('status');
    expect(emptyState.nativeElement.getAttribute('aria-live')).toBe('polite');
    expect(emptyState.nativeElement.getAttribute('aria-label')).toBe('No income records found');
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
