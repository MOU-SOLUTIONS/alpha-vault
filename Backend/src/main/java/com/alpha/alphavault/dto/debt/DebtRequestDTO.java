/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  DTO: DebtRequestDTO (create/update; null = no change on update)
 * ================================================================
 */
package com.alpha.alphavault.dto.debt;

import com.alpha.alphavault.enums.DebtStatus;
import com.alpha.alphavault.enums.RecurrenceType;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DebtRequestDTO(
        @NotNull(message = "User ID is required")
        Long userId,

        @NotBlank(message = "Creditor name is required")
        @Size(max = 160)
        String creditorName,

        @Size(max = 64)
        String accountRef,

        @Size(min = 3, max = 3, message = "Currency must be ISO-4217")
        String currency,

        @NotNull(message = "Principal amount is required")
        @DecimalMin(value = "0.00", inclusive = false)
        @Digits(integer = 15, fraction = 4)
        BigDecimal principalAmount,

        @DecimalMin(value = "0.00", inclusive = true)
        @Digits(integer = 15, fraction = 4)
        BigDecimal remainingAmount,

        @NotNull(message = "Interest APR is required")
        @DecimalMin(value = "0.0000", inclusive = true)
        @Digits(integer = 3, fraction = 4) // up to 999.9999%
        BigDecimal interestRateApr,

        @NotNull(message = "Billing cycle is required")
        RecurrenceType billingCycle,

        @NotNull(message = "Due date is required")
        @JsonFormat(pattern = "MM/dd/yyyy")
        LocalDate dueDate,

        @NotNull(message = "Minimum payment is required")
        @DecimalMin(value = "0.00", inclusive = false)
        @Digits(integer = 15, fraction = 4)
        BigDecimal minPayment,

        @Size(max = 1000)
        String notes,

        DebtStatus status
) {}
