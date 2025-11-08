/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  DTO: ForgotPasswordRequestDTO - forgot password flow
 * ================================================================
 */
package com.alpha.alphavault.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequestDTO(
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    String email
) {}
