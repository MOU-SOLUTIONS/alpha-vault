/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Repository: BudgetCategoryRepository (soft delete + lookups)
 * ================================================================
 */
package com.alpha.alphavault.repository;

import com.alpha.alphavault.model.BudgetCategory;
import com.alpha.alphavault.model.Budget;
import com.alpha.alphavault.enums.ExpenseCategory;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetCategoryRepository extends JpaRepository<BudgetCategory, Long> {

    // Find categories by budget
    List<BudgetCategory> findByBudget(Budget budget);
    
    // Find specific category in budget
    Optional<BudgetCategory> findByBudgetAndCategory(Budget budget, ExpenseCategory category);
    
    // Hard delete specific category
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM BudgetCategory bc WHERE bc.budget = :budget AND bc.category = :category")
    int deleteByBudgetAndCategory(@Param("budget") Budget budget, @Param("category") ExpenseCategory category);
}
