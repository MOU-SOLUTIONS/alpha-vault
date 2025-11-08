/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Repository: DebtHistoryRepository
 * ================================================================
 */
package com.alpha.alphavault.repository;

import com.alpha.alphavault.model.DebtHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DebtHistoryRepository extends JpaRepository<DebtHistory, Long> {
    List<DebtHistory> findByDebtIdOrderByPaymentDateDesc(Long debtId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "DELETE FROM debt_history WHERE debt_id = :debtId", nativeQuery = true)
    int deleteByDebtId(@Param("debtId") Long debtId);
}
