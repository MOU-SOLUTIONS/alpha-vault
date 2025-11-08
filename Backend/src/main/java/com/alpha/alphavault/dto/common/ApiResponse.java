/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Component: ApiResponse
 *  Purpose: Standard success/failure response wrapper for REST APIs
 *  Notes:
 *    - Use ApiError (GlobalExceptionHandler) for exception-driven errors.
 *    - These fail() helpers are for explicit non-exception flows.
 *    - Includes simple paged envelope helpers (optional).
 * ================================================================
 */
package com.alpha.alphavault.dto.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;
import java.util.function.Function;

@JsonInclude(JsonInclude.Include.NON_NULL)
/** Uniform envelope for all endpoints. */
public record ApiResponse<T>(
        boolean success,
        String message,
        T data,
        int status,
        String path,
        LocalDateTime timestamp
) {
    // -------------------- Success factories --------------------
    public static <T> ApiResponse<T> ok(String msg, T data, String path) {
        return new ApiResponse<>(true, msg, data, 200, path, LocalDateTime.now());
    }
    public static <T> ApiResponse<T> created(String msg, T data, String path) {
        return new ApiResponse<>(true, msg, data, 201, path, LocalDateTime.now());
    }
    public static <T> ApiResponse<T> accepted(String msg, T data, String path) {
        return new ApiResponse<>(true, msg, data, 202, path, LocalDateTime.now());
    }
    /** Convenience when you don’t have a path handy. */
    public static <T> ApiResponse<T> ok(String msg, T data) {
        return new ApiResponse<>(true, msg, data, 200, null, LocalDateTime.now());
    }

    // -------------------- Failure factories (explicit, non-exception) --------------------
    /** 400 — explicit validation/semantic failure without throwing. */
    public static <T> ApiResponse<T> badRequest(String msg) {
        return new ApiResponse<>(false, msg, null, 400, null, LocalDateTime.now());
    }
    public static <T> ApiResponse<T> badRequest(String msg, T data) {
        return new ApiResponse<>(false, msg, data, 400, null, LocalDateTime.now());
    }
    public static <T> ApiResponse<T> badRequest(String msg, T data, String path) {
        return new ApiResponse<>(false, msg, data, 400, path, LocalDateTime.now());
    }

    /** Common non-200 helpers if you ever return errors without exceptions. */
    public static <T> ApiResponse<T> unauthorized(String msg, String path) {
        return new ApiResponse<>(false, msg, null, 401, path, LocalDateTime.now());
    }
    public static <T> ApiResponse<T> forbidden(String msg, String path) {
        return new ApiResponse<>(false, msg, null, 403, path, LocalDateTime.now());
    }
    public static <T> ApiResponse<T> notFound(String msg, String path) {
        return new ApiResponse<>(false, msg, null, 404, path, LocalDateTime.now());
    }
    public static <T> ApiResponse<T> conflict(String msg, String path) {
        return new ApiResponse<>(false, msg, null, 409, path, LocalDateTime.now());
    }
    public static <T> ApiResponse<T> tooManyRequests(String msg, String path) {
        return new ApiResponse<>(false, msg, null, 429, path, LocalDateTime.now());
    }
    public static <T> ApiResponse<T> error(String msg, String path) {
        return new ApiResponse<>(false, msg, null, 500, path, LocalDateTime.now());
    }

    /** Fully custom status if you ever need it. */
    public static <T> ApiResponse<T> of(boolean success, String msg, T data, int status, String path) {
        return new ApiResponse<>(success, msg, data, status, path, LocalDateTime.now());
    }

    // -------------------- Optional: paged helpers (no signature changes) --------------------
    /** Wrap a Spring Page into a simple items+meta envelope and return as ApiResponse data. */
    public static <E> ApiResponse<PageEnvelope<E>> pagedOk(String msg, Page<E> page, String path) {
        return ok(msg, PageEnvelope.of(page), path);
    }
    /** Map entities to DTOs then wrap into items+meta. */
    public static <E, D> ApiResponse<PageEnvelope<D>> pagedOk(
            String msg, Page<E> page, Function<E, D> mapper, String path) {
        return ok(msg, PageEnvelope.of(page.map(mapper)), path);
    }

    /** Lightweight page envelope to avoid changing ApiResponse signature. */
    public record PageEnvelope<T>(List<T> items, PageMeta meta) {
        public static <T> PageEnvelope<T> of(Page<T> page) {
            return new PageEnvelope<>(
                    page.getContent(),
                    new PageMeta(page.getNumber(), page.getSize(),
                            page.getTotalElements(), page.getTotalPages(),
                            page.isFirst(), page.isLast())
            );
        }
    }
    public record PageMeta(int page, int size, long totalElements, int totalPages, boolean first, boolean last) {}
}
