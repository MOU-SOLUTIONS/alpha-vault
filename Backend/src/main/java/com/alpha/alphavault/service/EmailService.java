/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Service: EmailService - email functionality interface
 * ================================================================
 */
package com.alpha.alphavault.service;

public interface EmailService {
    
    /**
     * Send password reset email to user
     * @param toEmail recipient email address
     * @param resetToken password reset token
     * @param resetUrl full reset URL
     */
    void sendPasswordResetEmail(String toEmail, String resetToken, String resetUrl);
    
    /**
     * Send welcome email to newly registered user
     * @param toEmail recipient email address
     * @param firstName user's first name
     */
    void sendWelcomeEmail(String toEmail, String firstName);
}
