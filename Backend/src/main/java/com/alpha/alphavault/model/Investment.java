/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Entity: Investment — money-safe, auditable
 *  Guarantees:
 *    - BigDecimal for all money math
 *    - Support for symbol/quantity + cost basis/fees
 *    - Optimistic locking (@Version)
 *    - Derived P&L/ROI helpers for dashboards
 * ================================================================
 */
package com.alpha.alphavault.model;

import com.alpha.alphavault.enums.InvestmentStatus;
import com.alpha.alphavault.enums.InvestmentType;
import com.alpha.alphavault.enums.RiskLevel;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "investments",
    indexes = {
        @Index(name = "idx_inv_user", columnList = "user_id"),
        @Index(name = "idx_inv_type", columnList = "investment_type"),
        @Index(name = "idx_inv_symbol", columnList = "symbol"),
        @Index(name = "idx_inv_status", columnList = "status")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Investment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Concurrency safety. */
    @Version
    private Long version;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "investment_type", nullable = false, length = 32)
    private InvestmentType investmentType;

    /** Human label (e.g., "Apple Inc.", "BTC Stack", "Rental #1"). */
    @Column(nullable = false, length = 160)
    private String name;

    /** Optional ticker/symbol for market assets. */
    @Column(length = 32)
    private String symbol;

    /** ISO-4217; if null, default to user's preferredCurrency in service layer. */
    @Column(length = 3)
    private String currency;

    /** Units held (shares/coins/etc). */
    @Column(precision = 24, scale = 8)
    private BigDecimal quantity;

    /** Total cost basis (can include fees). */
    @Column(name = "amount_invested", nullable = false, precision = 19, scale = 4)
    private BigDecimal amountInvested;

    /** Explicit fees (commissions/gas). */
    @Column(name = "fees", precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal fees = BigDecimal.ZERO;

    /** Latest MTM value for OPEN positions. */
    @Column(name = "current_value", precision = 19, scale = 4)
    private BigDecimal currentValue;

    /** Optional current price → derives currentValue = price * quantity. */
    @Column(name = "current_price", precision = 19, scale = 8)
    private BigDecimal currentPrice;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", length = 16)
    private RiskLevel riskLevel;

    /** Where it’s held (broker/wallet/custodian). */
    @Column(length = 120)
    private String platform;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    @Builder.Default
    private InvestmentStatus status = InvestmentStatus.OPEN;

    /** Filled when CLOSED. */
    @Column(name = "sold_value", precision = 19, scale = 4)
    private BigDecimal soldValue;

    @Column(name = "sold_date")
    private LocalDate soldDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    // ---------- Audit fields ----------
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // ---------- Hooks ----------
    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (amountInvested == null) amountInvested = BigDecimal.ZERO;
        if (fees == null) fees = BigDecimal.ZERO;
        if (currentValue == null && currentPrice != null && quantity != null) {
            currentValue = currentPrice.multiply(quantity).setScale(4, RoundingMode.HALF_UP);
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (currentPrice != null && quantity != null) {
            currentValue = currentPrice.multiply(quantity).setScale(4, RoundingMode.HALF_UP);
        }
        if (status == InvestmentStatus.CLOSED) {
            if (soldDate == null) soldDate = LocalDate.now();
            if (soldValue == null && currentValue != null) soldValue = currentValue;
        }
    }

    // ---------- Derived metrics (not persisted) ----------
    @Transient
    public BigDecimal getUnrealizedPnl() {
        if (status != InvestmentStatus.OPEN || currentValue == null) return BigDecimal.ZERO;
        return currentValue.subtract(amountInvested).subtract(feesOrZero()).setScale(4, RoundingMode.HALF_UP);
    }

    @Transient
    public BigDecimal getRealizedPnl() {
        if (status != InvestmentStatus.CLOSED || soldValue == null) return BigDecimal.ZERO;
        return soldValue.subtract(amountInvested).subtract(feesOrZero()).setScale(4, RoundingMode.HALF_UP);
    }

    @Transient
    public BigDecimal getRoiPercent() {
        BigDecimal base = amountInvested.compareTo(BigDecimal.ZERO) == 0 ? BigDecimal.ONE : amountInvested;
        BigDecimal pnl = (status == InvestmentStatus.CLOSED) ? getRealizedPnl() : getUnrealizedPnl();
        return pnl.multiply(BigDecimal.valueOf(100)).divide(base, 4, RoundingMode.HALF_UP);
    }

    @Transient
    public boolean isClosed() {
        return status == InvestmentStatus.CLOSED;
    }

    private BigDecimal feesOrZero() {
        return (fees == null) ? BigDecimal.ZERO : fees;
    }
}
