/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  DTO: DebtPaymentRequestDTO (create a payment entry)
 * ================================================================
 */
package com.alpha.alphavault.dto.debt;

import com.alpha.alphavault.enums.PaymentMethod;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DebtPaymentRequestDTO(
        @NotNull(message = "Debt ID is required")
        Long debtId,

        @NotNull(message = "Payment amount is required")
        @DecimalMin(value = "0.00", inclusive = false)
        @Digits(integer = 15, fraction = 4)
        BigDecimal paymentAmount,

        @NotNull(message = "Payment method is required")
        PaymentMethod paymentMethod,

        @JsonFormat(pattern = "MM/dd/yyyy")
        LocalDate paymentDate,

        @Size(max = 500)
        String note
) {}
