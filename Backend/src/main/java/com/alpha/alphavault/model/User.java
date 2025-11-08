/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  License: Proprietary. All rights reserved.
 * ================================================================
 */
package com.alpha.alphavault.model;

import com.alpha.alphavault.enums.AccountType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    // ============================================================
    // == Identification & Credentials
    // ============================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    // ============================================================
    // == Personal Information
    // ============================================================

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    private String profileImageUrl;
    private String preferredLanguage;
    private String preferredCurrency;

    // ============================================================
    // == Security & Access Control
    // ============================================================

    @Column(nullable = false)
    private boolean twoFactorEnabled;

    @Column(nullable = false)
    @Builder.Default
    private boolean isVerified = false;

    private LocalDateTime emailVerifiedAt;

    @Column(nullable = false)
    @Builder.Default
    private boolean isActive = true;

    private int failedLoginAttempts;
    private LocalDateTime accountLockedUntil;

    // Password reset fields
    private String passwordResetToken;
    private LocalDateTime passwordResetTokenExpiry;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AccountType accountType = AccountType.BASIC;

    // ============================================================
    // == Legal & User Activity
    // ============================================================

    private LocalDateTime lastLoginAt;
    private LocalDateTime termsAcceptedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // ============================================================
    // == Relationships
    // ============================================================

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<Income> incomes;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<Expense> expenses;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<SavingGoal> savingGoals;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<Debt> debts;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<Investment> investments;

    // ============================================================
    // == Lifecycle Hooks
    // ============================================================

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ============================================================
    // == Utility Constructors
    // ============================================================

    public User(Long id) {
        this.id = id;
    }
}
