package com.alpha.alphavault.mapper;

import com.alpha.alphavault.dto.UserRequestDTO;
import com.alpha.alphavault.dto.UserResponseDTO;
import com.alpha.alphavault.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toEntity(UserRequestDTO dto) {
        return User.builder()
                .id(dto.getId())
                .email(dto.getEmail())
                .password(dto.getPassword())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .preferredLanguage(dto.getPreferredLanguage())
                .currency(dto.getCurrency())
                .twoFactorEnabled(dto.isTwoFactorEnabled())
                .build();
    }

    public UserResponseDTO fromEntity(User user) {
        return UserResponseDTO.fromEntity(user);
    }
}
