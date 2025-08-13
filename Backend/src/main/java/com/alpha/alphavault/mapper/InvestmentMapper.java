package com.alpha.alphavault.mapper;

import com.alpha.alphavault.dto.InvestmentRequestDTO;
import com.alpha.alphavault.dto.InvestmentResponseDTO;
import com.alpha.alphavault.model.Investment;
import com.alpha.alphavault.model.User;
import org.springframework.stereotype.Component;

// com/alpha/alphavault/mapper/InvestmentMapper.java

@Component
public class InvestmentMapper {

    public Investment toEntity(InvestmentRequestDTO dto) {
        Investment investment = new Investment();
        investment.setUser(new User(dto.getUserId()));
        investment.setInvestmentType(dto.getInvestmentType());
        investment.setName(dto.getName());
        investment.setAmountInvested(dto.getAmountInvested());
        investment.setCurrentValue(dto.getCurrentValue());
        investment.setStartDate(dto.getStartDate());
        investment.setNotes(dto.getNotes());
        investment.setRiskLevel(dto.getRiskLevel());
        investment.setIsSold(dto.getIsSold());
        investment.setSoldValue(dto.getSoldValue());
        investment.setSoldDate(dto.getSoldDate());
        return investment;
    }

    public InvestmentResponseDTO fromEntity(Investment investment) {
        InvestmentResponseDTO dto = new InvestmentResponseDTO();
        dto.setId(investment.getId());
        dto.setUserId(investment.getUser().getId());
        dto.setInvestmentType(investment.getInvestmentType());
        dto.setName(investment.getName());
        dto.setAmountInvested(investment.getAmountInvested());
        dto.setCurrentValue(investment.getCurrentValue());
        dto.setStartDate(investment.getStartDate());
        dto.setNotes(investment.getNotes());
        dto.setRiskLevel(investment.getRiskLevel());
        dto.setIsSold(investment.getIsSold());
        dto.setSoldValue(investment.getSoldValue());
        dto.setSoldDate(investment.getSoldDate());
        return dto;
    }

    /** new: apply all updatable fields from the DTO onto an existing entity */
    public void updateEntity(Investment existing, InvestmentRequestDTO dto) {
        if (dto.getInvestmentType() != null)   existing.setInvestmentType(dto.getInvestmentType());
        if (dto.getName()           != null)   existing.setName(dto.getName());
        if (dto.getAmountInvested() != null)   existing.setAmountInvested(dto.getAmountInvested());
        if (dto.getCurrentValue()   != null)   existing.setCurrentValue(dto.getCurrentValue());
        if (dto.getStartDate()      != null)   existing.setStartDate(dto.getStartDate());
        existing.setNotes(dto.getNotes());      // notes may be null to clear
        existing.setRiskLevel(dto.getRiskLevel());
        existing.setIsSold(dto.getIsSold());
        existing.setSoldValue(dto.getSoldValue());
        existing.setSoldDate(dto.getSoldDate());
    }
}
