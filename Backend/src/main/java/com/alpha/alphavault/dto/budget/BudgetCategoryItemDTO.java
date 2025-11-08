/**
 * ================================================================
 *  DTO: BudgetCategoryItemDTO - category allocation (request)
 * ================================================================
 */
package com.alpha.alphavault.dto.budget;

import com.alpha.alphavault.enums.ExpenseCategory;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record BudgetCategoryItemDTO(
    @NotNull(message = "Category is required")
    ExpenseCategory category,

    @NotNull(message = "Allocated amount is required")
    @DecimalMin(value = "0.00", inclusive = false, message = "Allocated must be > 0")
    @Digits(integer = 15, fraction = 4, message = "Allocated supports up to 4 decimals")
    BigDecimal allocated
) {}
