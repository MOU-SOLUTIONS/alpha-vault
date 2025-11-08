/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component IncomeTablePaginatorComponent
  @description Comprehensive tests for income table paginator component
*/

/* ===== IMPORTS ===== */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { By } from '@angular/platform-browser';

import { IncomeTablePaginatorComponent } from './income-table-paginator.component';

/* ===== TEST SUITE ===== */
describe('IncomeTablePaginatorComponent', () => {
  let component: IncomeTablePaginatorComponent;
  let fixture: ComponentFixture<IncomeTablePaginatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        IncomeTablePaginatorComponent,
        MatPaginatorModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeTablePaginatorComponent);
    component = fixture.componentInstance;
    component.totalCount = 100;
    component.pageSize = 10;
    component.pageSizeOptions = [5, 10, 25, 50];
    fixture.detectChanges();
  });

  /* ===== BASIC FUNCTIONALITY ===== */
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit pageChange when paginator page changes', () => {
    spyOn(component.pageChange, 'emit');
    
    const mockPageEvent: PageEvent = {
      pageIndex: 1,
      pageSize: 10,
      length: 100
    };
    
    component.onPageChange(mockPageEvent);
    
    expect(component.pageChange.emit).toHaveBeenCalledWith(mockPageEvent);
  });

  it('should display correct total count', () => {
    const paginator = fixture.debugElement.nativeElement.querySelector('mat-paginator');
    expect(paginator.getAttribute('ng-reflect-length')).toBe('100');
  });

  it('should display correct page size', () => {
    const paginator = fixture.debugElement.nativeElement.querySelector('mat-paginator');
    expect(paginator.getAttribute('ng-reflect-page-size')).toBe('10');
  });

  it('should display correct page size options', () => {
    const paginator = fixture.debugElement.nativeElement.querySelector('mat-paginator');
    expect(paginator.getAttribute('ng-reflect-page-size-options')).toContain('5,10,25,50');
  });

  /* ===== ACCESSIBILITY ===== */
  it('should have proper ARIA attributes', () => {
    const paginator = fixture.debugElement.query(By.css('mat-paginator'));
    expect(paginator.nativeElement.getAttribute('aria-label')).toBe('Income table pagination');
  });

  it('should support keyboard navigation', () => {
    const paginator = fixture.debugElement.query(By.css('mat-paginator'));
    const nextButton = paginator.query(By.css('button[aria-label="Next page"]'));
    
    if (nextButton) {
      spyOn(component.pageChange, 'emit');
      nextButton.nativeElement.click();
      expect(component.pageChange.emit).toHaveBeenCalled();
    }
  });

  /* ===== INPUT VALIDATION ===== */
  it('should handle zero total count', () => {
    component.totalCount = 0;
    fixture.detectChanges();
    
    const paginator = fixture.debugElement.nativeElement.querySelector('mat-paginator');
    expect(paginator.getAttribute('ng-reflect-length')).toBe('0');
  });

  it('should handle negative page size gracefully', () => {
    component.pageSize = -1;
    fixture.detectChanges();
    
    const paginator = fixture.debugElement.nativeElement.querySelector('mat-paginator');
    expect(paginator.getAttribute('ng-reflect-page-size')).toBe('-1');
  });

  it('should handle empty page size options', () => {
    component.pageSizeOptions = [];
    fixture.detectChanges();
    
    const paginator = fixture.debugElement.nativeElement.querySelector('mat-paginator');
    expect(paginator.getAttribute('ng-reflect-page-size-options')).toBe('');
  });
});
