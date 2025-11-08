/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Controller: UserController - user profile & admin ops
 * ================================================================
 */
package com.alpha.alphavault.controller;

import com.alpha.alphavault.dto.common.ApiResponse;
import com.alpha.alphavault.dto.user.UserRequestDTO;
import com.alpha.alphavault.dto.user.UserResponseDTO;
import com.alpha.alphavault.enums.AccountType;
import com.alpha.alphavault.service.FileStorageService;
import com.alpha.alphavault.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/users")
public class UserController {

    // ============================================================
    // == Dependencies
    // ============================================================
    private final UserService service;
    private final FileStorageService fileStorageService;

    // ============================================================
    // == Create (handled in AuthController normally; here if needed)
    // ============================================================

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponseDTO>> register(@Valid @RequestBody UserRequestDTO dto) {
        var data = service.register(dto);
        return ResponseEntity.status(201)
                .body(ApiResponse.created("User registered successfully", data, "/api/users"));
    }

    // ============================================================
    // == Read
    // ============================================================

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponseDTO>> get(@PathVariable Long id) {
        var data = service.getById(id);
        return ResponseEntity.ok(ApiResponse.ok("User fetched", data, "/api/users/" + id));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserResponseDTO>>> list(Pageable pageable) {
        var page = service.list(pageable);
        return ResponseEntity.ok(ApiResponse.ok("Users fetched", page, "/api/users"));
    }

    // ============================================================
    // == Update (profile & flags)
    // ============================================================

    /** Partial profile update (names, language, currency, avatar). */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponseDTO>> update(@PathVariable Long id,
                                                               @Valid @RequestBody UserRequestDTO dto) {
        var data = service.updateProfile(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated", data, "/api/users/" + id));
    }

    /** Upload profile image file directly. */
    @PostMapping("/{id}/upload-profile-image")
    public ResponseEntity<ApiResponse<String>> uploadProfileImage(@PathVariable Long id,
                                                                  @RequestParam("file") MultipartFile file) {
        try {
            String fileUrl = fileStorageService.saveProfileImage(file, id);
            service.updateProfileImage(id, fileUrl);
            return ResponseEntity.ok(ApiResponse.ok("Profile image uploaded successfully", fileUrl, "/api/users/" + id + "/upload-profile-image"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.badRequest("Invalid file: " + e.getMessage(), "/api/users/" + id + "/upload-profile-image"));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to upload image: " + e.getMessage(), "/api/users/" + id + "/upload-profile-image"));
        }
    }

    /** Update profile image URL (for external URLs or backwards compatibility). */
    @PatchMapping("/{id}/profile-image")
    public ResponseEntity<ApiResponse<Void>> updateImage(@PathVariable Long id,
                                                         @RequestParam("url") String url) {
        service.updateProfileImage(id, url);
        return ResponseEntity.ok(ApiResponse.ok("Profile image updated", null, "/api/users/" + id + "/profile-image"));
    }

    @PostMapping("/{id}/accept-terms")
    public ResponseEntity<ApiResponse<Void>> acceptTerms(@PathVariable Long id) {
        service.acceptTerms(id);
        return ResponseEntity.ok(ApiResponse.ok("Terms accepted", null, "/api/users/" + id + "/accept-terms"));
    }

    @PatchMapping("/{id}/2fa")
    public ResponseEntity<ApiResponse<Void>> toggle2fa(@PathVariable Long id,
                                                       @RequestParam("enabled") boolean enabled) {
        service.setTwoFactor(id, enabled);
        return ResponseEntity.ok(ApiResponse.ok("2FA updated", null, "/api/users/" + id + "/2fa"));
    }

    /**
     * Accepts lowercase/uppercase strings safely; we convert manually so
     * type=premium or type=PREMIUM both work.
     */
    @PatchMapping("/{id}/account-type")
    public ResponseEntity<ApiResponse<Void>> setType(@PathVariable Long id,
                                                     @RequestParam("type") String type) {
        service.setAccountType(id, AccountType.valueOf(type.toUpperCase()));
        return ResponseEntity.ok(ApiResponse.ok("Account type updated", null, "/api/users/" + id + "/account-type"));
    }

    @PatchMapping("/{id}/active")
    public ResponseEntity<ApiResponse<Void>> setActive(@PathVariable Long id,
                                                       @RequestParam("value") boolean value) {
        service.setActive(id, value);
        return ResponseEntity.ok(ApiResponse.ok("Account state updated", null, "/api/users/" + id + "/active"));
    }

    // ============================================================
    // == Delete
    // ============================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.ok("User deleted", null, "/api/users/" + id));
    }
}
