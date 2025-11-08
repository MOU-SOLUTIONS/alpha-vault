/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Mapper: Budget <-> DTOs
 * ================================================================
 */
package com.alpha.alphavault.mapper;

import com.alpha.alphavault.dto.budget.*;
import com.alpha.alphavault.model.Budget;
import com.alpha.alphavault.model.BudgetCategory;
import com.alpha.alphavault.model.User;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class BudgetMapper {

    public Budget toEntity(BudgetRequestDTO dto) {
        if (dto == null) return null;
        Budget b = new Budget();
        b.setUser(new User(dto.userId()));
        b.setMonth(dto.month());
        b.setYear(dto.year());
        b.setTotalBudget(dto.totalBudget());
        b.setCurrency(upper(dto.currency()));
        b.setNotes(trim(dto.notes()));
        if (dto.rolloverEnabled() != null) b.setRolloverEnabled(dto.rolloverEnabled());
        if (dto.alertThresholdPercent() != null) b.setAlertThresholdPercent(dto.alertThresholdPercent());

        // categories
        List<BudgetCategory> cats = new ArrayList<>();
        if (dto.categories() != null) {
            for (BudgetCategoryItemDTO c : dto.categories()) {
                BudgetCategory bc = new BudgetCategory();
                bc.setBudget(b);
                bc.setCategory(c.category());
                bc.setAllocated(c.allocated());
                cats.add(bc);
            }
        }
        b.setCategories(cats);
        return b;
    }

    /** Partial update. Month/year/userId immutable by default (enforce in service). */
    public void updateEntity(Budget target, BudgetRequestDTO dto) {
        if (dto.totalBudget() != null) target.setTotalBudget(dto.totalBudget());
        if (dto.currency() != null) target.setCurrency(upper(dto.currency()));
        if (dto.notes() != null) target.setNotes(trim(dto.notes()));
        if (dto.rolloverEnabled() != null) target.setRolloverEnabled(dto.rolloverEnabled());
        if (dto.alertThresholdPercent() != null) target.setAlertThresholdPercent(dto.alertThresholdPercent());

        if (dto.categories() != null) {
            // Replace categories wholesale (simple, safe) — orphanRemoval=true will handle it
            target.getCategories().clear();
            for (BudgetCategoryItemDTO c : dto.categories()) {
                BudgetCategory bc = new BudgetCategory();
                bc.setBudget(target);
                bc.setCategory(c.category());
                bc.setAllocated(c.allocated());
                target.getCategories().add(bc);
            }
        }
    }

    public BudgetResponseDTO toResponse(Budget b) {
        List<BudgetCategoryResponseDTO> cats = b.getCategories().stream()
                .map(c -> new BudgetCategoryResponseDTO(
                        c.getId(), c.getCategory(), c.getAllocated(), c.getSpentAmount(), c.getRemaining()))
                .toList();

        return new BudgetResponseDTO(
                b.getId(),
                b.getUser() != null ? b.getUser().getId() : null,
                b.getMonth(), b.getYear(),
                b.getCurrency(),
                b.getTotalBudget(),
                b.getTotalSpent(),
                b.getTotalRemaining(),
                b.isRolloverEnabled(),
                b.getAlertThresholdPercent(),
                b.getNotes(),
                cats,
                b.getCreatedAt(),
                b.getUpdatedAt()
        );
    }

    private String trim(String s) { if (s == null) return null; String t = s.trim(); return t.isEmpty()? null: t; }
    private String upper(String s) { return s == null ? null : s.trim().toUpperCase(); }
}
