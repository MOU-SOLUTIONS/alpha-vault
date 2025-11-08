/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ExpenseEvaluationInsightsComponent
  @description Expense evaluation insights component for displaying expense data
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseEvaluationInsightsComponent, Insight } from './expense-evaluation-insights.component';

describe('ExpenseEvaluationInsightsComponent', () => {
  let component: ExpenseEvaluationInsightsComponent;
  let fixture: ComponentFixture<ExpenseEvaluationInsightsComponent>;

  const mockInsights: Insight[] = [
    {
      id: 1,
      icon: '🚀',
      title: 'Positive Growth Trend',
      description: 'Your expenses have grown 15.5% this month. Keep up the excellent work!'
    },
    {
      id: 2,
      icon: '🌐',
      title: 'Diversification Opportunity',
      description: 'Consider diversifying your expense sources to reduce risk and increase stability.'
    },
    {
      id: 3,
      icon: '✅',
      title: 'Stable Expense Pattern',
      description: 'Your expenses show excellent consistency. This predictable pattern helps with financial planning.'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseEvaluationInsightsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseEvaluationInsightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display insights correctly', () => {
    component.insights = mockInsights;
    fixture.detectChanges();

    const insightCards = fixture.debugElement.nativeElement.querySelectorAll('.insight-card');
    expect(insightCards.length).toBe(3);

    const titles = fixture.debugElement.nativeElement.querySelectorAll('.insight-content h3');
    expect(titles[0].textContent).toBe('Positive Growth Trend');
    expect(titles[1].textContent).toBe('Diversification Opportunity');
    expect(titles[2].textContent).toBe('Stable Expense Pattern');

    const descriptions = fixture.debugElement.nativeElement.querySelectorAll('.insight-content p');
    expect(descriptions[0].textContent).toContain('Your expenses have grown 15.5%');
    expect(descriptions[1].textContent).toContain('Consider diversifying');
    expect(descriptions[2].textContent).toContain('excellent consistency');
  });

  it('should display insight icons correctly', () => {
    component.insights = mockInsights;
    fixture.detectChanges();

    const icons = fixture.debugElement.nativeElement.querySelectorAll('.insight-icon');
    expect(icons[0].textContent).toBe('🚀');
    expect(icons[1].textContent).toBe('🌐');
    expect(icons[2].textContent).toBe('✅');
  });

  it('should handle empty insights array', () => {
    component.insights = [];
    fixture.detectChanges();

    const insightCards = fixture.debugElement.nativeElement.querySelectorAll('.insight-card');
    expect(insightCards.length).toBe(0);
  });

  it('should track insights by id', () => {
    expect(component.trackByInsight(0, mockInsights[0])).toBe(1);
    expect(component.trackByInsight(1, mockInsights[1])).toBe(2);
    expect(component.trackByInsight(2, mockInsights[2])).toBe(3);
  });

  it('should have proper ARIA attributes', () => {
    component.insights = mockInsights;
    fixture.detectChanges();

    const section = fixture.debugElement.nativeElement.querySelector('section');
    expect(section.getAttribute('role')).toBe('region');
    expect(section.getAttribute('aria-labelledby')).toBe('insights-title');

    const insightsList = fixture.debugElement.nativeElement.querySelector('.insights-grid');
    expect(insightsList.getAttribute('role')).toBe('list');
    expect(insightsList.getAttribute('aria-label')).toBe('Smart insights and recommendations');

    const insightCards = fixture.debugElement.nativeElement.querySelectorAll('.insight-card');
    insightCards.forEach((card: any) => {
      expect(card.getAttribute('role')).toBe('listitem');
    });

    const titleIcon = fixture.debugElement.nativeElement.querySelector('.title-icon');
    expect(titleIcon.getAttribute('aria-hidden')).toBe('true');
  });

  it('should display default icon when not provided', () => {
    const insightsWithDefaultIcon: Insight[] = [
      {
        id: 1,
        icon: '',
        title: 'Test Insight',
        description: 'Test description'
      }
    ];

    component.insights = insightsWithDefaultIcon;
    fixture.detectChanges();

    const icon = fixture.debugElement.nativeElement.querySelector('.insight-icon');
    expect(icon.textContent).toBe('💡');
  });

  it('should handle single insight', () => {
    component.insights = [mockInsights[0]];
    fixture.detectChanges();

    const insightCards = fixture.debugElement.nativeElement.querySelectorAll('.insight-card');
    expect(insightCards.length).toBe(1);

    const title = fixture.debugElement.nativeElement.querySelector('.insight-content h3');
    expect(title.textContent).toBe('Positive Growth Trend');
  });

  it('should be responsive', () => {
    component.insights = mockInsights;
    fixture.detectChanges();

    // Test that the component renders without errors
    expect(component).toBeTruthy();
    
    // Test with many insights
    const manyInsights = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      icon: '💡',
      title: `Insight ${i + 1}`,
      description: `Description for insight ${i + 1}`
    }));

    component.insights = manyInsights;
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should support keyboard navigation', () => {
    component.insights = mockInsights;
    fixture.detectChanges();

    const insightCards = fixture.debugElement.nativeElement.querySelectorAll('.insight-card');
    const firstCard = insightCards[0];
    
    // Test tabindex
    expect(firstCard).toBeTruthy();
    expect(firstCard.getAttribute('tabindex')).toBe('0');
    
    // Test keyboard activation
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    
    spyOn(component, 'onInsightClick');
    
    firstCard.dispatchEvent(enterEvent);
    expect(component.onInsightClick).toHaveBeenCalledWith(mockInsights[0]);
    
    firstCard.dispatchEvent(spaceEvent);
    expect(component.onInsightClick).toHaveBeenCalledWith(mockInsights[0]);
  });

  it('should have proper focus management', () => {
    component.insights = mockInsights;
    fixture.detectChanges();

    const insightCards = fixture.debugElement.nativeElement.querySelectorAll('.insight-card');
    
    insightCards.forEach((card: any) => {
      expect(card.getAttribute('tabindex')).toBe('0');
      expect(card.getAttribute('role')).toBe('listitem');
    });
  });

  it('should handle insight click events', () => {
    component.insights = mockInsights;
    fixture.detectChanges();

    spyOn(component, 'onInsightClick');
    
    const firstCard = fixture.debugElement.nativeElement.querySelector('.insight-card');
    firstCard.click();
    
    expect(component.onInsightClick).toHaveBeenCalledWith(mockInsights[0]);
  });
});
