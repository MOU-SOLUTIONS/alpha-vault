/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Service: ExpenseService - analytics, totals, soft delete
 * ================================================================
 */
package com.alpha.alphavault.service;

import com.alpha.alphavault.dto.expense.ExpenseRequestDTO;
import com.alpha.alphavault.dto.expense.ExpenseResponseDTO;
import com.alpha.alphavault.exception.ExpenseException;
import com.alpha.alphavault.exception.ExpenseNotFoundException;
import com.alpha.alphavault.mapper.ExpenseMapper;
import com.alpha.alphavault.model.Expense;
import com.alpha.alphavault.repository.ExpenseRepository;
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
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseMapper expenseMapper;
    private final BudgetService budgetService; // keep your hook

    // ============================================================
    // == CRUD with DTOs (new, recommended)
    // ============================================================

    @Transactional
    public ExpenseResponseDTO create(ExpenseRequestDTO dto) {
        try {
            Expense exp = expenseMapper.toEntity(dto);
            Expense saved = expenseRepository.save(exp);
            // sync budget after change
            if (budgetService != null) budgetService.syncAfterExpenseChange(saved);
            return expenseMapper.toResponse(saved);
        } catch (Exception e) {
            throw new ExpenseException("Error creating expense: " + e.getMessage());
        }
    }

    @Transactional
    public ExpenseResponseDTO update(Long id, ExpenseRequestDTO dto) {
        Expense exp = expenseRepository.findById(id)
                .orElseThrow(() -> new ExpenseNotFoundException("Expense not found for id: " + id));
        expenseMapper.updateEntity(exp, dto);
        Expense saved = expenseRepository.save(exp);
        if (budgetService != null) budgetService.syncAfterExpenseChange(saved);
        return expenseMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public ExpenseResponseDTO getDtoById(Long id) {
        Expense exp = expenseRepository.findById(id)
                .orElseThrow(() -> new ExpenseNotFoundException("Expense not found for id: " + id));
        return expenseMapper.toResponse(exp);
    }

    @Transactional(readOnly = true)
    public Page<ExpenseResponseDTO> listByUser(Long userId, Pageable pageable) {
        return expenseRepository.findByUserIdOrderByExpenseDateDesc(userId, pageable)
                .map(expenseMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ExpenseResponseDTO> listByUserAndDateRange(Long userId, LocalDate startInclusive, LocalDate endInclusive, Pageable pageable) {
        return expenseRepository.findByUserIdAndExpenseDateBetweenOrderByExpenseDateDesc(userId, startInclusive, endInclusive, pageable)
                .map(expenseMapper::toResponse);
    }

    // ============================================================
    // == Legacy CRUD kept for compatibility (your old methods)
    // ============================================================

    @Transactional
    public Expense saveExpense(Expense expense) {
        try {
            Expense saved = expenseRepository.save(expense);
            if (budgetService != null) budgetService.syncAfterExpenseChange(saved);
            return saved;
        } catch (Exception e) {
            throw new ExpenseException("Error saving expense: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteExpense(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ExpenseNotFoundException("Expense not found for id: " + id));

        // Hard delete - permanently remove from database
        int deleted = expenseRepository.deleteByIdNative(id);
        if (deleted == 0) throw new ExpenseException("Failed to delete expense id: " + id);

        if (budgetService != null) budgetService.syncAfterExpenseChange(expense);
    }

    /** Soft delete with attribution (preferred when you know who deleted). */
    @Transactional
    public void deleteExpense(Long id, String deletedBy) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ExpenseNotFoundException("Expense not found for id: " + id));

        int updated = expenseRepository.softDelete(id, deletedBy);
        if (updated == 0) throw new ExpenseException("Failed to soft delete expense id: " + id);

        if (budgetService != null) budgetService.syncAfterExpenseChange(expense);
    }

    /** Restore a soft-deleted expense (admin). */
    @Transactional
    public void restoreExpense(Long id) {
        int updated = expenseRepository.restore(id);
        if (updated == 0) throw new ExpenseException("Failed to restore expense id: " + id);
    }

    @Transactional(readOnly = true)
    public Expense getExpenseById(Long id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new ExpenseNotFoundException("Expense not found for id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Expense> getExpensesByUserId(Long userId) {
        try {
            return expenseRepository.findByUserId(userId);
        } catch (Exception e) {
            throw new ExpenseException("Error fetching expenses for user: " + userId);
        }
    }

    // ============================================================
    // == Totals / Period analytics (DB-side sums)
    // ============================================================

    @Transactional(readOnly = true)
    public Double getExpenseForPeriod(Long userId, LocalDate startInclusive, LocalDate endExclusive) {
        try {
            BigDecimal sum = expenseRepository.sumAmountForPeriod(userId, startInclusive, endExclusive);
            return sum.doubleValue();
        } catch (Exception e) {
            throw new ExpenseException("Error fetching expense for the specified period for user: " + userId);
        }
    }

    @Transactional(readOnly = true)
    public Double getExpenseForToday(Long userId) {
        LocalDate today = LocalDate.now();
        return getExpenseForPeriod(userId, today, today.plusDays(1));
    }

    @Transactional(readOnly = true)
    public Double getExpenseForCurrentWeek(Long userId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate start = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            LocalDate end = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY)).plusDays(1);
            return getExpenseForPeriod(userId, start, end);
        } catch (Exception e) {
            throw new ExpenseException("Error fetching current week's expense for user: " + userId);
        }
    }

    @Transactional(readOnly = true)
    public Double getExpenseForCurrentMonth(Long userId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate start = today.with(TemporalAdjusters.firstDayOfMonth());
            LocalDate end = today.with(TemporalAdjusters.lastDayOfMonth()).plusDays(1);
            return getExpenseForPeriod(userId, start, end);
        } catch (Exception e) {
            throw new ExpenseException("Error fetching current month's expense for user: " + userId);
        }
    }

    @Transactional(readOnly = true)
    public Double getExpenseForCurrentYear(Long userId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate start = today.with(TemporalAdjusters.firstDayOfYear());
            LocalDate end = today.with(TemporalAdjusters.lastDayOfYear()).plusDays(1);
            return getExpenseForPeriod(userId, start, end);
        } catch (Exception e) {
            throw new ExpenseException("Error fetching current year's expense for user: " + userId);
        }
    }

    @Transactional(readOnly = true)
    public Double getExpenseForPreviousWeek(Long userId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate start = today.minusWeeks(1).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            LocalDate end = today.minusWeeks(1).with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY)).plusDays(1);
            return getExpenseForPeriod(userId, start, end);
        } catch (Exception e) {
            throw new ExpenseException("Error fetching previous week's expense for user: " + userId);
        }
    }

    @Transactional(readOnly = true)
    public Double getExpenseForPreviousMonth(Long userId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate start = today.minusMonths(1).with(TemporalAdjusters.firstDayOfMonth());
            LocalDate end = today.minusMonths(1).with(TemporalAdjusters.lastDayOfMonth()).plusDays(1);
            return getExpenseForPeriod(userId, start, end);
        } catch (Exception e) {
            throw new ExpenseException("Error fetching previous month's expense for user: " + userId);
        }
    }

    @Transactional(readOnly = true)
    public Double getExpenseForPreviousYear(Long userId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate start = today.minusYears(1).with(TemporalAdjusters.firstDayOfYear());
            LocalDate end = today.minusYears(1).with(TemporalAdjusters.lastDayOfYear()).plusDays(1);
            return getExpenseForPeriod(userId, start, end);
        } catch (Exception e) {
            throw new ExpenseException("Error fetching previous year's expense for user: " + userId);
        }
    }

    // ============================================================
    // == Summaries / Top-K (DB-side)
    // ============================================================

    @Transactional(readOnly = true)
    public Map<String, Double> getExpensePaymentMethodSummary(Long userId) {
        try {
            List<Object[]> rows = expenseRepository.sumByPaymentMethod(userId);
            Map<String, Double> out = new HashMap<>();
            for (Object[] r : rows) {
                String method = String.valueOf(r[0]);
                BigDecimal sum = (BigDecimal) r[1];
                out.put(method, sum.doubleValue());
            }
            return out;
        } catch (Exception e) {
            throw new ExpenseException("Error fetching payment method summary for user: " + userId);
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Double> getExpenseCategorySummary(Long userId) {
        try {
            List<Object[]> rows = expenseRepository.sumByCategory(userId);
            Map<String, Double> out = new HashMap<>();
            for (Object[] r : rows) {
                String category = String.valueOf(r[0]);
                BigDecimal sum = (BigDecimal) r[1];
                out.put(category, sum.doubleValue());
            }
            return out;
        } catch (Exception e) {
            throw new ExpenseException("Error fetching category summary for user: " + userId);
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Double> getCurrentMonthExpensePaymentMethodSummary(Long userId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate start = today.with(TemporalAdjusters.firstDayOfMonth());
            LocalDate end = today.with(TemporalAdjusters.lastDayOfMonth()).plusDays(1);
            
            List<Object[]> rows = expenseRepository.sumByPaymentMethodForPeriod(userId, start, end);
            Map<String, Double> out = new HashMap<>();
            for (Object[] r : rows) {
                String method = String.valueOf(r[0]);
                BigDecimal sum = (BigDecimal) r[1];
                out.put(method, sum.doubleValue());
            }
            return out;
        } catch (Exception e) {
            throw new ExpenseException("Error fetching current month payment method summary for user: " + userId);
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Double> getCurrentMonthExpenseCategorySummary(Long userId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate start = today.with(TemporalAdjusters.firstDayOfMonth());
            LocalDate end = today.with(TemporalAdjusters.lastDayOfMonth()).plusDays(1);
            
            List<Object[]> rows = expenseRepository.sumByCategoryForPeriod(userId, start, end);
            Map<String, Double> out = new HashMap<>();
            for (Object[] r : rows) {
                String category = String.valueOf(r[0]);
                BigDecimal sum = (BigDecimal) r[1];
                out.put(category, sum.doubleValue());
            }
            return out;
        } catch (Exception e) {
            throw new ExpenseException("Error fetching current month category summary for user: " + userId);
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Double> getTop5HighestExpensesThisMonth(Long userId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate start = today.with(TemporalAdjusters.firstDayOfMonth());
            LocalDate end = today.with(TemporalAdjusters.lastDayOfMonth()).plusDays(1);

            List<Expense> top5 = expenseRepository.findTop5ByUserIdAndExpenseDateBetweenOrderByAmountDesc(userId, start, end);

            LinkedHashMap<String, Double> result = new LinkedHashMap<>();
            for (Expense e : top5) {
                result.put(e.getCategory().name(), e.getAmount().doubleValue());
            }
            return result;
        } catch (Exception e) {
            throw new ExpenseException("Error fetching top-5 expenses for user " + userId);
        }
    }

    /** Back-compat variant returning a list of maps (category, amount). */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTop5HighestExpensesThisMonthList(Long userId) {
        Map<String, Double> map = getTop5HighestExpensesThisMonth(userId);
        List<Map<String, Object>> out = new ArrayList<>();
        map.forEach((k, v) -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("category", k);
            row.put("amount", v);
            out.add(row);
        });
        return out;
    }

    // ============================================================
    // == Series: weekly of month & 12 months of year
    // ============================================================

    @Transactional(readOnly = true)
    public List<Double> getExpenseForWeeksOfCurrentMonth(Long userId) {
        List<Double> weekly = new ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfMonth = today.with(TemporalAdjusters.lastDayOfMonth());

        LocalDate weekStart = startOfMonth.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        while (!weekStart.isAfter(endOfMonth)) {
            LocalDate weekEnd = weekStart.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
            if (weekEnd.isAfter(endOfMonth)) weekEnd = endOfMonth;
            double sum = getExpenseForPeriod(userId, weekStart, weekEnd.plusDays(1));
            weekly.add(sum);
            weekStart = weekEnd.plusDays(1);
        }
        return weekly;
    }

    @Transactional(readOnly = true)
    public List<Double> getExpenseForTwelveMonthsOfCurrentYear(Long userId) {
        List<Double> monthly = new ArrayList<>(12);
        LocalDate today = LocalDate.now();
        LocalDate startOfYear = today.with(TemporalAdjusters.firstDayOfYear());

        for (int m = 0; m < 12; m++) {
            LocalDate startOfMonth = startOfYear.plusMonths(m);
            LocalDate endOfMonth = startOfMonth.with(TemporalAdjusters.lastDayOfMonth()).plusDays(1);
            monthly.add(getExpenseForPeriod(userId, startOfMonth, endOfMonth));
        }
        return monthly;
    }
}
