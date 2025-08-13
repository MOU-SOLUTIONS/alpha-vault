package com.alpha.alphavault.controller;

import com.alpha.alphavault.dto.BudgetRequestDTO;
import com.alpha.alphavault.dto.BudgetResponseDTO;
import com.alpha.alphavault.enums.ExpenseCategory;
import com.alpha.alphavault.exception.BudgetNotFoundException;
import com.alpha.alphavault.mapper.BudgetMapper;
import com.alpha.alphavault.model.Budget;
import com.alpha.alphavault.service.BudgetService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/budget")
public class BudgetController {

    private final BudgetService budgetService;
    private final BudgetMapper budgetMapper;

    public BudgetController(BudgetService budgetService, BudgetMapper budgetMapper) {
        this.budgetService = budgetService;
        this.budgetMapper = budgetMapper;
    }

    /** CREATE or UPDATE a budget */
    @PostMapping
    public ResponseEntity<BudgetResponseDTO> saveBudget(@RequestBody BudgetRequestDTO dto) {
        Budget saved = budgetService.saveBudget(budgetMapper.toEntity(dto));
        return ResponseEntity.ok(budgetMapper.fromEntity(saved));
    }

    /** UPDATE an existing budget by ID */
@PutMapping("/{id}")
public ResponseEntity<BudgetResponseDTO> updateBudget(@PathVariable Long id,
                                                      @RequestBody BudgetRequestDTO dto) {
    Budget existing = budgetService.getBudgetById(id); // fetch to validate existence
    Budget updated = budgetMapper.toEntity(dto);
    updated.setId(id); // ensure ID is preserved
    Budget saved = budgetService.saveBudget(updated);
    return ResponseEntity.ok(budgetMapper.fromEntity(saved));
}


    /** DELETE a budget */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBudget(@PathVariable Long id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.ok("Budget deleted successfully.");
    }

    /** GET by ID */
    @GetMapping("/{id}")
    public ResponseEntity<BudgetResponseDTO> getBudgetById(@PathVariable Long id) {
        return ResponseEntity.ok(budgetMapper.fromEntity(budgetService.getBudgetById(id)));
    }

    /** GET all budgets for user */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BudgetResponseDTO>> getBudgetsByUser(@PathVariable Long userId) {
        List<Budget> budgets = budgetService.getBudgetsByUserId(userId);
        return ResponseEntity.ok(
                budgets.stream().map(budgetMapper::fromEntity).collect(Collectors.toList()));
    }

    /** GET current month summary */
    @GetMapping("/summary/current/{userId}")
    public ResponseEntity<Map<String, Object>> getCurrentMonthSummary(@PathVariable Long userId) {
        return ResponseEntity.ok(budgetService.getCurrentMonthBudgetSummary(userId));
    }

    /** GET previous month summary */
    @GetMapping("/summary/previous/{userId}")
    public ResponseEntity<Map<String, Object>> getPreviousMonthSummary(@PathVariable Long userId) {
        return ResponseEntity.ok(budgetService.getPreviousMonthBudgetSummary(userId));
    }

    /** GET available months/years for budgets */
    @GetMapping("/periods/{userId}")
    public ResponseEntity<List<Map<String, Integer>>> getAvailableBudgetPeriods(@PathVariable Long userId) {
        return ResponseEntity.ok(budgetService.getAvailableBudgetPeriods(userId));
    }

    /** GET total annual budget */
    @GetMapping("/total/year/{userId}")
    public ResponseEntity<BigDecimal> getAnnualBudget(@PathVariable Long userId,
                                                      @RequestParam int year) {
        return ResponseEntity.ok(budgetService.getAnnualBudget(userId, year));
    }

    /** GET monthly aggregate (map of month -> totalBudget) */
    @GetMapping("/aggregate/monthly/{userId}")
    public ResponseEntity<Map<Integer, BigDecimal>> getMonthlyAggregate(@PathVariable Long userId,
                                                                        @RequestParam int year) {
        return ResponseEntity.ok(budgetService.getMonthlyBudgetAggregate(userId, year));
    }

@GetMapping("/month/{userId}")
public ResponseEntity<?> getMonthlyBudget(@PathVariable Long userId,
                                          @RequestParam int month,
                                          @RequestParam int year) {
    try {
        Budget budget = budgetService.getBudgetForMonth(userId, month, year);
        return ResponseEntity.ok(budgetMapper.fromEntity(budget));
    } catch (BudgetNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                             .body("No budget found for specified month/year.");
    }
}

@PostMapping("/category")
public ResponseEntity<BudgetResponseDTO> addOrUpdateCategory(@RequestBody Map<String, Object> payload) {
    Long userId = Long.valueOf(payload.get("userId").toString());
    int month = (int) payload.get("month");
    int year = (int) payload.get("year");
    ExpenseCategory category = ExpenseCategory.valueOf(payload.get("category").toString());
    BigDecimal allocated = new BigDecimal(payload.get("allocated").toString());

    Budget updated = budgetService.addOrUpdateCategory(userId, month, year, category, allocated);
    return ResponseEntity.ok(budgetMapper.fromEntity(updated));
}




}
