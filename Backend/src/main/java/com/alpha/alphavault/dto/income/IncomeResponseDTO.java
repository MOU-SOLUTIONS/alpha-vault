/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  DTO: IncomeResponseDTO - Outgoing payload for income
 * ================================================================
 */
package com.alpha.alphavault.dto.income;

import com.alpha.alphavault.enums.PaymentMethod;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record IncomeResponseDTO(
    Long id,
    Long userId,
    String source,
    BigDecimal amount,
    String currency,

    @JsonFormat(pattern = "MM/dd/yyyy")
    LocalDate date,

    PaymentMethod paymentMethod,
    boolean received,
    String description,

    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
