/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component DebtWidgetComponent
  @description Main debt dashboard component tests for managing debt summary
*/

import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By, Meta } from '@angular/platform-browser';

import { DebtWidgetComponent } from './debt-widget.component';

describe('DebtWidgetComponent', () => {
  let component: DebtWidgetComponent;
  let fixture: ComponentFixture<DebtWidgetComponent>;
  let meta: jasmine.SpyObj<Meta>;

  beforeEach(async () => {
    const metaSpy = jasmine.createSpyObj('Meta', ['addTags']);

    await TestBed.configureTestingModule({
      imports: [DebtWidgetComponent],
      providers: [
        { provide: Meta, useValue: metaSpy },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DebtWidgetComponent);
    component = fixture.componentInstance;
    meta = TestBed.inject(Meta) as jasmine.SpyObj<Meta>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display total debt with formatted currency', () => {
    component.totalDebt = 50000.50;
    fixture.detectChanges();

    const valueEl = fixture.debugElement.query(By.css('.total-debt .value'));
    expect(valueEl.nativeElement.textContent.trim()).toContain('50,000.50');
  });

  it('should display all four widget cards', () => {
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.css('.debt-card'));
    expect(cards.length).toBe(4);
  });

  it('should not have tabindex on article elements', () => {
    fixture.detectChanges();

    const articles = fixture.debugElement.queryAll(By.css('article'));
    articles.forEach(article => {
      expect(article.nativeElement.getAttribute('tabindex')).toBeNull();
    });
  });

  it('should have proper ARIA labels for values', () => {
    component.totalDebt = 10000;
    fixture.detectChanges();

    const valueEl = fixture.debugElement.query(By.css('.total-debt .value'));
    expect(valueEl.nativeElement.getAttribute('aria-label')).toBe('Total debt amount');
  });

  it('should have accessible SVG icons instead of emojis', () => {
    fixture.detectChanges();

    const trendIcons = fixture.debugElement.queryAll(By.css('.trend-icon'));
    trendIcons.forEach(icon => {
      const svg = icon.query(By.css('svg'));
      expect(svg).toBeTruthy();
      expect(icon.nativeElement.getAttribute('aria-label')).toBeTruthy();
    });
  });

  it('should call meta service only in browser platform', () => {
    component.ngOnInit();
    expect(meta.addTags).toHaveBeenCalled();
  });

  it('should handle zero values correctly', () => {
    component.totalDebt = 0;
    component.totalMinPayments = 0;
    component.overdueDebts = 0;
    component.totalCreditors = 0;
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.css('.debt-card'));
    expect(cards.length).toBe(4);
    
    const totalDebtValue = fixture.debugElement.query(By.css('.total-debt .value'));
    expect(totalDebtValue.nativeElement.textContent).toContain('0.00');
  });

  it('should display minimum payments with currency format', () => {
    component.totalMinPayments = 1250.75;
    fixture.detectChanges();

    const valueEl = fixture.debugElement.query(By.css('.total-paid .value'));
    expect(valueEl.nativeElement.textContent.trim()).toContain('1,250.75');
  });

  it('should display overdue debts count', () => {
    component.overdueDebts = 3;
    fixture.detectChanges();

    const valueEl = fixture.debugElement.query(By.css('.overdue .value'));
    expect(valueEl.nativeElement.textContent.trim()).toBe('3');
  });

  it('should display total creditors count', () => {
    component.totalCreditors = 5;
    fixture.detectChanges();

    const valueEl = fixture.debugElement.query(By.css('.creditors .value'));
    expect(valueEl.nativeElement.textContent.trim()).toBe('5');
  });

  it('should have proper semantic structure with headings', () => {
    fixture.detectChanges();

    const headings = fixture.debugElement.queryAll(By.css('h3'));
    expect(headings.length).toBeGreaterThanOrEqual(4);
    
    headings.forEach(heading => {
      expect(heading.nativeElement.textContent).toBeTruthy();
    });
  });

  it('should have sr-only heading for screen readers', () => {
    fixture.detectChanges();

    const srHeading = fixture.debugElement.query(By.css('.sr-only'));
    expect(srHeading).toBeTruthy();
    expect(srHeading.nativeElement.textContent).toBe('Debt Summary Overview');
  });

  it('should have proper role attributes', () => {
    fixture.detectChanges();

    const section = fixture.debugElement.query(By.css('section[role="region"]'));
    expect(section).toBeTruthy();

    const articles = fixture.debugElement.queryAll(By.css('article[role="article"]'));
    expect(articles.length).toBe(4);
  });
});
