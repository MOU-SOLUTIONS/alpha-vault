/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Repository: BudgetRepository (soft delete + lookups + aggregates)
 * ================================================================
 */
package com.alpha.alphavault.repository;

import com.alpha.alphavault.model.Budget;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    // Canonical monthly lookup
    Optional<Budget> findByUserIdAndYearAndMonth(Long userId, int year, int month);

    // Back-compat alias (your old signature)
    default Optional<Budget> findByUserIdAndMonthAndYear(Long userId, int month, int year) {
        return findByUserIdAndYearAndMonth(userId, year, month);
    }

    // Lists
    Page<Budget> findByUserIdOrderByYearDescMonthDesc(Long userId, Pageable pageable);
    List<Budget> findByUserId(Long userId);
    List<Budget> findByUserIdAndYearOrderByMonthAsc(Long userId, int year);

    // Aggregates
    @Query("SELECT COALESCE(SUM(b.totalBudget), 0) FROM Budget b WHERE b.user.id = :userId AND b.year = :year")
    BigDecimal sumTotalBudgetByUserAndYear(@Param("userId") Long userId, @Param("year") int year);

    @Query("SELECT b.month, COALESCE(SUM(b.totalBudget), 0) FROM Budget b WHERE b.user.id = :userId AND b.year = :year GROUP BY b.month ORDER BY b.month ASC")
    List<Object[]> monthlyBudgetAggregate(@Param("userId") Long userId, @Param("year") int year);

    // Soft delete / restore
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Budget b SET b.deletedAt = CURRENT_TIMESTAMP, b.deletedBy = :deletedBy WHERE b.id = :id")
    int softDelete(@Param("id") Long id, @Param("deletedBy") String deletedBy);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Budget b SET b.deletedAt = NULL, b.deletedBy = NULL WHERE b.id = :id")
    int restore(@Param("id") Long id);
}
