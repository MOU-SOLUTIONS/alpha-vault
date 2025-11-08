/**
 * ================================================================
 *  DTO: BudgetResponseDTO - outgoing monthly budget view
 * ================================================================
 */
package com.alpha.alphavault.dto.budget;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record BudgetResponseDTO(
    Long id,
    Long userId,
    int month,
    int year,
    String currency,
    BigDecimal totalBudget,
    BigDecimal totalSpent,
    BigDecimal totalRemaining,
    Boolean rolloverEnabled,
    Integer alertThresholdPercent,
    String notes,
    List<BudgetCategoryResponseDTO> categories,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
