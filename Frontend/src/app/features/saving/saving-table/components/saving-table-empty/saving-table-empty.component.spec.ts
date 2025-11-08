/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component SavingTableEmptyComponent
  @description Test suite for saving table empty component
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SavingTableEmptyComponent } from './saving-table-empty.component';

describe('SavingTableEmptyComponent', () => {
  let component: SavingTableEmptyComponent;
  let fixture: ComponentFixture<SavingTableEmptyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SavingTableEmptyComponent,
        MatIconModule,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SavingTableEmptyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display empty state message', () => {
    const emptyState = fixture.debugElement.query(By.css('.empty-state'));
    expect(emptyState).toBeTruthy();
  });

  it('should have proper accessibility attributes', () => {
    const emptyState = fixture.debugElement.query(By.css('.empty-state'));
    expect(emptyState.nativeElement.getAttribute('role')).toBe('status');
    expect(emptyState.nativeElement.getAttribute('aria-live')).toBe('polite');
    expect(emptyState.nativeElement.getAttribute('aria-label')).toBe('No saving goals found');
  });

  it('should display correct content', () => {
    const title = fixture.debugElement.query(By.css('h3'));
    const description = fixture.debugElement.query(By.css('p'));
    const icon = fixture.debugElement.query(By.css('.empty-icon i'));

    expect(title.nativeElement.textContent.trim()).toBe('No Saving Goals Yet');
    expect(description.nativeElement.textContent.trim()).toBe('Start your financial journey by creating your first saving goal');
    expect(icon.nativeElement.classList.contains('fa-piggy-bank')).toBe(true);
  });

  it('should have proper icon accessibility', () => {
    const icon = fixture.debugElement.query(By.css('.empty-icon i'));
    expect(icon.nativeElement.getAttribute('aria-hidden')).toBe('true');
  });

  it('should emit createGoal event when button is clicked', () => {
    spyOn(component.createGoal, 'emit');
    
    const button = fixture.debugElement.query(By.css('.btn-create-goal'));
    button.nativeElement.click();
    
    expect(component.createGoal.emit).toHaveBeenCalled();
  });

  it('should emit createGoal event when Enter key is pressed', () => {
    spyOn(component.createGoal, 'emit');
    
    const button = fixture.debugElement.query(By.css('.btn-create-goal'));
    button.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    
    expect(component.createGoal.emit).toHaveBeenCalled();
  });

  it('should emit createGoal event when Space key is pressed', () => {
    spyOn(component.createGoal, 'emit');
    
    const button = fixture.debugElement.query(By.css('.btn-create-goal'));
    button.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    
    expect(component.createGoal.emit).toHaveBeenCalled();
  });

  it('should have proper button accessibility', () => {
    const button = fixture.debugElement.query(By.css('.btn-create-goal'));
    
    expect(button.nativeElement.getAttribute('aria-label')).toBe('Create your first saving goal');
    expect(button.nativeElement.getAttribute('tabindex')).toBe('0');
  });

  it('should focus button after view init', () => {
    spyOn(component.createButton.nativeElement, 'focus');
    
    component.ngAfterViewInit();
    
    expect(component.createButton.nativeElement.focus).toHaveBeenCalled();
  });
});
