package com.alpha.alphavault.service;

import com.alpha.alphavault.exception.IncomeException;
import com.alpha.alphavault.model.Budget;
import com.alpha.alphavault.model.Expense;
import com.alpha.alphavault.repository.BudgetRepository;
import com.alpha.alphavault.repository.ExpenseRepository;
import com.alpha.alphavault.exception.ExpenseNotFoundException;
import com.alpha.alphavault.exception.ExpenseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final BudgetService budgetService;

    @Autowired
    public ExpenseService(ExpenseRepository expenseRepository, BudgetRepository budgetRepository, BudgetService budgetService) {
        this.expenseRepository = expenseRepository;
        this.budgetService = budgetService;
    }

    public Expense saveExpense(Expense expense) {
        try {
            Expense saved = expenseRepository.save(expense);
            budgetService.syncAfterExpenseChange(saved);
            return saved;
        } catch (Exception e) {
            throw new ExpenseException("Error saving expense: " + e.getMessage());
        }
    }

    public void deleteExpense(Long id) {
        try {
            Expense expense = expenseRepository.findById(id)
                    .orElseThrow(() -> new ExpenseNotFoundException("Expense not found for id: " + id));

            expenseRepository.deleteById(id);
            budgetService.syncAfterExpenseChange(expense);

        } catch (ExpenseNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new ExpenseException("Error deleting expense: " + e.getMessage());
        }
    }

    public Expense getExpenseById(Long id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new ExpenseNotFoundException("Expense not found for id: " + id));
    }

    public List<Expense> getExpensesByUserId(Long userId) {
        try {
            return expenseRepository.findByUserId(userId);
        } catch (Exception e) {
            throw new ExpenseException("Error fetching expenses for user: " + userId);
        }
    }

    public Double getExpenseForPeriod(Long userId, LocalDate startDate, LocalDate endDate) {
        try {
            List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(userId, startDate, endDate.minusDays(1));
            return expenses.stream().mapToDouble(income -> income.getAmount().doubleValue()).sum();
        } catch (Exception e) {
            throw new IncomeException("Error fetching income for the specified period for user: " + userId);
        }
    }

    public Double getExpenseForToday(Long userId) {
        LocalDate today = LocalDate.now();
        return getExpenseForPeriod(userId, today, today.plusDays(1));
    }

    public Double getExpenseForCurrentWeek(Long userId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate startOfWeek = today.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
            LocalDate endOfWeek = today.with(TemporalAdjusters.nextOrSame(java.time.DayOfWeek.SUNDAY)).plusDays(1);
            return getExpenseForPeriod(userId, startOfWeek, endOfWeek);
        } catch (Exception e) {
            throw new ExpenseException("Error fetching current week's expense for user: " + userId);
        }
    }

    public Double getExpenseForCurrentMonth(Long userId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate startOfMonth = today.with(TemporalAdjusters.firstDayOfMonth());
            LocalDate endOfMonth = today.with(TemporalAdjusters.lastDayOfMonth()).plusDays(1);
            return getExpenseForPeriod(userId, startOfMonth, endOfMonth);
        } catch (Exception e) {
            throw new ExpenseException("Error fetching current month's income for user: " + userId);
        }
    }

    public Double getExpenseForCurrentYear(Long userId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate startOfYear = today.with(TemporalAdjusters.firstDayOfYear());
            LocalDate endOfYear = today.with(TemporalAdjusters.lastDayOfYear()).plusDays(1);
            return getExpenseForPeriod(userId, startOfYear, endOfYear);
        } catch (Exception e) {
            throw new ExpenseException("Error fetching current year's expense for user: " + userId);
        }
    }

    public Double getExpenseForPreviousWeek(Long userId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate startOfPreviousWeek = today.minusWeeks(1).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            LocalDate endOfPreviousWeek = today.minusWeeks(1).with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY)).plusDays(1);
            return getExpenseForPeriod(userId, startOfPreviousWeek, endOfPreviousWeek);
        } catch (Exception e) {
            throw new ExpenseException("Error fetching previous week's expense for user: " + userId);
        }
    }

    public Double getExpenseForPreviousMonth(Long userId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate startOfPreviousMonth = today.minusMonths(1).with(TemporalAdjusters.firstDayOfMonth());
            LocalDate endOfPreviousMonth = today.minusMonths(1).with(TemporalAdjusters.lastDayOfMonth()).plusDays(1);
            return getExpenseForPeriod(userId, startOfPreviousMonth, endOfPreviousMonth);
        } catch (Exception e) {
            throw new ExpenseException("Error fetching previous month's expense for user: " + userId);
        }
    }

    public Double getExpenseForPreviousYear(Long userId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate startOfPreviousYear = today.minusYears(1).with(TemporalAdjusters.firstDayOfYear());
            LocalDate endOfPreviousYear = today.minusYears(1).with(TemporalAdjusters.lastDayOfYear()).plusDays(1);
            return getExpenseForPeriod(userId, startOfPreviousYear, endOfPreviousYear);
        } catch (Exception e) {
            throw new ExpenseException("Error fetching previous year's expense for user: " + userId);
        }
    }

    public Map<String, Double> getExpensePaymentMethodSummary(Long userId) {
        try {
            List<Expense> expenses = getExpensesByUserId(userId);
            return expenses.stream()
                    .collect(Collectors.groupingBy(expense -> expense.getPaymentMethod().name(),
                            Collectors.mapping(Expense::getAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))))
                    .entrySet().stream()
                    .collect(Collectors.toMap(Map.Entry::getKey, entry -> entry.getValue().doubleValue()));
        } catch (Exception e) {
            throw new IncomeException("Error fetching payment method summary for user: " + userId);
        }
    }

    public List<Map<String, Object>> getTop5HighestExpensesThisMonth(Long userId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate startOfMonth = today.with(TemporalAdjusters.firstDayOfMonth());
            LocalDate endOfMonth = today.with(TemporalAdjusters.lastDayOfMonth()).plusDays(1);

            return expenseRepository.findByUserIdAndDateBetween(userId, startOfMonth, endOfMonth)
                    .stream()
                    .sorted(Comparator.comparing(Expense::getAmount).reversed())
                    .limit(5)
                    .map(expense -> {
                        Map<String, Object> map = new LinkedHashMap<>();
                        map.put("category", expense.getCategory().name());
                        map.put("amount", expense.getAmount());
                        return map;
                    })
                    .toList();
        } catch (Exception e) {
            throw new IncomeException("Error fetching top-5 expenses for user " + userId);
        }
    }

    public List<Double> getExpenseForWeeksOfCurrentMonth(Long userId) {
        List<Double> weeklyExpenses = new ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfMonth = today.with(TemporalAdjusters.lastDayOfMonth());

        LocalDate weekStart = startOfMonth.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        while (!weekStart.isAfter(endOfMonth)) {
            LocalDate weekEnd = weekStart.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
            if (weekEnd.isAfter(endOfMonth)) {
                weekEnd = endOfMonth;
            }
            double sum = getExpenseForPeriod(userId, weekStart, weekEnd.plusDays(1));
            weeklyExpenses.add(sum);
            weekStart = weekEnd.plusDays(1);
        }

        return weeklyExpenses;
    }

    public List<Double> getExpenseForTwelveMonthsOfCurrentYear(Long userId) {
        List<Double> monthlyExpenses = new ArrayList<>(12);
        LocalDate today = LocalDate.now();
        LocalDate startOfYear = today.with(TemporalAdjusters.firstDayOfYear());

        for (int monthIndex = 0; monthIndex < 12; monthIndex++) {
            LocalDate startOfMonth = startOfYear.plusMonths(monthIndex);
            LocalDate endOfMonth = startOfMonth.with(TemporalAdjusters.lastDayOfMonth()).plusDays(1);
            double monthlyTotal = getExpenseForPeriod(userId, startOfMonth, endOfMonth);
            monthlyExpenses.add(monthlyTotal);
        }

        return monthlyExpenses;
    }

    public Map<String, Double> getExpenseCategorySummary(Long userId) {
        try {
            List<Expense> expenses = getExpensesByUserId(userId);
            return expenses.stream()
                    .collect(Collectors.groupingBy(expense -> expense.getCategory().name(),
                            Collectors.mapping(Expense::getAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))))
                    .entrySet().stream()
                    .collect(Collectors.toMap(Map.Entry::getKey, entry -> entry.getValue().doubleValue()));
        } catch (Exception e) {
            throw new IncomeException("Error fetching category summary for user: " + userId);
        }
    }
}
