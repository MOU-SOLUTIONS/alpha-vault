/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Repository: InvestmentRepository — user/type/status lookups
 * ================================================================
 */
package com.alpha.alphavault.repository;

import com.alpha.alphavault.enums.InvestmentStatus;
import com.alpha.alphavault.enums.InvestmentType;
import com.alpha.alphavault.model.Investment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvestmentRepository extends JpaRepository<Investment, Long> {

    List<Investment> findByUserId(Long userId);

    List<Investment> findByUserIdAndInvestmentType(Long userId, InvestmentType type);

    List<Investment> findByUserIdAndStatus(Long userId, InvestmentStatus status);
}
