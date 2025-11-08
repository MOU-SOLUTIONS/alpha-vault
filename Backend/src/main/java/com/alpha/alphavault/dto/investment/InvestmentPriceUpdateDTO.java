/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  DTO: InvestmentPriceUpdateDTO — mark-to-market update
 * ================================================================
 */
package com.alpha.alphavault.dto.investment;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record InvestmentPriceUpdateDTO(
        @NotNull(message = "Current price is required")
        @DecimalMin(value = "0.0", inclusive = true, message = "Current price cannot be negative")
        @Digits(integer = 15, fraction = 8)
        BigDecimal currentPrice
) {}
