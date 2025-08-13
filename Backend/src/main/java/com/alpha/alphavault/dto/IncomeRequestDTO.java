package com.alpha.alphavault.dto;

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
public class IncomeRequestDTO {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Source is required")
    private String source;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Amount must be greater than zero")
    private BigDecimal amount;

    @NotNull(message = "Date is required")
    @JsonFormat(pattern = "MM/dd/yyyy")
    private LocalDate date;

    private String description;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    @NotNull(message = "isReceived is required")
    private Boolean isReceived;

    public User getUser() {
        return new User(userId);
    }
}
