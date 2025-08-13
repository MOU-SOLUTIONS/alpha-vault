package com.alpha.alphavault.repository;

import com.alpha.alphavault.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByUserId(Long userId);

    List<Expense> findByUserIdAndDateBetween(Long user_id, LocalDate date, LocalDate date2);

    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId AND MONTH(e.date) = :month AND YEAR(e.date) = :year")
List<Expense> findByUserIdAndMonthAndYear(@Param("userId") Long userId,
                                          @Param("month") int month,
                                          @Param("year") int year);


}
