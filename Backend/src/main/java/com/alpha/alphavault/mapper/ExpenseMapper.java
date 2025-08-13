package com.alpha.alphavault.mapper;

import com.alpha.alphavault.dto.ExpenseRequestDTO;
import com.alpha.alphavault.dto.ExpenseResponseDTO;
import com.alpha.alphavault.model.Expense;
import com.alpha.alphavault.model.User;
import com.alpha.alphavault.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ExpenseMapper {

    private final UserService userService;

    @Autowired
    public ExpenseMapper(UserService userService) {
        this.userService = userService;
    }

    // Convert ExpenseRequestDTO to Expense (Entity)
    public Expense toEntity(ExpenseRequestDTO expenseRequestDTO) {
        User user = userService.getUserById(expenseRequestDTO.getUserId());
        return Expense.builder()
                .user(user)
                .category(expenseRequestDTO.getCategory())
                .amount(expenseRequestDTO.getAmount())
                .date(expenseRequestDTO.getDate())
                .paymentMethod(expenseRequestDTO.getPaymentMethod())
                .description(expenseRequestDTO.getDescription())
                .build();
    }

    // Convert Expense (Entity) to ExpenseResponseDTO
    public ExpenseResponseDTO fromEntity(Expense expense) {
        return ExpenseResponseDTO.builder()
                .id(expense.getId())
                .userId(expense.getUser().getId())
                .category(expense.getCategory())
                .amount(expense.getAmount())
                .date(expense.getDate())
                .paymentMethod(expense.getPaymentMethod())
                .description(expense.getDescription())
                .build();
    }
}
