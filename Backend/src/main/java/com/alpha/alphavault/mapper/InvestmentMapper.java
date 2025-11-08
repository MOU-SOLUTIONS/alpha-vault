/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Mapper: InvestmentMapper — DTO <-> Entity
 * ================================================================
 */
package com.alpha.alphavault.mapper;

import com.alpha.alphavault.dto.investment.*;
import com.alpha.alphavault.enums.InvestmentStatus;
import com.alpha.alphavault.model.Investment;
import com.alpha.alphavault.model.User;
import org.springframework.stereotype.Component;

@Component
public class InvestmentMapper {

    // Create entity from request
    public Investment toEntity(InvestmentRequestDTO dto) {
        Investment inv = Investment.builder()
                .user(new User(dto.userId()))
                .investmentType(dto.investmentType())
                .name(dto.name())
                .symbol(emptyToNull(dto.symbol()))
                .currency(upperOrNull(dto.currency()))
                .amountInvested(dto.amountInvested())
                .fees(nullSafe(dto.fees()))
                .quantity(dto.quantity())
                .currentPrice(dto.currentPrice())
                .startDate(dto.startDate())
                .riskLevel(dto.riskLevel())
                .platform(emptyToNull(dto.platform()))
                .notes(dto.notes())
                .status(InvestmentStatus.OPEN)
                .build();
        // currentValue will be derived by entity hook if price & qty present
        return inv;
    }

    // Patch/update entity from request (nulls are ignored)
    public void updateEntity(Investment entity, InvestmentRequestDTO dto) {
        if (dto.investmentType() != null) entity.setInvestmentType(dto.investmentType());
        if (notBlank(dto.name())) entity.setName(dto.name());
        if (dto.symbol() != null) entity.setSymbol(emptyToNull(dto.symbol()));
        if (dto.currency() != null) entity.setCurrency(upperOrNull(dto.currency()));
        if (dto.amountInvested() != null) entity.setAmountInvested(dto.amountInvested());
        if (dto.fees() != null) entity.setFees(nullSafe(dto.fees()));
        if (dto.quantity() != null) entity.setQuantity(dto.quantity());
        if (dto.currentPrice() != null) entity.setCurrentPrice(dto.currentPrice());
        if (dto.startDate() != null) entity.setStartDate(dto.startDate());
        if (dto.riskLevel() != null) entity.setRiskLevel(dto.riskLevel());
        if (dto.platform() != null) entity.setPlatform(emptyToNull(dto.platform()));
        if (dto.notes() != null) entity.setNotes(dto.notes());
    }

    // Close position mapping
    public void applyClose(Investment entity, InvestmentCloseRequestDTO dto) {
        entity.setSoldValue(dto.soldValue());
        entity.setSoldDate(dto.soldDate());
        entity.setStatus(InvestmentStatus.CLOSED);
        if (dto.note() != null && !dto.note().isBlank()) {
            // append closing note
            String notes = entity.getNotes();
            String extra = "[CLOSED on " + dto.soldDate() + "] " + dto.note();
            entity.setNotes(notes == null || notes.isBlank() ? extra : (notes + "\n" + extra));
        }
    }

    // Price update mapping
    public void applyMarkToMarket(Investment entity, InvestmentPriceUpdateDTO dto) {
        entity.setCurrentPrice(dto.currentPrice());
        // currentValue auto-derived by entity in @PreUpdate
    }

    // Entity -> Response
    public InvestmentResponseDTO toResponse(Investment e) {
        return InvestmentResponseDTO.builder()
                .id(e.getId())
                .userId(e.getUser() != null ? e.getUser().getId() : null)
                .investmentType(e.getInvestmentType())
                .name(e.getName())
                .symbol(e.getSymbol())
                .currency(e.getCurrency())
                .quantity(e.getQuantity())
                .amountInvested(e.getAmountInvested())
                .fees(e.getFees())
                .currentPrice(e.getCurrentPrice())
                .currentValue(e.getCurrentValue())
                .startDate(e.getStartDate())
                .riskLevel(e.getRiskLevel())
                .platform(e.getPlatform())
                .status(e.getStatus())
                .soldValue(e.getSoldValue())
                .soldDate(e.getSoldDate())
                .notes(e.getNotes())
                .version(e.getVersion())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .unrealizedPnl(e.getUnrealizedPnl())
                .realizedPnl(e.getRealizedPnl())
                .roiPercent(e.getRoiPercent())
                .build();
    }

    // --------- helpers ----------
    private static String upperOrNull(String ccy) {
        return (ccy == null || ccy.isBlank()) ? null : ccy.toUpperCase();
        // Service layer should still default to user's preferredCurrency if null.
    }
    private static boolean notBlank(String s) { return s != null && !s.isBlank(); }
    private static String emptyToNull(String s) { return notBlank(s) ? s : null; }
    private static java.math.BigDecimal nullSafe(java.math.BigDecimal v) {
        return v == null ? java.math.BigDecimal.ZERO : v;
    }
}
