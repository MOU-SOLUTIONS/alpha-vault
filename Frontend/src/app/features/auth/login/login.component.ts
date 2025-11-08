/**
 * Alpha Vault Financial System
 * 
 * @author Mohamed Dhaoui
 * @component LoginComponent
 * @description Secure user authentication with comprehensive security features
 */

import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import {
    FormControl,
    FormGroup,
    NonNullableFormBuilder,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize, Subject, takeUntil } from 'rxjs';

// Core Services
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequestDTO } from '../../../models/auth.model';

// Form type definition
type LoginForm = FormGroup<{
  email: FormControl<string>;
  password: FormControl<string>;
  rememberMe: FormControl<boolean>;
}>;

// HTTP error response interface
interface HttpErrorResponse {
  status: number;
  error?: {
    message?: string;
    errors?: Record<string, any>;
    retryAfter?: number;
  };
  headers?: {
    get(name: string): string | null;
  };
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  // ================================================================
  // PUBLIC PROPERTIES
  // ================================================================

  loginForm!: LoginForm;
  showPassword = false;
  isSubmitting = false;
  loginError = '';
  isRateLimited = false;
  rateLimitCountdown = 0;
  formSubmitted = false;

  // ================================================================
  // PRIVATE PROPERTIES
  // ================================================================

