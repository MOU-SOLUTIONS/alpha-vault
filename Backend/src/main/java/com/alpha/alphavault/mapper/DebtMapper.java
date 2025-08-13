package com.alpha.alphavault.mapper;

import com.alpha.alphavault.dto.DebtRequestDTO;
import com.alpha.alphavault.dto.DebtResponseDTO;
import com.alpha.alphavault.model.Debt;
import com.alpha.alphavault.model.User;
import com.alpha.alphavault.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.sql.Date;

@Component
public class DebtMapper {

    private final UserService userService;

    @Autowired
    public DebtMapper(UserService userService) {
        this.userService = userService;
    }

    // DTO -> Entity
    public Debt toEntity(DebtRequestDTO debtRequestDTO) {
        User user = userService.getUserById(debtRequestDTO.getUserId());
        return Debt.builder()
                .user(user)
                .creditorName(debtRequestDTO.getCreditorName())
                .totalAmount(debtRequestDTO.getTotalAmount())
                .remainingAmount(debtRequestDTO.getRemainingAmount())
                .interestRate(debtRequestDTO.getInterestRate())
                .dueDate(debtRequestDTO.getDueDate()) // java.sql.Date extends java.util.Date -> OK
                .minPayment(debtRequestDTO.getMinPayment())
                .build();
    }

    // Entity -> DTO
    public DebtResponseDTO fromEntity(Debt debt) {
        // Safe convert util.Date -> sql.Date (avoid ClassCastException)
        java.util.Date util = debt.getDueDate();
        Date sql = (util != null) ? new Date(util.getTime()) : null;

        return DebtResponseDTO.builder()
                .id(debt.getId())
                .userId(debt.getUser() != null ? debt.getUser().getId() : null)
                .creditorName(debt.getCreditorName())
                .totalAmount(debt.getTotalAmount())
                .remainingAmount(debt.getRemainingAmount())
                .interestRate(debt.getInterestRate())
                .dueDate(sql)
                .minPayment(debt.getMinPayment())
                .build();
    }
}
