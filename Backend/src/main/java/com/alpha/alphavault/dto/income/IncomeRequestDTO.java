/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  DTO: IncomeRequestDTO - Incoming payload for create/update
 * ================================================================
 */
package com.alpha.alphavault.dto.income;

import com.alpha.alphavault.enums.PaymentMethod;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record IncomeRequestDTO(

    @NotNull(message = "User ID is required")
    Long userId,

    @NotBlank(message = "Source is required")
    @Size(max = 255, message = "Source must be <= 255 characters")
    String source,

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.00", inclusive = false, message = "Amount must be greater than zero")
    @Digits(integer = 15, fraction = 4, message = "Amount supports up to 4 decimals")
    BigDecimal amount,

    /** Optional ISO 4217 code (e.g., USD). Uppercased in mapper if present. */
    @Size(min = 3, max = 3, message = "Currency must be a 3-letter ISO code")
    String currency,

    /** Keep your existing client format to avoid breaking the frontend. */
    @NotNull(message = "Date is required")
    @JsonFormat(pattern = "MM/dd/yyyy")
    LocalDate date,

    @NotNull(message = "Payment method is required")
    PaymentMethod paymentMethod,

    @NotNull(message = "isReceived is required")
    Boolean received,

    @Size(max = 500, message = "Description must be <= 500 characters")
    String description
) {}
