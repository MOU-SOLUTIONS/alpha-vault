// src/main/java/com/alpha/alphavault/dto/InvestmentRequestDTO.java
package com.alpha.alphavault.dto;

import com.alpha.alphavault.enums.InvestmentType;
import com.alpha.alphavault.enums.RiskLevel;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class InvestmentRequestDTO {
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