  private rateTimer?: number;
  @ViewChild('loginErr') private loginErr?: ElementRef;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: NonNullableFormBuilder,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
    private readonly route: ActivatedRoute,
    private readonly meta: Meta,
    private readonly title: Title
  ) {}

  // ================================================================
  // LIFECYCLE HOOKS
  // ================================================================

  ngOnInit(): void {
    this.initializeForm();
    this.setupSEO();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Clear rate limiting timer to prevent memory leaks
    if (this.rateTimer) {
      window.clearInterval(this.rateTimer);
      this.rateTimer = undefined;
    }
  }

  // ================================================================
  // PUBLIC METHODS
  // ================================================================

  onSubmit(): void {
    if (this.loginForm.invalid || this.isSubmitting) {
      this.formSubmitted = true;
      this.loginForm.markAllAsTouched();
      return;
    }

    this.setSubmittingState(true);
    this.clearErrors();

    const loginData = this.prepareLoginData();
    this.submitLoginRequest(loginData);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  showForgotPassword(): void {
    this.router.navigate(['/auth/reset-password']);
  }

  navigateToSignup(): void {
    this.router.navigate(['/auth/signup']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched || this.formSubmitted) : false;
  }

  getSubmitButtonLabel(): string {
    if (this.isSubmitting) return 'Signing in, please wait';
    if (this.isRateLimited) return `Rate limited, wait ${this.rateLimitCountdown} seconds`;
    return 'Sign in to your account';
  }

  // ================================================================
  // PRIVATE METHODS - FORM MANAGEMENT
  // ================================================================

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: this.fb.control('', { 
        validators: [Validators.required, Validators.email] 
      }),
      password: this.fb.control('', { 
        validators: [Validators.required, Validators.minLength(8)] 
      }),
      rememberMe: this.fb.control(false)
    }, { updateOn: 'submit' }); // Cleaner validation on mobile
  }

  private prepareLoginData(): LoginRequestDTO {
    return {
      email: this.loginForm.controls.email.value.trim().toLowerCase(),
      password: this.loginForm.controls.password.value
    };
  }

  // ================================================================
  // PRIVATE METHODS - STATE MANAGEMENT
  // ================================================================

  private setSubmittingState(submitting: boolean): void {
    this.isSubmitting = submitting;
    this.formSubmitted = submitting;
    
    // Disable/enable form based on submission state
    if (submitting) {
      this.loginForm.disable();
    } else {
      this.loginForm.enable();
    }
  }

  private clearErrors(): void {
    this.loginError = '';
  }

  // ================================================================
  // PRIVATE METHODS - API COMMUNICATION
  // ================================================================

  private submitLoginRequest(loginData: LoginRequestDTO): void {
    this.authService.login(loginData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { 
          this.setSubmittingState(false);
          this.cdr.markForCheck(); 
        })
      )
      .subscribe({
        next: (response) => this.handleLoginSuccess(response),
        error: (error) => this.handleLoginError(error)
      });
  }

  private handleLoginSuccess(response: any): void {
    if (!response.success || !response.data) {
      this.setError(response.message || 'Login failed. Please try again.');
      return;
    }

    const responseData = response.data;
    const userData = responseData.user; // Extract user from data.user
    
    // Validate user data structure
    if (!this.isValidUserData(userData)) {
      this.setError('Invalid user data format from server');
      return;
    }
    
    // Store authentication data (token is optional for session-based auth)
    this.storeAuthData(responseData, userData);
    
    // Navigate to main application
    this.navigateToMainApp();
  }

  private handleLoginError(error: HttpErrorResponse): void {
    const errorMessage = this.getErrorMessage(error);
    this.setError(errorMessage);
    
    // Handle rate limiting specifically
    if (error.status === 429) {
      this.handleRateLimit(error);
    }
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 400:
        return this.get400ErrorMessage(error);
      case 401:
        return 'Invalid email or password. Please check your credentials.';
      case 429:
        return 'Too many login attempts. Please try again later.';
      case 0:
        return 'Network error. Please check your connection.';
      default:
        return 'Login failed. Please try again later.';
    }
  }

  private get400ErrorMessage(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return error.error.message === 'Invalid credentials' 
        ? 'Invalid email or password. Please check your credentials.'
        : error.error.message;
    }
    
    if (error.error?.errors) {
      const fieldErrors = Object.values(error.error.errors).join(', ');
      return `Validation error: ${fieldErrors}`;
    }
    
    return 'Invalid request data. Please check your input.';
  }

  // ================================================================
  // PRIVATE METHODS - VALIDATION
  // ================================================================

  private isValidUserData(userData: any): boolean {
    return !!(userData?.id && userData?.email);
  }

  // ================================================================
  // PRIVATE METHODS - AUTHENTICATION STORAGE
  // ================================================================

  private storeAuthData(responseData: any, userData: any): void {
    // Check for JWT token in the correct location based on backend response structure
    let foundToken = null;
    let foundField = null;
    
    // First check if token is directly in responseData
    const directTokenFields = ['token', 'jwt', 'accessToken', 'authToken', 'bearerToken'];
    for (const field of directTokenFields) {
      if (responseData[field]) {
        foundToken = responseData[field];
        foundField = field;
        break;
      }
    }
    
    // If not found directly, check inside responseData.data (backend structure)
    if (!foundToken && responseData.data) {
      const nestedTokenFields = ['token', 'jwt', 'accessToken', 'authToken', 'bearerToken'];
      for (const field of nestedTokenFields) {
        if (responseData.data[field]) {
          foundToken = responseData.data[field];
          foundField = `data.${field}`;
          break;
        }
      }
    }
    
    // Store token if found
    if (foundToken) {
      this.authService.setAuthData(foundToken, userData.id);
    } else {
      // For session-based authentication, just store user data
      localStorage.setItem('authType', 'session');
    }
    
    // Store user data
    this.authService.setCurrentUser(userData);
  }

  // ================================================================
  // PRIVATE METHODS - NAVIGATION
  // ================================================================

  private navigateToMainApp(): void {
    const returnUrl = this.safeInternalUrl(this.route.snapshot.queryParams['returnUrl']);
    this.router.navigate([returnUrl], { replaceUrl: true }).then(() => {
      // Focus management: app-root should set focus on its primary heading/container
      // This prevents users from hitting "Back" to see login with creds in DOM
    });
  }

  // ================================================================
  // PRIVATE METHODS - ERROR HANDLING
  // ================================================================

  private setError(message: string): void {
    this.loginError = message;
    this.focusErrorBanner();
  }

  private focusErrorBanner(): void {
    setTimeout(() => {
      this.loginErr?.nativeElement?.focus?.();
    });
  }

  // ================================================================
  // PRIVATE METHODS - RATE LIMITING
  // ================================================================

  private handleRateLimit(error: HttpErrorResponse): void {
    // Extract retry-after from headers (standard) or body (fallback)
    const headerRetryAfter = Number(error.headers?.get('Retry-After'));
    const bodyRetryAfter = Number(error.error?.retryAfter);
    const retryAfter = (Number.isFinite(headerRetryAfter) && headerRetryAfter) || 
                      (Number.isFinite(bodyRetryAfter) && bodyRetryAfter) || 60;
    
    this.startRateLimitTimer(retryAfter);
  }

  private startRateLimitTimer(seconds: number): void {
    this.isRateLimited = true;
    this.rateLimitCountdown = seconds;
    
    // Clear existing timer if present
    if (this.rateTimer) {
      window.clearInterval(this.rateTimer);
    }
    
    // Start countdown timer
    this.rateTimer = window.setInterval(() => {
      this.rateLimitCountdown--;
      this.cdr.markForCheck();
      
      // Reset when countdown reaches zero
      if (this.rateLimitCountdown <= 0) {
        this.resetRateLimit();
      }
    }, 1000);
  }

  private resetRateLimit(): void {
    this.isRateLimited = false;
    this.rateLimitCountdown = 0;
    
    if (this.rateTimer) {
      window.clearInterval(this.rateTimer);
      this.rateTimer = undefined;
    }
    
    this.cdr.markForCheck();
  }

  // ================================================================
  // PRIVATE METHODS - SECURITY
  // ================================================================

  private safeInternalUrl(url: string | null): string {
    if (!url) return '/main';
    
    // Decode URL safely
    try { 
      url = decodeURIComponent(url); 
    } catch {
      return '/main';
    }
    
    // Reject malicious URLs
    if (this.isMaliciousUrl(url)) {
      return '/main';
    }
    
    // Validate URL structure
    return this.validateInternalUrl(url);
  }

  private isMaliciousUrl(url: string): boolean {
    return !url.startsWith('/') || 
           url.startsWith('//') || 
           url.includes('\\') ||
           /^(javascript|data|file):/i.test(url) || 
           /%0d|%0a/i.test(url);
  }

  private validateInternalUrl(url: string): string {
    try {
      const tree = this.router.parseUrl(url);
      return tree.root.hasChildren() ? url : '/main';
    } catch {
      return '/main';
    }
  }

  // ================================================================
  // PRIVATE METHODS - SEO
  // ================================================================

  private setupSEO(): void {
    // Set page title
    this.title.setTitle('Login - Alpha Vault');
    
    // Add comprehensive meta tags
    this.meta.addTags([
      // Basic SEO
      { name: 'description', content: 'Securely login to your Alpha Vault Financial System account. Access your financial dashboard, budget tracking, expense management, and investment monitoring.' },
      { name: 'keywords', content: 'login, authentication, Alpha Vault, financial system, budget tracking, expense management, investment monitoring, personal finance' },
      { name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
      { name: 'author', content: 'Mohamed Dhaoui' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      { name: 'theme-color', content: '#007bff' },
      
      // Open Graph (Facebook, LinkedIn)
      { property: 'og:title', content: 'Login - Alpha Vault Financial System' },
      { property: 'og:description', content: 'Securely login to your Alpha Vault Financial System account. Access your financial dashboard, budget tracking, expense management, and investment monitoring.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: `${window.location.origin}/auth/login` },
      { property: 'og:image', content: `${window.location.origin}/assets/logos/black-alpha.png` },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:site_name', content: 'Alpha Vault Financial System' },
      { property: 'og:locale', content: 'en_US' },
      
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Login - Alpha Vault Financial System' },
      { name: 'twitter:description', content: 'Securely login to your Alpha Vault Financial System account. Access your financial dashboard, budget tracking, expense management, and investment monitoring.' },
      { name: 'twitter:image', content: `${window.location.origin}/assets/logos/black-alpha.png` },
      { name: 'twitter:site', content: '@alphavault' },
      { name: 'twitter:creator', content: '@mohameddhaoui' },
      
      // Additional SEO
      { name: 'canonical', content: `${window.location.origin}/auth/login` },
      { name: 'language', content: 'en' },
      { name: 'revisit-after', content: '7 days' },
      { name: 'distribution', content: 'global' },
      { name: 'rating', content: 'general' },
      { name: 'referrer', content: 'strict-origin-when-cross-origin' },
      
      // Security and Performance
      { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' },
      // Use environment variable for CSP connect-src to support different environments
      { 'http-equiv': 'Content-Security-Policy', content: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' ${environment.apiUrl.replace('/api', '')};` },
      { 'http-equiv': 'X-Content-Type-Options', content: 'nosniff' },
      { 'http-equiv': 'X-XSS-Protection', content: '1; mode=block' }
    ]);
  }
}
