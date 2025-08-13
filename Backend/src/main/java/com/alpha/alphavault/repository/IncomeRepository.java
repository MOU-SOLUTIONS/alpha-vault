package com.alpha.alphavault.repository;

import com.alpha.alphavault.model.Income;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface IncomeRepository extends JpaRepository<Income, Long> {

    List<Income> findByUserId(Long userId);

    List<Income> findByUserIdAndDateBetween(Long userId, LocalDate start, LocalDate end);

    @Query("SELECT DISTINCT i.source FROM Income i WHERE i.user.id = :userId")
    List<String> findDistinctSourcesByUserId(@Param("userId") Long userId);

}
