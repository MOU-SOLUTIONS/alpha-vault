/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  DTO: SavingGoalResponseDTO - API-safe response view
 *  Includes:
 *    - Derived fields: remainingAmount, progressPercent
 *    - Version for optimistic concurrency on the client
 * ================================================================
 */
package com.alpha.alphavault.dto.savinggoal;

import com.alpha.alphavault.enums.SavingGoalPriority;
import com.alpha.alphavault.enums.SavingGoalCategory;
import com.alpha.alphavault.enums.SavingGoalStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record SavingGoalResponseDTO(
    Long id,
    Long userId,
    Long version,
    String name,
    SavingGoalCategory category,
    SavingGoalPriority priority,
    SavingGoalStatus status,
    String currency,
    BigDecimal targetAmount,
    BigDecimal currentAmount,
    BigDecimal remainingAmount,
    Integer progressPercent,
    LocalDate deadline,
    LocalDateTime achievedAt,
    String notes,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
