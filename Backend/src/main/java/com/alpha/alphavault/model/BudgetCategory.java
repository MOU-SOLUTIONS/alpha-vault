package com.alpha.alphavault.model;

import com.alpha.alphavault.enums.ExpenseCategory;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.Objects;

@Entity
@Table(name = "budget_categories")
public class BudgetCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExpenseCategory category;

    @Column(nullable = false)
    private BigDecimal allocated;

    @Column(nullable = false)
    private BigDecimal remaining;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ExpenseCategory getCategory() {
        return category;
    }

    public void setCategory(ExpenseCategory category) {
        this.category = category;
    }

    public BigDecimal getAllocated() {
        return allocated;
    }

    public void setAllocated(BigDecimal allocated) {
        this.allocated = allocated;
    }

    public BigDecimal getRemaining() {
        return remaining;
    }

    public void setRemaining(BigDecimal remaining) {
        this.remaining = remaining;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BudgetCategory that = (BudgetCategory) o;
        return category == that.category;
    }

    @Override
    public int hashCode() {
        return Objects.hash(category);
    }
}
