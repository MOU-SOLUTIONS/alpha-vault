package com.alpha.alphavault.mapper;

import com.alpha.alphavault.dto.SavingGoalRequestDTO;
import com.alpha.alphavault.dto.SavingGoalResponseDTO;
import com.alpha.alphavault.model.SavingGoal;
import org.springframework.stereotype.Component;

@Component
public class SavingGoalMapper {

    public SavingGoal toEntity(SavingGoalRequestDTO dto) {
        return SavingGoal.builder()
                .user(dto.getUser())
                .name(dto.getName())
                .targetAmount(dto.getTargetAmount())
                .currentAmount(dto.getCurrentAmount())
                .deadline(dto.getDeadline())
                .category(dto.getCategory())
                .priority(dto.getPriority())
                .build();
    }

    public SavingGoalResponseDTO fromEntity(SavingGoal entity) {
        return SavingGoalResponseDTO.fromEntity(entity);
    }
}
