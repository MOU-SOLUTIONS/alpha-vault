/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Entity: Debt (money-safe, auditable, soft-deletable)
 *  Guarantees:
 *    - BigDecimal for all money
 *    - Optimistic locking (@Version)
 *    - Soft delete (@SQLDelete + @Where)
 *    - Status + due-date semantics, indexes for speed
 * ================================================================
 */
package com.alpha.alphavault.model;

import com.alpha.alphavault.enums.DebtStatus;
import com.alpha.alphavault.enums.RecurrenceType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(
    name = "debts",
    indexes = {
        @Index(name = "idx_debt_user", columnList = "user_id"),
        @Index(name = "idx_debt_status", columnList = "status"),
        @Index(name = "idx_debt_due_date", columnList = "due_date"),
        @Index(name = "idx_debt_deleted", columnList = "deleted_at")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE debts SET deleted_at = NOW() WHERE id = ?")
@FilterDef(name = "debtDeletedFilter", defaultCondition = "deleted_at IS NULL")
@Filter(name = "debtDeletedFilter")
public class Debt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Prevent lost updates. */
    @Version
    private Long version;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 160)
    private String creditorName;

    /** Optional external ref / masked account number. */
    @Column(length = 64)
    private String accountRef;

    /** Optional ISO 4217; defaults to user's currency upstream if null. */
    @Column(length = 3)
    private String currency;

    /** Original principal / total obligation. */
    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal principalAmount;

    /** Remaining amount to settle (principal+interest as your app defines). */
    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal remainingAmount;

    /** Annual percentage rate (e.g., 7.5 = 7.5%). */
    @Column(nullable = false, precision = 7, scale = 4)
    private BigDecimal interestRateApr;

    /** Billing cycle for payments (MONTHLY default). */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private RecurrenceType billingCycle = RecurrenceType.MONTHLY;

    /** Next payment due date (first due date on creation). */
    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    /** Minimum required payment for the cycle. */
    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal minPayment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    @Builder.Default
    private DebtStatus status = DebtStatus.ACTIVE;

    @Column(length = 1000)
    private String notes;

    // ---------- Audit / soft delete ----------
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // ---------- Relations ----------
    @OneToMany(mappedBy = "debt", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<DebtHistory> debtHistory;

    // ---------- Hooks ----------
    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (remainingAmount == null) remainingAmount = principalAmount;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        // Auto-close when fully paid
        if (remainingAmount != null && remainingAmount.compareTo(BigDecimal.ZERO) <= 0) {
            remainingAmount = BigDecimal.ZERO;
            status = DebtStatus.PAID_OFF;
        }
    }

    // ---------- Derived ----------
    @Transient
    public boolean isOverdue() {
        return (status == DebtStatus.ACTIVE || status == DebtStatus.DELINQUENT)
                && dueDate != null && dueDate.isBefore(LocalDate.now());
    }

    @Transient
    public int getDaysPastDue() {
        if (!isOverdue()) return 0;
        return (int) java.time.temporal.ChronoUnit.DAYS.between(dueDate, LocalDate.now());
    }
}
