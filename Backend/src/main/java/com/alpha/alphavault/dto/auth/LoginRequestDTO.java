/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  DTO: LoginRequestDTO
 * ================================================================
 */
package com.alpha.alphavault.dto.auth;

import jakarta.validation.constraints.*;

public record LoginRequestDTO(
    @NotBlank @Email String email,
    @NotBlank String password
) {}
