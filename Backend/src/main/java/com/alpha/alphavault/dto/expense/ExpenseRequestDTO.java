/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  DTO: ExpenseRequestDTO - Incoming payload for create/update
 * ================================================================
 */
package com.alpha.alphavault.dto.expense;

import com.alpha.alphavault.enums.ExpenseCategory;
import com.alpha.alphavault.enums.PaymentMethod;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseRequestDTO(

    @NotNull(message = "User ID is required")
    Long userId,

    @NotNull(message = "Category is required")
    ExpenseCategory category,

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.00", inclusive = false, message = "Amount must be greater than zero")
    @Digits(integer = 15, fraction = 4, message = "Amount supports up to 4 decimals")
    BigDecimal amount,

    /** Optional ISO 4217 code (e.g., USD). Will be uppercased in the mapper if present. */
    @Size(min = 3, max = 3, message = "Currency must be a 3-letter ISO code")
    String currency,

    @NotNull(message = "Date is required")
    @JsonFormat(pattern = "MM/dd/yyyy")
    LocalDate date,

    @NotNull(message = "Payment method is required")
    PaymentMethod paymentMethod,

    @Size(max = 500, message = "Description must be <= 500 characters")
    String description
) {}
