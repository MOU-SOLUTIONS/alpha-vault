/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  DTO: InvestmentRequestDTO — create/update payload
 * ================================================================
 */
package com.alpha.alphavault.dto.investment;

import com.alpha.alphavault.enums.InvestmentType;
import com.alpha.alphavault.enums.RiskLevel;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record InvestmentRequestDTO(
        @NotNull(message = "User ID is required")
        Long userId,

        @NotNull(message = "Investment type is required")
        InvestmentType investmentType,

        @NotBlank(message = "Name is required")
        @Size(max = 160, message = "Name max length is 160")
        String name,

        @Size(max = 32, message = "Symbol max length is 32")
        String symbol,

        @Size(min = 3, max = 3, message = "Currency must be 3-letter ISO code")
        String currency,

        @DecimalMin(value = "0.0", inclusive = false, message = "Amount invested must be > 0")
        @Digits(integer = 15, fraction = 4)
        BigDecimal amountInvested,

        @DecimalMin(value = "0.0", inclusive = true, message = "Fees cannot be negative")
        @Digits(integer = 15, fraction = 4)
        BigDecimal fees,

        @DecimalMin(value = "0.0", inclusive = true, message = "Quantity cannot be negative")
        @Digits(integer = 16, fraction = 8)
        BigDecimal quantity,

        @DecimalMin(value = "0.0", inclusive = true, message = "Current price cannot be negative")
        @Digits(integer = 15, fraction = 8)
        BigDecimal currentPrice,

        @NotNull(message = "Start date is required")
        @JsonFormat(pattern = "MM/dd/yyyy")
        LocalDate startDate,

        RiskLevel riskLevel,

        @Size(max = 120, message = "Platform max length is 120")
        String platform,

        String notes
) {}
