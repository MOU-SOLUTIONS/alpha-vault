/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Service: EmailServiceImpl - simple email service implementation
 * ================================================================
 */
package com.alpha.alphavault.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailServiceImpl implements EmailService {
    
    @Override
    public void sendPasswordResetEmail(String toEmail, String resetToken, String resetUrl) {
        // TODO: Implement actual email sending (e.g., using JavaMailSender, SendGrid, etc.)
        log.info("=== PASSWORD RESET EMAIL ===");
        log.info("To: {}", toEmail);
        log.info("Reset URL: {}", resetUrl);
        log.info("Token: {}", resetToken);
        log.info("Subject: Password Reset Request");
        log.info("Body: Click the link above to reset your password. This link expires in 24 hours.");
        log.info("==========================");
        
        // For development, you can print the reset URL to console
        System.out.println("\n=== PASSWORD RESET LINK ===");
        System.out.println("Email: " + toEmail);
        System.out.println("Reset URL: " + resetUrl);
        System.out.println("==========================\n");
    }
    
    @Override
    public void sendWelcomeEmail(String toEmail, String firstName) {
        // TODO: Implement actual email sending
        log.info("=== WELCOME EMAIL ===");
        log.info("To: {}", toEmail);
        log.info("Subject: Welcome to Alpha Vault!");
        log.info("Body: Welcome {}! Your account has been created successfully.", firstName);
        log.info("=====================");
    }
}
