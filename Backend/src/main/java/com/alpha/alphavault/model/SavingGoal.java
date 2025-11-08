/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Entity: SavingGoal (money-safe, auditable, resilient)
 *  Guarantees:
 *    - BigDecimal for all money (precision 19, scale 4)
 *    - Optimistic locking + soft delete
 *    - Unique per (user, name) to prevent duplicates
 *    - Computed progress/remaining (no drift)
 * ================================================================
 */
package com.alpha.alphavault.model;

import com.alpha.alphavault.enums.SavingGoalPriority;
import com.alpha.alphavault.enums.SavingGoalCategory;
import com.alpha.alphavault.enums.SavingGoalStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "saving_goals",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_goal_user_name", columnNames = {"user_id", "name"})
    },
    indexes = {
        @Index(name = "idx_goal_user", columnList = "user_id"),
        @Index(name = "idx_goal_deadline", columnList = "deadline"),
        @Index(name = "idx_goal_status", columnList = "status"),
        @Index(name = "idx_goal_deleted", columnList = "deleted_at")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE saving_goals SET deleted_at = NOW() WHERE id = ?")
@FilterDef(name = "savingGoalDeletedFilter", defaultCondition = "deleted_at IS NULL")
@Filter(name = "savingGoalDeletedFilter")
public class SavingGoal {

    // ================= Identity & Locking =================
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Prevents lost updates on concurrent writes. */
    @Version
    private Long version;

    // ================= Ownership ==========================
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // ================= Business Fields ====================
    @Column(nullable = false, length = 120)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private SavingGoalCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private SavingGoalPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    @Builder.Default
    private SavingGoalStatus status = SavingGoalStatus.ACTIVE;

    /** Target amount to reach. */
    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal targetAmount;

    /** Current saved amount (persisted cache; validated in service). */
    @Column(nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal currentAmount = BigDecimal.ZERO;

    /** Optional ISO 4217; if null, default to user's preferredCurrency upstream. */
    @Column(length = 3)
    private String currency;

    /** Deadline to achieve the goal (inclusive). */
    @Column(nullable = false)
    private LocalDate deadline;

    /** Timestamp when the goal was achieved (set when current >= target). */
    private LocalDateTime achievedAt;

    @Column(length = 500)
    private String notes;

    // ================= Audit / Soft Delete =================
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // ================= Hooks ==============================
    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (currentAmount == null) currentAmount = BigDecimal.ZERO;
        // sanity clamp
        if (targetAmount != null && currentAmount.compareTo(targetAmount) >= 0 && achievedAt == null) {
            achievedAt = now;
            status = SavingGoalStatus.COMPLETED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        
        // Ensure currentAmount is never null
        if (currentAmount == null) {
            currentAmount = BigDecimal.ZERO;
        }
        
        // Ensure status is never null
        if (status == null) {
            status = SavingGoalStatus.ACTIVE;
        }
        
        // Update completion status based on amounts
        if (targetAmount != null && currentAmount != null) {
            if (currentAmount.compareTo(targetAmount) >= 0) {
                if (achievedAt == null) achievedAt = LocalDateTime.now();
                status = SavingGoalStatus.COMPLETED;
            } else if (status == SavingGoalStatus.COMPLETED) {
                // allow re-open if target increased later
                status = SavingGoalStatus.ACTIVE;
                achievedAt = null;
            }
        }
    }

    // ================= Derived (never stored) =============
    @Transient
    public BigDecimal getRemainingAmount() {
        if (targetAmount == null || currentAmount == null) return null;
        BigDecimal r = targetAmount.subtract(currentAmount);
        return r.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : r;
    }

    @Transient
    public int getProgressPercent() {
        if (targetAmount == null || targetAmount.compareTo(BigDecimal.ZERO) <= 0 || currentAmount == null) return 0;
        // (current / target) * 100, rounded down to int
        return currentAmount.multiply(BigDecimal.valueOf(100))
                .divide(targetAmount, 0, java.math.RoundingMode.DOWN).intValue();
    }

    public boolean isDeleted() { return deletedAt != null; }
    public boolean isCompleted() { return status == SavingGoalStatus.COMPLETED; }
}
