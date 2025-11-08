/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Mapper: SavingGoal <-> DTOs
 *  Rules:
 *    - toEntity: for create; fills defaults when needed
 *    - updateEntity: partial update; null fields are ignored
 *    - toResponse: includes derived fields (remaining, progress)
 * ================================================================
 */
package com.alpha.alphavault.mapper;

import com.alpha.alphavault.dto.savinggoal.SavingGoalRequestDTO;
import com.alpha.alphavault.dto.savinggoal.SavingGoalResponseDTO;
import com.alpha.alphavault.model.SavingGoal;
import com.alpha.alphavault.model.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class SavingGoalMapper {

    public SavingGoal toEntity(SavingGoalRequestDTO dto) {
        if (dto == null) return null;

        SavingGoal g = new SavingGoal();
        g.setUser(new User(dto.userId()));
        g.setName(trim(dto.name()));
        g.setCategory(dto.category());
        g.setPriority(dto.priority());
        g.setTargetAmount(dto.targetAmount());
        g.setCurrentAmount(dto.currentAmount() != null ? dto.currentAmount() : BigDecimal.ZERO);
        g.setCurrency(upper(dto.currency()));
        g.setDeadline(dto.deadline());
        g.setNotes(trim(dto.notes()));
        if (dto.status() != null) {
            g.setStatus(dto.status());
        }
        return g;
    }

    /** Partial update: only apply non-null fields. */
    public void updateEntity(SavingGoal target, SavingGoalRequestDTO dto) {
        if (dto == null) return;
        if (dto.name() != null) target.setName(trim(dto.name()));
        if (dto.category() != null) target.setCategory(dto.category());
        if (dto.priority() != null) target.setPriority(dto.priority());
        if (dto.targetAmount() != null) target.setTargetAmount(dto.targetAmount());
        if (dto.currentAmount() != null) target.setCurrentAmount(dto.currentAmount());
        if (dto.currency() != null) target.setCurrency(upper(dto.currency()));
        if (dto.deadline() != null) target.setDeadline(dto.deadline());
        if (dto.notes() != null) target.setNotes(trim(dto.notes()));
        if (dto.status() != null) target.setStatus(dto.status());
        // userId is immutable here; manage reassignment only via an admin-specific flow if needed
    }

    public SavingGoalResponseDTO toResponse(SavingGoal g) {
        if (g == null) return null;
        
        // Safely get user ID (handle lazy loading)
        Long userId = null;
        try {
            userId = g.getUser() != null ? g.getUser().getId() : null;
        } catch (Exception e) {
            // If lazy loading fails, userId will remain null
            // This should not happen in a @Transactional context, but handle gracefully
        }
        
        // Safely compute derived fields (handle null values)
        BigDecimal remainingAmount = null;
        Integer progressPercent = 0;
        try {
            remainingAmount = g.getRemainingAmount();
            progressPercent = g.getProgressPercent();
        } catch (Exception e) {
            // If computation fails, use safe defaults
            if (g.getTargetAmount() != null && g.getCurrentAmount() != null) {
                remainingAmount = g.getTargetAmount().subtract(g.getCurrentAmount());
                if (remainingAmount.compareTo(BigDecimal.ZERO) < 0) {
                    remainingAmount = BigDecimal.ZERO;
                }
            }
        }
        
        return new SavingGoalResponseDTO(
                g.getId(),
                userId,
                g.getVersion(),
                g.getName(),
                g.getCategory(),
                g.getPriority(),
                g.getStatus(),
                g.getCurrency(),
                g.getTargetAmount(),
                g.getCurrentAmount() != null ? g.getCurrentAmount() : BigDecimal.ZERO,
                remainingAmount,
                progressPercent,
                g.getDeadline(),
                g.getAchievedAt(),
                g.getNotes(),
                g.getCreatedAt(),
                g.getUpdatedAt()
        );
    }

    // -------- helpers --------
    private String trim(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private String upper(String s) {
        return s == null ? null : s.trim().toUpperCase();
    }
}
