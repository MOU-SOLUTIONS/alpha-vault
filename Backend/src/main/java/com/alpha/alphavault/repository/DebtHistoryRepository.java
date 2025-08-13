package com.alpha.alphavault.repository;

import com.alpha.alphavault.model.DebtHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface DebtHistoryRepository extends JpaRepository<DebtHistory, Long> {

    List<DebtHistory> findByDebtId(Long debtId);

    List<DebtHistory> findByDebtIdOrderByPaymentDateDesc(Long debtId);

    List<DebtHistory> findByDebtIdAndPaymentDateAfter(Long debtId, Date afterDate);
}
