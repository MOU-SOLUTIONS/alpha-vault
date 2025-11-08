/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Mapper: Debt <-> DTOs
 *  Rules:
 *    - toEntity: for create
 *    - updateEntity: partial update, ignore nulls
 *    - toResponse: includes derived flags (overdue, daysPastDue)
 * ================================================================
 */
package com.alpha.alphavault.mapper;

import com.alpha.alphavault.dto.debt.*;
import com.alpha.alphavault.model.Debt;
import com.alpha.alphavault.model.DebtHistory;
import com.alpha.alphavault.model.User;
import org.springframework.stereotype.Component;

@Component
public class DebtMapper {

    // -------- Debt --------
    public Debt toEntity(DebtRequestDTO dto) {
        Debt d = new Debt();
        d.setUser(new User(dto.userId()));
        d.setCreditorName(trim(dto.creditorName()));
        d.setAccountRef(trim(dto.accountRef()));
        d.setCurrency(upper(dto.currency()));
        d.setPrincipalAmount(dto.principalAmount());
        d.setRemainingAmount(dto.remainingAmount() != null ? dto.remainingAmount() : dto.principalAmount());
        d.setInterestRateApr(dto.interestRateApr());
        d.setBillingCycle(dto.billingCycle());
        d.setDueDate(dto.dueDate());
        d.setMinPayment(dto.minPayment());
        d.setNotes(trim(dto.notes()));
        if (dto.status() != null) d.setStatus(dto.status());
        return d;
    }

    /** Partial update: only apply non-null fields. */
    public void updateEntity(Debt target, DebtRequestDTO dto) {
        if (dto.creditorName() != null) target.setCreditorName(trim(dto.creditorName()));
        if (dto.accountRef() != null) target.setAccountRef(trim(dto.accountRef()));
        if (dto.currency() != null) target.setCurrency(upper(dto.currency()));
        if (dto.principalAmount() != null) target.setPrincipalAmount(dto.principalAmount());
        if (dto.remainingAmount() != null) target.setRemainingAmount(dto.remainingAmount());
        if (dto.interestRateApr() != null) target.setInterestRateApr(dto.interestRateApr());
        if (dto.billingCycle() != null) target.setBillingCycle(dto.billingCycle());
        if (dto.dueDate() != null) target.setDueDate(dto.dueDate());
        if (dto.minPayment() != null) target.setMinPayment(dto.minPayment());
        if (dto.notes() != null) target.setNotes(trim(dto.notes()));
        if (dto.status() != null) target.setStatus(dto.status());
    }

    public DebtResponseDTO toResponse(Debt d) {
        return new DebtResponseDTO(
                d.getId(),
                d.getUser() != null ? d.getUser().getId() : null,
                d.getVersion(),
                d.getCreditorName(),
                d.getAccountRef(),
                d.getCurrency(),
                d.getPrincipalAmount(),
                d.getRemainingAmount(),
                d.getInterestRateApr(),
                d.getBillingCycle(),
                d.getDueDate(),
                d.getMinPayment(),
                d.getStatus(),
                d.getNotes(),
                d.isOverdue(),
                d.getDaysPastDue(),
                d.getCreatedAt(),
                d.getUpdatedAt()
        );
    }

    // -------- DebtHistory (Payment) --------
    public DebtHistory toPaymentEntity(DebtPaymentRequestDTO dto) {
        DebtHistory p = new DebtHistory();
        p.setDebt(new Debt()); p.getDebt().setId(dto.debtId());
        p.setPaymentAmount(dto.paymentAmount());
        p.setPaymentMethod(dto.paymentMethod());
        p.setPaymentDate(dto.paymentDate());
        p.setNote(trim(dto.note()));
        // remainingAfterPayment is set by the service after business logic
        return p;
    }

    public DebtPaymentResponseDTO toPaymentResponse(DebtHistory h) {
        return new DebtPaymentResponseDTO(
                h.getId(),
                h.getDebt() != null ? h.getDebt().getId() : null,
                h.getVersion(),
                h.getPaymentDate(),
                h.getPaymentMethod(),
                h.getPaymentAmount(),
                h.getRemainingAfterPayment(),
                h.getNote(),
                h.getCreatedAt()
        );
    }

    // helpers
    private String trim(String s) { if (s == null) return null; String t = s.trim(); return t.isEmpty() ? null : t; }
    private String upper(String s) { return s == null ? null : s.trim().toUpperCase(); }
}
