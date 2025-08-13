package com.alpha.alphavault.service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

import com.alpha.alphavault.enums.ExpenseCategory;
import com.alpha.alphavault.model.Budget;
import com.alpha.alphavault.model.BudgetCategory;
import com.alpha.alphavault.model.Expense;
import com.alpha.alphavault.repository.BudgetRepository;
import com.alpha.alphavault.repository.ExpenseRepository;

// Unified Budget/Expense Synchronization Logic
// Ensures expenses dynamically affect budget allocations and remaining values

public class BudgetSyncService {

    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;

    public BudgetSyncService(BudgetRepository budgetRepository, ExpenseRepository expenseRepository) {
        this.budgetRepository = budgetRepository;
        this.expenseRepository = expenseRepository;
    }

    public void syncAfterExpenseChange(Expense expense) {
        Long userId = expense.getUser().getId();
        int month = expense.getDate().getMonthValue();
        int year = expense.getDate().getYear();

        Optional<Budget> optionalBudget = budgetRepository.findByUserIdAndMonthAndYear(userId, month, year);

        if (optionalBudget.isEmpty()) return;

        Budget budget = optionalBudget.get();

        // Step 1: Sum all expenses per category for this period
        List<Expense> expenses = expenseRepository.findByUserIdAndMonthAndYear(userId, month, year);
Map<ExpenseCategory, BigDecimal> expenseTotals = expenses.stream()
    .collect(Collectors.groupingBy(
        Expense::getCategory,
        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)
    ));

        // Step 2: Update category remaining values
        BigDecimal totalBudget = BigDecimal.ZERO;
        BigDecimal totalRemaining = BigDecimal.ZERO;

for (BudgetCategory category : budget.getCategories()) {
    BigDecimal allocated = category.getAllocated();
BigDecimal spent = expenseTotals.getOrDefault(category.getCategory(), BigDecimal.ZERO);
    BigDecimal remaining = allocated.subtract(spent);
    category.setRemaining(remaining);
    totalBudget = totalBudget.add(allocated);
    totalRemaining = totalRemaining.add(remaining);
}


        budget.setTotalBudget(totalBudget);
        budget.setTotalRemaining(totalRemaining);
        budgetRepository.save(budget);
    }

    public void syncAfterBudgetChange(Budget budget) {
        Long userId = budget.getUser().getId();
        int month = budget.getMonth();
        int year = budget.getYear();

        List<Expense> expenses = expenseRepository.findByUserIdAndMonthAndYear(userId, month, year);

        Map<String, BigDecimal> expenseTotals = expenses.stream()
            .collect(Collectors.groupingBy(
e -> e.getCategory().name(),
                Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)
            ));

        BigDecimal totalBudget = BigDecimal.ZERO;
        BigDecimal totalRemaining = BigDecimal.ZERO;

        for (BudgetCategory category : budget.getCategories()) {
            BigDecimal allocated = category.getAllocated();
            BigDecimal spent = expenseTotals.getOrDefault(category.getCategory(), BigDecimal.ZERO);
            BigDecimal remaining = allocated.subtract(spent);

            category.setRemaining(remaining);
            totalBudget = totalBudget.add(allocated);
            totalRemaining = totalRemaining.add(remaining);
        }

        budget.setTotalBudget(totalBudget);
        budget.setTotalRemaining(totalRemaining);
        budgetRepository.save(budget);
    }
}

