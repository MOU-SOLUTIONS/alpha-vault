/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Entity: Income
 * ================================================================
 */
package com.alpha.alphavault.model;

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
    name = "incomes",
    indexes = {
        @Index(name = "idx_income_user", columnList = "user_id"),
        @Index(name = "idx_income_date", columnList = "income_date"),
        @Index(name = "idx_income_payment_method", columnList = "paymentMethod"),
        @Index(name = "idx_income_deleted", columnList = "deleted_at")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE incomes SET deleted_at = NOW() WHERE id = ?")
@FilterDef(name = "incomeDeletedFilter", defaultCondition = "deleted_at IS NULL")
@Filter(name = "incomeDeletedFilter")
public class Income {

    // ================= Identity & Ownership =================
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Optimistic locking to prevent lost updates. */
    // @Version  // Temporarily disabled to fix update issue
    private Long version;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // ================= Business Fields =====================
    @Column(nullable = false, length = 255)
    private String source;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(length = 3)
    private String currency; // optional per-transaction currency

    @Column(name = "income_date", nullable = false)
    private LocalDate incomeDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private PaymentMethod paymentMethod;

    @Column(nullable = false)
    @Builder.Default
    private boolean received = true;

    @Column(length = 500)
    private String description;

    // ================= Audit ===============================
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // ================= Soft Delete =========================
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "deleted_by", length = 100)
    private String deletedBy;

    // ================= Hooks ===============================
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
