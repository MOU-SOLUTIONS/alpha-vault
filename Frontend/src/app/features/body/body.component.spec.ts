/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component BodyComponent
  @description Unit tests for main content area component with enhanced functionality
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationEnd,Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { BodyComponent } from './body.component';

describe('BodyComponent', () => {
  let component: BodyComponent;
  let fixture: ComponentFixture<BodyComponent>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate'], {
      events: of(new NavigationEnd(1, '/dashboard', '/dashboard'))
    });

    await TestBed.configureTestingModule({
      imports: [
        BodyComponent,
        RouterTestingModule
      ],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BodyComponent);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit componentLoaded event after initialization', (done) => {
    component.componentLoaded.subscribe(() => {
      expect(true).toBeTrue();
      done();
    });
  });

  it('should have proper component structure', () => {
    expect(component.componentLoaded).toBeDefined();
    expect(component.contentChanged).toBeDefined();
    expect(component.currentRoute).toBeDefined();
    expect(component.isContentLoading).toBeDefined();
    expect(component.hasContentError).toBeDefined();
  });

  it('should initialize with default states', () => {
    expect(component.currentRoute).toBe('');
    expect(component.isContentLoading).toBeFalse();
    expect(component.hasContentError).toBeFalse();
    expect(component.contentErrorMessage).toBe('');
  });

  it('should handle retry content load', () => {
    component.hasContentError = true;
    component.contentErrorMessage = 'Test error';
    
    component.retryContentLoad();
    
    expect(component.hasContentError).toBeFalse();
    expect(component.contentErrorMessage).toBe('');
    expect(component.isContentLoading).toBeTrue();
  });

  it('should clear content error', () => {
    component.hasContentError = true;
    component.contentErrorMessage = 'Test error';
    
    component.clearContentError();
    
    expect(component.hasContentError).toBeFalse();
    expect(component.contentErrorMessage).toBe('');
  });

  it('should emit contentChanged event when route changes', (done) => {
    component.contentChanged.subscribe((route: string) => {
      expect(route).toBe('/dashboard');
      done();
    });
  });

  it('should update current route on navigation', () => {
    expect(component.currentRoute).toBe('/dashboard');
  });

  it('should handle component destruction properly', () => {
    spyOn(component.componentLoaded, 'emit');
    
    component.ngOnDestroy();
    
    expect(component.componentLoaded.emit).not.toHaveBeenCalled();
  });
});
