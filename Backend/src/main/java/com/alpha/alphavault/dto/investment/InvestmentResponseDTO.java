/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  DTO: InvestmentResponseDTO — API response view
 * ================================================================
 */
package com.alpha.alphavault.dto.investment;

import com.alpha.alphavault.enums.InvestmentStatus;
import com.alpha.alphavault.enums.InvestmentType;
import com.alpha.alphavault.enums.RiskLevel;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Builder
public record InvestmentResponseDTO(
        Long id,
        Long userId,
        InvestmentType investmentType,
        String name,
        String symbol,
        String currency,
        BigDecimal quantity,
        BigDecimal amountInvested,
        BigDecimal fees,
        BigDecimal currentPrice,
        BigDecimal currentValue,
        @JsonFormat(pattern = "MM/dd/yyyy")
        LocalDate startDate,
        RiskLevel riskLevel,
        String platform,
        InvestmentStatus status,
        BigDecimal soldValue,
        @JsonFormat(pattern = "MM/dd/yyyy")
        LocalDate soldDate,
        String notes,
        Long version,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime createdAt,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime updatedAt,

        // Derived metrics for dashboards
        BigDecimal unrealizedPnl,
        BigDecimal realizedPnl,
        BigDecimal roiPercent
) {}
