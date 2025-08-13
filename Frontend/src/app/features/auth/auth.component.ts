/* ========== IMPORTS ========== */
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import {
  AuthResponse,
  AuthService,
  LoginRequest,
  RegisterRequest,
} from '../../core/services/auth.service';

/**
 * Authentication component that handles user login, registration and password recovery
 * with a sliding panel UI for switching between forms.
 */
@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit {
  /* ========== VIEW REFERENCES ========== */
  @ViewChild('container', { static: true }) private container!: ElementRef;

  /* ========== PUBLIC PROPERTIES ========== */
  public loginForm: FormGroup;
  public signupForm: FormGroup;
  public forgotPasswordForm: FormGroup;
  public passwordStrength: 'weak' | 'medium' | 'strong' = 'weak';
  public passwordStrengthText: string = 'Weak password';
  public loginError: string = '';
  public signupError: string = '';
  public forgotPasswordError: string = '';
  public forgotPasswordSuccess: string = '';
  public showForgotPasswordModal: boolean = false;

  /* ========== CONSTRUCTOR ========== */
  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService
  ) {
    // Initialize Login Form
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    // Initialize Sign-up Form
    this.signupForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    // Initialize Forgot Password Form
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  /* ========== LIFECYCLE HOOKS ========== */
  public ngOnInit(): void {
    // Toggle panel based on ?mode=signup or default signin
    this.route.queryParams.subscribe((params) => {
      params['mode'] === 'signup' ? this.showSignup() : this.showSignin();
    });
    
    // Subscribe to password changes to check strength
    this.signupForm.get('password')?.valueChanges.subscribe(password => {
      this.checkPasswordStrength(password);
    });
  }

  /* ========== PUBLIC METHODS ========== */
  /**
   * Shows the sign-in panel by removing the right-panel-active class
   */
  public showSignin(): void {
    this.container.nativeElement.classList.remove('right-panel-active');
    this.resetForms();
  }

  /**
   * Shows the sign-up panel by adding the right-panel-active class
   */
  public showSignup(): void {
    this.container.nativeElement.classList.add('right-panel-active');
    this.resetForms();
  }

  /**
   * Getter for login email form control
   */
  public get loginEmail() {
    return this.loginForm.get('email')!;
  }

  /**
   * Getter for login password form control
   */
  public get loginPassword() {
    return this.loginForm.get('password')!;
  }

  /**
   * Handles login form submission
   * Validates the form and calls the auth service
   */
  public onSubmitLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    // Reset previous errors
    this.loginError = '';

    const dto: LoginRequest = this.loginForm.value;
    this.authService.login(dto).subscribe({
      next: (res: AuthResponse) => {
        // Store token
        localStorage.setItem('authToken', `${res.tokenType} ${res.token}`);
        localStorage.setItem('userId', res.userId.toString());
        // Navigate to main page
        this.fetchCurrentUser();
      },
      error: (err) => {
        if (err.status === 401) {
          this.loginError = 'Invalid email or password';
        } else if (err.status === 404) {
          this.loginError = 'Account not found';
        } else {
          this.loginError = `Login failed: ${err.error?.message || err.message}`;
        }
      },
    });
  }

  /**
   * Getter for signup first name form control
   */
  public get signupFirstName() {
    return this.signupForm.get('firstName')!;
  }

  /**
   * Getter for signup last name form control
   */
  public get signupLastName() {
    return this.signupForm.get('lastName')!;
  }

  /**
   * Getter for signup email form control
   */
  public get signupEmail() {
    return this.signupForm.get('email')!;
  }

  /**
   * Getter for signup password form control
   */
  public get signupPassword() {
    return this.signupForm.get('password')!;
  }

  /**
   * Getter for forgot password email form control
   */
  public get forgotPasswordEmail() {
    return this.forgotPasswordForm.get('email')!;
  }

  /**
   * Handles signup form submission
   * Validates the form and calls the auth service
   */
  public onSubmitSignup(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    // Reset previous errors
    this.signupError = '';

    const req: RegisterRequest = this.signupForm.value;
    this.authService.register(req).subscribe({
      next: () => {
        // Navigate to login page
        this.router.navigateByUrl('/main?mode=signin');
      },
      error: (err) => {
        if (err.status === 409) {
          this.signupError = 'Email already exists. Please use a different email or try to login.';
        } else {
          this.signupError = `Registration failed: ${err.error?.message || err.message}`;
        }
      },
    });
  }

  /**
   * Opens the forgot password modal
   */
  public openForgotPasswordModal(): void {
    this.showForgotPasswordModal = true;
    this.forgotPasswordForm.reset();
    this.forgotPasswordError = '';
    this.forgotPasswordSuccess = '';
  }

  /**
   * Closes the forgot password modal
   */
  public closeForgotPasswordModal(): void {
    this.showForgotPasswordModal = false;
  }

  /**
   * Handles forgot password form submission
   * Sends a password reset email to the user
   */
  public onSubmitForgotPassword(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    // Reset previous messages
    this.forgotPasswordError = '';
    this.forgotPasswordSuccess = '';

    const email = this.forgotPasswordForm.value.email;
    
    // Here you would call your auth service method to send a reset email
    // For now, we'll simulate a successful response
    this.authService.requestPasswordReset(email).subscribe({
      next: () => {
        this.forgotPasswordSuccess = 'Password reset instructions have been sent to your email';
        // Auto-close after 3 seconds on success
        setTimeout(() => {
          this.closeForgotPasswordModal();
        }, 3000);
      },
      error: (err) => {
        if (err.status === 404) {
          this.forgotPasswordError = 'Email not found';
        } else {
          this.forgotPasswordError = `Failed to send reset email: ${err.error?.message || err.message}`;
        }
      }
    });
  }
  
  /**
   * Evaluates password strength based on length, characters, numbers and special chars
   * Updates the passwordStrength and passwordStrengthText properties
   * @param password The password string to evaluate
   */
  public checkPasswordStrength(password: string): void {
    // Reset strength to default
    this.passwordStrength = 'weak';
    this.passwordStrengthText = 'Weak password';
    
    if (!password) return;
    
    // Check password strength
    const hasLetters = /[A-Za-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (password.length >= 8) {
      if (hasLetters && hasNumbers && hasSpecialChars) {
        this.passwordStrength = 'strong';
        this.passwordStrengthText = 'Strong password';
      } else if ((hasLetters && hasNumbers) || (hasLetters && hasSpecialChars) || (hasNumbers && hasSpecialChars)) {
        this.passwordStrength = 'medium';
        this.passwordStrengthText = 'Medium password';
      }
    }
  }

  /* ========== PRIVATE METHODS ========== */
  /**
   * Resets both login and signup forms
   */
  private resetForms(): void {
    this.loginForm.reset();
    this.signupForm.reset();
    this.loginError = '';
    this.signupError = '';
  }

  /**
   * Navigates to the main page after successful login
   */
  private fetchCurrentUser(): void {
    this.router.navigateByUrl('/main');
  }
}
