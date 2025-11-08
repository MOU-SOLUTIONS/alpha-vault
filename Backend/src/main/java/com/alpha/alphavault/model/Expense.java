/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Entity: Expense (with soft delete + optimistic locking)
 * ================================================================
 */
package com.alpha.alphavault.model;

import com.alpha.alphavault.enums.ExpenseCategory;
import com.alpha.alphavault.enums.PaymentMethod;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;

@Entity
@Table(
    name = "expenses",
    indexes = {
        @Index(name = "idx_expense_user", columnList = "user_id"),
        @Index(name = "idx_expense_date", columnList = "expense_date"),
        @Index(name = "idx_expense_category", columnList = "category"),
        @Index(name = "idx_expense_payment_method", columnList = "paymentMethod"),
        @Index(name = "idx_expense_deleted", columnList = "deleted_at")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE expenses SET deleted_at = NOW() WHERE id = ?")
@FilterDef(name = "expenseDeletedFilter", defaultCondition = "deleted_at IS NULL")
@Filter(name = "expenseDeletedFilter")
public class Expense {

    // ================= Identity & Locking =================
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Prevent lost updates on concurrent writes. */
    @Version
    private Long version;

    // ================= Ownership ==========================
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // ================= Business Fields ====================
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ExpenseCategory category;

    /** Money-safe precision. */
    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    /** Optional per-transaction ISO 4217 code (e.g. "USD"). */
    @Column(length = 3)
    private String currency;

    /** Effective date of the expense. */
    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private PaymentMethod paymentMethod;

    @Column(length = 500)
    private String description;

    // ================= Audit ==============================
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // ================= Soft Delete ========================
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "deleted_by", length = 100)
    private String deletedBy;

    // ================= Hooks ==============================
    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Convenience
    public boolean isDeleted() { return deletedAt != null; }
}
