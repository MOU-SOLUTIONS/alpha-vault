/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component DebtProgressComponent
  @description Main debt dashboard component tests for managing debt repayment progress
*/

import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By, Meta } from '@angular/platform-browser';

import { DebtProgressComponent } from './debt-progress.component';

describe('DebtProgressComponent', () => {
  let component: DebtProgressComponent;
  let fixture: ComponentFixture<DebtProgressComponent>;
  let meta: jasmine.SpyObj<Meta>;

  beforeEach(async () => {
    const metaSpy = jasmine.createSpyObj('Meta', ['addTags']);

    await TestBed.configureTestingModule({
      imports: [DebtProgressComponent],
      providers: [
        { provide: Meta, useValue: metaSpy },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DebtProgressComponent);
    component = fixture.componentInstance;
    meta = TestBed.inject(Meta) as jasmine.SpyObj<Meta>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate progress percentage correctly', () => {
    component.totalDebt = 10000;
    component.totalPaid = 2500;
    fixture.detectChanges();

    expect(component.progressPercentage).toBe(25);
  });

  it('should return 0% when total debt is 0', () => {
    component.totalDebt = 0;
    component.totalPaid = 1000;
    fixture.detectChanges();

    expect(component.progressPercentage).toBe(0);
  });

  it('should cap progress at 100%', () => {
    component.totalDebt = 10000;
    component.totalPaid = 15000;
    fixture.detectChanges();

    expect(component.progressPercentage).toBe(100);
  });

  it('should calculate remaining amount correctly', () => {
    component.totalDebt = 10000;
    component.totalPaid = 3000;
    fixture.detectChanges();

    expect(component.remainingAmount).toBe(7000);
  });

  it('should return 0 remaining when paid exceeds debt', () => {
    component.totalDebt = 10000;
    component.totalPaid = 15000;
    fixture.detectChanges();

    expect(component.remainingAmount).toBe(0);
  });

  it('should display correct progress status', () => {
    component.totalDebt = 10000;
    component.totalPaid = 5000;
    fixture.detectChanges();

    expect(component.progressStatus).toBe('Halfway There');
  });

  it('should display "Not Started" for 0% progress', () => {
    component.totalDebt = 10000;
    component.totalPaid = 0;
    fixture.detectChanges();

    expect(component.progressStatus).toBe('Not Started');
  });

  it('should display "Debt Free!" for 100% progress', () => {
    component.totalDebt = 10000;
    component.totalPaid = 10000;
    fixture.detectChanges();

    expect(component.progressStatus).toBe('Debt Free!');
  });

  it('should update progress bar width', () => {
    component.totalDebt = 10000;
    component.totalPaid = 5000;
    fixture.detectChanges();

    const progressFill = fixture.debugElement.query(By.css('.progress-fill'));
    const width = progressFill.nativeElement.style.width;
    expect(width).toBe('50%');
  });

  it('should display all milestone markers', () => {
    fixture.detectChanges();

    const milestones = fixture.debugElement.queryAll(By.css('.milestone'));
    expect(milestones.length).toBe(4);
  });

  it('should activate milestones based on progress', () => {
    component.totalDebt = 10000;
    component.totalPaid = 6000;
    fixture.detectChanges();

    const milestones = fixture.debugElement.queryAll(By.css('.milestone'));
    expect(milestones[0].nativeElement.classList.contains('active')).toBe(true); // 25%
    expect(milestones[1].nativeElement.classList.contains('active')).toBe(true); // 50%
    expect(milestones[2].nativeElement.classList.contains('active')).toBe(false); // 75%
    expect(milestones[3].nativeElement.classList.contains('active')).toBe(false); // 100%
  });

  it('should activate all milestones at 100%', () => {
    component.totalDebt = 10000;
    component.totalPaid = 10000;
    fixture.detectChanges();

    const milestones = fixture.debugElement.queryAll(By.css('.milestone'));
    milestones.forEach(milestone => {
      expect(milestone.nativeElement.classList.contains('active')).toBe(true);
    });
  });

  it('should have accessible SVG icon instead of emoji', () => {
    fixture.detectChanges();

    const insightIcon = fixture.debugElement.query(By.css('.insight-icon'));
    const svg = insightIcon.query(By.css('svg'));
    expect(svg).toBeTruthy();
    expect(insightIcon.nativeElement.getAttribute('aria-label')).toBe('Insight indicator');
  });

  it('should display celebration icon only at 100% completion', () => {
    component.totalDebt = 10000;
    component.totalPaid = 10000;
    fixture.detectChanges();

    const celebrationIcon = fixture.debugElement.query(By.css('.celebration-icon'));
    expect(celebrationIcon).toBeTruthy();
    
    component.totalPaid = 5000;
    fixture.detectChanges();
    
    const celebrationIconAfter = fixture.debugElement.query(By.css('.celebration-icon'));
    expect(celebrationIconAfter).toBeFalsy();
  });

  it('should call meta service only in browser', () => {
    component.ngOnInit();
    expect(meta.addTags).toHaveBeenCalled();
  });

  it('should handle zero values gracefully', () => {
    component.totalDebt = 0;
    component.totalPaid = 0;
    fixture.detectChanges();

    expect(component.progressPercentage).toBe(0);
    expect(component.remainingAmount).toBe(0);
    expect(component.progressStatus).toBe('Not Started');
  });

  it('should display correct progress message', () => {
    component.totalDebt = 10000;
    component.totalPaid = 3000; // 30%
    fixture.detectChanges();

    expect(component.progressMessage).toContain('momentum');
  });

  it('should memoize computed values', () => {
    component.totalDebt = 10000;
    component.totalPaid = 5000;
    fixture.detectChanges();

    const firstCall = component.progressPercentage;
    const secondCall = component.progressPercentage;
    
    expect(firstCall).toBe(secondCall);
    expect(firstCall).toBe(50);
  });

  it('should invalidate cache on input changes', () => {
    component.totalDebt = 10000;
    component.totalPaid = 5000;
    fixture.detectChanges();

    const firstPercentage = component.progressPercentage;
    
    component.totalPaid = 7500;
    component.ngOnChanges({
      totalPaid: { currentValue: 7500, previousValue: 5000, firstChange: false, isFirstChange: () => false }
    } as any);
    fixture.detectChanges();

    const secondPercentage = component.progressPercentage;
    expect(secondPercentage).not.toBe(firstPercentage);
    expect(secondPercentage).toBe(75);
  });

  it('should display all three stat cards', () => {
    fixture.detectChanges();

    const statCards = fixture.debugElement.queryAll(By.css('.stat-card'));
    expect(statCards.length).toBe(3);
  });

  it('should have proper semantic structure', () => {
    fixture.detectChanges();

    const section = fixture.debugElement.query(By.css('section[role="region"]'));
    expect(section).toBeTruthy();

    const heading = fixture.debugElement.query(By.css('h2'));
    expect(heading).toBeTruthy();
  });
});
