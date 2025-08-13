import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

/**
 * ContactComponent provides the contact form and information section
 * for users to get in touch with Alpha Vault.
 */
@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
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
  
  // ================= CONSTRUCTOR =================
  constructor() {}
  
  // ================= LIFECYCLE HOOKS =================
  /**
   * Initialize the component
   */
  public ngOnInit(): void {
    // Component initialization logic
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
    setTimeout(() => {
      // In a real implementation, you would call your email service here
      // this.emailService.sendEmail(this.formData).subscribe(...)
      
      console.log('Email sent:', this.formData);
      this.isSubmitting = false;
      this.isSubmitted = true;
      
      // Reset form after successful submission
      this.resetForm();
    }, 1500);
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