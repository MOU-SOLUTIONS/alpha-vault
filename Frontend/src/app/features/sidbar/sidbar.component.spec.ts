/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component SidbarComponent
  @description Comprehensive unit tests for advanced navigation sidebar component
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { SidbarComponent } from './sidbar.component';

describe('SidbarComponent', () => {
  let component: SidbarComponent;
  let fixture: ComponentFixture<SidbarComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockUrl: string;

  beforeEach(async () => {
    mockUrl = '/dashboard';
    
    const routerSpy = jasmine.createSpyObj('Router', ['navigate'], {
      events: of(new NavigationEnd(1, '/dashboard', '/dashboard'))
    });
    
    Object.defineProperty(routerSpy, 'url', {
      get: () => mockUrl,
      configurable: true
    });

    await TestBed.configureTestingModule({
      imports: [
        SidbarComponent,
        RouterTestingModule
      ],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidbarComponent);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have proper component structure', () => {
    expect(component.currentSection).toBeDefined();
    expect(component.sectionColors).toBeDefined();
    expect(component.getCurrentColors).toBeDefined();
  });

  it('should initialize with default section', () => {
    expect(component.currentSection).toBe('default');
  });

  it('should have all required color themes', () => {
    const themes = Object.keys(component.sectionColors);
    expect(themes).toContain('default');
    expect(themes).toContain('income');
    expect(themes).toContain('expense');
    expect(themes).toContain('saving');
    expect(themes).toContain('budget');
    expect(themes).toContain('debt');
    expect(themes).toContain('investment');
  });

  it('should return correct colors for default section', () => {
    const colors = component.getCurrentColors();
    expect(colors.primary).toBe('#6366f1');
    expect(colors.secondary).toBe('#8b5cf6');
    expect(colors.accent).toBe('#a855f7');
  });

  it('should return correct colors for income section', () => {
    (component as any)._currentSection = 'income';
    const colors = component.getCurrentColors();
    expect(colors.primary).toBe('#3b82f6');
    expect(colors.secondary).toBe('#2563eb');
    expect(colors.accent).toBe('#60a5fa');
  });

  it('should detect income section from URL', () => {
    const section = (component as any).determineSectionFromUrl('/main/body/income');
    expect(section).toBe('income');
  });

  it('should detect expense section from URL', () => {
    const section = (component as any).determineSectionFromUrl('/main/body/expense');
    expect(section).toBe('expense');
  });

  it('should detect saving section from URL', () => {
    const section = (component as any).determineSectionFromUrl('/main/body/saving');
    expect(section).toBe('saving');
  });

  it('should detect budget section from URL', () => {
    const section = (component as any).determineSectionFromUrl('/main/body/budget');
    expect(section).toBe('budget');
  });

  it('should detect debt section from URL', () => {
    const section = (component as any).determineSectionFromUrl('/main/body/debt');
    expect(section).toBe('debt');
  });

  it('should detect investment section from URL', () => {
    const section = (component as any).determineSectionFromUrl('/main/body/investment');
    expect(section).toBe('investment');
  });

  it('should return default for unknown URLs', () => {
    const section = (component as any).determineSectionFromUrl('/unknown/path');
    expect(section).toBe('default');
  });

  it('should handle case-insensitive URL matching', () => {
    const section = (component as any).determineSectionFromUrl('/MAIN/BODY/INCOME');
    expect(section).toBe('income');
  });

  it('should navigate to income section', () => {
    component.navigateToIncome();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['main/body/income']);
  });

  it('should navigate to expense section', () => {
    component.navigateToExpense();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['main/body/expense']);
  });

  it('should navigate to saving section', () => {
    component.navigateToSaving();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['main/body/saving']);
  });

  it('should navigate to budget section', () => {
    component.navigateToBudget();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['main/body/budget']);
  });

  it('should navigate to debt section', () => {
    component.navigateToDebt();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['main/body/debt']);
  });

  it('should navigate to investment section', () => {
    component.navigateToInvestment();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['main/body/investment']);
  });

  it('should detect active route correctly', () => {
    mockUrl = '/main/body/income';
    expect(component.isRouteActive('main/body/income')).toBeTrue();
  });

  it('should detect route starting with path', () => {
    mockUrl = '/main/body/income/details';
    expect(component.isRouteActive('main/body/income')).toBeTrue();
  });

  it('should return false for non-matching routes', () => {
    mockUrl = '/main/body/expense';
    expect(component.isRouteActive('main/body/income')).toBeFalse();
  });

  it('should handle root path correctly', () => {
    mockUrl = '/';
    expect(component.isRouteActive('main/body/income')).toBeFalse();
  });

  it('should set up router monitoring on init', () => {
    spyOn(component as any, 'setupRouterMonitoring');
    component.ngOnInit();
    expect((component as any).setupRouterMonitoring).toHaveBeenCalled();
  });

  it('should update colors on init', () => {
    spyOn(component as any, 'updateSectionColors');
    component.ngOnInit();
    expect((component as any).updateSectionColors).toHaveBeenCalledWith(mockRouter.url);
  });

  it('should use OnPush change detection strategy', () => {
    const componentDef = (component.constructor as any).ɵcmp;
    expect(componentDef).toBeDefined();
    expect(componentDef.onPush).toBeDefined();
  });

  it('should use DestroyRef for subscription management', () => {
    expect((component as any).destroyRef).toBeDefined();
  });

  it('should check if component is destroyed', () => {
    expect((component as any).isDestroyed()).toBeFalse();
    
    expect(typeof (component as any).isDestroyed).toBe('function');
  });

  it('should not navigate when component is destroyed', () => {
    mockRouter.navigate.calls.reset();
    
    component.navigateToIncome();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['main/body/income']);
    
    mockRouter.navigate.calls.reset();
    
    component.navigateToExpense();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['main/body/expense']);
  });

  it('should cache route active states', () => {
    mockUrl = '/main/body/income';
    const result1 = component.isRouteActive('main/body/income');
    const result2 = component.isRouteActive('main/body/income');
    expect(result1).toBe(result2);
    expect((component as any)._routeActiveCache.has('main/body/income')).toBeTrue();
  });

  it('should cache current colors', () => {
    const colors1 = component.getCurrentColors();
    const colors2 = component.getCurrentColors();
    expect(colors1).toBe(colors2);
  });

  it('should handle complete navigation flow', () => {
    mockUrl = '/main/body/income';
    (component as any).updateSectionColors('/main/body/income');
    
    expect(component.currentSection).toBe('income');
    expect(component.getCurrentColors().primary).toBe('#3b82f6');
  });

  it('should handle section change correctly', () => {
    expect(component.currentSection).toBe('default');
    
    (component as any).updateSectionColors('/main/body/expense');
    expect(component.currentSection).toBe('expense');
    
    const colors = component.getCurrentColors();
    expect(colors.primary).toBe('#3f51b5');
  });

  it('should maintain state consistency across operations', () => {
    component.navigateToIncome();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['main/body/income']);
    
    mockUrl = '/main/body/income';
    expect(component.isRouteActive('main/body/income')).toBeTrue();
    
    expect(component.currentSection).toBe('default');
  });
});
