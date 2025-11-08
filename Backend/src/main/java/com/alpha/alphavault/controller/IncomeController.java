/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Controller: IncomeController - CRUD + analytics (soft delete)
 * ================================================================
 */
package com.alpha.alphavault.controller;

import com.alpha.alphavault.dto.common.ApiResponse;
import com.alpha.alphavault.dto.income.IncomeRequestDTO;
import com.alpha.alphavault.dto.income.IncomeResponseDTO;
import com.alpha.alphavault.dto.income.PaymentMethodSummary;
import com.alpha.alphavault.dto.income.SourceSummary;
import com.alpha.alphavault.exception.IncomeException;
import com.alpha.alphavault.exception.IncomeNotFoundException;
import com.alpha.alphavault.model.Income;
import com.alpha.alphavault.repository.IncomeRepository;
import com.alpha.alphavault.service.IncomeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/incomes") // change to "/api/income" if you need to keep old path
public class IncomeController {

    private final IncomeService incomeService;
    private final IncomeRepository incomeRepository;

    // ============================================================
    // == Test endpoint for debugging
    // ============================================================
    
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Income controller is working! CORS and basic connectivity are functional.");
    }

    @GetMapping("/test-delete/{id}")
    public ResponseEntity<Map<String, Object>> testDelete(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            Income income = incomeRepository.findByIdWithDeletedStatus(id);
            result.put("found", income != null);
            if (income != null) {
                result.put("id", income.getId());
                result.put("deleted", income.isDeleted());
                result.put("deletedAt", income.getDeletedAt());
                result.put("deletedBy", income.getDeletedBy());
                result.put("version", income.getVersion());
                result.put("source", income.getSource());
                result.put("amount", income.getAmount());
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("error", e.getMessage());
            return ResponseEntity.status(500).body(result);
        }
    }
    
    @PutMapping("/test-update/{id}")
    public ResponseEntity<Map<String, Object>> testUpdate(@PathVariable Long id, @RequestBody IncomeRequestDTO dto) {
        Map<String, Object> result = new HashMap<>();
        try {
            System.out.println("DEBUG: Test update called for id: " + id);
            System.out.println("DEBUG: DTO received: " + dto);
            IncomeResponseDTO updatedIncome = incomeService.update(id, dto);
            result.put("success", true);
            result.put("data", updatedIncome);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("DEBUG: Test update error: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            result.put("success", false);
            result.put("error", e.getMessage());
            result.put("errorType", e.getClass().getSimpleName());
            return ResponseEntity.status(500).body(result);
        }
    }
    
    @PostMapping("/fix-versions")
    public ResponseEntity<Map<String, Object>> fixVersions() {
        Map<String, Object> result = new HashMap<>();
        try {
            System.out.println("DEBUG: Fixing version fields for all income records...");
            // Use a simple approach - get all incomes and update them
            List<Income> incomes = incomeRepository.findAll();
            int updated = 0;
            for (Income income : incomes) {
                if (income.getVersion() == null) {
                    income.setVersion(0L);
                    incomeRepository.save(income);
                    updated++;
                    System.out.println("DEBUG: Fixed version for income ID: " + income.getId());
                }
            }
            result.put("success", true);
            result.put("updated", updated);
            result.put("message", "Fixed " + updated + " income records with null version fields");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("DEBUG: Fix versions error: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            result.put("success", false);
            result.put("error", e.getMessage());
            return ResponseEntity.status(500).body(result);
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = Map.of(
            "status", "UP",
            "timestamp", System.currentTimeMillis(),
            "controller", "IncomeController",
            "message", "Service is healthy and accessible"
        );
        return ResponseEntity.ok(health);
    }

    // ============================================================
    // == CRUD (DTO-based)
    // ============================================================

    @PostMapping
    public ResponseEntity<ApiResponse<IncomeResponseDTO>> create(@Valid @RequestBody IncomeRequestDTO dto) {
        var data = incomeService.create(dto);
        return ResponseEntity.status(201)
                .body(ApiResponse.created("Income created", data, "/api/incomes"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<IncomeResponseDTO>> update(@PathVariable Long id,
                                                                 @Valid @RequestBody IncomeRequestDTO dto) {
        try {
            var data = incomeService.update(id, dto);
            return ResponseEntity.ok(ApiResponse.ok("Income updated", data, "/api/incomes/" + id));
        } catch (IncomeNotFoundException e) {
            return ResponseEntity.status(404).body(ApiResponse.error("Income not found", "/api/incomes/" + id));
        } catch (IncomeException e) {
            return ResponseEntity.status(400).body(ApiResponse.error("Error updating income: " + e.getMessage(), "/api/incomes/" + id));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id,
                                                    @RequestParam(name = "deletedBy", required = false) String deletedBy) {
        try {
            if (deletedBy == null || deletedBy.isBlank()) {
                incomeService.deleteIncome(id);
            } else {
                incomeService.deleteIncome(id, deletedBy);
            }
            return ResponseEntity.ok(ApiResponse.ok("Income deleted", null, "/api/incomes/" + id));
        } catch (IncomeNotFoundException e) {
            return ResponseEntity.status(404).body(ApiResponse.error("Income not found", "/api/incomes/" + id));
        } catch (IncomeException e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Error deleting income: " + e.getMessage(), "/api/incomes/" + id));
        }
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restore(@PathVariable Long id) {
        incomeService.restoreIncome(id);
        return ResponseEntity.ok(ApiResponse.ok("Income restored", null, "/api/incomes/" + id + "/restore"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<IncomeResponseDTO>> getById(@PathVariable Long id) {
        var data = incomeService.getDtoById(id);
        return ResponseEntity.ok(ApiResponse.ok("Income fetched", data, "/api/incomes/" + id));
    }

    // ============================================================
    // == Lists
    // ============================================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Page<IncomeResponseDTO>>> listByUser(
            @PathVariable Long userId,
            @PageableDefault(size = 20, sort = "incomeDate") Pageable pageable) {
        var page = incomeService.listByUser(userId, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Incomes fetched", page, "/api/incomes/user/" + userId));
    }

    @GetMapping("/user/{userId}/range")
    public ResponseEntity<ApiResponse<Page<IncomeResponseDTO>>> listByUserInRange(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @PageableDefault(size = 20, sort = "incomeDate") Pageable pageable) {
        var page = incomeService.listByUserAndDateRange(userId, start, end, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Incomes fetched (range)", page,
                "/api/incomes/user/" + userId + "/range"));
    }

    // ============================================================
    // == Totals (note: `end` is treated as inclusive)
    // ============================================================

    @GetMapping("/user/{userId}/sum")
    public ResponseEntity<ApiResponse<Double>> sumForPeriod(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        double total = incomeService.getIncomeForPeriod(userId, start, end.plusDays(1)); // endExclusive in service
        return ResponseEntity.ok(ApiResponse.ok("Income sum (period)", total,
                "/api/incomes/user/" + userId + "/sum"));
    }

    @GetMapping("/user/{userId}/today")
    public ResponseEntity<ApiResponse<Double>> today(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok("Income sum (today)",
                incomeService.getIncomeForToday(userId), "/api/incomes/user/" + userId + "/today"));
    }

    @GetMapping("/user/{userId}/week")
    public ResponseEntity<ApiResponse<Double>> currentWeek(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok("Income sum (current week)",
                incomeService.getIncomeForCurrentWeek(userId), "/api/incomes/user/" + userId + "/week"));
    }

    @GetMapping("/user/{userId}/month")
    public ResponseEntity<ApiResponse<Double>> currentMonth(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok("Income sum (current month)",
                incomeService.getIncomeForCurrentMonth(userId), "/api/incomes/user/" + userId + "/month"));
    }

    @GetMapping("/user/{userId}/year")
    public ResponseEntity<ApiResponse<Double>> currentYear(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok("Income sum (current year)",
                incomeService.getIncomeForCurrentYear(userId), "/api/incomes/user/" + userId + "/year"));
    }

    @GetMapping("/user/{userId}/previous-week")
    public ResponseEntity<ApiResponse<Double>> previousWeek(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok("Income sum (previous week)",
                incomeService.getIncomeForPreviousWeek(userId), "/api/incomes/user/" + userId + "/previous-week"));
    }

    @GetMapping("/user/{userId}/previous-month")
    public ResponseEntity<ApiResponse<Double>> previousMonth(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok("Income sum (previous month)",
                incomeService.getIncomeForPreviousMonth(userId), "/api/incomes/user/" + userId + "/previous-month"));
    }

    @GetMapping("/user/{userId}/previous-year")
    public ResponseEntity<ApiResponse<Double>> previousYear(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok("Income sum (previous year)",
                incomeService.getIncomeForPreviousYear(userId), "/api/incomes/user/" + userId + "/previous-year"));
    }

    // ============================================================
    // == Summaries / Top-K
    // ============================================================

    @GetMapping("/summary/payment-method/{userId}")
    public ResponseEntity<ApiResponse<Map<String, Double>>> paymentMethodSummary(@PathVariable Long userId) {
        var data = incomeService.getIncomePaymentMethodSummary(userId);
        return ResponseEntity.ok(ApiResponse.ok("Income by payment method", data,
                "/api/incomes/summary/payment-method/" + userId));
    }

    @GetMapping("/summary/source/{userId}")
    public ResponseEntity<ApiResponse<Map<String, Double>>> sourceSummary(@PathVariable Long userId) {
        var data = incomeService.getIncomeSourceSummary(userId);
        return ResponseEntity.ok(ApiResponse.ok("Income by source", data,
                "/api/incomes/summary/source/" + userId));
    }

    @GetMapping("/summary/payment-method/{userId}/current-month")
    public ResponseEntity<ApiResponse<Map<String, Double>>> getCurrentMonthPaymentMethodSummary(@PathVariable Long userId) {
        var data = incomeService.getCurrentMonthPaymentMethodSummary(userId);
        return ResponseEntity.ok(ApiResponse.ok("Current month income by payment method", data,
                "/api/incomes/summary/payment-method/" + userId + "/current-month"));
    }

    @GetMapping("/summary/source/{userId}/current-month")
    public ResponseEntity<ApiResponse<Map<String, Double>>> getCurrentMonthSourceSummary(@PathVariable Long userId) {
        var data = incomeService.getCurrentMonthSourceSummary(userId);
        return ResponseEntity.ok(ApiResponse.ok("Current month income by source", data,
                "/api/incomes/summary/source/" + userId + "/current-month"));
    }

    @GetMapping("/top5/{userId}")
    public ResponseEntity<ApiResponse<Map<String, Double>>> top5(@PathVariable Long userId) {
        var data = incomeService.getTop5HighestIncomesThisMonth(userId);
        return ResponseEntity.ok(ApiResponse.ok("Top 5 incomes (this month)", data,
                "/api/incomes/top5/" + userId));
    }

    @GetMapping("/weeks/{userId}")
    public ResponseEntity<ApiResponse<List<Double>>> weeklyIncomes(@PathVariable Long userId) {
        var data = incomeService.getIncomeForWeeksOfCurrentMonth(userId);
        return ResponseEntity.ok(ApiResponse.ok("Weekly incomes (current month)", data,
                "/api/incomes/weeks/" + userId));
    }

    @GetMapping("/yearly/{userId}")
    public ResponseEntity<ApiResponse<List<Double>>> yearlyIncomes(@PathVariable Long userId) {
        var data = incomeService.getIncomeForTwelveMonthsOfCurrentYear(userId);
        return ResponseEntity.ok(ApiResponse.ok("Monthly incomes (current year)", data,
                "/api/incomes/yearly/" + userId));
    }

    // ============================================================
    // == Evolutions (% change)
    // ============================================================

    @GetMapping("/evolution/week/{userId}")
    public ResponseEntity<ApiResponse<Double>> weeklyEvolution(@PathVariable Long userId) {
        double current = incomeService.getIncomeForCurrentWeek(userId);
        double previous = incomeService.getIncomeForPreviousWeek(userId);
        double pct = (previous == 0) ? (current == 0 ? 0.0 : 100.0) : ((current - previous) / previous) * 100.0;
        return ResponseEntity.ok(ApiResponse.ok("Weekly income evolution (%)", pct,
                "/api/incomes/evolution/week/" + userId));
    }

    @GetMapping("/evolution/month/{userId}")
    public ResponseEntity<ApiResponse<Double>> monthlyEvolution(@PathVariable Long userId) {
        double current = incomeService.getIncomeForCurrentMonth(userId);
        double previous = incomeService.getIncomeForPreviousMonth(userId);
        double pct = (previous == 0) ? (current == 0 ? 0.0 : 100.0) : ((current - previous) / previous) * 100.0;
        return ResponseEntity.ok(ApiResponse.ok("Monthly income evolution (%)", pct,
                "/api/incomes/evolution/month/" + userId));
    }

    @GetMapping("/evolution/year/{userId}")
    public ResponseEntity<ApiResponse<Double>> yearlyEvolution(@PathVariable Long userId) {
        double current = incomeService.getIncomeForCurrentYear(userId);
        double previous = incomeService.getIncomeForPreviousYear(userId);
        double pct = (previous == 0) ? (current == 0 ? 0.0 : 100.0) : ((current - previous) / previous) * 100.0;
        return ResponseEntity.ok(ApiResponse.ok("Yearly income evolution (%)", pct,
                "/api/incomes/evolution/year/" + userId));
    }

    // ============================================================
    // == Metadata
    // ============================================================

    @GetMapping("/source/{userId}")
    public ResponseEntity<ApiResponse<List<String>>> distinctSources(@PathVariable Long userId) {
        var data = incomeService.getDistinctSourcesByUserId(userId);
        return ResponseEntity.ok(ApiResponse.ok("Distinct income sources", data,
                "/api/incomes/source/" + userId));
    }
}
