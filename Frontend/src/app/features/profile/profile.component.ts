/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component ProfileComponent
  @description User profile management component for updating user information
*/

import { CommonModule, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { SeoService } from '../../core/seo/seo.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { UserService } from '../../core/services/user.service';
import { UserRequestDTO, UserResponseDTO } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgOptimizedImage,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly notificationService = inject(NotificationService);
  private readonly seo = inject(SeoService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  profileForm!: FormGroup;
  currentUser: UserResponseDTO | null = null;
  isLoading = false;
  isSaving = false;
  hasError = false;
  errorMessage = '';
  isUploading = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  readonly preferredLanguages = [
    { value: 'en', label: 'English', flag: 'us' },
    { value: 'fr', label: 'Français', flag: 'fr' },
    { value: 'es', label: 'Español', flag: 'es' },
    { value: 'de', label: 'Deutsch', flag: 'de' },
    { value: 'ar', label: 'العربية', flag: 'sa' },
  ];

  readonly preferredCurrencies = [
    { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
    { value: 'EUR', label: 'Euro (€)', symbol: '€' },
    { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
    { value: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' },
    { value: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' },
    { value: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$' },
  ];

  @ViewChild('fileInput', { static: false }) fileInputRef?: ElementRef<HTMLInputElement>;

  trackByLanguage = (_: number, lang: { value: string; label: string; flag: string }): string => lang.value;
  trackByCurrency = (_: number, currency: { value: string; label: string; symbol: string }): string => currency.value;

  ngOnInit(): void {
    this.setupSEO();
    this.initializeForm();
    this.loadUserData();
  }

  private setupSEO(): void {
    this.seo.set({
      title: 'User Profile',
      description: 'Manage and update your personal information, preferences, and account settings in Alpha Vault financial management system.',
      canonicalUrl: 'https://alphavault.app/main/body/profile',
      keywords: ['user profile', 'account settings', 'personal information', 'preferences', 'Alpha Vault'],
      robots: 'index,follow',
      og: {
        title: 'User Profile',
        description: 'Manage and update your personal information and preferences.',
        type: 'website',
        image: '/assets/og/default.png',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'User Profile',
        description: 'Manage and update your personal information and preferences.',
        image: '/assets/og/default.png',
      },
    }, 'Alpha Vault');
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      preferredLanguage: ['en'],
      preferredCurrency: ['USD'],
      profileImageUrl: [''],
      password: [''],
      confirmPassword: [''],
    });
  }

  loadUserData(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    try {
      const user = this.authService.getCurrentUser();
      if (user) {
        this.currentUser = user as UserResponseDTO;
        this.populateForm(this.currentUser);
        this.hasError = false;
      } else {
        this.handleError('No user data available. Please log in again.');
      }
    } catch (error) {
      this.handleError('Failed to load user data');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  private populateForm(user: UserResponseDTO): void {
    this.profileForm.patchValue({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      preferredLanguage: user.preferredLanguage || 'en',
      preferredCurrency: user.preferredCurrency || 'USD',
      profileImageUrl: user.profileImageUrl || '',
      password: '',
      confirmPassword: '',
    });

    if (user.profileImageUrl) {
      this.previewUrl = user.profileImageUrl;
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid || !this.currentUser) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    const password = this.profileForm.get('password')?.value;
    const confirmPassword = this.profileForm.get('confirmPassword')?.value;

    if (password && password !== confirmPassword) {
      this.profileForm.get('confirmPassword')?.setErrors({ mismatch: true });
      this.cdr.markForCheck();
      return;
    }

    this.isSaving = true;
    this.hasError = false;
    this.errorMessage = '';

    const formValue = this.profileForm.value;
    const updateDto: UserRequestDTO = {
      email: formValue.email,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      preferredLanguage: formValue.preferredLanguage,
      preferredCurrency: formValue.preferredCurrency,
      profileImageUrl: formValue.profileImageUrl || undefined,
      password: password || undefined,
    };

    this.userService.updateProfile(this.currentUser.id, updateDto).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((error) => {
        this.handleSaveError(error);
        return of(null);
      }),
      finalize(() => {
        this.isSaving = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.authService.setCurrentUser(response.data);
          this.userService.setCurrentUser(response.data as any);
          this.currentUser = response.data;
          this.populateForm(response.data);
          
          this.notificationService.addNotification({
            type: 'success',
            title: 'Profile Updated',
            message: 'Your profile has been successfully updated.',
            category: 'general',
          });

          this.profileForm.patchValue({
            password: '',
            confirmPassword: '',
          });
        }
      }
    });
  }

  private handleSaveError(error: any): void {
    let errorMessage = 'An error occurred while updating your profile.';

    if (error.error) {
      if (error.error.message) {
        errorMessage = error.error.message;
      } else if (error.error.error) {
        errorMessage = error.error.error;
      } else if (typeof error.error === 'string') {
        errorMessage = error.error;
      }
    }

    if (error.status === 400) {
      errorMessage = 'Invalid data provided. Please check all fields and try again.';
    } else if (error.status === 404) {
      errorMessage = 'User not found. Please log in again.';
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to update this profile.';
    } else if (error.status === 409) {
      errorMessage = 'This email is already in use. Please use a different email.';
    }

    this.handleError(errorMessage);

    this.notificationService.addNotification({
      type: 'error',
      title: 'Update Failed',
      message: errorMessage,
      category: 'general',
    });
  }

  private handleError(message: string): void {
    this.hasError = true;
    this.errorMessage = message;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    if (field.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required.`;
    }
    if (field.errors['email']) {
      return 'Please enter a valid email address.';
    }
    if (field.errors['minlength']) {
      return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters.`;
    }
    if (field.errors['maxlength']) {
      return `${this.getFieldLabel(fieldName)} must not exceed ${field.errors['maxlength'].requiredLength} characters.`;
    }
    if (field.errors['mismatch']) {
      return 'Passwords do not match.';
    }

    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.valid && field.touched && field.value);
  }

  get selectedLanguageLabel(): string {
    const value = this.profileForm.get('preferredLanguage')?.value;
    return this.preferredLanguages.find(l => l.value === value)?.label || 'English';
  }

  get selectedCurrencyLabel(): string {
    const value = this.profileForm.get('preferredCurrency')?.value;
    return this.preferredCurrencies.find(c => c.value === value)?.label || 'US Dollar';
  }

  getSelectedLanguageLabel(): string {
    return this.selectedLanguageLabel;
  }

  getSelectedCurrencyLabel(): string {
    return this.selectedCurrencyLabel;
  }

  onEscapeKey(event: Event): void {
    const target = event.target as HTMLElement;
    if (target) {
      target.blur();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.notificationService.addNotification({
        type: 'error',
        title: 'Invalid File Type',
        message: 'Please select an image file (JPEG, PNG, etc.).',
        category: 'general',
      });
      input.value = '';
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      this.notificationService.addNotification({
        type: 'error',
        title: 'File Too Large',
        message: 'File size must be less than 10MB.',
        category: 'general',
      });
      input.value = '';
      return;
    }

    this.selectedFile = file;

    if (this.isBrowser) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.previewUrl = e.target?.result as string;
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(file);
    }
  }

  uploadProfileImage(): void {
    if (!this.selectedFile || !this.currentUser) {
      return;
    }

    this.isUploading = true;
    this.cdr.markForCheck();

    this.userService.uploadProfileImage(this.currentUser.id, this.selectedFile).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((error) => {
        let errorMessage = 'Failed to upload profile image.';
        
        if (error.error) {
          if (error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error.error) {
            errorMessage = error.error.error;
          }
        }

        if (error.status === 400) {
          errorMessage = 'Invalid image file. Please try another image.';
        } else if (error.status === 413) {
          errorMessage = 'File is too large. Maximum size is 10MB.';
        }

        this.notificationService.addNotification({
          type: 'error',
          title: 'Upload Failed',
          message: errorMessage,
          category: 'general',
        });

        return of(null);
      }),
      finalize(() => {
        this.isUploading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (response) => {
        if (response && response.success && response.data) {
          this.profileForm.patchValue({
            profileImageUrl: response.data,
          });

          this.previewUrl = response.data;

          this.selectedFile = null;
          if (this.fileInputRef?.nativeElement) {
            this.fileInputRef.nativeElement.value = '';
          }

          this.notificationService.addNotification({
            type: 'success',
            title: 'Image Uploaded',
            message: 'Your profile image has been uploaded successfully.',
            category: 'general',
          });

          if (this.currentUser) {
            this.currentUser.profileImageUrl = response.data;
            this.authService.setCurrentUser(this.currentUser);
            this.userService.setCurrentUser(this.currentUser as any);
          }
        }
      }
    });
  }

  removeImagePreview(): void {
    this.selectedFile = null;
    if (this.currentUser?.profileImageUrl) {
      this.previewUrl = this.currentUser.profileImageUrl;
    } else {
      this.previewUrl = null;
    }
    this.cdr.markForCheck();
  }

  getProfileImageUrl(): string {
    if (this.previewUrl) {
      return this.previewUrl;
    }
    if (this.currentUser?.profileImageUrl) {
      return this.currentUser.profileImageUrl;
    }
    return '../../../assets/images/user3.jpg';
  }
}

