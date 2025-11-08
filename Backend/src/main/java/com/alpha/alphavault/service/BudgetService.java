/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Service: BudgetService — monthly budgets, categories & analytics
 *  Rules:
 *    - We NEVER store "remaining". It's derived:
 *      Budget.totalRemaining = totalBudget - totalSpent
 *      Category.remaining    = allocated    - spentAmount
 *    - totalSpent / spentAmount are cached & recomputed on sync
 *    - Includes compatibility methods from the old service
 * ================================================================
 */
package com.alpha.alphavault.service;

import com.alpha.alphavault.dto.budget.BudgetRequestDTO;
import com.alpha.alphavault.dto.budget.BudgetResponseDTO;
import com.alpha.alphavault.enums.ExpenseCategory;
import com.alpha.alphavault.exception.BudgetException;
import com.alpha.alphavault.exception.BudgetNotFoundException;
import com.alpha.alphavault.mapper.BudgetMapper;
import com.alpha.alphavault.model.Budget;
import com.alpha.alphavault.model.BudgetCategory;
import com.alpha.alphavault.model.Expense;
import com.alpha.alphavault.model.User;
import com.alpha.alphavault.repository.BudgetRepository;
import com.alpha.alphavault.repository.BudgetCategoryRepository;
import com.alpha.alphavault.repository.ExpenseRepository;
import com.alpha.alphavault.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@RequiredArgsConstructor
@Service
public class BudgetService {

    private final BudgetRepository repo;
    private final BudgetCategoryRepository categoryRepo;
    private final BudgetMapper mapper;
    private final ExpenseRepository expenseRepo;
    private final UserRepository userRepo;

    // ========================== CRUD (DTO-based) ==========================

    @Transactional
    public BudgetResponseDTO create(BudgetRequestDTO dto) {
        // Validate owner exists
        User owner = userRepo.findById(dto.userId())
                .orElseThrow(() -> new BudgetException("User not found: " + dto.userId()));

        // Enforce uniqueness (user, year, month)
        repo.findByUserIdAndYearAndMonth(dto.userId(), dto.year(), dto.month())
                .ifPresent(b -> { throw new IllegalArgumentException("Budget already exists for this month"); });

        Budget b = mapper.toEntity(dto);
        b.setUser(owner);

        try {
            Budget saved = repo.save(b);
            // initial sync from existing expenses
            syncTotals(saved.getId());
            return mapper.toResponse(saved);
        } catch (DataIntegrityViolationException e) {
            // in case DB unique constraint fires first
            throw new IllegalArgumentException("Budget already exists for this month");
        }
    }

