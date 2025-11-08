/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Entity: BudgetCategory (per-category allocations)
 * ================================================================
 */
package com.alpha.alphavault.model;

import com.alpha.alphavault.enums.ExpenseCategory;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "budget_categories",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_budgetcat_budget_category", columnNames = {"budget_id", "category"})
    },
    indexes = {
        @Index(name = "idx_budgetcat_budget", columnList = "budget_id"),
        @Index(name = "idx_budgetcat_category", columnList = "category")
    }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BudgetCategory {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "budget_id", nullable = false)
    private Budget budget;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ExpenseCategory category;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal allocated;

    /** Cached monthly spent for this category. */
    @Column(name = "spent_amount", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal spentAmount = BigDecimal.ZERO;

    // Audit fields
    @Column(nullable = false, updatable = false) private LocalDateTime createdAt;
    @Column(nullable = false) private LocalDateTime updatedAt;
    @Column(name = "deleted_at") private LocalDateTime deletedAt; // Keep for database compatibility

    @PrePersist protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now; 
        updatedAt = now;
        if (spentAmount == null) spentAmount = BigDecimal.ZERO;
    }
    
    @PreUpdate protected void onUpdate() { 
        updatedAt = LocalDateTime.now(); 
    }

    // Derived
    @Transient
    public BigDecimal getRemaining() {
        if (allocated == null || spentAmount == null) return null;
        return allocated.subtract(spentAmount);
    }
}
