/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  DTO: UserResponseDTO - Outgoing payload for user data
 * ================================================================
 */
package com.alpha.alphavault.dto.user;

import com.alpha.alphavault.enums.AccountType;
import java.time.LocalDateTime;

public record UserResponseDTO(
    Long id,
    String email,
    String firstName,
    String lastName,
    String preferredLanguage,
    String preferredCurrency,
    String profileImageUrl,
    boolean twoFactorEnabled,
    boolean isVerified,
    boolean isActive,
    AccountType accountType,
    LocalDateTime lastLoginAt,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
