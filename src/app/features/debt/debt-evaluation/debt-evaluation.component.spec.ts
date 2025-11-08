/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component DebtEvaluationComponent
  @description Main debt dashboard component tests for managing debt health score and recommendations
*/

import { DebugElement, PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { Debt } from '../../../models/debt.model';
import { DebtEvaluationComponent } from './debt-evaluation.component';

describe('DebtEvaluationComponent', () => {
  let component: DebtEvaluationComponent;
  let fixture: ComponentFixture<DebtEvaluationComponent>;

  const mockDebts: Debt[] = [
    {
      id: '1',
      creditor: 'Bank A',
      principalAmount: 10000,
      remainingAmount: 5000,
      interestRateApr: 18,
      minPayment: 200,
      dueDate: '2024-12-01',
      recurrenceType: 'monthly' as any,
      isPaidOff: false
    },
    {
      id: '2',
      creditor: 'Credit Card B',
      principalAmount: 5000,
      remainingAmount: 3000,
      interestRateApr: 3,
      minPayment: 100,
      dueDate: '2024-11-15',
      recurrenceType: 'monthly' as any,
      isPaidOff: false
    },
    {
      id: '3',
      creditor: 'Loan C',
      principalAmount: 8000,
      remainingAmount: 7000,
      interestRateApr: 20,
      minPayment: 150,
      dueDate: '2024-10-20',
      recurrenceType: 'monthly' as any,
      isPaidOff: false
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebtEvaluationComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DebtEvaluationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Rendering', () => {
    it('should render debt evaluation container', () => {
      fixture.detectChanges();
      const container = fixture.debugElement.query(By.css('.debt-evaluation-container'));
      expect(container).toBeTruthy();
    });

    it('should display health score', () => {
      component.debts = mockDebts;
      component.totalDebt = 15000;
      component.totalPaid = 5000;
      fixture.detectChanges();

      const healthScore = fixture.debugElement.query(By.css('.health-score'));
      expect(healthScore).toBeTruthy();
      
      const scoreValue = fixture.debugElement.query(By.css('.score'));
      expect(scoreValue.nativeElement.textContent).toBeTruthy();
    });

    it('should display total debt metrics', () => {
      component.debts = mockDebts;
      component.totalDebt = 15000;
      component.totalPaid = 5000;
      fixture.detectChanges();

      const totalDebtValue = fixture.debugElement.query(By.css('.evaluation-card .value'));
      expect(totalDebtValue.nativeElement.textContent).toContain('15,000');
    });

    it('should display interest analysis', () => {
      component.debts = mockDebts;
      component.totalDebt = 15000;
      component.totalPaid = 5000;
      fixture.detectChanges();

      const interestCard = fixture.debugElement.queryAll(By.css('.evaluation-card'))[1];
      expect(interestCard).toBeTruthy();
      
      const highInterestValue = fixture.debugElement.query(By.css('.value.warning'));
      expect(highInterestValue).toBeTruthy();
    });

    it('should display recommendations list', () => {
      component.debts = mockDebts;
      component.totalDebt = 15000;
      component.totalPaid = 5000;
      fixture.detectChanges();

      const recommendationsList = fixture.debugElement.query(By.css('.recommendations-list'));
      expect(recommendationsList).toBeTruthy();
    });
  });

  describe('Data Calculations', () => {
    it('should calculate health score correctly', () => {
      component.debts = mockDebts;
      component.totalDebt = 15000;
      component.totalPaid = 5000;
      fixture.detectChanges();

      expect(component.healthScore).toBeGreaterThanOrEqual(0);
      expect(component.healthScore).toBeLessThanOrEqual(100);
      expect(['excellent', 'good', 'fair', 'poor']).toContain(component.healthStatus);
    });

    it('should calculate progress percentage correctly', () => {
      component.debts = mockDebts;
      component.totalDebt = 15000;
      component.totalPaid = 5000;
      fixture.detectChanges();

      const expectedProgress = (5000 / 15000) * 100;
      expect(component.progressPercentage).toBeCloseTo(expectedProgress, 1);
    });

    it('should count high interest debts correctly', () => {
      component.debts = mockDebts;
      fixture.detectChanges();

      expect(component.highInterestDebtCount).toBe(2);
    });

    it('should count low interest debts correctly', () => {
      component.debts = mockDebts;
      fixture.detectChanges();

      expect(component.lowInterestDebtCount).toBe(1);
    });

    it('should determine risk level based on health score', () => {
      component.debts = mockDebts;
      component.totalDebt = 15000;
      component.totalPaid = 5000;
      fixture.detectChanges();

      const riskLevel = component.riskLevel;
      expect(['low-risk', 'medium-risk', 'high-risk']).toContain(riskLevel);
    });

    it('should generate recommendations', () => {
      component.debts = mockDebts;
      component.totalDebt = 15000;
      component.totalPaid = 5000;
      fixture.detectChanges();

      const recommendations = component.recommendations;
      expect(Array.isArray(recommendations)).toBe(true);
      recommendations.forEach(rec => {
        expect(rec.text).toBeTruthy();
        expect(['high', 'medium', 'low']).toContain(rec.priority);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty debt data', () => {
      component.debts = [];
      component.totalDebt = 0;
      component.totalPaid = 0;
      fixture.detectChanges();

      expect(component.healthScore).toBe(100);
      expect(component.healthStatus).toBe('excellent');
      expect(component.recommendations.length).toBe(0);
    });

    it('should handle zero total debt', () => {
      component.debts = [];
      component.totalDebt = 0;
      component.totalPaid = 0;
      fixture.detectChanges();

      expect(component.progressPercentage).toBe(0);
      expect(component.highInterestDebtCount).toBe(0);
      expect(component.lowInterestDebtCount).toBe(0);
    });

    it('should handle very large debt amounts', () => {
      const largeDebt: Debt = {
        id: '1',
        creditor: 'Large Bank',
        principalAmount: 1000000,
        remainingAmount: 900000,
        interestRateApr: 5,
        minPayment: 5000,
        dueDate: '2024-12-01',
        recurrenceType: 'monthly' as any,
        isPaidOff: false
      };

      component.debts = [largeDebt];
      component.totalDebt = 1000000;
      component.totalPaid = 100000;
      fixture.detectChanges();

      expect(component.progressPercentage).toBeGreaterThan(0);
      expect(component.healthScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for recommendations list', () => {
      component.debts = mockDebts;
      component.totalDebt = 15000;
      component.totalPaid = 5000;
      fixture.detectChanges();

      const recommendationsList = fixture.debugElement.query(By.css('.recommendations-list'));
      expect(recommendationsList.nativeElement.getAttribute('role')).toBe('list');
      expect(recommendationsList.nativeElement.getAttribute('aria-label')).toBe('Debt management recommendations');
    });

    it('should have role="listitem" for recommendation items', () => {
      component.debts = mockDebts;
      component.totalDebt = 15000;
      component.totalPaid = 5000;
      fixture.detectChanges();

      const recommendationItems = fixture.debugElement.queryAll(By.css('.recommendations-list li'));
      recommendationItems.forEach((item: DebugElement) => {
        expect(item.nativeElement.getAttribute('role')).toBe('listitem');
      });
    });

    it('should have proper ARIA labels for icons', () => {
      fixture.detectChanges();

      const headerIcon = fixture.debugElement.query(By.css('.header-icon'));
      expect(headerIcon.nativeElement.getAttribute('aria-label')).toBe('Evaluation icon');

      const cardIcons = fixture.debugElement.queryAll(By.css('.card-icon'));
      cardIcons.forEach((icon: DebugElement) => {
        expect(icon.nativeElement.getAttribute('aria-label')).toBeTruthy();
      });
    });

    it('should have aria-hidden on decorative SVG elements', () => {
      fixture.detectChanges();

      const svgElements = fixture.debugElement.queryAll(By.css('svg'));
      svgElements.forEach((svg: DebugElement) => {
        expect(svg.nativeElement.getAttribute('aria-hidden')).toBe('true');
      });
    });

    it('should have region role with proper labeling', () => {
      fixture.detectChanges();

      const container = fixture.debugElement.query(By.css('.debt-evaluation-container'));
      expect(container.nativeElement.getAttribute('role')).toBe('region');
      expect(container.nativeElement.getAttribute('aria-labelledby')).toBe('debtEvaluationTitle');
    });

    it('should have priority badges with ARIA labels', () => {
      component.debts = mockDebts;
      component.totalDebt = 15000;
      component.totalPaid = 5000;
      fixture.detectChanges();

      const priorityBadges = fixture.debugElement.queryAll(By.css('.priority-badge'));
      priorityBadges.forEach((badge: DebugElement) => {
        const ariaLabel = badge.nativeElement.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
        expect(ariaLabel).toMatch(/high priority|medium priority|low priority/);
      });
    });
  });

  describe('Performance - Caching', () => {
    it('should cache computed values', () => {
      component.debts = mockDebts;
      component.totalDebt = 15000;
      component.totalPaid = 5000;
      fixture.detectChanges();

      const firstProgress = component.progressPercentage;
      const firstHighInterest = component.highInterestDebtCount;
      const firstRecommendations = component.recommendations;

      const secondProgress = component.progressPercentage;
      const secondHighInterest = component.highInterestDebtCount;
      const secondRecommendations = component.recommendations;

      expect(firstProgress).toBe(secondProgress);
      expect(firstHighInterest).toBe(secondHighInterest);
      expect(firstRecommendations).toBe(secondRecommendations);
    });

    it('should invalidate cache when data changes', () => {
      component.debts = mockDebts;
      component.totalDebt = 15000;
      component.totalPaid = 5000;
      fixture.detectChanges();

      const firstProgress = component.progressPercentage;
      const firstRecommendations = component.recommendations;

      component.totalDebt = 20000;
      component.totalPaid = 8000;
      fixture.detectChanges();

      const secondProgress = component.progressPercentage;
      expect(firstProgress).not.toBe(secondProgress);
    });
  });

  describe('TrackBy Function', () => {
    it('should return recommendation text for trackBy', () => {
      const recommendation = {
        text: 'Test recommendation',
        priority: 'high' as const
      };
      expect(component.trackByRecommendation(0, recommendation)).toBe('Test recommendation');
    });
  });

  describe('SSR Safety', () => {
    it('should initialize without errors on server platform', async () => {
      TestBed.resetTestingModule();
      
      await TestBed.configureTestingModule({
        imports: [DebtEvaluationComponent],
        providers: [
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      }).compileComponents();

      const serverFixture = TestBed.createComponent(DebtEvaluationComponent);
      serverFixture.componentInstance.debts = mockDebts;
      serverFixture.componentInstance.totalDebt = 15000;
      serverFixture.componentInstance.totalPaid = 5000;
      
      expect(() => {
        serverFixture.componentInstance.ngOnInit();
        serverFixture.detectChanges();
      }).not.toThrow();
      
      expect(serverFixture.componentInstance).toBeTruthy();
    });
  });
});

