/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Repository: ExpenseRepository
 * ================================================================
 */
package com.alpha.alphavault.repository;

import com.alpha.alphavault.model.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    // ---------- Simple finders (respect @Where -> ignore soft-deleted) ----------
    List<Expense> findByUserId(Long userId);

    // OLD name used "date" -> entity uses "expenseDate"
    List<Expense> findByUserIdAndExpenseDateBetween(Long userId, LocalDate start, LocalDate end);

    Page<Expense> findByUserIdOrderByExpenseDateDesc(Long userId, Pageable pageable);

    Page<Expense> findByUserIdAndExpenseDateBetweenOrderByExpenseDateDesc(Long userId, LocalDate start, LocalDate end, Pageable pageable);

    List<Expense> findTop5ByUserIdAndExpenseDateBetweenOrderByAmountDesc(Long userId, LocalDate start, LocalDate end);

    // ---------- Aggregations (DB-side, fast) ----------
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e " +
           "WHERE e.user.id = :userId AND e.expenseDate >= :start AND e.expenseDate < :end")
    BigDecimal sumAmountForPeriod(@Param("userId") Long userId,
                                  @Param("start") LocalDate start,
                                  @Param("end") LocalDate end); // end is exclusive

    @Query("SELECT e.paymentMethod, SUM(e.amount) FROM Expense e " +
           "WHERE e.user.id = :userId GROUP BY e.paymentMethod")
    List<Object[]> sumByPaymentMethod(@Param("userId") Long userId);

    @Query("SELECT e.category, SUM(e.amount) FROM Expense e " +
           "WHERE e.user.id = :userId GROUP BY e.category")
    List<Object[]> sumByCategory(@Param("userId") Long userId);

    @Query("SELECT e.paymentMethod, SUM(e.amount) FROM Expense e " +
           "WHERE e.user.id = :userId AND e.expenseDate >= :start AND e.expenseDate < :end GROUP BY e.paymentMethod")
    List<Object[]> sumByPaymentMethodForPeriod(@Param("userId") Long userId,
                                              @Param("start") LocalDate start,
                                              @Param("end") LocalDate end);

    @Query("SELECT e.category, SUM(e.amount) FROM Expense e " +
           "WHERE e.user.id = :userId AND e.expenseDate >= :start AND e.expenseDate < :end GROUP BY e.category")
    List<Object[]> sumByCategoryForPeriod(@Param("userId") Long userId,
                                         @Param("start") LocalDate start,
                                         @Param("end") LocalDate end);

    // ---------- Soft delete helpers ----------
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Expense e SET e.deletedAt = CURRENT_TIMESTAMP, e.deletedBy = :deletedBy WHERE e.id = :id")
    int softDelete(@Param("id") Long id, @Param("deletedBy") String deletedBy);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Expense e SET e.deletedAt = NULL, e.deletedBy = NULL WHERE e.id = :id")
    int restore(@Param("id") Long id);

    // ---------- Hard delete methods ----------
    
    // Native SQL delete to bypass any constraints
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "DELETE FROM expenses WHERE id = :id", nativeQuery = true)
    int deleteByIdNative(@Param("id") Long id);
}
