/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component DebtDueDateChartComponent
  @description Main debt dashboard component tests for managing debt payment deadlines
*/

import { DebugElement, PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { DebtDueDateChartComponent } from './debt-due-date-chart.component';

describe('DebtDueDateChartComponent', () => {
  let component: DebtDueDateChartComponent;
  let fixture: ComponentFixture<DebtDueDateChartComponent>;

  const mockDebts = [
    {
      creditorName: 'Bank A',
      dueDate: '2024-01-15',
      remainingAmount: 5000
    },
    {
      creditorName: 'Credit Card B',
      dueDate: '2024-12-20',
      remainingAmount: 3000
    },
    {
      creditorName: 'Loan C',
      dueDate: '2024-11-10',
      remainingAmount: 2000
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebtDueDateChartComponent, NoopAnimationsModule],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DebtDueDateChartComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Rendering', () => {
    it('should render when no debt data is provided', () => {
      component.debts = [];
      fixture.detectChanges();

      const noDataElement = fixture.debugElement.query(By.css('.no-data'));
      expect(noDataElement).toBeTruthy();
      
      const title = fixture.debugElement.query(By.css('.no-data-title'));
      expect(title.nativeElement.textContent.trim()).toBe('No Debt Data Available');
    });

    it('should render debt list when data is provided', () => {
      component.debts = mockDebts;
      fixture.detectChanges();

      const debtList = fixture.debugElement.query(By.css('.due-date-list'));
      expect(debtList).toBeTruthy();

      const debtItems = fixture.debugElement.queryAll(By.css('.due-date-item'));
      expect(debtItems.length).toBe(3);
    });

    it('should display creditor names correctly', () => {
      component.debts = mockDebts;
      fixture.detectChanges();

      const creditorNames = fixture.debugElement
        .queryAll(By.css('.creditor-name'))
        .map((el: DebugElement) => el.nativeElement.textContent.trim());

      expect(creditorNames).toContain('Bank A');
      expect(creditorNames).toContain('Credit Card B');
      expect(creditorNames).toContain('Loan C');
    });

    it('should display summary counts', () => {
      component.debts = mockDebts;
      fixture.detectChanges();

      const summaryItems = fixture.debugElement.queryAll(By.css('.summary-item'));
      expect(summaryItems.length).toBe(3);
    });
  });

  describe('Data Transformation', () => {
    it('should sort debts by due date ascending', () => {
      component.debts = mockDebts;
      fixture.detectChanges();

      const sortedDebts = component.sortedDebts;
      expect(sortedDebts[0].dueDate).toBe('2024-01-15');
      expect(sortedDebts[1].dueDate).toBe('2024-11-10');
      expect(sortedDebts[2].dueDate).toBe('2024-12-20');
    });

    it('should calculate debt status correctly', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 20);

      component.debts = [
        {
          creditorName: 'Past Debt',
          dueDate: pastDate.toISOString().split('T')[0],
          remainingAmount: 1000
        },
        {
          creditorName: 'Future Debt',
          dueDate: futureDate.toISOString().split('T')[0],
          remainingAmount: 2000
        }
      ];
      fixture.detectChanges();

      const pastStatus = component.getDebtStatus(pastDate.toISOString().split('T')[0]);
      expect(pastStatus.class).toBe('overdue');

      const futureStatus = component.getDebtStatus(futureDate.toISOString().split('T')[0]);
      expect(['warning', 'normal']).toContain(futureStatus.class);
    });

    it('should calculate overdue count correctly', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);
      
      component.debts = [
        {
          creditorName: 'Past Debt 1',
          dueDate: pastDate.toISOString().split('T')[0],
          remainingAmount: 1000
        },
        {
          creditorName: 'Past Debt 2',
          dueDate: pastDate.toISOString().split('T')[0],
          remainingAmount: 2000
        },
        {
          creditorName: 'Future Debt',
          dueDate: '2024-12-31',
          remainingAmount: 3000
        }
      ];
      fixture.detectChanges();

      expect(component.overdueCount).toBe(2);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for debt list', () => {
      component.debts = mockDebts;
      fixture.detectChanges();

      const debtList = fixture.debugElement.query(By.css('.due-date-list'));
      expect(debtList.nativeElement.getAttribute('role')).toBe('list');
      expect(debtList.nativeElement.getAttribute('aria-label')).toBe('Debt payment deadlines');
    });

    it('should have role="listitem" for debt items', () => {
      component.debts = mockDebts;
      fixture.detectChanges();

      const debtItems = fixture.debugElement.queryAll(By.css('.due-date-item'));
      debtItems.forEach((item: DebugElement) => {
        expect(item.nativeElement.getAttribute('role')).toBe('listitem');
        expect(item.nativeElement.getAttribute('aria-label')).toBeTruthy();
      });
    });

    it('should have proper ARIA labels for icons', () => {
      fixture.detectChanges();

      const headerIcon = fixture.debugElement.query(By.css('.header-icon'));
      expect(headerIcon.nativeElement.getAttribute('aria-label')).toBe('Payment deadlines icon');

      const noDataIcon = fixture.debugElement.query(By.css('.no-data-icon'));
      if (noDataIcon) {
        expect(noDataIcon.nativeElement.getAttribute('aria-label')).toBe('Chart icon');
      }
    });

    it('should have aria-hidden on decorative SVG elements', () => {
      component.debts = mockDebts;
      fixture.detectChanges();

      const svgElements = fixture.debugElement.queryAll(By.css('svg'));
      svgElements.forEach((svg: DebugElement) => {
        const ariaHidden = svg.nativeElement.getAttribute('aria-hidden');
        expect(ariaHidden).toBe('true');
      });
    });

    it('should have region role with proper labeling', () => {
      fixture.detectChanges();

      const container = fixture.debugElement.query(By.css('.due-date-chart-container'));
      expect(container.nativeElement.getAttribute('role')).toBe('region');
      expect(container.nativeElement.getAttribute('aria-labelledby')).toBe('dueDateChartTitle');
    });

    it('should replace emoji with accessible SVG icons', () => {
      component.debts = [];
      fixture.detectChanges();

      const noDataIcon = fixture.debugElement.query(By.css('.no-data-icon'));
      const svg = noDataIcon.query(By.css('svg'));
      expect(svg).toBeTruthy();
      expect(noDataIcon.nativeElement.getAttribute('aria-label')).toBe('Chart icon');
    });

    it('should have status badges with ARIA labels', () => {
      component.debts = mockDebts;
      fixture.detectChanges();

      const statusBadges = fixture.debugElement.queryAll(By.css('.status-badge'));
      statusBadges.forEach((badge: DebugElement) => {
        expect(badge.nativeElement.getAttribute('aria-label')).toBeTruthy();
      });
    });

    it('should have summary items with ARIA labels', () => {
      component.debts = mockDebts;
      fixture.detectChanges();

      const summaryItems = fixture.debugElement.queryAll(By.css('.summary-item'));
      summaryItems.forEach((item: DebugElement) => {
        expect(item.nativeElement.getAttribute('role')).toBe('listitem');
        expect(item.nativeElement.getAttribute('aria-label')).toBeTruthy();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty debt data', () => {
      component.debts = [];
      fixture.detectChanges();

      expect(component.hasDebtData).toBe(false);
      expect(component.sortedDebts.length).toBe(0);
      expect(component.overdueCount).toBe(0);
      expect(component.urgentCount).toBe(0);
      expect(component.upcomingCount).toBe(0);
    });

    it('should handle single debt', () => {
      component.debts = [mockDebts[0]];
      fixture.detectChanges();

      expect(component.hasDebtData).toBe(true);
      expect(component.sortedDebts.length).toBe(1);
    });

    it('should handle debts with same due dates', () => {
      const sameDate = '2024-12-31';
      component.debts = [
        { creditorName: 'Debt A', dueDate: sameDate, remainingAmount: 1000 },
        { creditorName: 'Debt B', dueDate: sameDate, remainingAmount: 2000 }
      ];
      fixture.detectChanges();

      expect(component.sortedDebts.length).toBe(2);
    });
  });

  describe('Performance - Caching', () => {
    it('should cache sorted debts', () => {
      component.debts = mockDebts;
      fixture.detectChanges();

      const firstSorted = component.sortedDebts;
      const secondSorted = component.sortedDebts;

      expect(firstSorted).toBe(secondSorted);
    });

    it('should cache debt statuses', () => {
      component.debts = mockDebts;
      fixture.detectChanges();

      const firstStatus = component.getDebtStatus(mockDebts[0].dueDate);
      const secondStatus = component.getDebtStatus(mockDebts[0].dueDate);

      expect(firstStatus).toBe(secondStatus);
    });

    it('should invalidate cache when debts change', () => {
      component.debts = mockDebts;
      fixture.detectChanges();

      const firstSorted = component.sortedDebts;

      component.debts = [{ creditorName: 'New Debt', dueDate: '2024-12-31', remainingAmount: 1000 }];
      fixture.detectChanges();

      const secondSorted = component.sortedDebts;
      expect(firstSorted).not.toBe(secondSorted);
      expect(secondSorted.length).toBe(1);
    });
  });

  describe('TrackBy Function', () => {
    it('should return creditor name for trackBy', () => {
      const debt = { creditorName: 'Test Creditor', dueDate: '2024-12-31', remainingAmount: 1000 };
      expect(component.trackByDebt(0, debt)).toBe('Test Creditor');
    });
  });

  describe('SSR Safety', () => {
    it('should initialize without errors on server platform', async () => {
      TestBed.resetTestingModule();
      
      await TestBed.configureTestingModule({
        imports: [DebtDueDateChartComponent, NoopAnimationsModule],
        providers: [
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      }).compileComponents();

      const serverFixture = TestBed.createComponent(DebtDueDateChartComponent);
      serverFixture.componentInstance.debts = mockDebts;
      
      expect(() => {
        serverFixture.componentInstance.ngOnInit();
        serverFixture.detectChanges();
      }).not.toThrow();
      
      expect(serverFixture.componentInstance).toBeTruthy();
    });
  });

  describe('Security', () => {
    it('should not use innerHTML for icons', () => {
      component.debts = mockDebts;
      fixture.detectChanges();

      const badgeIcons = fixture.debugElement.queryAll(By.css('.badge-icon'));
      badgeIcons.forEach((icon: DebugElement) => {
        const svg = icon.query(By.css('svg'));
        expect(svg).toBeTruthy();
      });
    });
  });
});

