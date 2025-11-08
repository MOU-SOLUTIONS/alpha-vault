/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  DTO: DebtPaymentResponseDTO
 * ================================================================
 */
package com.alpha.alphavault.dto.debt;

import com.alpha.alphavault.enums.PaymentMethod;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record DebtPaymentResponseDTO(
        Long id,
        Long debtId,
        Long version,
        LocalDate paymentDate,
        PaymentMethod paymentMethod,
        BigDecimal paymentAmount,
        BigDecimal remainingAfterPayment,
        String note,
        LocalDateTime createdAt
) {}
