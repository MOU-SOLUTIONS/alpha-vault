package com.alpha.alphavault.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

@Getter
public class ApiError {
    private final int status;
    private final String error;
    private final String path;
    private final LocalDateTime timestamp;

    public ApiError(HttpStatus status, String error, String path) {
        this.status = status.value();
        this.error = error;
        this.path = path;
        this.timestamp = LocalDateTime.now();
    }

}
