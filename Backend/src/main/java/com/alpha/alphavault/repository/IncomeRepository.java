/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Repository: IncomeRepository
 * ================================================================
 */
package com.alpha.alphavault.repository;

import com.alpha.alphavault.model.Income;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface IncomeRepository extends JpaRepository<Income, Long> {

    // ---------- Simple finders (respect @Where -> ignore soft-deleted) ----------
    List<Income> findByUserId(Long userId);

    // Old name used "date" -> your entity uses "incomeDate"
    List<Income> findByUserIdAndIncomeDateBetween(Long userId, LocalDate start, LocalDate end);

    Page<Income> findByUserIdOrderByIncomeDateDesc(Long userId, Pageable pageable);

    Page<Income> findByUserIdAndIncomeDateBetweenOrderByIncomeDateDesc(Long userId, LocalDate start, LocalDate end, Pageable pageable);

    List<Income> findTop5ByUserIdAndIncomeDateBetweenOrderByAmountDesc(Long userId, LocalDate start, LocalDate end);

    @Query("SELECT DISTINCT i.source FROM Income i WHERE i.user.id = :userId")
    List<String> findDistinctSourcesByUserId(@Param("userId") Long userId);

    // ---------- Aggregations (DB-side, fast) ----------
    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Income i " +
           "WHERE i.user.id = :userId AND i.incomeDate >= :start AND i.incomeDate < :end")
    BigDecimal sumAmountForPeriod(@Param("userId") Long userId,
                                  @Param("start") LocalDate start,
                                  @Param("end") LocalDate end);

    @Query("SELECT i.paymentMethod, SUM(i.amount) FROM Income i " +
           "WHERE i.user.id = :userId GROUP BY i.paymentMethod")
    List<Object[]> sumByPaymentMethod(@Param("userId") Long userId);

    @Query("SELECT i.source, SUM(i.amount) FROM Income i " +
           "WHERE i.user.id = :userId GROUP BY i.source")
    List<Object[]> sumBySource(@Param("userId") Long userId);

    @Query("SELECT i.paymentMethod, SUM(i.amount) FROM Income i " +
           "WHERE i.user.id = :userId AND i.incomeDate >= :start AND i.incomeDate < :end GROUP BY i.paymentMethod")
    List<Object[]> sumByPaymentMethodForPeriod(@Param("userId") Long userId,
                                               @Param("start") LocalDate start,
                                               @Param("end") LocalDate end);

    @Query("SELECT i.source, SUM(i.amount) FROM Income i " +
           "WHERE i.user.id = :userId AND i.incomeDate >= :start AND i.incomeDate < :end GROUP BY i.source")
    List<Object[]> sumBySourceForPeriod(@Param("userId") Long userId,
                                        @Param("start") LocalDate start,
                                        @Param("end") LocalDate end);

    // ---------- Soft delete helpers (set deletedAt/deletedBy without select) ----------
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Income i SET i.deletedAt = CURRENT_TIMESTAMP, i.deletedBy = :deletedBy WHERE i.id = :id")
    int softDelete(@Param("id") Long id, @Param("deletedBy") String deletedBy);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Income i SET i.deletedAt = NULL, i.deletedBy = NULL WHERE i.id = :id")
    int restore(@Param("id") Long id);

    // ---------- Methods that bypass soft delete filter ----------
    @Query(value = "SELECT * FROM incomes WHERE id = :id", nativeQuery = true)
    Income findByIdIncludingDeleted(@Param("id") Long id);
    
    // Alternative method using JPQL with explicit condition
    @Query("SELECT i FROM Income i WHERE i.id = :id AND (i.deletedAt IS NULL OR i.deletedAt IS NOT NULL)")
    Income findByIdWithDeletedStatus(@Param("id") Long id);
    
    // Native SQL delete to bypass any constraints
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "DELETE FROM incomes WHERE id = :id", nativeQuery = true)
    int deleteByIdNative(@Param("id") Long id);
    
    // Fix null version fields
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "UPDATE incomes SET version = 0 WHERE version IS NULL", nativeQuery = true)
    int fixVersionFields();
}
