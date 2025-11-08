/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Component: GlobalExceptionHandler
 *  Purpose: Centralized error handling for REST APIs
 *  Guarantees:
 *    - Consistent ApiError JSON across all controllers
 *    - Clear messages for domain, validation, security & DB conflicts
 *    - Helpful hints for clients (date format, conflicts)
 * ================================================================
 */
package com.alpha.alphavault.exception;

import jakarta.persistence.OptimisticLockException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.StaleObjectStateException;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.flywaydb.core.api.FlywayException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ============================================================
    // == 400 Bad Request: @Valid failed on request body
    // ============================================================
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        List<ApiError.Violation> violations = ex.getBindingResult().getAllErrors().stream()
                .map(err -> {
                    if (err instanceof FieldError fe) {
                        return new ApiError.Violation(fe.getField(), fe.getDefaultMessage());
                    }
                    return new ApiError.Violation(err.getObjectName(), err.getDefaultMessage());
                })
                .collect(Collectors.toList());
        return ResponseEntity.badRequest()
                .body(ApiError.of("Validation failed", 400, req.getRequestURI(), violations));
    }

    // ============================================================
    // == 400 Bad Request: @Valid failed on query params/path vars
    // ============================================================
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> handleConstraint(ConstraintViolationException ex, HttpServletRequest req) {
        List<ApiError.Violation> violations = ex.getConstraintViolations().stream()
                .map(v -> new ApiError.Violation(resolveParam(v), v.getMessage()))
                .collect(Collectors.toList());
        return ResponseEntity.badRequest()
                .body(ApiError.of("Validation failed", 400, req.getRequestURI(), violations));
    }

    // ============================================================
    // == 400 Bad Request: Malformed JSON, missing params, type mismatch
    // ============================================================
    @ExceptionHandler({
            HttpMessageNotReadableException.class,
            MissingServletRequestParameterException.class,
            MethodArgumentTypeMismatchException.class,
            IllegalArgumentException.class,
            InvalidDateRangeException.class
    })
    public ResponseEntity<ApiError> handleBadRequest(Exception ex, HttpServletRequest req) {
        Map<String, Object> hints = new HashMap<>();
        if (ex instanceof HttpMessageNotReadableException) {
            String errorMsg = ex.getMessage() != null ? ex.getMessage() : "";
            String lowerMsg = errorMsg.toLowerCase();
            
            if (lowerMsg.contains("date") || lowerMsg.contains("localdate") || lowerMsg.contains("cannot deserialize")) {
                hints.put("hint", "Date format error. Expected format: 'MM/dd/yyyy' (e.g., '12/25/2024').");
                hints.put("expectedFormat", "MM/dd/yyyy");
                hints.put("example", "12/25/2024");
            } else if (lowerMsg.contains("enum") || lowerMsg.contains("category") || lowerMsg.contains("priority") || lowerMsg.contains("status")) {
                hints.put("hint", "Invalid enum value. Check that category, priority, and status values are valid.");
            } else {
                hints.put("hint", "Check JSON body format and date format 'MM/dd/yyyy'.");
            }
            
            // Log the actual parsing error for debugging
            log.warn("JSON parsing error at {}: {}", req.getRequestURI(), errorMsg);
        } else if (ex instanceof MethodArgumentTypeMismatchException mismatch) {
            hints.put("parameter", mismatch.getName());
            Class<?> requiredType = mismatch.getRequiredType();
            hints.put("expectedType", requiredType != null ? requiredType.getSimpleName() : "unknown");
            hints.put("value", String.valueOf(mismatch.getValue()));
        } else if (ex instanceof IllegalArgumentException) {
            hints.put("hint", ex.getMessage());
        }
        String msg = messageOrDefault(ex, "Bad request");
        return ResponseEntity.badRequest()
                .body(ApiError.of(msg, 400, req.getRequestURI(), hints.isEmpty() ? null : hints));
    }

    // ============================================================
    // == 401 Unauthorized / 403 Forbidden (security)
    // ============================================================
    @ExceptionHandler({ InvalidCredentialsException.class, AuthenticationException.class })
    public ResponseEntity<ApiError> handleUnauthorized(Exception ex, HttpServletRequest req) {
        String msg = ex.getMessage() == null ? "Unauthorized" : ex.getMessage();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiError.of(msg, 401, req.getRequestURI()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleForbidden(AccessDeniedException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiError.of("Forbidden", 403, req.getRequestURI()));
    }

    // ============================================================
    // == 404 Not Found (domain resources)
    // ============================================================
    @ExceptionHandler({
            UserNotFoundException.class,
            IncomeNotFoundException.class,
            ExpenseNotFoundException.class,
            BudgetNotFoundException.class,
            SavingGoalNotFoundException.class,
            InvestmentNotFoundException.class

    })
    public ResponseEntity<ApiError> handleNotFound(RuntimeException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiError.of(ex.getMessage(), 404, req.getRequestURI()));
    }

    // ============================================================
    // == 405 / 415 Method or Media Type not supported
    // ============================================================
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiError> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(ApiError.of("Method not allowed", 405, req.getRequestURI()));
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiError> handleMediaType(HttpMediaTypeNotSupportedException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                .body(ApiError.of("Unsupported media type", 415, req.getRequestURI()));
    }

    // ============================================================
    // == 409 Conflict: Optimistic locking & data integrity
    // ============================================================
    @ExceptionHandler({ OptimisticLockException.class, ObjectOptimisticLockingFailureException.class, StaleObjectStateException.class })
    public ResponseEntity<ApiError> handleOptimisticLock(Exception ex, HttpServletRequest req) {
        Map<String, Object> hints = Map.of("hint", "The record was modified by another request. Reload and try again.");
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiError.of("Update conflict", 409, req.getRequestURI(), hints));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleDataIntegrity(DataIntegrityViolationException ex, HttpServletRequest req) {
        String errorMessage = ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : "";
        String lower = errorMessage.toLowerCase();
        
        // Build a more descriptive error message
        String msg = "Data integrity violation";
        Map<String, Object> details = new HashMap<>();
        
        // Check for specific constraint violations
        if (lower.contains("unique") || lower.contains("duplicate") || lower.contains("uk_")) {
            msg = "Duplicate value violates a unique constraint.";
            details.put("constraint", "unique");
            if (lower.contains("uk_")) {
                // Try to extract constraint name
                int constraintStart = lower.indexOf("uk_");
                if (constraintStart >= 0) {
                    int constraintEnd = lower.indexOf(" ", constraintStart);
                    if (constraintEnd < 0) constraintEnd = Math.min(constraintStart + 50, lower.length());
                    details.put("constraintName", errorMessage.substring(constraintStart, constraintEnd));
                }
            }
        } else if (lower.contains("foreign key") || lower.contains("fk_") || lower.contains("referential")) {
            msg = "Cannot delete this record: it is referenced by other records.";
            details.put("constraint", "foreign_key");
            
            // Try to extract more context from the error message
            if (lower.contains("investment")) {
                msg = "Cannot delete investment: it has associated records that reference it. " +
                      "This may include transactions, market data, or other linked entities.";
                details.put("hint", "Please check for associated records before attempting deletion.");
            } else if (lower.contains("transaction")) {
                msg = "Cannot delete: this record has associated transactions.";
                details.put("hint", "Transactions must be handled before deletion.");
            } else {
                details.put("hint", "This record is referenced by other entities. Remove or update dependent records first.");
            }
            
            // Try to extract foreign key constraint name
            if (lower.contains("fk_")) {
                int fkStart = lower.indexOf("fk_");
                if (fkStart >= 0) {
                    int fkEnd = lower.indexOf(" ", fkStart);
                    if (fkEnd < 0) fkEnd = Math.min(fkStart + 50, lower.length());
                    details.put("constraintName", errorMessage.substring(fkStart, fkEnd));
                }
            }
        } else if (lower.contains("check") || lower.contains("constraint")) {
            msg = "A database constraint prevents this operation.";
            details.put("constraint", "check");
        } else if (lower.contains("not null") || lower.contains("null constraint")) {
            msg = "A required field cannot be null.";
            details.put("constraint", "not_null");
        }
        
        // If it's an investment deletion, add specific context
        if (req.getRequestURI() != null && req.getRequestURI().contains("/investments/") && req.getMethod().equals("DELETE")) {
            if (!details.containsKey("hint")) {
                details.put("hint", "Investment deletion permanently removes the record. " +
                          "If this error persists, there may be a foreign key constraint preventing deletion.");
            }
            details.put("operation", "investment_deletion");
            details.put("deletionType", "hard_delete");
        }
        
        // Log the full exception for debugging
        log.warn("Data integrity violation at {}: {}", req.getRequestURI(), errorMessage, ex);
        
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiError.of(msg, 409, req.getRequestURI(), details.isEmpty() ? null : details));
    }

    // ============================================================
    // == 503 Service Unavailable: Database connection issues
    // ============================================================
    @ExceptionHandler(FlywayException.class)
    public ResponseEntity<ApiError> handleFlywayException(FlywayException ex, HttpServletRequest req) {
        log.error("Flyway migration error: {}", ex.getMessage(), ex);
        Map<String, Object> details = new HashMap<>();
        details.put("hint", "Database migration failed. This may indicate schema mismatch or migration conflicts.");
        details.put("migrationError", ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiError.of("Database migration failed", 500, req.getRequestURI(), details));
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ApiError> handleDataAccess(DataAccessException ex, HttpServletRequest req) {
        log.error("Data access exception: {}", ex.getMessage(), ex);
        String errorMsg = ex.getMostSpecificCause() != null ? 
                ex.getMostSpecificCause().getMessage() : 
                ex.getMessage();
        
        Map<String, Object> details = new HashMap<>();
        details.put("error", errorMsg);
        
        // Check for common database errors
        String lowerMsg = errorMsg != null ? errorMsg.toLowerCase() : "";
        if (lowerMsg.contains("connection") || lowerMsg.contains("timeout") || 
            lowerMsg.contains("refused") || lowerMsg.contains("could not connect") ||
            ex.getClass().getSimpleName().contains("Connection")) {
            details.put("hint", "Unable to connect to the database. Please check if PostgreSQL is running and accessible.");
            details.put("database", "PostgreSQL");
            details.put("commonCauses", List.of(
                "PostgreSQL service is not running",
                "Database credentials are incorrect",
                "Network connectivity issues",
                "Database server is unreachable"
            ));
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ApiError.of("Database connection failed", 503, req.getRequestURI(), details));
        } else if (lowerMsg.contains("table") && lowerMsg.contains("does not exist")) {
            details.put("hint", "Database table not found. Run Flyway migrations to create the schema.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiError.of("Database schema error", 500, req.getRequestURI(), details));
        } else if (lowerMsg.contains("column") && lowerMsg.contains("does not exist")) {
            details.put("hint", "Database column not found. Schema may be out of sync. Run Flyway migrations.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiError.of("Database schema error", 500, req.getRequestURI(), details));
        }
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiError.of("Database access error", 500, req.getRequestURI(), details));
    }

    // ============================================================
    // == 500 Internal Errors (domain + fallback)
    // ============================================================
    @ExceptionHandler({
            UserException.class,
            IncomeException.class,
            ExpenseException.class,
            BudgetException.class,
            SavingGoalException.class,
            InvestmentException.class
    })
    public ResponseEntity<ApiError> handleDomainServer(RuntimeException ex, HttpServletRequest req) {
        log.error("Domain exception: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiError.of(ex.getMessage(), 500, req.getRequestURI()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex, HttpServletRequest req) {
        log.error("Unhandled exception at {}: {}", req.getRequestURI(), ex.getMessage(), ex);
        Map<String, Object> details = new HashMap<>();
        details.put("exceptionType", ex.getClass().getSimpleName());
        details.put("message", ex.getMessage());
        // Include stack trace in development (could be conditionally enabled)
        if (ex.getCause() != null) {
            details.put("cause", ex.getCause().getClass().getSimpleName() + ": " + ex.getCause().getMessage());
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiError.of("Unexpected error occurred", 500, req.getRequestURI(), details));
    }

    // ============================================================
    // == Helpers
    // ============================================================
    private String messageOrDefault(Exception ex, String def) {
        return (ex.getMessage() == null || ex.getMessage().isBlank()) ? def : ex.getMessage();
    }

    private String resolveParam(ConstraintViolation<?> v) {
        // e.g. "update.id" -> "id"
        String path = v.getPropertyPath().toString();
        int dot = path.lastIndexOf('.');
        return dot >= 0 ? path.substring(dot + 1) : path;
    }
}
