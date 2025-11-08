/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  DTO: LoginResponseDTO - contains user data and JWT token
 * ================================================================
 */
package com.alpha.alphavault.dto.auth;

import com.alpha.alphavault.dto.user.UserResponseDTO;

public record LoginResponseDTO(
    UserResponseDTO user,
    String token
) {}
