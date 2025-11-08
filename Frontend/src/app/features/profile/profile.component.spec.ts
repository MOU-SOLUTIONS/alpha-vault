/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ProfileComponent
  @description Unit tests for user profile management component
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { SeoService } from '../../core/seo/seo.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { UserService } from '../../core/services/user.service';
import { UserResponseDTO } from '../../models/user.model';
import { ProfileComponent } from './profile.component';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockSeoService: jasmine.SpyObj<SeoService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockUser: UserResponseDTO = {
    id: 1,
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    preferredLanguage: 'en',
    preferredCurrency: 'USD',
    profileImageUrl: '',
    twoFactorEnabled: false,
    isVerified: true,
    isActive: true,
    accountType: 'FREE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'setCurrentUser']);
    mockUserService = jasmine.createSpyObj('UserService', ['updateProfile', 'setCurrentUser']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['addNotification']);
    mockSeoService = jasmine.createSpyObj('SeoService', ['set']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ProfileComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: SeoService, useValue: mockSeoService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should setup SEO on init', () => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
      fixture.detectChanges();

      expect(mockSeoService.set).toHaveBeenCalledWith(jasmine.objectContaining({
        title: 'User Profile',
        description: jasmine.any(String),
      }));
    });

    it('should initialize form with empty values', () => {
      expect(component.profileForm).toBeDefined();
      expect(component.profileForm.get('firstName')?.value).toBe('');
      expect(component.profileForm.get('lastName')?.value).toBe('');
      expect(component.profileForm.get('email')?.value).toBe('');
    });

    it('should load user data on init', () => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
      fixture.detectChanges();

      expect(component.currentUser).toEqual(mockUser);
      expect(component.profileForm.get('firstName')?.value).toBe('John');
      expect(component.profileForm.get('lastName')?.value).toBe('Doe');
      expect(component.profileForm.get('email')?.value).toBe('test@example.com');
    });

    it('should handle missing user data gracefully', () => {
      mockAuthService.getCurrentUser.and.returnValue(null);
      fixture.detectChanges();

      expect(component.hasError).toBe(true);
      expect(component.errorMessage).toContain('No user data available');
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
      fixture.detectChanges();
    });

    it('should mark form as invalid when required fields are empty', () => {
      component.profileForm.patchValue({
        firstName: '',
        lastName: '',
        email: '',
      });

      expect(component.profileForm.invalid).toBe(true);
    });

    it('should validate email format', () => {
      component.profileForm.patchValue({
        email: 'invalid-email',
      });
      component.profileForm.get('email')?.markAsTouched();

      expect(component.isFieldInvalid('email')).toBe(true);
      expect(component.getFieldError('email')).toContain('valid email');
    });

    it('should validate password match', () => {
      component.profileForm.patchValue({
        password: 'password123',
        confirmPassword: 'password456',
      });

      component.onSubmit();

      expect(component.profileForm.get('confirmPassword')?.errors?.['mismatch']).toBeTruthy();
    });

    it('should show error messages for invalid fields', () => {
      component.profileForm.patchValue({
        firstName: '',
      });
      component.profileForm.get('firstName')?.markAsTouched();

      expect(component.isFieldInvalid('firstName')).toBe(true);
      expect(component.getFieldError('firstName')).toContain('required');
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
      fixture.detectChanges();
    });

    it('should update profile successfully', () => {
      const updatedUser = { ...mockUser, firstName: 'Jane' };
      mockUserService.updateProfile.and.returnValue(
        of({ success: true, data: updatedUser, message: 'Updated successfully' } as any)
      );

      component.profileForm.patchValue({
        firstName: 'Jane',
      });
      component.onSubmit();

      expect(mockUserService.updateProfile).toHaveBeenCalledWith(
        mockUser.id,
        jasmine.objectContaining({
          firstName: 'Jane',
          email: mockUser.email,
        })
      );
      expect(mockAuthService.setCurrentUser).toHaveBeenCalledWith(updatedUser);
      expect(mockNotificationService.addNotification).toHaveBeenCalledWith(
        jasmine.objectContaining({
          type: 'success',
          title: 'Profile Updated',
        })
      );
    });

    it('should not submit if form is invalid', () => {
      component.profileForm.patchValue({
        firstName: '',
      });
      component.onSubmit();

      expect(mockUserService.updateProfile).not.toHaveBeenCalled();
    });

    it('should handle update errors gracefully', () => {
      mockUserService.updateProfile.and.returnValue(
        throwError(() => ({ status: 400, error: { message: 'Invalid data' } }))
      );

      component.onSubmit();

      expect(component.hasError).toBe(true);
      expect(mockNotificationService.addNotification).toHaveBeenCalledWith(
        jasmine.objectContaining({
          type: 'error',
          title: 'Update Failed',
        })
      );
    });

    it('should clear password fields after successful update', () => {
      const updatedUser = { ...mockUser };
      mockUserService.updateProfile.and.returnValue(
        of({ success: true, data: updatedUser, message: 'Updated successfully' } as any)
      );

      component.profileForm.patchValue({
        password: 'newpassword',
        confirmPassword: 'newpassword',
      });
      component.onSubmit();

      expect(component.profileForm.get('password')?.value).toBe('');
      expect(component.profileForm.get('confirmPassword')?.value).toBe('');
    });
  });

  describe('Helper Methods', () => {
    beforeEach(() => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
      fixture.detectChanges();
    });

    it('should return correct language label', () => {
      component.profileForm.patchValue({ preferredLanguage: 'fr' });
      expect(component.getSelectedLanguageLabel()).toBe('Français');
    });

    it('should return correct currency label', () => {
      component.profileForm.patchValue({ preferredCurrency: 'EUR' });
      expect(component.getSelectedCurrencyLabel()).toBe('Euro (€)');
    });

    it('should identify invalid fields correctly', () => {
      component.profileForm.patchValue({ firstName: '' });
      component.profileForm.get('firstName')?.markAsTouched();

      expect(component.isFieldInvalid('firstName')).toBe(true);
      expect(component.isFieldValid('firstName')).toBe(false);
    });

    it('should identify valid fields correctly', () => {
      component.profileForm.patchValue({ firstName: 'John' });
      component.profileForm.get('firstName')?.markAsTouched();

      expect(component.isFieldValid('firstName')).toBe(true);
      expect(component.isFieldInvalid('firstName')).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle loading errors', () => {
      mockAuthService.getCurrentUser.and.throwError('Error loading user');
      fixture.detectChanges();

      expect(component.hasError).toBe(true);
      expect(component.errorMessage).toContain('Failed to load');
    });

    it('should provide retry functionality', () => {
      mockAuthService.getCurrentUser.and.returnValue(null);
      fixture.detectChanges();

      expect(component.hasError).toBe(true);

      mockAuthService.getCurrentUser.and.returnValue(mockUser);
      component.loadUserData();

      expect(component.currentUser).toEqual(mockUser);
      expect(component.hasError).toBe(false);
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
      fixture.detectChanges();
    });

    it('should have proper ARIA attributes on form fields', () => {
      const firstNameInput = fixture.nativeElement.querySelector('#firstName');
      expect(firstNameInput).toBeTruthy();
      expect(firstNameInput.getAttribute('aria-required')).toBe('true');
      expect(firstNameInput.hasAttribute('aria-invalid')).toBe(true);
    });

    it('should announce errors to screen readers', () => {
      component.profileForm.patchValue({ firstName: '' });
      component.profileForm.get('firstName')?.markAsTouched();
      fixture.detectChanges();
      
      const errorElement = fixture.nativeElement.querySelector('#firstName-error');
      expect(errorElement).toBeTruthy();
      expect(errorElement.getAttribute('role')).toBe('alert');
      expect(errorElement.getAttribute('aria-live')).toBe('polite');
    });

    it('should support keyboard activation for buttons', () => {
      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton).toBeTruthy();
      expect(submitButton.getAttribute('aria-label')).toBe('Save profile changes');
      
      // Verify button is keyboard accessible
      expect(submitButton.tabIndex).not.toBe(-1);
    });

    it('should handle escape key on form inputs', () => {
      const firstNameInput = fixture.nativeElement.querySelector('#firstName');
      firstNameInput.focus();
      
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      firstNameInput.dispatchEvent(escapeEvent);
      
      // Input should blur (handled by onEscapeKey)
      expect(document.activeElement).not.toBe(firstNameInput);
    });
  });

  describe('File Upload', () => {
    beforeEach(() => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
      fixture.detectChanges();
    });

    it('should validate file type on selection', () => {
      const fileInput = fixture.nativeElement.querySelector('#profileImageFile');
      const invalidFile = new File([''], 'test.txt', { type: 'text/plain' });
      
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(invalidFile);
      Object.defineProperty(fileInput, 'files', {
        value: dataTransfer.files,
        writable: false,
      });
      
      const changeEvent = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(changeEvent);
      fixture.detectChanges();
      
      expect(mockNotificationService.addNotification).toHaveBeenCalledWith(
        jasmine.objectContaining({
          type: 'error',
          title: 'Invalid File Type',
        })
      );
    });

    it('should validate file size', () => {
      const fileInput = fixture.nativeElement.querySelector('#profileImageFile');
      const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(largeFile);
      Object.defineProperty(fileInput, 'files', {
        value: dataTransfer.files,
        writable: false,
      });
      
      const changeEvent = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(changeEvent);
      fixture.detectChanges();
      
      expect(mockNotificationService.addNotification).toHaveBeenCalledWith(
        jasmine.objectContaining({
          type: 'error',
          title: 'File Too Large',
        })
      );
    });

    it('should have trackBy functions for ngFor loops', () => {
      expect(component.trackByLanguage).toBeDefined();
      expect(component.trackByCurrency).toBeDefined();
      expect(typeof component.trackByLanguage).toBe('function');
      expect(typeof component.trackByCurrency).toBe('function');
    });

    it('should return correct values from trackBy functions', () => {
      const lang = { value: 'en', label: 'English', flag: 'us' };
      const currency = { value: 'USD', label: 'US Dollar ($)', symbol: '$' };
      
      expect(component.trackByLanguage(0, lang)).toBe('en');
      expect(component.trackByCurrency(0, currency)).toBe('USD');
    });
  });

  describe('Memoized Getters', () => {
    beforeEach(() => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
      fixture.detectChanges();
    });

    it('should return memoized language label', () => {
      component.profileForm.patchValue({ preferredLanguage: 'fr' });
      fixture.detectChanges();
      
      expect(component.selectedLanguageLabel).toBe('Français');
      expect(component.getSelectedLanguageLabel()).toBe('Français');
    });

    it('should return memoized currency label', () => {
      component.profileForm.patchValue({ preferredCurrency: 'EUR' });
      fixture.detectChanges();
      
      expect(component.selectedCurrencyLabel).toBe('Euro (€)');
      expect(component.getSelectedCurrencyLabel()).toBe('Euro (€)');
    });
  });
});

