package com.alpha.alphavault.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class UserResponseDTO {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String preferredLanguage;
    private String currency;
    private boolean twoFactorEnabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static UserResponseDTO fromEntity(com.alpha.alphavault.model.User user) {
        return UserResponseDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .preferredLanguage(user.getPreferredLanguage())
                .currency(user.getCurrency())
                .twoFactorEnabled(user.isTwoFactorEnabled())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
