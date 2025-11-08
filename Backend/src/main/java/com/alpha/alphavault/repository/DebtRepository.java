/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Repository: DebtRepository
 * ================================================================
 */
package com.alpha.alphavault.repository;

import com.alpha.alphavault.enums.DebtStatus;
import com.alpha.alphavault.model.Debt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface DebtRepository extends JpaRepository<Debt, Long> {

    Page<Debt> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    List<Debt> findByUserId(Long userId);

    List<Debt> findByUserIdAndStatus(Long userId, DebtStatus status);

    List<Debt> findByUserIdAndDueDateBefore(Long userId, LocalDate before);

    List<Debt> findByUserIdAndDueDateBetween(Long userId, LocalDate start, LocalDate end);

    @Query("""
        SELECT d FROM Debt d
        WHERE d.user.id = :userId
          AND d.dueDate BETWEEN :start AND :end
          AND d.status IN (com.alpha.alphavault.enums.DebtStatus.ACTIVE,
                           com.alpha.alphavault.enums.DebtStatus.DELINQUENT)
        ORDER BY d.dueDate ASC
    """)
    List<Debt> findDueWindow(@Param("userId") Long userId,
                             @Param("start") LocalDate start,
                             @Param("end") LocalDate end);

    @Query("SELECT COALESCE(SUM(d.remainingAmount), 0) FROM Debt d WHERE d.user.id = :userId")
    BigDecimal sumRemainingByUser(@Param("userId") Long userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Debt d SET d.deletedAt = NULL WHERE d.id = :id")
    int restore(@Param("id") Long id);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "DELETE FROM debts WHERE id = :id", nativeQuery = true)
    int hardDeleteById(@Param("id") Long id);
}
