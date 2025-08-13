package com.alpha.alphavault.repository;

import com.alpha.alphavault.model.Debt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DebtRepository extends JpaRepository<Debt, Long> {

    // Explicit JPQL so Spring Data doesn’t try to find a non-existent "userId" field on Debt
    @Query("select d from Debt d join d.user u where u.id = :userId")
    List<Debt> findByUserId(@Param("userId") Long userId);

    @Query("select d from Debt d join d.user u where u.id = :userId and d.creditorName = :creditorName")
    List<Debt> findByUserIdAndCreditorName(@Param("userId") Long userId, @Param("creditorName") String creditorName);

    @Query("select d from Debt d join d.user u where u.id = :userId order by d.dueDate desc")
    Page<Debt> findByUserIdOrderByDueDateDesc(@Param("userId") Long userId, Pageable pageable);

    // Leave as-is if unused; if you need “top by amount”, prefer sorting + Pageable instead of this signature.
    Page<Debt> findTopDebtsByUserId(Long userId, Pageable pageable);
}
