/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Entity: DebtHistory (payment ledger; BigDecimal-safe)
 * ================================================================
 */
package com.alpha.alphavault.model;

import com.alpha.alphavault.enums.PaymentMethod;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "debt_history",
    indexes = {
        @Index(name = "idx_debt_history_debt", columnList = "debt_id"),
        @Index(name = "idx_debt_history_date", columnList = "payment_date")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DebtHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Optional for concurrency if you plan edits on payments. */
    @Version
    private Long version;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "debt_id", nullable = false)
    private Debt debt;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private PaymentMethod paymentMethod;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal paymentAmount;

    /** Remaining balance after this payment is applied. */
    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal remainingAfterPayment;

    @Column(length = 500)
    private String note;

    // Audit
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (paymentDate == null) paymentDate = LocalDate.now();
    }
}
