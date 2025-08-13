package com.alpha.alphavault.dto;

import com.alpha.alphavault.model.BudgetCategory;
import com.alpha.alphavault.model.User;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class BudgetRequestDTO {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Month is required")
    @Min(value = 1, message = "Month must be between 1 and 12")
    @Max(value = 12, message = "Month must be between 1 and 12")
    private int month;

    @NotNull(message = "Year is required")
    private int year;

    @NotNull(message = "Total budget is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Total budget must be greater than zero")
    private BigDecimal totalBudget;

    @NotNull(message = "Total remaining is required")
    @DecimalMin(value = "0.0", message = "Remaining must be zero or more")
    private BigDecimal totalRemaining;

    @NotNull(message = "Categories list is required")
    @Size(min = 1, message = "At least one category must be provided")
    private List<BudgetCategory> categories;

    public User getUser() {
        return new User(userId);
    }
}
