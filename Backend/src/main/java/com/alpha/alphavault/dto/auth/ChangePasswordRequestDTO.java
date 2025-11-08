/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  DTO: ChangePasswordRequestDTO
 * ================================================================
 */
package com.alpha.alphavault.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequestDTO(
    @NotBlank String currentPassword,
    @NotBlank @Size(min = 8, max = 128) String newPassword
) {}
