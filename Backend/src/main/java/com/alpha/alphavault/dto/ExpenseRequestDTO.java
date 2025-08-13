package com.alpha.alphavault.dto;

import com.alpha.alphavault.enums.ExpenseCategory;
import com.alpha.alphavault.enums.PaymentMethod;
import com.alpha.alphavault.model.User;
import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class ExpenseRequestDTO {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Category is required")
    private ExpenseCategory category;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Amount must be greater than zero")
    private BigDecimal amount;

    @NotNull(message = "Date is required")
    @JsonFormat(pattern = "MM/dd/yyyy")
    private LocalDate date;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    private String description;


    public User getUser() {
        return new User(userId);
    }
}
