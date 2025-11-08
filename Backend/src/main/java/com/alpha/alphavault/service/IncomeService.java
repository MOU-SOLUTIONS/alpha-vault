/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Service: IncomeService - analytics, totals, soft delete
 * ================================================================
 */
package com.alpha.alphavault.service;

import com.alpha.alphavault.dto.income.IncomeRequestDTO;
import com.alpha.alphavault.dto.income.IncomeResponseDTO;
import com.alpha.alphavault.exception.IncomeException;
import com.alpha.alphavault.exception.IncomeNotFoundException;
import com.alpha.alphavault.mapper.IncomeMapper;
import com.alpha.alphavault.model.Income;
import com.alpha.alphavault.repository.IncomeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.*;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@RequiredArgsConstructor
@Service
public class IncomeService {

    private final IncomeRepository incomeRepository;
    private final IncomeMapper incomeMapper;

    // ============================================================
    // == CRUD with DTOs (new, recommended)
    // ============================================================

    @Transactional
    public IncomeResponseDTO create(IncomeRequestDTO dto) {
        try {
            Income income = incomeMapper.toEntity(dto);
            return incomeMapper.toResponse(incomeRepository.save(income));
        } catch (Exception e) {
            throw new IncomeException("Error creating income: " + e.getMessage());
        }
    }

