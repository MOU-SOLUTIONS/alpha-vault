package com.alpha.alphavault.repository;

import com.alpha.alphavault.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    // Find budget by user ID, month, and year
    Optional<Budget> findByUserIdAndMonthAndYear(Long userId, int month, int year);

    // Find budgets by user ID
    List<Budget> findByUserId(Long userId);
}
