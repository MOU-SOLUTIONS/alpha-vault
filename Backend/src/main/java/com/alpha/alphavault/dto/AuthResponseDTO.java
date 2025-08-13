package com.alpha.alphavault.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthResponseDTO {
    private String token;
    private String tokenType;
    private Long userId;

    // existing two-arg constructor
    public AuthResponseDTO(String token, Long userId) {
        this.token = token;
        this.userId = userId;
        this.tokenType = "Bearer"; // default if you like
    }

    // add this three-arg constructor
    public AuthResponseDTO(String token, String tokenType, Long userId) {
        this.token     = token;
        this.tokenType = tokenType;
        this.userId    = userId;
    }
}
