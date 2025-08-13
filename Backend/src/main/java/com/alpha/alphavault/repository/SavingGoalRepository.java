package com.alpha.alphavault.repository;

import com.alpha.alphavault.model.SavingGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SavingGoalRepository extends JpaRepository<SavingGoal, Long> {

    List<SavingGoal> findByUserId(Long userId);

    List<SavingGoal> findByUserIdOrderByCreationDateDesc(Long userId);

    List<SavingGoal> findByUserIdAndDeadlineBefore(Long userId, LocalDate deadline);

    List<SavingGoal> findByUserIdAndCategory(Long userId, com.alpha.alphavault.enums.SavingGoalCategory category);

    List<SavingGoal> findByUserIdAndPriority(Long userId, com.alpha.alphavault.enums.PriorityLevel priority);

    List<SavingGoal> findByUserIdAndTargetAmountGreaterThan(Long userId, Double amount);

    List<SavingGoal> findByUserIdAndCurrentAmountLessThan(Long userId, Double amount);
}