    @Transactional
    public BudgetResponseDTO update(Long id, BudgetRequestDTO dto) {
        Budget b = repo.findById(id).orElseThrow(() -> new BudgetNotFoundException("Budget not found: " + id));

        // Keep identity immutable
        mapper.updateEntity(b, dto);

        Budget saved = repo.save(b);
        syncTotals(saved.getId());
        return mapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public BudgetResponseDTO get(Long id) {
        Budget b = repo.findById(id).orElseThrow(() -> new BudgetNotFoundException("Budget not found: " + id));
        return mapper.toResponse(b);
    }

    @Transactional(readOnly = true)
    public BudgetResponseDTO getByUserMonth(Long userId, int year, int month) {
        Budget b = repo.findByUserIdAndYearAndMonth(userId, year, month)
                .orElseThrow(() -> new BudgetNotFoundException(
                        "Budget not found for user %d (%d-%02d)".formatted(userId, year, month)));
        return mapper.toResponse(b);
    }

    @Transactional(readOnly = true)
    public Page<BudgetResponseDTO> listByUser(Long userId, Pageable pageable) {
        return repo.findByUserIdOrderByYearDescMonthDesc(userId, pageable).map(mapper::toResponse);
    }

    @Transactional
    public void delete(Long id) {
        if (!repo.existsById(id)) throw new BudgetNotFoundException("Budget not found: " + id);
        int updated = repo.softDelete(id, null);
        if (updated == 0) throw new BudgetException("Failed to delete budget: " + id);
    }

    @Transactional
    public void delete(Long id, String deletedBy) {
        if (!repo.existsById(id)) throw new BudgetNotFoundException("Budget not found: " + id);
        int updated = repo.softDelete(id, deletedBy);
        if (updated == 0) throw new BudgetException("Failed to delete budget: " + id);
    }

    @Transactional
    public void restore(Long id) {
        int updated = repo.restore(id);
        if (updated == 0) throw new BudgetException("Failed to restore budget: " + id);
    }

    // ========================== Sync / Totals ==========================

    /** Full recompute from expenses in that month (safe & simple). */
    @Transactional
    public void syncTotals(Long budgetId) {
        Budget b = repo.findById(budgetId).orElseThrow(() -> new BudgetNotFoundException("Budget not found: " + budgetId));
        LocalDate start = LocalDate.of(b.getYear(), b.getMonth(), 1);
        LocalDate endExclusive = start.with(TemporalAdjusters.lastDayOfMonth()).plusDays(1);

        var expenses = expenseRepo.findByUserIdAndExpenseDateBetween(b.getUser().getId(), start, endExclusive);

        // total spent
        BigDecimal total = expenses.stream()
                .map(Expense::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        b.setTotalSpent(total);

        // per-category
        Map<ExpenseCategory, BigDecimal> byCat = new EnumMap<>(ExpenseCategory.class);
        for (Expense e : expenses) {
            if (e.getCategory() == null || e.getAmount() == null) continue;
            byCat.merge(e.getCategory(), e.getAmount(), BigDecimal::add);
        }
        for (BudgetCategory bc : b.getCategories()) {
            bc.setSpentAmount(byCat.getOrDefault(bc.getCategory(), BigDecimal.ZERO));
        }
        repo.save(b);
    }

    /** Hook for ExpenseService: call after expense create/update/delete. */
    @Transactional
    public void syncAfterExpenseChange(Expense expense) {
        Long userId = expense.getUser().getId();
        LocalDate d = expense.getExpenseDate();
        repo.findByUserIdAndYearAndMonth(userId, d.getYear(), d.getMonthValue())
                .ifPresent(b -> syncTotals(b.getId()));
    }

    /** Optional convenience: when a budget changes, resync its totals. */
    @Transactional
    public void syncAfterBudgetChange(Budget budget) {
        syncTotals(budget.getId());
    }

    // ========================== Category Mgmt (compat) ==========================

    /**
     * Add a new category to a monthly budget.
     * - Creates the budget if it doesn't exist yet.
     * - Throws error if category already exists (no duplicates allowed).
     */
    @Transactional
    public BudgetResponseDTO addCategory(Long userId, int month, int year, ExpenseCategory category, BigDecimal allocated) {
        User owner = userRepo.findById(userId).orElseThrow(() -> new BudgetException("User not found: " + userId));

        Budget budget = repo.findByUserIdAndYearAndMonth(userId, year, month)
                .orElseGet(() -> {
                    Budget nb = new Budget();
                    nb.setUser(owner);
                    nb.setMonth(month);
                    nb.setYear(year);
                    nb.setTotalBudget(BigDecimal.ZERO);
                    nb.setCurrency(owner.getPreferredCurrency());
                    return repo.save(nb);
                });

        // Find existing category in the budget's collection
        BudgetCategory existingCategory = budget.getCategories().stream()
                .filter(c -> c.getCategory() == category)
                .findFirst()
                .orElse(null);

        if (existingCategory != null) {
            // Category already exists - throw error (don't allow duplicates)
            throw new BudgetException("Category '" + category + "' already exists in this budget");
        } else {
            // Create new category
            BudgetCategory newCategory = new BudgetCategory();
            newCategory.setBudget(budget);
            newCategory.setCategory(category);
            newCategory.setAllocated(allocated);
            newCategory.setSpentAmount(BigDecimal.ZERO);
            
            // Add to budget collection (cascade will handle saving)
            budget.getCategories().add(newCategory);
        }

        // Recompute totalBudget as sum of allocations
        BigDecimal totalAllocated = budget.getCategories().stream()
                .map(BudgetCategory::getAllocated)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        budget.setTotalBudget(totalAllocated);

        // Save budget (cascade will handle categories)
        repo.save(budget);
        syncTotals(budget.getId()); // refresh spent from expenses
        return mapper.toResponse(budget);
    }

    /**
     * Update an existing category in a monthly budget.
     * - Creates the budget if it doesn't exist yet.
     * - Updates existing category if found, creates new if not found.
     */
    @Transactional
    public BudgetResponseDTO updateCategory(Long userId, int month, int year, ExpenseCategory category, BigDecimal allocated) {
        User owner = userRepo.findById(userId).orElseThrow(() -> new BudgetException("User not found: " + userId));

        Budget budget = repo.findByUserIdAndYearAndMonth(userId, year, month)
                .orElseGet(() -> {
                    Budget nb = new Budget();
                    nb.setUser(owner);
                    nb.setMonth(month);
                    nb.setYear(year);
                    nb.setTotalBudget(BigDecimal.ZERO);
                    nb.setCurrency(owner.getPreferredCurrency());
                    return repo.save(nb);
                });

        // Find existing category in the budget's collection
        BudgetCategory existingCategory = budget.getCategories().stream()
                .filter(c -> c.getCategory() == category)
                .findFirst()
                .orElse(null);

        if (existingCategory != null) {
            // Update existing category
            existingCategory.setAllocated(allocated);
        } else {
            // Create new category if it doesn't exist
            BudgetCategory newCategory = new BudgetCategory();
            newCategory.setBudget(budget);
            newCategory.setCategory(category);
            newCategory.setAllocated(allocated);
            newCategory.setSpentAmount(BigDecimal.ZERO);
            
            // Add to budget collection (cascade will handle saving)
            budget.getCategories().add(newCategory);
        }

        // Recompute totalBudget as sum of allocations
        BigDecimal totalAllocated = budget.getCategories().stream()
                .map(BudgetCategory::getAllocated)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        budget.setTotalBudget(totalAllocated);

        // Save budget (cascade will handle categories)
        repo.save(budget);
        syncTotals(budget.getId()); // refresh spent from expenses
        return mapper.toResponse(budget);
    }

    /**
     * Delete a specific category from a monthly budget using hard delete.
     * - Finds the budget for the given user/year/month
     * - Hard deletes the specified category using repository method
     * - Recomputes totalBudget as sum of remaining allocations
     * - Returns the updated budget data
     */
    @Transactional
    public BudgetResponseDTO deleteCategory(Long userId, int month, int year, ExpenseCategory category) {
        // Validate user exists
        userRepo.findById(userId).orElseThrow(() -> new BudgetException("User not found: " + userId));

        Budget budget = repo.findByUserIdAndYearAndMonth(userId, year, month)
                .orElseThrow(() -> new BudgetNotFoundException(
                        "Budget not found for user %d (%d-%02d)".formatted(userId, year, month)));

        // Check if category exists in budget
        Optional<BudgetCategory> existingCategory = categoryRepo.findByBudgetAndCategory(budget, category);
        if (existingCategory.isEmpty()) {
            throw new BudgetNotFoundException("Category '%s' not found in budget for user %d (%d-%02d)"
                    .formatted(category, userId, year, month));
        }

        // Hard delete the category using repository method
        int deletedCount = categoryRepo.deleteByBudgetAndCategory(budget, category);
        if (deletedCount == 0) {
            throw new BudgetException("Failed to delete category '%s' from budget for user %d (%d-%02d)"
                    .formatted(category, userId, year, month));
        }

        // Reload the budget from database to get fresh data after deletion
        Budget updatedBudget = repo.findById(budget.getId())
                .orElseThrow(() -> new BudgetException("Budget not found after category deletion"));
        
        // Recompute totalBudget as sum of remaining allocations
        BigDecimal totalAllocated = updatedBudget.getCategories().stream()
                .map(BudgetCategory::getAllocated)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        updatedBudget.setTotalBudget(totalAllocated);

        repo.save(updatedBudget);
        syncTotals(updatedBudget.getId()); // refresh spent from expenses
        return mapper.toResponse(updatedBudget);
    }

    // ========================== Summaries / Aggregates (compat) ==========================

    @Transactional(readOnly = true)
    public Map<String, Object> getBudgetSummary(Long userId, int month, int year) {
        Budget b = repo.findByUserIdAndYearAndMonth(userId, year, month)
                .orElseThrow(() -> new BudgetNotFoundException("No budget found for this month/year."));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("month", b.getMonth());
        out.put("year", b.getYear());
        out.put("currency", b.getCurrency());
        out.put("totalBudget", b.getTotalBudget());
        out.put("totalSpent", b.getTotalSpent());
        out.put("totalRemaining", b.getTotalRemaining());
        out.put("categories", b.getCategories().stream().map(c -> Map.of(
                "id", c.getId(),
                "category", c.getCategory(),
                "allocated", c.getAllocated(),
                "spentAmount", c.getSpentAmount(),
                "remaining", c.getRemaining()
        )).toList());
        return out;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCurrentMonthBudgetSummary(Long userId) {
        LocalDate today = LocalDate.now();
        return getBudgetSummary(userId, today.getMonthValue(), today.getYear());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPreviousMonthBudgetSummary(Long userId) {
        LocalDate prev = LocalDate.now().minusMonths(1);
        return getBudgetSummary(userId, prev.getMonthValue(), prev.getYear());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Integer>> getAvailableBudgetPeriods(Long userId) {
        return repo.findByUserId(userId).stream()
                .map(b -> Map.of("month", b.getMonth(), "year", b.getYear()))
                .toList();
    }

    @Transactional(readOnly = true)
    public BigDecimal getAnnualBudget(Long userId, int year) {
        return repo.sumTotalBudgetByUserAndYear(userId, year);
    }

    @Transactional(readOnly = true)
    public Map<Integer, BigDecimal> getMonthlyBudgetAggregate(Long userId, int year) {
        Map<Integer, BigDecimal> out = new LinkedHashMap<>();
        for (Object[] row : repo.monthlyBudgetAggregate(userId, year)) {
            Integer month = (Integer) row[0];
            BigDecimal sum = (BigDecimal) row[1];
            out.put(month, sum);
        }
        return out;
    }

    // ========================== Legacy entity getters (compat) ==========================

    @Transactional(readOnly = true)
    public Budget getBudgetById(Long id) { return repo.findById(id).orElseThrow(() -> new BudgetNotFoundException("Budget not found for id: " + id)); }

    @Transactional(readOnly = true)
    public List<Budget> getBudgetsByUserId(Long userId) { return repo.findByUserId(userId); }

    @Transactional(readOnly = true)
    public Budget getBudgetForMonth(Long userId, int month, int year) {
        return repo.findByUserIdAndYearAndMonth(userId, year, month)
                .orElseThrow(() -> new BudgetNotFoundException("No budget found for this month/year."));
    }
}
