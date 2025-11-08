/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Mapper: Expense <-> DTOs
 * ================================================================
 */
package com.alpha.alphavault.mapper;

import com.alpha.alphavault.dto.expense.ExpenseRequestDTO;
import com.alpha.alphavault.dto.expense.ExpenseResponseDTO;
import com.alpha.alphavault.model.Expense;
import com.alpha.alphavault.model.User;
import org.springframework.stereotype.Component;

@Component
public class ExpenseMapper {

    // ========== DTO -> Entity (Create) ==========
    public Expense toEntity(ExpenseRequestDTO dto) {
        if (dto == null) return null;

        Expense expense = new Expense();
        expense.setUser(new User(dto.userId()));
        expense.setCategory(dto.category());
        expense.setAmount(dto.amount());
        expense.setCurrency(upper(dto.currency()));
        expense.setExpenseDate(dto.date());
        expense.setPaymentMethod(dto.paymentMethod());
        expense.setDescription(trim(dto.description()));
        return expense;
    }

    // ========== DTO -> Entity (Update mutable fields) ==========
    public void updateEntity(Expense target, ExpenseRequestDTO dto) {
        if (target == null || dto == null) return;

        if (dto.category() != null)        target.setCategory(dto.category());
        if (dto.amount() != null)          target.setAmount(dto.amount());
        if (dto.currency() != null)        target.setCurrency(upper(dto.currency()));
        if (dto.date() != null)            target.setExpenseDate(dto.date());
        if (dto.paymentMethod() != null)   target.setPaymentMethod(dto.paymentMethod());
        if (dto.description() != null)     target.setDescription(trim(dto.description()));
        // userId is not updatable here; change ownership via dedicated service if needed
    }

    // ========== Entity -> DTO ==========
    public ExpenseResponseDTO toResponse(Expense expense) {
        if (expense == null) return null;

        return new ExpenseResponseDTO(
            expense.getId(),
            expense.getUser() != null ? expense.getUser().getId() : null,
            expense.getCategory(),
            expense.getAmount(),
            expense.getCurrency(),
            expense.getExpenseDate(),
            expense.getPaymentMethod(),
            expense.getDescription(),
            expense.getCreatedAt(),
            expense.getUpdatedAt()
        );
    }

    // ========== helpers ==========
    private String trim(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
    private String upper(String s) { return s == null ? null : s.trim().toUpperCase(); }
}
