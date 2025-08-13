package com.alpha.alphavault.dto;

import com.alpha.alphavault.model.Budget;
import com.alpha.alphavault.model.BudgetCategory;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
public class BudgetResponseDTO {
    private Long id;
    private Long userId;
    private int month;
    private int year;
    private BigDecimal totalBudget;
    private BigDecimal totalRemaining;
    private List<BudgetCategory> categories;

    public static BudgetResponseDTO fromEntity(Budget budget) {
        return BudgetResponseDTO.builder()
                .id(budget.getId())
                .userId(budget.getUser().getId())
                .month(budget.getMonth())
                .year(budget.getYear())
                .totalBudget(budget.getTotalBudget())
                .totalRemaining(budget.getTotalRemaining())
                .categories(budget.getCategories())
                .build();
    }
}
