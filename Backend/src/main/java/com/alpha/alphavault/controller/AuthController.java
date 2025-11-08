/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Controller: AuthController - registration & login flows
 * ================================================================
 */
package com.alpha.alphavault.controller;

import com.alpha.alphavault.dto.auth.ChangePasswordRequestDTO;
import com.alpha.alphavault.dto.auth.ForgotPasswordRequestDTO;
import com.alpha.alphavault.dto.auth.LoginRequestDTO;
import com.alpha.alphavault.dto.auth.LoginResponseDTO;
import com.alpha.alphavault.dto.auth.ResetPasswordRequestDTO;
import com.alpha.alphavault.dto.common.ApiResponse;
import com.alpha.alphavault.dto.user.UserRequestDTO;
import com.alpha.alphavault.dto.user.UserResponseDTO;
import com.alpha.alphavault.service.UserService;
import com.alpha.alphavault.utils.JwtUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtUtils jwtUtils;

    // ============================================================
    // == Registration & Login
    // ============================================================

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponseDTO>> register(@Valid @RequestBody UserRequestDTO dto) {
        var data = userService.register(dto);
        return ResponseEntity.status(201)
            .body(ApiResponse.created("User registered successfully", data, "/api/auth/register"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDTO>> login(@Valid @RequestBody LoginRequestDTO dto) {
        var userData = userService.authenticate(dto.email(), dto.password()); // wrong pwd/lockout handled
        
        // Generate JWT token
        String token = jwtUtils.generateToken(dto.email());
        
        // Create login response with user data and token
        LoginResponseDTO loginResponse = new LoginResponseDTO(userData, token);
        
        return ResponseEntity.ok(ApiResponse.ok("Login successful", loginResponse, "/api/auth/login"));
    }

    // ============================================================
    // == Password Management
    // ============================================================

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDTO dto) {
        userService.initiatePasswordReset(dto.email());
        return ResponseEntity.ok(
            ApiResponse.ok("If an account with this email exists, a reset link will be sent.", null, "/api/auth/forgot-password")
        );
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO dto) {
        userService.resetPasswordWithToken(dto.resetToken(), dto.newPassword());
        return ResponseEntity.ok(
            ApiResponse.ok("Password reset successfully", null, "/api/auth/reset-password")
        );
    }

    @PostMapping("/change-password/{id}")
    public ResponseEntity<ApiResponse<Void>> changePassword(@PathVariable Long id,
                                                            @Valid @RequestBody ChangePasswordRequestDTO dto) {
        userService.changePassword(id, dto.currentPassword(), dto.newPassword());
        return ResponseEntity.ok(
            ApiResponse.ok("Password updated successfully", null, "/api/auth/change-password/" + id)
        );
    }
}
