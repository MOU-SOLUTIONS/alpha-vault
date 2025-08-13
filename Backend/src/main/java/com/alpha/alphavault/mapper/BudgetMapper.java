package com.alpha.alphavault.mapper;

import com.alpha.alphavault.dto.BudgetRequestDTO;
import com.alpha.alphavault.dto.BudgetResponseDTO;
import com.alpha.alphavault.model.Budget;
import com.alpha.alphavault.model.User;
import com.alpha.alphavault.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;


@Component
public class BudgetMapper {

    private final UserService userService;

    @Autowired
    public BudgetMapper(UserService userService) {
        this.userService = userService;
    }

    // Convert BudgetRequestDTO to Budget entity
    public Budget toEntity(BudgetRequestDTO dto) {
        User user = userService.getUserById(dto.getUserId());

        return Budget.builder()
                .user(user)
                .month(dto.getMonth())
                .year(dto.getYear())
                .totalBudget(dto.getTotalBudget())
                .totalRemaining(dto.getTotalRemaining())
                .categories(dto.getCategories())  // assumed to be passed directly
                .build();
    }

    // Convert Budget entity to BudgetResponseDTO
    public BudgetResponseDTO fromEntity(Budget budget) {
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
