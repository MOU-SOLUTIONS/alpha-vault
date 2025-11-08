/**
 * ================================================================
 *  DTO: BudgetCategoryResponseDTO - outgoing category view
 * ================================================================
 */
package com.alpha.alphavault.dto.budget;

import com.alpha.alphavault.enums.ExpenseCategory;

import java.math.BigDecimal;

public record BudgetCategoryResponseDTO(
    Long id,
    ExpenseCategory category,
    BigDecimal allocated,
    BigDecimal spentAmount,
    BigDecimal remaining
) {}
