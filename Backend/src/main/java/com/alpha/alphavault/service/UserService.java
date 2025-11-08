/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Service: UserService - secure, scalable user operations
 *  Guarantees: Clear messages on success/failure via GlobalExceptionHandler
 * ================================================================
 */
package com.alpha.alphavault.service;

import com.alpha.alphavault.dto.user.UserRequestDTO;
import com.alpha.alphavault.dto.user.UserResponseDTO;
import com.alpha.alphavault.enums.AccountType;
import com.alpha.alphavault.exception.UserException;
import com.alpha.alphavault.exception.UserNotFoundException;
import com.alpha.alphavault.mapper.UserMapper;
import com.alpha.alphavault.model.User;
import com.alpha.alphavault.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@RequiredArgsConstructor
@Service
public class UserService {

    // ============================================================
    // == Dependencies
    // ============================================================

    private final UserRepository repo;
    private final UserMapper mapper;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    // ============================================================
    // == Security/Lockout Policy (tune per environment)
    // ============================================================

    private static final int MAX_FAILED_LOGIN_ATTEMPTS = 5;
    private static final int ACCOUNT_LOCK_MINUTES = 15;

    // ============================================================
    // == Create / Read
    // ============================================================

    /** Register new user with hashed password and safe defaults. */
    @Transactional
    public UserResponseDTO register(UserRequestDTO dto) {
        String email = normalizeEmail(dto.email());
        if (repo.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already in use");
        }
        User user = mapper.toEntity(dto);
        user.setEmail(email);
        user.setFirstName(trimOrNull(user.getFirstName()));
        user.setLastName(trimOrNull(user.getLastName()));
        if (user.getPreferredLanguage() != null) user.setPreferredLanguage(user.getPreferredLanguage().trim());
        if (user.getPreferredCurrency() != null) user.setPreferredCurrency(user.getPreferredCurrency().trim());
        user.setPassword(passwordEncoder.encode(dto.password()));
        User saved = repo.save(user);
        return mapper.toResponse(saved);
    }

    /** Authenticate user by email/password. Handles wrong password + lockouts. */
    @Transactional
    public UserResponseDTO authenticate(String emailRaw, String rawPassword) {
        String email = normalizeEmail(emailRaw);
        User u = repo.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        // Check lock status before password match
        if (u.getAccountLockedUntil() != null && u.getAccountLockedUntil().isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("Account locked due to repeated failures. Try again later.");
        }

        // Verify password
        if (!passwordEncoder.matches(rawPassword, u.getPassword())) {
            recordFailedLogin(email);
            throw new IllegalArgumentException("Invalid credentials");
        }

        // Success path
        recordSuccessfulLogin(u.getId());
        return mapper.toResponse(u);
    }

    @Transactional(readOnly = true)
    public UserResponseDTO getById(Long id) {
        User u = repo.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found for id: " + id));
        return mapper.toResponse(u);
    }

    @Transactional(readOnly = true)
    public UserResponseDTO getByEmail(String emailRaw) {
        String email = normalizeEmail(emailRaw);
        User u = repo.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found for email: " + email));
        return mapper.toResponse(u);
    }

    @Transactional(readOnly = true)
    public Page<UserResponseDTO> list(Pageable pageable) {
        return repo.findAll(pageable).map(mapper::toResponse);
    }

    // ============================================================
    // == Update (Profile, Flags, Roles)
    // ============================================================

    /** Partial profile update (names, language, currency, avatar). */
    @Transactional
    public UserResponseDTO updateProfile(Long id, UserRequestDTO dto) {
        User u = repo.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found for id: " + id));

        mapper.updateEntity(u, dto);
        // sanitize updated fields
        u.setFirstName(trimOrNull(u.getFirstName()));
        u.setLastName(trimOrNull(u.getLastName()));
        if (u.getPreferredLanguage() != null) u.setPreferredLanguage(u.getPreferredLanguage().trim());
        if (u.getPreferredCurrency() != null) u.setPreferredCurrency(u.getPreferredCurrency().trim());

        User saved = repo.save(u);
        return mapper.toResponse(saved);
    }

    @Transactional
    public void updateProfileImage(Long id, String profileImageUrl) {
        User u = repo.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found for id: " + id));
        u.setProfileImageUrl(profileImageUrl);
        repo.save(u);
    }

    @Transactional
    public void acceptTerms(Long id) {
        User u = repo.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found for id: " + id));
        u.setTermsAcceptedAt(LocalDateTime.now());
        repo.save(u);
    }

