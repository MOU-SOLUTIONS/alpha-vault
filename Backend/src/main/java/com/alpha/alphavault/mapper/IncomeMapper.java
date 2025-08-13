package com.alpha.alphavault.mapper;

import com.alpha.alphavault.dto.IncomeRequestDTO;
import com.alpha.alphavault.dto.IncomeResponseDTO;
import com.alpha.alphavault.model.Income;
import com.alpha.alphavault.model.User;
import com.alpha.alphavault.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class IncomeMapper {

    private final UserService userService;

    @Autowired
    public IncomeMapper(UserService userService) {
        this.userService = userService;
    }

    // Convert IncomeRequestDTO to Income (Entity)
    public Income toEntity(IncomeRequestDTO dto) {
        User user = userService.getUserById(dto.getUserId());
        return Income.builder()
                .user(user)
                .source(dto.getSource())
                .amount(dto.getAmount())
                .date(dto.getDate())
                .description(dto.getDescription())
                .paymentMethod(dto.getPaymentMethod())
                .isReceived(dto.getIsReceived() != null ? dto.getIsReceived() : false)
                .build();
    }

    // Convert Income (Entity) to IncomeResponseDTO
    public IncomeResponseDTO fromEntity(Income income) {
        return IncomeResponseDTO.builder()
                .id(income.getId())
                .userId(income.getUser().getId())
                .source(income.getSource())
                .amount(income.getAmount())
                .date(income.getDate())
                .description(income.getDescription())
                .paymentMethod(income.getPaymentMethod())
                .isReceived(income.isReceived())
                .build();
    }
}
