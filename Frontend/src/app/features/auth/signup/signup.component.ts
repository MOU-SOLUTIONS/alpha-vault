/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component SignupComponent
  @description Multi-phase user registration with progressive form validation
*/

import { CommonModule } from '@angular/common';
import { Component,OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { AbstractControl, FormControl, FormControlName,FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import { finalize,Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { UserRequestDTO } from '../../../models/user.model';

// API response wrapper interface
interface ApiResponse<T> { 
  success: boolean; 
  message?: string; 
  data?: T; 
}

// Form type definitions
type Phase1Form = FormGroup<{ 
  firstName: FormControl<string>; 
  lastName: FormControl<string>; 
}>;

type Phase2Form = FormGroup<{ 
  email: FormControl<string>; 
  confirmEmail: FormControl<string>; 
}>;

type Phase3Form = FormGroup<{ 
  password: FormControl<string>; 
  confirmPassword: FormControl<string>; 
}>;

type Phase4Form = FormGroup<{ 
  preferredLanguage: FormControl<string>; 
  preferredCurrency: FormControl<string>; 
  acceptTerms: FormControl<boolean>; 
}>;

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, OnDestroy {

  /* ================================================================
     PUBLIC PROPERTIES
     ================================================================ */

  /** Current active phase (1-4) */
  currentPhase = 1;

  /** Password visibility toggle states */
  showPassword = false;
  showConfirmPassword = false;

  /** Form submission state */
  isSubmitting = false;

  /** Error message display */
  signupError = '';

  /* ================================================================
     FORM INSTANCES
     ================================================================ */

  /** Phase 1: Personal Information Form */
  phase1Form!: Phase1Form;

  /** Phase 2: Email Verification Form */
  phase2Form!: Phase2Form;

  /** Phase 3: Password Creation Form */
  phase3Form!: Phase3Form;

  /** Phase 4: Preferences & Terms Form */
  phase4Form!: Phase4Form;

  /* ================================================================
     PRIVATE PROPERTIES
     ================================================================ */

  /** RxJS subject for component cleanup */
  private destroy$ = new Subject<void>();

  /** ViewChildren for form controls to enable proper focus management */
  @ViewChildren(FormControlName) private formControls!: QueryList<FormControlName>;

  /* ================================================================
     CONSTRUCTOR & LIFECYCLE
     ================================================================ */

  constructor(
    private fb: NonNullableFormBuilder,
    private router: Router,
    private authService: AuthService,
    private metaService: Meta,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.setupSEO();
    this.restoreFormState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* ================================================================
     PUBLIC METHODS - FORM SUBMISSION
     ================================================================ */

  /**
   * Handles Phase 1 form submission
   * Validates personal information and proceeds to email phase
   */
  onPhase1Submit(): void {
    if (this.phase1Form.invalid) {
      this.phase1Form.markAllAsTouched();
      this.focusFirstInvalid(this.phase1Form);
      return;
    }
    
    this.currentPhase = 2;
    this.saveFormState();
    this.focusById('email');
  }

  /**
   * Handles Phase 2 form submission
   * Validates email verification and proceeds to password phase
   */
  onPhase2Submit(): void {
    if (this.phase2Form.invalid || this.phase2Form.errors?.['emailMismatch']) {
      this.phase2Form.markAllAsTouched();
      this.focusFirstInvalid(this.phase2Form);
      return;
    }
    
    this.currentPhase = 3;
    this.saveFormState();
    this.focusById('password');
  }

  /**
   * Handles Phase 3 form submission
   * Validates password creation and proceeds to preferences phase
   */
  onPhase3Submit(): void {
    if (this.phase3Form.invalid || this.phase3Form.errors?.['passwordMismatch']) {
      this.phase3Form.markAllAsTouched();
      this.focusFirstInvalid(this.phase3Form);
      return;
    }
    
    this.currentPhase = 4;
    this.saveFormState();
    this.focusById('preferredLanguage');
  }

  /**
   * Handles Phase 4 form submission
   * Creates user account and redirects to login
   */
  onPhase4Submit(): void {
    if (this.isSubmitting) return;
    
    if (this.phase4Form.invalid) { 
      this.signupError = 'Please complete all required fields.'; 
      this.focusFirstInvalid(this.phase4Form);
      return; 
    }

    this.isSubmitting = true; 
    this.signupError = '';
    
    // Disable all forms during submission
    this.disableForms();
    
    // Sanitize and validate input data before submission
    const signupData: UserRequestDTO = {
      email: this.sanitizeEmail(this.phase2Form.get('email')?.value || ''),
      password: this.phase3Form.get('password')?.value || '',
      firstName: this.sanitizeName(this.phase1Form.get('firstName')?.value || ''),
      lastName: this.sanitizeName(this.phase1Form.get('lastName')?.value || ''),
      preferredLanguage: this.phase4Form.get('preferredLanguage')?.value || 'en',
      preferredCurrency: this.phase4Form.get('preferredCurrency')?.value || 'USD',
      profileImageUrl: ''
    };

    this.authService.register(signupData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isSubmitting = false;
          this.enableForms(); // Re-enable forms after submission
        })
      )
      .subscribe({
        next: (response: ApiResponse<any>) => {
          if (response.success) {
            // Clear saved form state on successful signup
            this.clearFormState();
            this.router.navigate(['/auth/login'], { 
              queryParams: { message: 'Account created successfully! Please check your email to verify your account.' } 
            });
          } else {
            this.signupError = response.message || 'Registration failed. Please try again.';
          }
        },
        error: (error: any) => {
          this.handleSignupError(error);
        }
      });
  }

  /* ================================================================
     PUBLIC METHODS - NAVIGATION & UI
     ================================================================ */

  /**
   * Navigates to the previous phase
   */
  previousPhase(): void {
    if (this.currentPhase > 1) {
      this.currentPhase--;
      this.signupError = '';
      this.saveFormState();
    }
  }

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

  // ================================================================
  // PRIVATE METHODS - INITIALIZATION
  // ================================================================

  /**
   * Initializes all form groups with validation rules
   */
  private initializeForms(): void {
    this.initializePhase1Form();
    this.initializePhase2Form();
    this.initializePhase3Form();
    this.initializePhase4Form();
  }

  /**
   * Initializes Phase 1 form - Personal Information
   */
  private initializePhase1Form(): void {
    this.phase1Form = this.fb.group({
      firstName: this.fb.control('', { 
        validators: [
          Validators.required, 
          Validators.minLength(2), 
          Validators.maxLength(50), 
          Validators.pattern(/^[\p{L}\p{M} .'-]{2,50}$/u)
        ] 
      }),
      lastName: this.fb.control('', { 
        validators: [
          Validators.required, 
          Validators.minLength(2), 
          Validators.maxLength(50), 
          Validators.pattern(/^[\p{L}\p{M} .'-]{2,50}$/u)
        ] 
      })
    }, { updateOn: 'change' });
  }

  /**
   * Initializes Phase 2 form - Email Verification
   */
  private initializePhase2Form(): void {
    this.phase2Form = this.fb.group({
      email: this.fb.control('', { 
        validators: [
          Validators.required, 
          Validators.email, 
          Validators.minLength(1), 
          Validators.maxLength(254)
        ] 
      }),
      confirmEmail: this.fb.control('', { 
        validators: [
          Validators.required, 
          Validators.email, 
          Validators.minLength(1), 
          Validators.maxLength(254)
        ] 
      })
    }, { 
      validators: this.emailMatchValidator, 
      updateOn: 'change' 
    });
  }

  /**
   * Initializes Phase 3 form - Password Creation
   */
  private initializePhase3Form(): void {
    this.phase3Form = this.fb.group({
      password: this.fb.control('', { 
        validators: [
          Validators.required, 
          Validators.minLength(8), 
          Validators.maxLength(128)
        ] 
      }),
      confirmPassword: this.fb.control('', { 
        validators: [Validators.required] 
      })
    }, { 
      validators: this.passwordMatchValidator, 
      updateOn: 'change' 
    });
  }

  /**
   * Initializes Phase 4 form - Preferences & Terms
   */
  private initializePhase4Form(): void {
    this.phase4Form = this.fb.group({
      preferredLanguage: this.fb.control('en', { 
        validators: [Validators.required] 
      }),
      preferredCurrency: this.fb.control('USD', { 
        validators: [Validators.required] 
      }),
      acceptTerms: this.fb.control(false, { 
        validators: [Validators.requiredTrue] 
      })
    }, { updateOn: 'change' });
  }

  /**
   * Sets up SEO meta tags and page title
   */
  private setupSEO(): void {
    this.titleService.setTitle('Sign Up - Alpha Vault');
    
    this.metaService.updateTag({ name: 'description', content: 'Create your Alpha Vault account for secure financial management. Join thousands of users who trust Alpha Vault for their financial needs.' });
    this.metaService.updateTag({ name: 'keywords', content: 'signup, register, account, alpha vault, financial management, secure banking' });
    this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
    this.metaService.updateTag({ name: 'author', content: 'Alpha Vault Team' });
    this.metaService.updateTag({ name: 'viewport', content: 'width=device-width, initial-scale=1' });
    this.metaService.updateTag({ name: 'theme-color', content: '#667eea' });
    
    // Open Graph tags
    this.metaService.updateTag({ property: 'og:title', content: 'Sign Up - Alpha Vault' });
    this.metaService.updateTag({ property: 'og:description', content: 'Create your Alpha Vault account for secure financial management' });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({ property: 'og:url', content: 'https://alphavault.com/auth/signup' });
    this.metaService.updateTag({ property: 'og:site_name', content: 'Alpha Vault' });
    
    // Twitter Card tags
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: 'Sign Up - Alpha Vault' });
    this.metaService.updateTag({ name: 'twitter:description', content: 'Create your Alpha Vault account for secure financial management' });
    
    // Additional meta tags
    this.metaService.updateTag({ name: 'format-detection', content: 'telephone=no' });
    this.metaService.updateTag({ name: 'mobile-web-app-capable', content: 'yes' });
    this.metaService.updateTag({ name: 'apple-mobile-web-app-capable', content: 'yes' });
    this.metaService.updateTag({ name: 'apple-mobile-web-app-status-bar-style', content: 'default' });
    this.metaService.updateTag({ name: 'apple-mobile-web-app-title', content: 'Alpha Vault' });
    this.metaService.updateTag({ name: 'msapplication-TileColor', content: '#667eea' });
    this.metaService.updateTag({ name: 'msapplication-config', content: '/browserconfig.xml' });
  }

  /**
   * Disables all forms when submitting
   */
  private disableForms(): void {
    this.phase1Form.disable();
    this.phase2Form.disable();
    this.phase3Form.disable();
    this.phase4Form.disable();
  }

  /**
   * Enables all forms after submission
   */
  private enableForms(): void {
    this.phase1Form.enable();
    this.phase2Form.enable();
    this.phase3Form.enable();
    this.phase4Form.enable();
  }

  // ================================================================
  // PRIVATE METHODS - INPUT SANITIZATION
  // ================================================================

  /**
   * Sanitizes email input by trimming and normalizing
   */
  private sanitizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  /**
   * Sanitizes name input by trimming and removing dangerous characters
   */
  private sanitizeName(name: string): string {
    return name.trim().replace(/[<>]/g, '');
  }

  // ================================================================
  // PRIVATE METHODS - VALIDATION
  // ================================================================

  /**
   * Custom validator for email confirmation matching
   */
  private emailMatchValidator(group: AbstractControl): Record<string, any> | null {
    const email = (group.get('email')?.value || '').trim().toLowerCase();
    const confirmEmail = (group.get('confirmEmail')?.value || '').trim().toLowerCase();
    return email && confirmEmail && email !== confirmEmail ? { emailMismatch: true } : null;
  }

  /**
   * Custom validator for password confirmation matching
   */
  private passwordMatchValidator(group: AbstractControl): Record<string, any> | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password && confirmPassword && password !== confirmPassword ? { passwordMismatch: true } : null;
  }

  // ================================================================
  // PRIVATE METHODS - ERROR HANDLING
  // ================================================================

  /**
   * Handles signup API errors with user-friendly messages
   */
  private handleSignupError(error: any): void {
    // Sanitize error messages to prevent information leakage
    if (error.status === 429) {
      const retryAfterHeader = Number(error.headers?.get('Retry-After'));
      const bodyRetry = Number(error?.error?.retryAfter);
      const retryAfter = (Number.isFinite(retryAfterHeader) && retryAfterHeader) || 
                        (Number.isFinite(bodyRetry) && bodyRetry) || 60;
      this.signupError = `Too many attempts. Try again in ${retryAfter}s.`;
    } else if (error.status === 409) {
      this.signupError = 'An account with this email already exists.';
    } else if (error.status === 400) {
      this.signupError = 'Invalid data provided. Please check your information.';
    } else if (error.status === 0) {
      this.signupError = 'Network error. Please check your connection.';
    } else if (error.status >= 500) {
      this.signupError = 'Server error. Please try again later.';
    } else {
      this.signupError = 'Registration failed. Please try again later.';
    }
  }

  // ================================================================
  // PRIVATE METHODS - FORM MANAGEMENT
  // ================================================================

  /**
   * Focuses the first invalid form control using ViewChildren
   */
  private focusFirstInvalid(form: FormGroup): void {
    for (const key of Object.keys(form.controls)) {
      const ctrl = form.get(key);
      if (ctrl && ctrl.invalid) {
        const formControl = this.formControls.find(control => control.name === key);
        if (formControl && formControl.valueAccessor) {
          const element = (formControl.valueAccessor as any)._elementRef?.nativeElement;
          if (element && element.focus) {
            element.focus();
            break;
          }
        }
      }
    }
  }

  /**
   * Focuses an element by ID using ViewChildren approach
   */
  private focusById(id: string): void { 
    setTimeout(() => {
      const formControl = this.formControls.find(control => 
        !!(control.valueAccessor && 
        (control.valueAccessor as any)._elementRef?.nativeElement?.id === id)
      );
      
      if (formControl && formControl.valueAccessor) {
        const element = (formControl.valueAccessor as any)._elementRef?.nativeElement;
        if (element && element.focus) {
          element.focus();
        }
      }
    }, 0); 
  }

  // ================================================================
  // PRIVATE METHODS - FORM STATE PERSISTENCE
  // ================================================================

  /**
   * Saves current form state to sessionStorage
   */
  private saveFormState(): void {
    try {
      const formState = {
        currentPhase: this.currentPhase,
        phase1Data: this.phase1Form.value,
        phase2Data: this.phase2Form.value,
        phase3Data: this.phase3Form.value,
        phase4Data: this.phase4Form.value
      };
      sessionStorage.setItem('signupFormState', JSON.stringify(formState));
    } catch (error) {
      // Silently fail if storage is not available
      // Silently handle form state save errors
    }
  }

  /**
   * Restores form state from sessionStorage
   */
  private restoreFormState(): void {
    try {
      const savedState = sessionStorage.getItem('signupFormState');
      if (savedState) {
        const formState = JSON.parse(savedState);
        this.currentPhase = formState.currentPhase || 1;
        
        if (formState.phase1Data) {
          this.phase1Form.patchValue(formState.phase1Data);
        }
        if (formState.phase2Data) {
          this.phase2Form.patchValue(formState.phase2Data);
        }
        if (formState.phase3Data) {
          this.phase3Form.patchValue(formState.phase3Data);
        }
        if (formState.phase4Data) {
          this.phase4Form.patchValue(formState.phase4Data);
        }
      }
    } catch (error) {
      // Silently fail if storage is not available or corrupted
      // Silently handle form state restore errors
    }
  }

  /**
   * Clears saved form state from sessionStorage
   */
  private clearFormState(): void {
    try {
      sessionStorage.removeItem('signupFormState');
    } catch (error) {
      // Silently fail if storage is not available
      // Silently handle form state clear errors
    }
  }
}
