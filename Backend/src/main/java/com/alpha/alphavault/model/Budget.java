/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Entity: Budget (monthly; soft delete + optimistic locking)
 * ================================================================
 */
package com.alpha.alphavault.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "budgets",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_budget_user_year_month", columnNames = {"user_id", "year", "month"})
    },
    indexes = {
        @Index(name = "idx_budget_user", columnList = "user_id"),
        @Index(name = "idx_budget_year_month", columnList = "year, month"),
        @Index(name = "idx_budget_deleted", columnList = "deleted_at")
    }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@SQLDelete(sql = "UPDATE budgets SET deleted_at = NOW() WHERE id = ?")
@FilterDef(name = "budgetDeletedFilter", defaultCondition = "deleted_at IS NULL")
@Filter(name = "budgetDeletedFilter")
public class Budget {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Prevents lost updates under concurrency. */
    @Version
    private Long version;

    // Owner
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Period (monthly)
    @Column(nullable = false) private int month; // 1..12
    @Column(nullable = false) private int year;

    // Totals
    @Column(name = "total_budget", nullable = false, precision = 19, scale = 4)
    private BigDecimal totalBudget;

    /** Cached monthly spent. Recomputed in BudgetService; safe to store. */
    @Column(name = "total_spent", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal totalSpent = BigDecimal.ZERO;

    /** ISO 4217 (e.g., USD). If null, default to user's preferredCurrency upstream. */
    @Column(length = 3)
    private String currency;

    // Optional UX helpers
    @Column(nullable = false) @Builder.Default
    private boolean rolloverEnabled = false;

    @Column(precision = 19, scale = 4)
    private BigDecimal carryOverAmount;

    @Column(nullable = false) @Builder.Default
    private Integer alertThresholdPercent = 80;

    @Column(length = 500)
    private String notes;

    // Categories
    @OneToMany(mappedBy = "budget", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BudgetCategory> categories = new ArrayList<>();

    // Audit / Soft delete
    @Column(nullable = false, updatable = false) private LocalDateTime createdAt;
    @Column(nullable = false) private LocalDateTime updatedAt;
    @Column(name = "deleted_at") private LocalDateTime deletedAt;
    @Column(name = "deleted_by", length = 100) private String deletedBy;

    @PrePersist protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now; updatedAt = now;
        if (totalSpent == null) totalSpent = BigDecimal.ZERO;
        if (carryOverAmount == null) carryOverAmount = BigDecimal.ZERO;
    }
    @PreUpdate protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    // Derived
    @Transient
    public BigDecimal getTotalRemaining() {
        if (totalBudget == null || totalSpent == null) return null;
        return totalBudget.subtract(totalSpent);
    }
}
