package com.alpha.alphavault.dto;

import com.alpha.alphavault.enums.ExpenseCategory;
import com.alpha.alphavault.enums.PaymentMethod;
import com.alpha.alphavault.model.Expense;
import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Builder
public class ExpenseResponseDTO {

    private Long id;
    private Long userId;
    private ExpenseCategory category;
    private BigDecimal amount;

    @JsonFormat(pattern = "MM/dd/yyyy")
    private LocalDate date;
    private PaymentMethod paymentMethod;
    private String description;

    public static ExpenseResponseDTO fromEntity(Expense expense) {
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
