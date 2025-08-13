package com.alpha.alphavault.dto;

import com.alpha.alphavault.enums.PaymentMethod;
import com.alpha.alphavault.model.Income;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Builder
public class IncomeResponseDTO {

    private Long id;
    private Long userId;
    private String source;
    private BigDecimal amount;

    @JsonFormat(pattern = "MM/dd/yyyy")
    private LocalDate date;

    private String recurrenceType;
    private String description;
    private PaymentMethod paymentMethod;
    @JsonProperty("isReceived")
    private boolean isReceived;

    // Static method for converting entity to DTO
    public static IncomeResponseDTO fromEntity(Income income) {
        return IncomeResponseDTO.builder()
                .id(income.getId())
                .userId(income.getUser().getId())
                .source(income.getSource())
                .amount(income.getAmount())
                .date(income.getDate())
                .description(income.getDescription())
                .paymentMethod(income.getPaymentMethod())
                .isReceived(income.isReceived()) // Include this
                .build();
    }
}
