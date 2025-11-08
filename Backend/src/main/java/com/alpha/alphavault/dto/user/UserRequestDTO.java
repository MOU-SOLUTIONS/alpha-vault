/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  DTO: UserRequestDTO - Incoming payload for user creation/update
 * ================================================================
 */
package com.alpha.alphavault.dto.user;

import jakarta.validation.constraints.*;

public record UserRequestDTO(
    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    String email,

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters")
    String password,

    @NotBlank(message = "First name is required")
    String firstName,

    @NotBlank(message = "Last name is required")
    String lastName,

    String preferredLanguage,
    String preferredCurrency,
    String profileImageUrl
) {}
