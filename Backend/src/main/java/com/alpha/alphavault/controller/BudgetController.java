/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Controller: BudgetController — CRUD, categories & analytics
 * ================================================================
 */
package com.alpha.alphavault.controller;

import com.alpha.alphavault.dto.budget.BudgetRequestDTO;
import com.alpha.alphavault.dto.budget.BudgetResponseDTO;
import com.alpha.alphavault.dto.common.ApiResponse;
import com.alpha.alphavault.enums.ExpenseCategory;
import com.alpha.alphavault.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService service;

    // ========================== CRUD ==========================

    @PostMapping
    public ResponseEntity<ApiResponse<BudgetResponseDTO>> create(@Valid @RequestBody BudgetRequestDTO dto) {
        var data = service.create(dto);
        return ResponseEntity.status(201).body(ApiResponse.created("Budget created", data, "/api/budgets"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BudgetResponseDTO>> update(@PathVariable Long id, @Valid @RequestBody BudgetRequestDTO dto) {
        var data = service.update(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Budget updated", data, "/api/budgets/" + id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id,
                                                    @RequestParam(name = "deletedBy", required = false) String deletedBy) {
        if (deletedBy == null || deletedBy.isBlank()) service.delete(id); else service.delete(id, deletedBy);
        return ResponseEntity.ok(ApiResponse.ok("Budget deleted", null, "/api/budgets/" + id));
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restore(@PathVariable Long id) {
        service.restore(id);
        return ResponseEntity.ok(ApiResponse.ok("Budget restored", null, "/api/budgets/" + id + "/restore"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BudgetResponseDTO>> get(@PathVariable Long id) {
        var data = service.get(id);
        return ResponseEntity.ok(ApiResponse.ok("Budget fetched", data, "/api/budgets/" + id));
    }

    @GetMapping("/user/{userId}/{year}/{month}")
    public ResponseEntity<ApiResponse<BudgetResponseDTO>> getByUserMonth(@PathVariable Long userId,
                                                                         @PathVariable int year,
                                                                         @PathVariable int month) {
        var data = service.getByUserMonth(userId, year, month);
        return ResponseEntity.ok(ApiResponse.ok("Budget fetched", data,
                "/api/budgets/user/" + userId + "/" + year + "/" + month));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Page<BudgetResponseDTO>>> listByUser(@PathVariable Long userId,
                                                                           @PageableDefault(size = 20, sort = {"year","month"}) Pageable pageable) {
        var page = service.listByUser(userId, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Budgets fetched", page, "/api/budgets/user/" + userId));
    }

    @PostMapping("/{id}/sync")
    public ResponseEntity<ApiResponse<Void>> sync(@PathVariable Long id) {
        service.syncTotals(id);
        return ResponseEntity.ok(ApiResponse.ok("Budget totals synced", null, "/api/budgets/" + id + "/sync"));
    }

    // ========================== Category (compat) ==========================

    @PostMapping("/user/{userId}/{year}/{month}/category")
    public ResponseEntity<ApiResponse<BudgetResponseDTO>> addCategory(@PathVariable Long userId,
                                                                       @PathVariable int year,
                                                                       @PathVariable int month,
                                                                       @RequestParam ExpenseCategory category,
                                                                       @RequestParam BigDecimal allocated) {
        var data = service.addCategory(userId, month, year, category, allocated);
        return ResponseEntity.ok(ApiResponse.ok("Category added", data,
                "/api/budgets/user/" + userId + "/" + year + "/" + month + "/category"));
    }

    @PutMapping("/user/{userId}/{year}/{month}/category")
    public ResponseEntity<ApiResponse<BudgetResponseDTO>> updateCategory(@PathVariable Long userId,
                                                                        @PathVariable int year,
                                                                        @PathVariable int month,
                                                                        @RequestParam ExpenseCategory category,
                                                                        @RequestParam BigDecimal allocated) {
        var data = service.updateCategory(userId, month, year, category, allocated);
        return ResponseEntity.ok(ApiResponse.ok("Category updated", data,
                "/api/budgets/user/" + userId + "/" + year + "/" + month + "/category"));
    }

    @DeleteMapping("/user/{userId}/{year}/{month}/category")
    public ResponseEntity<ApiResponse<BudgetResponseDTO>> deleteCategory(@PathVariable Long userId,
                                                                        @PathVariable int year,
                                                                        @PathVariable int month,
                                                                        @RequestParam("category") ExpenseCategory category) {
        var data = service.deleteCategory(userId, month, year, category);
        return ResponseEntity.ok(ApiResponse.ok("Category deleted", data,
                "/api/budgets/user/" + userId + "/" + year + "/" + month + "/category"));
    }

    // ========================== Summaries / Aggregates (compat) ==========================

    @GetMapping("/user/{userId}/summary/current")
    public ResponseEntity<ApiResponse<Map<String, Object>>> currentSummary(@PathVariable Long userId) {
        var data = service.getCurrentMonthBudgetSummary(userId);
        return ResponseEntity.ok(ApiResponse.ok("Current month summary", data, "/api/budgets/user/" + userId + "/summary/current"));
    }

    @GetMapping("/user/{userId}/summary/previous")
    public ResponseEntity<ApiResponse<Map<String, Object>>> previousSummary(@PathVariable Long userId) {
        var data = service.getPreviousMonthBudgetSummary(userId);
        return ResponseEntity.ok(ApiResponse.ok("Previous month summary", data, "/api/budgets/user/" + userId + "/summary/previous"));
    }

    @GetMapping("/user/{userId}/periods")
    public ResponseEntity<ApiResponse<List<Map<String, Integer>>>> periods(@PathVariable Long userId) {
        var data = service.getAvailableBudgetPeriods(userId);
        return ResponseEntity.ok(ApiResponse.ok("Available budget periods", data, "/api/budgets/user/" + userId + "/periods"));
    }

    @GetMapping("/user/{userId}/annual/{year}")
    public ResponseEntity<ApiResponse<BigDecimal>> annual(@PathVariable Long userId, @PathVariable int year) {
        var data = service.getAnnualBudget(userId, year);
        return ResponseEntity.ok(ApiResponse.ok("Annual budget", data, "/api/budgets/user/" + userId + "/annual/" + year));
    }

    @GetMapping("/user/{userId}/aggregate/{year}")
    public ResponseEntity<ApiResponse<Map<Integer, BigDecimal>>> aggregate(@PathVariable Long userId, @PathVariable int year) {
        var data = service.getMonthlyBudgetAggregate(userId, year);
        return ResponseEntity.ok(ApiResponse.ok("Monthly budget aggregate", data, "/api/budgets/user/" + userId + "/aggregate/" + year));
    }
}
