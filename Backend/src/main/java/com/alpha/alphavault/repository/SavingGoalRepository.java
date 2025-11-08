/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Repository: SavingGoalRepository (soft delete aware)
 *  Notes:
 *    - Entity uses @SQLDelete + @Where, so deletes are soft by default.
 *    - Provide restore() to undo soft delete.
 * ================================================================
 */
package com.alpha.alphavault.repository;

import com.alpha.alphavault.enums.SavingGoalPriority;
import com.alpha.alphavault.enums.SavingGoalCategory;
import com.alpha.alphavault.enums.SavingGoalStatus;
import com.alpha.alphavault.model.SavingGoal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface SavingGoalRepository extends JpaRepository<SavingGoal, Long> {

    // ---- basic lookups ----
    Page<SavingGoal> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    List<SavingGoal> findByUserId(Long userId);
    List<SavingGoal> findByUserIdAndCategory(Long userId, SavingGoalCategory category);
    List<SavingGoal> findByUserIdAndPriority(Long userId, SavingGoalPriority priority);
    List<SavingGoal> findByUserIdAndStatus(Long userId, SavingGoalStatus status);

    // ---- amounts (BigDecimal) ----
    List<SavingGoal> findByUserIdAndTargetAmountGreaterThan(Long userId, BigDecimal amount);
    List<SavingGoal> findByUserIdAndCurrentAmountLessThan(Long userId, BigDecimal amount);

    // ---- deadlines ----
    List<SavingGoal> findByUserIdAndDeadlineBefore(Long userId, LocalDate before);
    List<SavingGoal> findByUserIdAndDeadlineBetween(Long userId, LocalDate startInclusive, LocalDate endInclusive);

    // Overdue but not completed/cancelled
    @Query("""
           SELECT g FROM SavingGoal g
            WHERE g.user.id = :userId
              AND g.deadline < :before
              AND g.status NOT IN (com.alpha.alphavault.enums.SavingGoalStatus.COMPLETED,
                                   com.alpha.alphavault.enums.SavingGoalStatus.CANCELLED)
           """)
    List<SavingGoal> findActiveOverdue(@Param("userId") Long userId, @Param("before") LocalDate before);

    // Soon due (active)
    @Query("""
           SELECT g FROM SavingGoal g
            WHERE g.user.id = :userId
              AND g.deadline BETWEEN :from AND :to
              AND g.status IN (com.alpha.alphavault.enums.SavingGoalStatus.ACTIVE,
                               com.alpha.alphavault.enums.SavingGoalStatus.PAUSED)
            ORDER BY g.deadline ASC
           """)
    List<SavingGoal> findDueWindow(@Param("userId") Long userId,
                                   @Param("from") LocalDate from,
                                   @Param("to") LocalDate to);

    // ---- restore soft-deleted ----
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE SavingGoal g SET g.deletedAt = NULL WHERE g.id = :id")
    int restore(@Param("id") Long id);

    // ---- permanent/hard delete ----
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "DELETE FROM saving_goals WHERE id = :id", nativeQuery = true)
    int deleteByIdNative(@Param("id") Long id);

    // ---- method to bypass soft delete filter ----
    @Query(value = "SELECT * FROM saving_goals WHERE id = :id", nativeQuery = true)
    SavingGoal findByIdIncludingDeleted(@Param("id") Long id);
    
    // ---- fix null version field ----
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "UPDATE saving_goals SET version = 0 WHERE id = :id AND version IS NULL", nativeQuery = true)
    int fixNullVersion(@Param("id") Long id);
}
