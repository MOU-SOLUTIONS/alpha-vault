package com.alpha.alphavault.dto;

import com.alpha.alphavault.enums.PriorityLevel;
import com.alpha.alphavault.enums.SavingGoalCategory;
import com.alpha.alphavault.model.SavingGoal;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class SavingGoalResponseDTO {

    private Long id;
    private Long userId;
    private String name;
    private double targetAmount;
    private double currentAmount;
    private LocalDate creationDate;
    private LocalDate deadline;
    private SavingGoalCategory category;
    private PriorityLevel priority;

    public static SavingGoalResponseDTO fromEntity(SavingGoal goal) {
        return SavingGoalResponseDTO.builder()
                .id(goal.getId())
                .userId(goal.getUser().getId())
                .name(goal.getName())
                .targetAmount(goal.getTargetAmount())
                .currentAmount(goal.getCurrentAmount())
                .creationDate(goal.getCreationDate())
                .deadline(goal.getDeadline())
                .category(goal.getCategory())
                .priority(goal.getPriority())
                .build();
    }
}
