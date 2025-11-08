/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component NavbarComponent
  @description Comprehensive unit tests for enhanced navigation bar component
*/

import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthService } from '../../core/services/auth.service';
import { UserResponseDTO } from '../../models/user.model';
import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockChangeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;

  const mockUser: UserResponseDTO = {
    id: 1,
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    twoFactorEnabled: false,
    isVerified: true,
    isActive: true,
    accountType: 'premium',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'logout']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const changeDetectorRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck']);

    await TestBed.configureTestingModule({
      imports: [
        NavbarComponent,
        RouterTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ChangeDetectorRef, useValue: changeDetectorRefSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockChangeDetectorRef = TestBed.inject(ChangeDetectorRef) as jasmine.SpyObj<ChangeDetectorRef>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have proper component structure', () => {
    expect(component.currentUser).toBeDefined();
    expect(component.showUserMenu).toBeDefined();
    expect(component.isLoadingUser).toBeDefined();
    expect(component.hasUserError).toBeDefined();
    expect(component.userErrorMessage).toBeDefined();
    expect(component.showUserMenu$).toBeDefined();
  });

  it('should initialize with default values', () => {
    expect(component.currentUser).toBeNull();
    expect(component.showUserMenu).toBeFalse();
    expect(component.isLoadingUser).toBeFalse();
    expect(component.hasUserError).toBeFalse();
    expect(component.userErrorMessage).toBe('');
  });

  it('should call setupUserData on init', () => {
    spyOn(component as any, 'setupUserData');
    spyOn(component as any, 'setupAccessibility');
    spyOn(component as any, 'setupKeyboardNavigation');

    component.ngOnInit();

    expect((component as any).setupUserData).toHaveBeenCalled();
    expect((component as any).setupAccessibility).toHaveBeenCalled();
    expect((component as any).setupKeyboardNavigation).toHaveBeenCalled();
  });

  describe('User Data Management', () => {
    it('should load user data successfully', () => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
      spyOn(component as any, 'announceToScreenReader');

      component.ngOnInit();

      expect(component.currentUser).toEqual(mockUser);
      expect(component.isLoadingUser).toBeFalse();
      expect(component.hasUserError).toBeFalse();
      expect((component as any).announceToScreenReader).toHaveBeenCalledWith('User data loaded successfully');
    });

    it('should handle missing user data', () => {
      mockAuthService.getCurrentUser.and.returnValue(null);
      spyOn(component as any, 'announceToScreenReader');

      component.ngOnInit();

      expect(component.currentUser).toBeNull();
      expect(component.hasUserError).toBeTrue();
      expect(component.userErrorMessage).toBe('No user data available');
      expect((component as any).announceToScreenReader).toHaveBeenCalledWith('No user data available');
    });

    it('should handle user data loading errors', () => {
      const error = new Error('Database error');
      mockAuthService.getCurrentUser.and.throwError(error);
      spyOn(component as any, 'announceToScreenReader');
      spyOn(console, 'error');

      component.ngOnInit();

      expect(component.currentUser).toBeNull();
      expect(component.hasUserError).toBeTrue();
      expect(component.userErrorMessage).toBe('Failed to load user data');
      expect(console.error).toHaveBeenCalledWith('User data loading error:', error);
    });

    it('should retry loading user data', () => {
      spyOn(component as any, 'setupUserData');
      component.hasUserError = true;
      component.userErrorMessage = 'Test error';

      component.retryUserDataLoad();

      expect((component as any).setupUserData).toHaveBeenCalled();
    });
  });

  describe('User Menu Management', () => {
    it('should toggle user menu correctly', () => {
      spyOn(component as any, 'announceToScreenReader');
      spyOn(component as any, 'focusUserMenu');

      component.toggleUserMenu();

      expect(component.showUserMenu).toBeTrue();
      expect((component as any).announceToScreenReader).toHaveBeenCalledWith('User menu opened');
      expect((component as any).focusUserMenu).toHaveBeenCalled();
    });

    it('should close user menu correctly', () => {
      component.showUserMenu = true;
      spyOn(component as any, 'announceToScreenReader');

      component.closeUserMenu();

      expect(component.showUserMenu).toBeFalse();
      expect((component as any).announceToScreenReader).toHaveBeenCalledWith('User menu closed');
    });

    it('should not close menu if already closed', () => {
      component.showUserMenu = false;
      spyOn(component as any, 'announceToScreenReader');

      component.closeUserMenu();

      expect(component.showUserMenu).toBeFalse();
      expect((component as any).announceToScreenReader).not.toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should navigate to home correctly', () => {
      spyOn(component as any, 'announceToScreenReader');

      component.goToHome();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
      expect((component as any).announceToScreenReader).toHaveBeenCalledWith('Navigating to home');
    });

    it('should navigate to profile correctly', () => {
      spyOn(component as any, 'announceToScreenReader');

      component.openProfile();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/profile']);
      expect((component as any).announceToScreenReader).toHaveBeenCalledWith('Opening user profile');
    });

    it('should navigate to settings correctly', () => {
      spyOn(component as any, 'announceToScreenReader');

      component.openSettings();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/settings']);
      expect((component as any).announceToScreenReader).toHaveBeenCalledWith('Opening user settings');
    });
  });

  describe('Logout', () => {
    it('should logout successfully', () => {
      component.showUserMenu = true;
      spyOn(component as any, 'announceToScreenReader');

      component.logout();

      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(component.showUserMenu).toBeFalse();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth']);
      expect((component as any).announceToScreenReader).toHaveBeenCalledWith('Logging out');
    });

    it('should handle logout errors gracefully', () => {
      const error = new Error('Logout failed');
      mockAuthService.logout.and.throwError(error);
      spyOn(component as any, 'announceToScreenReader');
      spyOn(console, 'error');

      component.logout();

      expect(console.error).toHaveBeenCalledWith('Logout failed:', error);
      expect((component as any).announceToScreenReader).toHaveBeenCalledWith('Logout failed, please try again');
    });
  });

  describe('Accessibility', () => {
    it('should announce component initialization', () => {
      spyOn(component as any, 'announceToScreenReader');

      component.ngOnInit();

      expect((component as any).announceToScreenReader).toHaveBeenCalledWith('Navigation bar loaded');
    });

    it('should announce user menu state changes', () => {
      spyOn(component as any, 'announceToScreenReader');

      component.toggleUserMenu();

      expect((component as any).announceToScreenReader).toHaveBeenCalledWith('User menu opened');
    });

    it('should focus user menu when opened', () => {
      spyOn(component as any, 'focusUserMenu');

      component.toggleUserMenu();

      expect((component as any).focusUserMenu).toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should handle escape key correctly', () => {
      component.showUserMenu = true;
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      spyOn(event, 'preventDefault');

      component.onUserMenuKeydown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.showUserMenu).toBeFalse();
    });

    it('should handle enter key correctly', () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      spyOn(event, 'preventDefault');
      spyOn(component, 'toggleUserMenu');

      component.onUserMenuKeydown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.toggleUserMenu).toHaveBeenCalled();
    });

    it('should handle space key correctly', () => {
      const event = new KeyboardEvent('keydown', { key: ' ' });
      spyOn(event, 'preventDefault');
      spyOn(component, 'toggleUserMenu');

      component.onUserMenuKeydown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.toggleUserMenu).toHaveBeenCalled();
    });

    it('should handle arrow down key when menu is open', () => {
      component.showUserMenu = true;
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      spyOn(event, 'preventDefault');
      spyOn(component as any, 'focusFirstMenuItem');

      component.onUserMenuKeydown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect((component as any).focusFirstMenuItem).toHaveBeenCalled();
    });

    it('should not handle arrow down when menu is closed', () => {
      component.showUserMenu = false;
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      spyOn(component as any, 'focusFirstMenuItem');

      component.onUserMenuKeydown(event);

      expect((component as any).focusFirstMenuItem).not.toHaveBeenCalled();
    });
  });

  describe('Dropdown Item Keyboard Navigation', () => {
    it('should handle logout action on enter key', () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      spyOn(event, 'preventDefault');
      spyOn(component, 'logout');

      component.onDropdownItemKeydown(event, 'logout');

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.logout).toHaveBeenCalled();
    });

    it('should handle logout action on space key', () => {
      const event = new KeyboardEvent('keydown', { key: ' ' });
      spyOn(event, 'preventDefault');
      spyOn(component, 'logout');

      component.onDropdownItemKeydown(event, 'logout');

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.logout).toHaveBeenCalled();
    });

    it('should close menu on escape key', () => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      spyOn(event, 'preventDefault');
      spyOn(component, 'closeUserMenu');

      component.onDropdownItemKeydown(event, 'logout');

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.closeUserMenu).toHaveBeenCalled();
    });
  });

  describe('Utility Functions', () => {
    it('should check if component is destroyed', () => {
      expect(typeof (component as any).isDestroyed).toBe('function');
    });

    it('should have proper cleanup methods', () => {
      expect(typeof (component as any).cleanup).toBe('function');
    });
  });

  describe('Component Lifecycle', () => {
    it('should clean up on destroy', () => {
      component.showUserMenu = true;
      spyOn((component as any).userMenuState$, 'next');

      component.ngOnDestroy();

      expect((component as any).userMenuState$.next).toHaveBeenCalled();
      expect(component.showUserMenu).toBeFalse();
    });

    it('should complete destroy subject on destroy', () => {
      spyOn((component as any).destroy$, 'next');
      spyOn((component as any).destroy$, 'complete');

      component.ngOnDestroy();

      expect((component as any).destroy$.next).toHaveBeenCalled();
      expect((component as any).destroy$.complete).toHaveBeenCalled();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete user interaction flow', () => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
      component.ngOnInit();

      component.toggleUserMenu();
      expect(component.showUserMenu).toBeTrue();

      component.logout();
      expect(component.showUserMenu).toBeFalse();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth']);
    });

    it('should handle error recovery flow', () => {
      component.hasUserError = true;
      component.userErrorMessage = 'Test error';

      component.retryUserDataLoad();

      expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
    });
  });
});