    @Transactional
    public IncomeResponseDTO update(Long id, IncomeRequestDTO dto) {
        System.out.println("DEBUG: Attempting to update income with id: " + id);
        
        try {
            // Use regular findById first - this should work for non-deleted records
            Income income = incomeRepository.findById(id)
                    .orElseThrow(() -> new IncomeNotFoundException("Income not found for id: " + id));
            
            System.out.println("DEBUG: Found income - ID: " + income.getId() + ", Deleted: " + income.isDeleted() + ", Version: " + income.getVersion());
            
            if (income.isDeleted()) {
                System.out.println("DEBUG: Cannot update deleted income");
                throw new IncomeException("Cannot update deleted income with id: " + id);
            }
            
            System.out.println("DEBUG: Updating income...");
            incomeMapper.updateEntity(income, dto);
            
            System.out.println("DEBUG: Saving income...");
            Income savedIncome = incomeRepository.save(income);
            System.out.println("DEBUG: Successfully updated income with id: " + id + ", new version: " + savedIncome.getVersion());
            
            return incomeMapper.toResponse(savedIncome);
        } catch (Exception e) {
            System.err.println("DEBUG: Exception in update: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public IncomeResponseDTO getDtoById(Long id) {
        Income income = incomeRepository.findById(id)
                .orElseThrow(() -> new IncomeNotFoundException("Income not found for id: " + id));
        return incomeMapper.toResponse(income);
    }

    @Transactional(readOnly = true)
    public Page<IncomeResponseDTO> listByUser(Long userId, Pageable pageable) {
        return incomeRepository.findByUserIdOrderByIncomeDateDesc(userId, pageable)
                .map(incomeMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<IncomeResponseDTO> listByUserAndDateRange(Long userId, LocalDate startInclusive, LocalDate endInclusive, Pageable pageable) {
        return incomeRepository.findByUserIdAndIncomeDateBetweenOrderByIncomeDateDesc(userId, startInclusive, endInclusive, pageable)
                .map(incomeMapper::toResponse);
    }

    // ============================================================
    // == Legacy CRUD kept for compatibility (your old methods)
    // ============================================================

    @Transactional
    public Income saveIncome(Income income) {
        try {
            return incomeRepository.save(income);
        } catch (Exception e) {
            throw new IncomeException("Error saving income: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteIncome(Long id) {
        System.out.println("DEBUG: Attempting to permanently delete income with id: " + id);
        
        try {
            // First try to find the income using regular findById
            Income income = incomeRepository.findById(id).orElse(null);
            System.out.println("DEBUG: Regular findById result: " + (income != null ? "found" : "null"));
            
            if (income == null) {
                // If not found with regular method, try the bypass method
                System.out.println("DEBUG: Trying bypass method...");
                income = incomeRepository.findByIdWithDeletedStatus(id);
                System.out.println("DEBUG: Bypass method result: " + (income != null ? "found" : "null"));
            }
            
            if (income == null) {
                System.out.println("DEBUG: Income not found for id: " + id);
                throw new IncomeNotFoundException("Income not found for id: " + id);
            }
            
            System.out.println("DEBUG: Found income - ID: " + income.getId() + ", Deleted: " + income.isDeleted());
            
            // Permanently delete the record from database using native SQL
            System.out.println("DEBUG: Executing permanent delete for id: " + id);
            int deleted = incomeRepository.deleteByIdNative(id);
            System.out.println("DEBUG: Native delete affected " + deleted + " rows");
            
            if (deleted == 0) {
                throw new IncomeException("Failed to delete income with id: " + id);
            }
            
            System.out.println("DEBUG: Successfully permanently deleted income with id: " + id);
        } catch (Exception e) {
            System.err.println("DEBUG: Exception in deleteIncome: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /** Permanent delete with attribution (preferred when you know who deleted). */
    @Transactional
    public void deleteIncome(Long id, String deletedBy) {
        System.out.println("DEBUG: Attempting to permanently delete income with id: " + id + " by: " + deletedBy);
        
        // Check if income exists (including soft-deleted ones)
        Income income = incomeRepository.findByIdWithDeletedStatus(id);
        if (income == null) {
            throw new IncomeNotFoundException("Income not found for id: " + id);
        }
        
        System.out.println("DEBUG: Found income - ID: " + income.getId() + ", Deleted: " + income.isDeleted());
        
        // Permanently delete the record from database using native SQL
        System.out.println("DEBUG: Executing permanent delete for id: " + id);
        int deleted = incomeRepository.deleteByIdNative(id);
        System.out.println("DEBUG: Native delete affected " + deleted + " rows");
        
        if (deleted == 0) {
            throw new IncomeException("Failed to delete income with id: " + id);
        }
        
        System.out.println("DEBUG: Successfully permanently deleted income with id: " + id);
    }

    /** Restore a soft-deleted income (admin). */
    @Transactional
    public void restoreIncome(Long id) {
        int updated = incomeRepository.restore(id);
        if (updated == 0) {
            throw new IncomeException("Failed to restore income id: " + id);
        }
    }

    @Transactional(readOnly = true)
    public Income getIncomeById(Long id) {
        return incomeRepository.findById(id)
                .orElseThrow(() -> new IncomeNotFoundException("Income not found for id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Income> getIncomesByUserId(Long userId) {
        try {
            return incomeRepository.findByUserId(userId);
        } catch (Exception e) {
            throw new IncomeException("Error fetching incomes for user: " + userId);
        }
    }

    // ============================================================
    // == Totals / Period analytics (DB-side sums)
    // ============================================================

    @Transactional(readOnly = true)
    public Double getIncomeForPeriod(Long userId, LocalDate startInclusive, LocalDate endExclusive) {
        try {
            BigDecimal sum = incomeRepository.sumAmountForPeriod(userId, startInclusive, endExclusive);
            return sum.doubleValue();
        } catch (Exception e) {
            throw new IncomeException("Error fetching income for the specified period for user: " + userId);
        }
    }

    @Transactional(readOnly = true)
    public Double getIncomeForToday(Long userId) {
        LocalDate today = LocalDate.now();
        return getIncomeForPeriod(userId, today, today.plusDays(1));
    }

    @Transactional(readOnly = true)
    public Double getIncomeForCurrentWeek(Long userId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate start = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            LocalDate end = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY)).plusDays(1);
            return getIncomeForPeriod(userId, start, end);
        } catch (Exception e) {
            throw new IncomeException("Error fetching current week's income for user: " + userId);
        }
    }

    @Transactional(readOnly = true)
    public Double getIncomeForCurrentMonth(Long userId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate start = today.with(TemporalAdjusters.firstDayOfMonth());
            LocalDate end = today.with(TemporalAdjusters.lastDayOfMonth()).plusDays(1);
            return getIncomeForPeriod(userId, start, end);
        } catch (Exception e) {
            throw new IncomeException("Error fetching current month's income for user: " + userId);
        }
    }

    @Transactional(readOnly = true)
    public Double getIncomeForCurrentYear(Long userId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate start = today.with(TemporalAdjusters.firstDayOfYear());
            LocalDate end = today.with(TemporalAdjusters.lastDayOfYear()).plusDays(1);
            return getIncomeForPeriod(userId, start, end);
        } catch (Exception e) {
            throw new IncomeException("Error fetching current year's income for user: " + userId);
        }
    }

    @Transactional(readOnly = true)
    public Double getIncomeForPreviousWeek(Long userId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate start = today.minusWeeks(1).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            LocalDate end = today.minusWeeks(1).with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY)).plusDays(1);
            return getIncomeForPeriod(userId, start, end);
        } catch (Exception e) {
            throw new IncomeException("Error fetching previous week's income for user: " + userId);
        }
    }

    @Transactional(readOnly = true)
    public Double getIncomeForPreviousMonth(Long userId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate start = today.minusMonths(1).with(TemporalAdjusters.firstDayOfMonth());
            LocalDate end = today.minusMonths(1).with(TemporalAdjusters.lastDayOfMonth()).plusDays(1);
            return getIncomeForPeriod(userId, start, end);
        } catch (Exception e) {
            throw new IncomeException("Error fetching previous month's income for user: " + userId);
        }
    }

    @Transactional(readOnly = true)
    public Double getIncomeForPreviousYear(Long userId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate start = today.minusYears(1).with(TemporalAdjusters.firstDayOfYear());
            LocalDate end = today.minusYears(1).with(TemporalAdjusters.lastDayOfYear()).plusDays(1);
            return getIncomeForPeriod(userId, start, end);
        } catch (Exception e) {
            throw new IncomeException("Error fetching previous year's income for user: " + userId);
        }
    }

    // ============================================================
    // == Summaries / Top-K
    // ============================================================

    @Transactional(readOnly = true)
    public Map<String, Double> getIncomePaymentMethodSummary(Long userId) {
        try {
            List<Object[]> rows = incomeRepository.sumByPaymentMethod(userId);
            Map<String, Double> out = new HashMap<>();
            for (Object[] r : rows) {
                String method = String.valueOf(r[0]);
                BigDecimal sum = (BigDecimal) r[1];
                out.put(method, sum.doubleValue());
            }
            return out;
        } catch (Exception e) {
            throw new IncomeException("Error fetching payment method summary for user: " + userId);
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Double> getTop5HighestIncomesThisMonth(Long userId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate start = today.with(TemporalAdjusters.firstDayOfMonth());
            LocalDate end = today.with(TemporalAdjusters.lastDayOfMonth()).plusDays(1);

            List<Income> top5 = incomeRepository.findTop5ByUserIdAndIncomeDateBetweenOrderByAmountDesc(userId, start, end);

            LinkedHashMap<String, Double> result = new LinkedHashMap<>();
            for (Income inc : top5) {
                result.put(inc.getSource(), inc.getAmount().doubleValue());
            }
            return result;
        } catch (Exception e) {
            throw new IncomeException("Error fetching top-5 incomes for user " + userId);
        }
    }

    @Transactional(readOnly = true)
    public List<Double> getIncomeForWeeksOfCurrentMonth(Long userId) {
        List<Double> weeklyIncomes = new ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfMonth = today.with(TemporalAdjusters.lastDayOfMonth());

        LocalDate weekStart = startOfMonth.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        while (!weekStart.isAfter(endOfMonth)) {
            LocalDate weekEnd = weekStart.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
            if (weekEnd.isAfter(endOfMonth)) {
                weekEnd = endOfMonth;
            }
            double sum = getIncomeForPeriod(userId, weekStart, weekEnd.plusDays(1));
            weeklyIncomes.add(sum);
            weekStart = weekEnd.plusDays(1);
        }
        return weeklyIncomes;
        }

    @Transactional(readOnly = true)
    public List<Double> getIncomeForTwelveMonthsOfCurrentYear(Long userId) {
        List<Double> monthlyIncomes = new ArrayList<>(12);
        LocalDate today = LocalDate.now();
        LocalDate startOfYear = today.with(TemporalAdjusters.firstDayOfYear());

        for (int monthIndex = 0; monthIndex < 12; monthIndex++) {
            LocalDate startOfMonth = startOfYear.plusMonths(monthIndex);
            LocalDate endOfMonth = startOfMonth.with(TemporalAdjusters.lastDayOfMonth()).plusDays(1);
            double monthlyTotal = getIncomeForPeriod(userId, startOfMonth, endOfMonth);
            monthlyIncomes.add(monthlyTotal);
        }
        return monthlyIncomes;
    }

    @Transactional(readOnly = true)
    public Map<String, Double> getIncomeSourceSummary(Long userId) {
        try {
            List<Object[]> rows = incomeRepository.sumBySource(userId);
            Map<String, Double> out = new HashMap<>();
            for (Object[] r : rows) {
                String source = (String) r[0];
                BigDecimal sum = (BigDecimal) r[1];
                out.put(source, sum.doubleValue());
            }
            return out;
        } catch (Exception e) {
            throw new IncomeException("Error fetching income summary by source for user: " + userId);
        }
    }

    @Transactional(readOnly = true)
    public List<String> getDistinctSourcesByUserId(Long userId) {
        try {
            return incomeRepository.findDistinctSourcesByUserId(userId);
        } catch (Exception e) {
            throw new IncomeException("Error fetching distinct sources for user: " + userId);
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Double> getCurrentMonthPaymentMethodSummary(Long userId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate start = today.with(TemporalAdjusters.firstDayOfMonth());
            LocalDate end = today.with(TemporalAdjusters.lastDayOfMonth()).plusDays(1);
            
            System.out.println("DEBUG: Current month range for user " + userId + ": " + start + " to " + end);
            
            List<Object[]> rows = incomeRepository.sumByPaymentMethodForPeriod(userId, start, end);
            System.out.println("DEBUG: Found " + rows.size() + " payment method groups");
            
            Map<String, Double> out = new HashMap<>();
            for (Object[] r : rows) {
                String method = String.valueOf(r[0]);
                BigDecimal sum = (BigDecimal) r[1];
                out.put(method, sum.doubleValue());
                System.out.println("DEBUG: Payment method " + method + " = " + sum.doubleValue());
            }
            
            // If no data found, return empty map instead of null
            if (out.isEmpty()) {
                System.out.println("DEBUG: No payment method data found for current month");
            }
            
            return out;
        } catch (Exception e) {
            System.err.println("DEBUG: Error in getCurrentMonthPaymentMethodSummary: " + e.getMessage());
            e.printStackTrace();
            throw new IncomeException("Error fetching current month payment method summary for user: " + userId);
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Double> getCurrentMonthSourceSummary(Long userId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate start = today.with(TemporalAdjusters.firstDayOfMonth());
            LocalDate end = today.with(TemporalAdjusters.lastDayOfMonth()).plusDays(1);
            
            System.out.println("DEBUG: Current month range for user " + userId + ": " + start + " to " + end);
            
            List<Object[]> rows = incomeRepository.sumBySourceForPeriod(userId, start, end);
            System.out.println("DEBUG: Found " + rows.size() + " source groups");
            
            Map<String, Double> out = new HashMap<>();
            for (Object[] r : rows) {
                String source = (String) r[0];
                BigDecimal sum = (BigDecimal) r[1];
                out.put(source, sum.doubleValue());
                System.out.println("DEBUG: Source " + source + " = " + sum.doubleValue());
            }
            
            // If no data found, return empty map instead of null
            if (out.isEmpty()) {
                System.out.println("DEBUG: No source data found for current month");
            }
            
            return out;
        } catch (Exception e) {
            System.err.println("DEBUG: Error in getCurrentMonthSourceSummary: " + e.getMessage());
            e.printStackTrace();
            throw new IncomeException("Error fetching current month source summary for user: " + userId);
        }
    }
}
