/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component IncomeEvaluationComponent
  @description Income evaluation component for displaying income data
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { of } from 'rxjs';

import { IncomeService } from '../../../core/services/income.service';
import { Income } from '../../../models/income.model';
import { IncomeEvaluationComponent } from './income-evaluation.component';

describe('IncomeEvaluationComponent', () => {
  let component: IncomeEvaluationComponent;
  let fixture: ComponentFixture<IncomeEvaluationComponent>;
  let mockIncomeService: jasmine.SpyObj<IncomeService>;
  let mockMeta: jasmine.SpyObj<Meta>;

  const mockIncomes: Income[] = [
    {
      id: 1,
      userId: 1,
      amount: 1000,
      description: 'Salary',
      date: '2024-01-15',
      paymentMethod: 'Bank Transfer' as any,
      source: 'Salary',
      isReceived: true,
      received: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: 2,
      userId: 1,
      amount: 500,
      description: 'Freelance Work',
      date: '2024-01-20',
      paymentMethod: 'PayPal' as any,
      source: 'Freelance',
      isReceived: true,
      received: true,
      createdAt: '2024-01-20',
      updatedAt: '2024-01-20'
    }
  ];

  beforeEach(async () => {
    const incomeServiceSpy = jasmine.createSpyObj('IncomeService', ['getAllIncomes']);
    const metaSpy = jasmine.createSpyObj('Meta', ['addTags', 'updateTag']);

    await TestBed.configureTestingModule({
      imports: [IncomeEvaluationComponent],
      providers: [
        { provide: IncomeService, useValue: incomeServiceSpy },
        { provide: Meta, useValue: metaSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeEvaluationComponent);
    component = fixture.componentInstance;
    mockIncomeService = TestBed.inject(IncomeService) as jasmine.SpyObj<IncomeService>;
    mockMeta = TestBed.inject(Meta) as jasmine.SpyObj<Meta>;

    mockIncomeService.getAllIncomes.and.returnValue(of(mockIncomes as any));
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    // Reset component to initial state
    component.incomes = [];
    component.monthIncome = 0;
    component.weekIncome = 0;
    component.yearIncome = 0;
    component.dayIncome = 0;
    component.weekEvolution = 0;
    component.monthEvolution = 0;
    component.yearEvolution = 0;
    component.incomeSourceData = {};
    mockIncomeService.getAllIncomes.and.returnValue(of([]));
    
    component.ngOnInit();
    (component as any).updateSignals();
    fixture.detectChanges();

    expect(component.currentPeriod).toBe('month');
    expect(component.evolutionMetrics().totalIncome).toBe(0);
    expect(component.performanceMetrics().efficiency).toBe(0);
    expect(component.insights()).toEqual([]);
  });

  it('should process income data correctly', () => {
    component.incomes = mockIncomes;
    component.monthIncome = 1500;
    component.weekIncome = 500;
    component.yearIncome = 18000;
    component.dayIncome = 100;
    component.weekEvolution = 5;
    component.monthEvolution = 10;
    component.yearEvolution = 15;
    component.incomeSourceData = { 'Salary': 1000, 'Freelance': 500 };

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.evolutionMetrics().totalIncome).toBe(1500);
    expect(component.evolutionMetrics().monthlyGrowth).toBe(10);
    expect(component.evolutionMetrics().weeklyGrowth).toBe(5);
    expect(component.evolutionMetrics().yearlyGrowth).toBe(15);
  });

  it('should calculate performance metrics correctly', () => {
    component.incomes = mockIncomes;
    component.monthIncome = 1500;

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.performanceMetrics().efficiency).toBeGreaterThanOrEqual(0);
    expect(component.performanceMetrics().growthPotential).toBeGreaterThanOrEqual(0);
    expect(component.performanceMetrics().goalAlignment).toBeGreaterThanOrEqual(0);
    expect(component.performanceMetrics().stabilityIndex).toBeGreaterThanOrEqual(0);
  });

  it('should generate insights correctly', () => {
    component.incomes = mockIncomes;
    component.monthIncome = 1500;
    component.monthEvolution = 10;

    component.ngOnInit();
    fixture.detectChanges();

    const insights = component.insights();
    expect(insights).toBeDefined();
    expect(Array.isArray(insights)).toBe(true);
  });

  it('should detect when data is available', () => {
    component.incomes = mockIncomes;
    component.monthIncome = 1500;

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.hasData()).toBe(true);
  });

  it('should detect when no data is available', () => {
    // Reset component to initial state
    component.incomes = [];
    component.monthIncome = 0;
    component.weekIncome = 0;
    component.yearIncome = 0;
    component.dayIncome = 0;
    component.weekEvolution = 0;
    component.monthEvolution = 0;
    component.yearEvolution = 0;
    component.incomeSourceData = {};
    mockIncomeService.getAllIncomes.and.returnValue(of([]));
    
    component.ngOnInit();
    (component as any).updateSignals();
    fixture.detectChanges();

    expect(component.hasData()).toBe(false);
  });

  it('should update signals when inputs change', () => {
    component.incomes = []; // Empty array so it uses monthIncome instead of sum of incomes
    component.monthIncome = 1000;

    component.ngOnInit();
    (component as any).updateSignals();
    fixture.detectChanges();

    const initialTotal = component.evolutionMetrics().totalIncome;

    // Update the input property and signals
    component.monthIncome = 2000;
    (component as any).updateSignals();
    fixture.detectChanges();

    // The computed signal should reflect the new value
    expect(component.evolutionMetrics().totalIncome).toBe(2000);
  });

  it('should have proper getter methods', () => {
    component.incomes = mockIncomes;
    component.monthIncome = 1500;
    component.weekIncome = 500;
    component.yearIncome = 18000;
    component.dayIncome = 100;

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.totalIncome()).toBe(1500);
    expect(component.growthRate()).toBeDefined();
    expect(component.achievementRate()).toBeDefined();
    expect(component.trend()).toBeDefined();
    expect(component.monthlyGrowth()).toBeDefined();
    expect(component.consistencyScore()).toBeDefined();
    expect(component.diversificationScore()).toBeDefined();
    expect(component.todayIncome()).toBe(100);
    expect(component.efficiency()).toBeDefined();
    expect(component.growthPotential()).toBeDefined();
    expect(component.goalAlignment()).toBeDefined();
    expect(component.stabilityIndex()).toBeDefined();
    expect(component.insightsList()).toBeDefined();
  });

  it('should handle edge cases in calculations', () => {
    // Reset component to initial state
    component.incomes = [];
    component.monthIncome = 0;
    component.weekIncome = 0;
    component.yearIncome = 0;
    component.dayIncome = 0;
    component.weekEvolution = 0;
    component.monthEvolution = 0;
    component.yearEvolution = 0;
    component.incomeSourceData = {};
    mockIncomeService.getAllIncomes.and.returnValue(of([]));
    component.ngOnInit();
    (component as any).updateSignals();
    fixture.detectChanges();

    expect(component.evolutionMetrics().totalIncome).toBe(0);
    expect(component.performanceMetrics().efficiency).toBe(0);
    expect(component.insights().length).toBe(0);
  });

  it('should update meta tags on initialization', () => {
    component.ngOnInit();
    expect(mockMeta.addTags).toHaveBeenCalled();
  });

  it('should support keyboard navigation for add income button', () => {
    // Reset component to initial state
    component.incomes = [];
    component.monthIncome = 0;
    component.weekIncome = 0;
    component.yearIncome = 0;
    component.dayIncome = 0;
    component.weekEvolution = 0;
    component.monthEvolution = 0;
    component.yearEvolution = 0;
    component.incomeSourceData = {};
    mockIncomeService.getAllIncomes.and.returnValue(of([]));
    
    component.ngOnInit();
    (component as any).updateSignals();
    fixture.detectChanges();

    const addButton = fixture.debugElement.nativeElement.querySelector('.btn-secondary');
    expect(addButton).toBeTruthy();
    expect(addButton.getAttribute('aria-label')).toBe('Add new income entry');

    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    
    spyOn(component, 'onAddIncome');
    
    addButton.dispatchEvent(enterEvent);
    expect(component.onAddIncome).toHaveBeenCalled();
    
    addButton.dispatchEvent(spaceEvent);
    expect(component.onAddIncome).toHaveBeenCalled();
  });

  it('should have proper ARIA attributes', () => {
    component.incomes = mockIncomes;
    component.monthIncome = 1500;
    component.ngOnInit();
    fixture.detectChanges();

    const main = fixture.debugElement.nativeElement.querySelector('main');
    expect(main.getAttribute('role')).toBe('main');

    const contentGrid = fixture.debugElement.nativeElement.querySelector('.content-grid');
    expect(contentGrid.getAttribute('role')).toBe('region');
    expect(contentGrid.getAttribute('aria-label')).toBe('Income analysis dashboard');
  });

  it('should handle add income action', () => {
    // Reset component to initial state
    component.incomes = [];
    component.monthIncome = 0;
    component.weekIncome = 0;
    component.yearIncome = 0;
    component.dayIncome = 0;
    component.weekEvolution = 0;
    component.monthEvolution = 0;
    component.yearEvolution = 0;
    component.incomeSourceData = {};
    mockIncomeService.getAllIncomes.and.returnValue(of([]));
    
    component.ngOnInit();
    (component as any).updateSignals();
    fixture.detectChanges();

    spyOn(component, 'onAddIncome');
    
    const addButton = fixture.debugElement.nativeElement.querySelector('.btn-secondary');
    addButton.click();
    
    expect(component.onAddIncome).toHaveBeenCalled();
  });

  it('should have proper focus management', () => {
    component.incomes = mockIncomes;
    component.monthIncome = 1500;
    component.ngOnInit();
    fixture.detectChanges();

    const buttons = fixture.debugElement.nativeElement.querySelectorAll('button');
    buttons.forEach((button: any) => {
      expect(button.getAttribute('tabindex')).toBe('0');
    });
  });

  it('should have proper accessibility features', () => {
    component.incomes = mockIncomes;
    component.monthIncome = 1500;
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.totalIncome()).toBeDefined();
    expect(component.growthRate()).toBeDefined();
    expect(component.achievementRate()).toBeDefined();
    expect(component.trend()).toBeDefined();
    expect(component.monthlyGrowth()).toBeDefined();
    expect(component.weeklyGrowth()).toBeDefined();
    expect(component.yearlyGrowth()).toBeDefined();
    expect(component.consistencyScore()).toBeDefined();
    expect(component.diversificationScore()).toBeDefined();
    expect(component.todayIncome()).toBeDefined();
    expect(component.efficiency()).toBeDefined();
    expect(component.growthPotential()).toBeDefined();
    expect(component.goalAlignment()).toBeDefined();
    expect(component.stabilityIndex()).toBeDefined();
    expect(component.insightsList()).toBeDefined();
  });
});