/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component PasswordResetComponent
  @description Secure password recovery flow with email validation
*/

import { CommonModule } from '@angular/common';
import { Component, OnDestroy,OnInit } from '@angular/core';
import { FormControl,FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Meta,Title } from '@angular/platform-browser';
import { ActivatedRoute,Router, RouterModule } from '@angular/router';
import { finalize,Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';

// Form type definitions
type ForgotForm = FormGroup<{ email: FormControl<string> }>;
type ResetForm = FormGroup<{ 
  newPassword: FormControl<string>, 
  confirmPassword: FormControl<string> 
}>;

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit, OnDestroy {

  /* ================================================================
     PUBLIC PROPERTIES
     ================================================================ */

  /** Current step in password reset flow */
  currentStep: 'forgot' | 'reset' = 'forgot';

  /** Password visibility toggle state */
  showPassword = false;
  showConfirmPassword = false;

  /** Form submission state */
  isSubmitting = false;

  /** Error message display */
  resetError = '';

  /** Success message display */
  successMessage = '';

  /** Reset token from URL query parameters */
  resetToken: string | null = null;

  /* ================================================================
     FORM INSTANCES
     ================================================================ */

  /** Forgot password form for requesting reset links */
  forgotPasswordForm!: ForgotForm;

  /** Password reset form for setting new passwords */
  resetPasswordForm!: ResetForm;

  /* ================================================================
     PRIVATE PROPERTIES
     ================================================================ */

  /** RxJS subject for component cleanup */
  private destroy$ = new Subject<void>();

  /* ================================================================
     CONSTRUCTOR & LIFECYCLE
     ================================================================ */

  constructor(
    private fb: NonNullableFormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private title: Title,
    private meta: Meta
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.checkResetToken();
    this.setupSEO();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* ================================================================
     PUBLIC METHODS - FORM SUBMISSION
     ================================================================ */

  /**
   * Handles forgot password form submission
   * Sends reset email to the provided email address
   */
  onSubmitForgotPassword(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.resetError = '';

    const email = this.forgotPasswordForm.get('email')?.value || '';

    this.authService.forgotPassword({ email })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isSubmitting = false;
          // Re-enable form after submission
          this.forgotPasswordForm.enable();
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Password reset email sent successfully. Please check your inbox.';
            this.currentStep = 'reset';
          } else {
            this.resetError = response.message || 'Failed to send reset email. Please try again.';
          }
        },
        error: (error) => {
          this.handleResetError(error);
        }
      });
  }

  /**
   * Handles password reset form submission
   * Sets new password using the reset token
   */
  onSubmitResetPassword(): void {
    if (this.resetPasswordForm.invalid || !this.resetToken) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.resetError = '';
    
    // Disable form during submission
    this.resetPasswordForm.disable();

    const newPassword = this.resetPasswordForm.get('newPassword')?.value || '';
    const confirmPassword = this.resetPasswordForm.get('confirmPassword')?.value || '';

    if (newPassword !== confirmPassword) {
      this.resetError = 'Passwords do not match.';
      this.isSubmitting = false;
      // Re-enable form on validation error
      this.resetPasswordForm.enable();
      return;
    }

    this.authService.resetPassword({ 
      resetToken: this.resetToken, 
      newPassword 
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isSubmitting = false;
          // Re-enable form after submission
          this.resetPasswordForm.enable();
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Password reset successfully! Redirecting to login...';
            setTimeout(() => {
              this.router.navigate(['/auth/login']);
            }, 2000);
          } else {
            this.resetError = response.message || 'Failed to reset password. Please try again.';
          }
        },
        error: (error) => {
          this.handleResetError(error);
        }
      });
  }

  /* ================================================================
     PUBLIC METHODS - UI INTERACTIONS
     ================================================================ */

  /**
   * Toggles password visibility for main password field
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Toggles password visibility for confirm password field
   */
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * Navigates back to forgot password step
   */
  goBackToForgot(): void {
    this.currentStep = 'forgot';
    this.resetError = '';
    this.successMessage = '';
  }

  /**
   * Navigates to login page
   */
  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  /**
   * Checks if a form field is invalid and should show error
   */
  isFieldInvalid(fieldName: string, form: FormGroup): boolean {
    const field = form.get(fieldName);
    if (!field) return false;
    
    return field.invalid && (field.touched || field.dirty);
  }

  /* ================================================================
     PRIVATE METHODS - INITIALIZATION
     ================================================================ */

  /**
   * Initializes all form groups with validation rules
   */
  private initializeForms(): void {
    this.forgotPasswordForm = this.fb.group({
      email: this.fb.control('', { 
        validators: [
          Validators.required, 
          Validators.email, 
          Validators.minLength(1), 
          Validators.maxLength(254)
        ] 
      })
    });

    this.resetPasswordForm = this.fb.group({
      newPassword: this.fb.control('', { 
        validators: [
          Validators.required, 
          Validators.minLength(8), 
          Validators.maxLength(128)
        ] 
      }),
      confirmPassword: this.fb.control('', { 
        validators: [Validators.required] 
      })
    });
  }

  /**
   * Checks for reset token in URL query parameters
   */
  private checkResetToken(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.resetToken = token;
        this.currentStep = 'reset';
      }
    });
  }

  /**
   * Sets up SEO meta tags and page title
   */
  private setupSEO(): void {
    this.title.setTitle('Password Reset - Alpha Vault');
    
    this.meta.updateTag({ name: 'description', content: 'Reset your Alpha Vault password securely. Get back to managing your finances with our secure password recovery system.' });
    this.meta.updateTag({ name: 'keywords', content: 'password reset, forgot password, alpha vault, financial management, secure recovery' });
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    this.meta.updateTag({ name: 'author', content: 'Alpha Vault Team' });
    this.meta.updateTag({ name: 'viewport', content: 'width=device-width, initial-scale=1' });
    this.meta.updateTag({ name: 'theme-color', content: '#667eea' });
    
    // Open Graph tags
    this.meta.updateTag({ property: 'og:title', content: 'Password Reset - Alpha Vault' });
    this.meta.updateTag({ property: 'og:description', content: 'Reset your Alpha Vault password securely' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://alphavault.com/auth/password-reset' });
    this.meta.updateTag({ property: 'og:site_name', content: 'Alpha Vault' });
    
    // Twitter Card tags
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: 'Password Reset - Alpha Vault' });
    this.meta.updateTag({ name: 'twitter:description', content: 'Reset your Alpha Vault password securely' });
    
    // Additional meta tags
    this.meta.updateTag({ name: 'canonical', content: 'https://alphavault.com/auth/password-reset' });
    this.meta.updateTag({ name: 'language', content: 'en' });
    this.meta.updateTag({ name: 'referrer', content: 'strict-origin-when-cross-origin' });
  }

  /* ================================================================
     PRIVATE METHODS - ERROR HANDLING
     ================================================================ */

  /**
   * Handles password reset API errors with user-friendly messages
   */
  private handleResetError(error: any): void {
    if (error.status === 400) {
      this.resetError = 'Invalid request. Please check your information.';
    } else if (error.status === 401) {
      this.resetError = 'Invalid or expired reset token. Please request a new one.';
    } else if (error.status === 404) {
      this.resetError = 'Email address not found. Please check your email or create a new account.';
    } else if (error.status === 429) {
      this.resetError = 'Too many attempts. Please try again later.';
    } else if (error.status === 0) {
      this.resetError = 'Network error. Please check your connection.';
    } else if (error.status >= 500) {
      this.resetError = 'Server error. Please try again later.';
    } else {
      this.resetError = 'Password reset failed. Please try again later.';
    }
  }
}
