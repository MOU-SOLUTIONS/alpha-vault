/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Component: ApiError
 *  Purpose: Standard error response wrapper with validation + details
 * ================================================================
 */
package com.alpha.alphavault.exception;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/** Uniform error envelope returned by GlobalExceptionHandler. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
    /** Human-readable message (safe for UI). */
    String message,

    /** HTTP status code (e.g., 400, 404, 409, 500). */
    int status,

    /** Request path that produced this error. */
    String path,

    /** Server timestamp of the error. */
    LocalDateTime timestamp,

    /** Optional structured details (hints, parameters, conflict info). */
    Map<String, Object> details,

    /** Optional field-level validation violations. */
    List<Violation> violations
) {
    // -------- Factories (simple) --------
    public static ApiError of(String msg, int status, String path) {
        return new ApiError(msg, status, path, LocalDateTime.now(), null, null);
    }

    // With details (e.g., {"hint":"check date format"})
    public static ApiError of(String msg, int status, String path, Map<String, Object> details) {
        return new ApiError(msg, status, path, LocalDateTime.now(), details, null);
    }

    // With violations (field errors)
    public static ApiError of(String msg, int status, String path, List<Violation> violations) {
        return new ApiError(msg, status, path, LocalDateTime.now(), null, violations);
    }

    // With both (rare but handy)
    public static ApiError of(String msg, int status, String path, Map<String, Object> details, List<Violation> violations) {
        return new ApiError(msg, status, path, LocalDateTime.now(), details, violations);
    }

    /** Field-level validation details. */
    public record Violation(String field, String error) {}
}
