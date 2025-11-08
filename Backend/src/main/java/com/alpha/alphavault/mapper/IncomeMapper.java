/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Mapper: Income <-> DTOs
 * ================================================================
 */
package com.alpha.alphavault.mapper;

import com.alpha.alphavault.dto.income.IncomeRequestDTO;
import com.alpha.alphavault.dto.income.IncomeResponseDTO;
import com.alpha.alphavault.model.Income;
import com.alpha.alphavault.model.User;
import org.springframework.stereotype.Component;

@Component
public class IncomeMapper {

    // ========== DTO -> Entity (Create) ==========
    public Income toEntity(IncomeRequestDTO dto) {
        if (dto == null) return null;

        Income income = new Income();
        income.setUser(new User(dto.userId()));
        income.setSource(trim(dto.source()));
        income.setAmount(dto.amount());
        income.setCurrency(upper(dto.currency()));
        income.setIncomeDate(dto.date());
        income.setPaymentMethod(dto.paymentMethod());
        income.setReceived(Boolean.TRUE.equals(dto.received()));
        income.setDescription(trim(dto.description()));
        return income;
    }

    // ========== DTO -> Entity (Update mutable fields) ==========
    public void updateEntity(Income target, IncomeRequestDTO dto) {
        if (target == null || dto == null) return;

        if (dto.source() != null)          target.setSource(trim(dto.source()));
        if (dto.amount() != null)          target.setAmount(dto.amount());
        if (dto.currency() != null)        target.setCurrency(upper(dto.currency()));
        if (dto.date() != null)            target.setIncomeDate(dto.date());
        if (dto.paymentMethod() != null)   target.setPaymentMethod(dto.paymentMethod());
        if (dto.received() != null)        target.setReceived(dto.received());
        if (dto.description() != null)     target.setDescription(trim(dto.description()));
    }

    // ========== Entity -> DTO ==========
    public IncomeResponseDTO toResponse(Income income) {
        if (income == null) return null;

        return new IncomeResponseDTO(
            income.getId(),
            income.getUser() != null ? income.getUser().getId() : null,
            income.getSource(),
            income.getAmount(),
            income.getCurrency(),
            income.getIncomeDate(),
            income.getPaymentMethod(),
            income.isReceived(),
            income.getDescription(),
            income.getCreatedAt(),
            income.getUpdatedAt()
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
