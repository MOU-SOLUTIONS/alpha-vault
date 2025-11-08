/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  DTO: InvestmentCloseRequestDTO — close position
 * ================================================================
 */
package com.alpha.alphavault.dto.investment;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record InvestmentCloseRequestDTO(
        @NotNull(message = "Sold value is required")
        @DecimalMin(value = "0.0", inclusive = true, message = "Sold value cannot be negative")
        @Digits(integer = 15, fraction = 4)
        BigDecimal soldValue,

        @NotNull(message = "Sold date is required")
        @JsonFormat(pattern = "MM/dd/yyyy")
        LocalDate soldDate,

        String note
) {}
