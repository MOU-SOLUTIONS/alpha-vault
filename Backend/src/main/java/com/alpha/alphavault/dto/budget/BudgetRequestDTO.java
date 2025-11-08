/**
 * ================================================================
 *  DTO: BudgetRequestDTO - create/update monthly budget
 * ================================================================
 */
package com.alpha.alphavault.dto.budget;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public record BudgetRequestDTO(
    @NotNull(message = "User ID is required")
    Long userId,

    @Min(value = 1, message = "Month must be 1..12")
    @Max(value = 12, message = "Month must be 1..12")
    int month,

    @Min(value = 2000, message = "Year must be >= 2000")
    int year,

    @NotNull(message = "Total budget is required")
    @DecimalMin(value = "0.00", inclusive = false, message = "Total budget must be > 0")
    @Digits(integer = 15, fraction = 4, message = "Total budget supports up to 4 decimals")
    BigDecimal totalBudget,

    /** Optional ISO 4217 (uppercased in mapper). */
    @Size(min = 3, max = 3, message = "Currency must be a 3-letter ISO code")
    String currency,

    @Size(max = 500, message = "Notes must be <= 500 chars")
    String notes,

    /** Optional flags (nullable -> unchanged on update). */
    Boolean rolloverEnabled,
    @Min(0) @Max(100) Integer alertThresholdPercent,

    /** Per-category allocations (optional). */
    List<BudgetCategoryItemDTO> categories
) {}
