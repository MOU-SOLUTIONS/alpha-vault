package com.alpha.alphavault.service;

import com.alpha.alphavault.enums.ExpenseCategory;
import com.alpha.alphavault.exception.BudgetException;
import com.alpha.alphavault.exception.BudgetNotFoundException;
import com.alpha.alphavault.model.Budget;
import com.alpha.alphavault.model.BudgetCategory;
import com.alpha.alphavault.model.Expense;
import com.alpha.alphavault.model.User;
import com.alpha.alphavault.repository.BudgetRepository;
import com.alpha.alphavault.repository.ExpenseRepository;
import com.alpha.alphavault.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public BudgetService(BudgetRepository budgetRepository, ExpenseRepository expenseRepository, UserRepository userRepository) {
        this.budgetRepository = budgetRepository;
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
    }

    public Budget addOrUpdateCategory(Long userId, int month, int year, ExpenseCategory category, BigDecimal allocated) {
        User user = userRepository.findById(userId).orElseThrow(() -> new BudgetException("User not found: " + userId));

        Budget budget = budgetRepository.findByUserIdAndMonthAndYear(userId, month, year)
                .orElseGet(() -> {
                    Budget newBudget = new Budget();
                    newBudget.setUser(user);
                    newBudget.setMonth(month);
                    newBudget.setYear(year);
                    newBudget.setCategories(new ArrayList<>());
                    newBudget.setTotalBudget(BigDecimal.ZERO);
                    newBudget.setTotalRemaining(BigDecimal.ZERO);
                    return newBudget;
                });

        List<BudgetCategory> categories = budget.getCategories();
        Optional<BudgetCategory> existing = categories.stream()
                .filter(c -> c.getCategory() == category)
                .findFirst();

        if (existing.isPresent()) {
            existing.get().setAllocated(allocated);
        } else {
            BudgetCategory newCategory = new BudgetCategory();
            newCategory.setCategory(category);
            newCategory.setAllocated(allocated);
            newCategory.setRemaining(allocated);
            categories.add(newCategory);
        }

        return recalculate(budget);
    }

    public Budget getBudgetById(Long id) {
        return budgetRepository.findById(id)
                .orElseThrow(() -> new BudgetNotFoundException("Budget not found for id: " + id));
    }

    public void deleteBudget(Long id) {
        if (!budgetRepository.existsById(id)) {
            throw new BudgetNotFoundException("Budget not found for id: " + id);
        }
        budgetRepository.deleteById(id);
    }

    public List<Budget> getBudgetsByUserId(Long userId) {
        return budgetRepository.findByUserId(userId);
    }

    public Budget getBudgetForMonth(Long userId, int month, int year) {
        return budgetRepository.findByUserIdAndMonthAndYear(userId, month, year)
                .orElseThrow(() -> new BudgetNotFoundException("No budget found for this month/year."));
    }

    public Map<String, Object> getCurrentMonthBudgetSummary(Long userId) {
        LocalDate today = LocalDate.now();
        return getBudgetSummary(userId, today.getMonthValue(), today.getYear());
    }

    public Map<String, Object> getPreviousMonthBudgetSummary(Long userId) {
        LocalDate today = LocalDate.now().minusMonths(1);
        return getBudgetSummary(userId, today.getMonthValue(), today.getYear());
    }

    private Map<String, Object> getBudgetSummary(Long userId, int month, int year) {
        Budget budget = getBudgetForMonth(userId, month, year);
        Map<String, Object> summary = new HashMap<>();
        summary.put("month", budget.getMonth());
        summary.put("year", budget.getYear());
        summary.put("totalBudget", budget.getTotalBudget());
        summary.put("totalRemaining", budget.getTotalRemaining());
        summary.put("categories", budget.getCategories());
        return summary;
    }

    public List<Map<String, Integer>> getAvailableBudgetPeriods(Long userId) {
        return getBudgetsByUserId(userId).stream()
                .map(budget -> {
                    Map<String, Integer> entry = new HashMap<>();
                    entry.put("month", budget.getMonth());
                    entry.put("year", budget.getYear());
                    return entry;
                }).collect(Collectors.toList());
    }

    public BigDecimal getAnnualBudget(Long userId, int year) {
        return getBudgetsByUserId(userId).stream()
                .filter(b -> b.getYear() == year)
                .map(Budget::getTotalBudget)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public Map<Integer, BigDecimal> getMonthlyBudgetAggregate(Long userId, int year) {
        Map<Integer, BigDecimal> result = new HashMap<>();
        getBudgetsByUserId(userId).stream()
                .filter(b -> b.getYear() == year)
                .forEach(b -> result.merge(b.getMonth(), b.getTotalBudget(), BigDecimal::add));
        return result;
    }

    public Budget syncAfterExpenseChange(Expense expense) {
        Long userId = expense.getUser().getId();
        int month = expense.getDate().getMonthValue();
        int year = expense.getDate().getYear();

        Optional<Budget> optionalBudget = budgetRepository.findByUserIdAndMonthAndYear(userId, month, year);
        if (optionalBudget.isEmpty()) return null;

        Budget budget = optionalBudget.get();
        return recalculate(budget);
    }

   public Budget saveBudget(Budget budget) {
    try {
        Set<ExpenseCategory> seen = new HashSet<>();
        List<BudgetCategory> freshList = new ArrayList<>();

        for (BudgetCategory cat : budget.getCategories()) {
            if (!seen.add(cat.getCategory())) {
                throw new BudgetException("Duplicate category: " + cat.getCategory());
            }
            BudgetCategory fresh = new BudgetCategory();
            fresh.setCategory(cat.getCategory());
            fresh.setAllocated(cat.getAllocated());
            fresh.setRemaining(cat.getRemaining()); // safe to keep here for initial state
            freshList.add(fresh);
        }

        budget.setCategories(freshList);

        // ✅ Recalculate after saving changes
        return recalculate(budget);

    } catch (Exception e) {
        throw new BudgetException("Error saving budget: " + e.getMessage());
    }
}


    private Budget recalculate(Budget budget) {
        Long userId = budget.getUser().getId();
        int month = budget.getMonth();
        int year = budget.getYear();

        List<Expense> expenses = expenseRepository.findByUserIdAndMonthAndYear(userId, month, year);

        Map<ExpenseCategory, BigDecimal> expenseTotals = expenses.stream()
                .collect(Collectors.groupingBy(
                        Expense::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)
                ));

        BigDecimal totalAllocated = BigDecimal.ZERO;
        BigDecimal totalRemaining = BigDecimal.ZERO;

        for (BudgetCategory cat : budget.getCategories()) {
            BigDecimal allocated = cat.getAllocated();
            BigDecimal spent = expenseTotals.getOrDefault(cat.getCategory(), BigDecimal.ZERO);
            BigDecimal remaining = allocated.subtract(spent);

            cat.setRemaining(remaining);
            totalAllocated = totalAllocated.add(allocated);
            totalRemaining = totalRemaining.add(remaining);
        }

        budget.setTotalBudget(totalAllocated);
        budget.setTotalRemaining(totalRemaining);

        return budgetRepository.save(budget);
    }
} 