    @Transactional
    public void setTwoFactor(Long id, boolean enabled) {
        User u = repo.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found for id: " + id));
        u.setTwoFactorEnabled(enabled);
        repo.save(u);
    }

    @Transactional
    public void setAccountType(Long id, AccountType type) {
        User u = repo.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found for id: " + id));
        u.setAccountType(type);
        repo.save(u);
    }

    @Transactional
    public void setActive(Long id, boolean active) {
        User u = repo.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found for id: " + id));
        u.setActive(active); // NOTE: field should be 'isActive' with setter 'setActive' via Lombok
        repo.save(u);
    }

    // ============================================================
    // == Password & Verification
    // ============================================================

    /** Forgot password: Generate reset token and send email (placeholder for email service). */
    @Transactional
    public void initiatePasswordReset(String emailRaw) {
        String email = normalizeEmail(emailRaw);
        User user = repo.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("If an account with this email exists, a reset link will be sent."));
        
        // Generate reset token (you can implement your own token generation logic)
        String resetToken = generateResetToken();
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetTokenExpiry(LocalDateTime.now().plusHours(24)); // 24 hours expiry
        
        repo.save(user);
        
        // Send password reset email
        String resetUrl = "http://localhost:4200/reset-password?token=" + resetToken;
        emailService.sendPasswordResetEmail(email, resetToken, resetUrl);
    }

    /** Reset password using token. */
    @Transactional
    public void resetPasswordWithToken(String resetToken, String newPassword) {
        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("New password must be at least 8 characters");
        }
        
        User user = repo.findByPasswordResetToken(resetToken)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));
        
        if (user.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Reset token has expired");
        }
        
        // Clear reset token and set new password
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        
        repo.save(user);
    }

    /** Generate a random reset token. */
    private String generateResetToken() {
        // Simple token generation - you can enhance this
        return java.util.UUID.randomUUID().toString().replace("-", "");
    }

    @Transactional
    public void changePassword(Long id, String currentPassword, String newPassword) {
        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("New password must be at least 8 characters");
        }
        User u = repo.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found for id: " + id));

        if (!passwordEncoder.matches(currentPassword, u.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        u.setPassword(passwordEncoder.encode(newPassword));
        repo.save(u);
    }

    /** Admin/Token-based reset (no current password required). */
    @Transactional
    public void resetPassword(Long id, String newPassword) {
        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("New password must be at least 8 characters");
        }
        User u = repo.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found for id: " + id));
        u.setPassword(passwordEncoder.encode(newPassword));
        repo.save(u);
    }

    @Transactional
    public void verifyEmail(Long id) {
        User u = repo.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found for id: " + id));
        if (!u.isVerified()) {
            u.setVerified(true);
            u.setEmailVerifiedAt(LocalDateTime.now());
            repo.save(u);
        }
    }

    // ============================================================
    // == Login Auditing & Lockouts
    // ============================================================

    @Transactional
    public void recordSuccessfulLogin(Long id) {
        User u = repo.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found for id: " + id));
        u.setLastLoginAt(LocalDateTime.now());
        u.setFailedLoginAttempts(0);
        u.setAccountLockedUntil(null);
        repo.save(u);
    }

    @Transactional
    public void recordFailedLogin(String emailRaw) {
        String email = normalizeEmail(emailRaw);
        User u = repo.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found for email: " + email));

        int attempts = u.getFailedLoginAttempts() + 1;
        u.setFailedLoginAttempts(attempts);

        if (attempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
            u.setAccountLockedUntil(LocalDateTime.now().plusMinutes(ACCOUNT_LOCK_MINUTES));
        }
        repo.save(u);
    }

    @Transactional(readOnly = true)
    public boolean isAccountLocked(String emailRaw) {
        String email = normalizeEmail(emailRaw);
        return repo.findByEmail(email)
                .map(u -> u.getAccountLockedUntil() != null
                        && u.getAccountLockedUntil().isAfter(LocalDateTime.now()))
                .orElse(false);
    }

    // ============================================================
    // == Delete
    // ============================================================

    @Transactional
    public void deleteUser(Long id) {
        if (!repo.existsById(id)) {
            throw new UserNotFoundException("User not found for id: " + id);
        }
        try {
            repo.deleteById(id);
        } catch (Exception e) {
            throw new UserException("Error deleting user: " + e.getMessage());
        }
    }

    // ============================================================
    // == Helpers
    // ============================================================

    private String normalizeEmail(String email) {
        if (email == null) return null;
        return email.trim().toLowerCase();
    }

    private String trimOrNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
