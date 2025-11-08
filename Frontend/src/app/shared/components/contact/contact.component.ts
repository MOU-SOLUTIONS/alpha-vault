import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * ContactComponent provides the contact form and information section
 * for users to get in touch with Alpha Vault.
 * 
 * Features:
 * - Contact form with validation
 * - Contact information display
 * - Social media links
 * 
 * @component
 * @standalone
 */
@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactComponent implements OnInit, OnDestroy {
  // ================= INPUTS / OUTPUTS =================
  
  // ================= PUBLIC PROPERTIES =================
  public formData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };
  
  public isSubmitting = false;
  public isSubmitted = false;
  public submitError = '';
  
  // ================= PRIVATE PROPERTIES =================
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private timeoutId?: number;
  
  // ================= CONSTRUCTOR =================
  constructor() {}
  
  // ================= LIFECYCLE HOOKS =================
  /**
   * Initialize the component
   */
  public ngOnInit(): void {
    // Component initialization logic
  }

  /**
   * Cleanup on component destruction
   */
  public ngOnDestroy(): void {
    if (this.timeoutId && this.isBrowser) {
      clearTimeout(this.timeoutId);
    }
  }
  
  // ================= PUBLIC METHODS =================
  /**
   * Handles form submission
   * @param event Form submission event
   */
  public onSubmit(event: Event): void {
    event.preventDefault();
    
    if (!this.validateForm()) {
      this.submitError = 'Please fill out all required fields';
      return;
    }
    
    this.isSubmitting = true;
    this.submitError = '';
    
    // Simulate sending email (replace with actual email service in production)
    if (this.isBrowser) {
      this.timeoutId = window.setTimeout(() => {
        // In a real implementation, you would call your email service here
        // this.emailService.sendEmail(this.formData).subscribe(...)
        
        this.isSubmitting = false;
        this.isSubmitted = true;
        
        // Reset form after successful submission
        this.resetForm();
      }, 1500);
    }
  }

  /**
   * Handles form submission via keyboard (Enter key)
   * @param event Keyboard event
   */
  public onFormKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      const form = (event.target as HTMLElement).closest('form');
      if (form) {
        event.preventDefault();
        this.onSubmit(new Event('submit'));
      }
    }
  }
  
  // ================= PRIVATE METHODS =================
  /**
   * Validates the form data
   * @returns True if form is valid, false otherwise
   */
  private validateForm(): boolean {
    return !!this.formData.name && 
           !!this.formData.email && 
           !!this.formData.subject && 
           !!this.formData.message;
  }
  
  /**
   * Resets the form data
   */
  private resetForm(): void {
    this.formData = {
      name: '',
      email: '',
      subject: '',
      message: ''
    };
  }
}