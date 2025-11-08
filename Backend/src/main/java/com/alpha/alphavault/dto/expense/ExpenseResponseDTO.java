/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  DTO: ExpenseResponseDTO - Outgoing payload for expense
 * ================================================================
 */
package com.alpha.alphavault.dto.expense;

import com.alpha.alphavault.enums.ExpenseCategory;
import com.alpha.alphavault.enums.PaymentMethod;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ExpenseResponseDTO(
    Long id,
    Long userId,
    ExpenseCategory category,
    BigDecimal amount,
    String currency,

    @JsonFormat(pattern = "MM/dd/yyyy")
    LocalDate date,

    PaymentMethod paymentMethod,
    String description,

    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
