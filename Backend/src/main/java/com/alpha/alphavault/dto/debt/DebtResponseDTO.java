/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  DTO: DebtResponseDTO (API-safe view + derived flags)
 * ================================================================
 */
package com.alpha.alphavault.dto.debt;

import com.alpha.alphavault.enums.DebtStatus;
import com.alpha.alphavault.enums.RecurrenceType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record DebtResponseDTO(
        Long id,
        Long userId,
        Long version,
        String creditorName,
        String accountRef,
        String currency,
        BigDecimal principalAmount,
        BigDecimal remainingAmount,
        BigDecimal interestRateApr,
        RecurrenceType billingCycle,
        LocalDate dueDate,
        BigDecimal minPayment,
        DebtStatus status,
        String notes,
        boolean overdue,
        Integer daysPastDue,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
