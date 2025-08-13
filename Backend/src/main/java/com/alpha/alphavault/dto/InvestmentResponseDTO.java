// src/main/java/com/alpha/alphavault/dto/InvestmentResponseDTO.java
package com.alpha.alphavault.dto;

import com.alpha.alphavault.enums.InvestmentType;
import com.alpha.alphavault.enums.RiskLevel;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InvestmentResponseDTO {
    private Long id;
    private Long userId;
    private InvestmentType investmentType;
    private String name;
    private BigDecimal amountInvested;
    private BigDecimal currentValue;
    private LocalDate startDate;
    private String notes;
    private RiskLevel riskLevel;
    private Boolean isSold;
    private BigDecimal soldValue;
    private LocalDate soldDate;
    // ─────────── Getters & Setters ───────────
    // ...
}
