/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Mapper: User <-> DTOs
 * ================================================================
 */
package com.alpha.alphavault.mapper;

import com.alpha.alphavault.dto.user.UserRequestDTO;
import com.alpha.alphavault.dto.user.UserResponseDTO;
import com.alpha.alphavault.enums.AccountType;
import com.alpha.alphavault.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    // ============================================================
    // == DTO -> Entity (Create)
    // ============================================================
    public User toEntity(UserRequestDTO dto) {
        if (dto == null) return null;

        return User.builder()
                .email(dto.email())
                .password(dto.password())
                .firstName(dto.firstName())
                .lastName(dto.lastName())
                .preferredLanguage(dto.preferredLanguage())
                .preferredCurrency(dto.preferredCurrency())
                .profileImageUrl(dto.profileImageUrl())

                // Backend-controlled defaults
                .twoFactorEnabled(false)
                .isVerified(false)
                .isActive(true)
                .accountType(AccountType.BASIC)
                .build();
    }

    // ============================================================
    // == DTO -> Entity (Update mutable fields only)
    // ============================================================
    public void updateEntity(User user, UserRequestDTO dto) {
        if (user == null || dto == null) return;

        if (dto.firstName() != null && !dto.firstName().isBlank()) {
            user.setFirstName(dto.firstName());
        }
        if (dto.lastName() != null && !dto.lastName().isBlank()) {
            user.setLastName(dto.lastName());
        }
        if (dto.preferredLanguage() != null) {
            user.setPreferredLanguage(dto.preferredLanguage());
        }
        if (dto.preferredCurrency() != null) {
            user.setPreferredCurrency(dto.preferredCurrency());
        }
        if (dto.profileImageUrl() != null) {
            user.setProfileImageUrl(dto.profileImageUrl());
        }
        // Email changes are a policy decision; keep immutable unless you have a verified flow.
        // Password changes should be handled in a dedicated endpoint to ensure hashing + checks.
    }

    // ============================================================
    // == Entity -> DTO (Response)
    // ============================================================
    public UserResponseDTO toResponse(User user) {
        if (user == null) return null;

        return new UserResponseDTO(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPreferredLanguage(),
                user.getPreferredCurrency(),
                user.getProfileImageUrl(),
                user.isTwoFactorEnabled(),
                user.isVerified(),
                user.isActive(),
                user.getAccountType(),
                user.getLastLoginAt(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
