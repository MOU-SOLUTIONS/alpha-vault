/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Controller: ExpenseController - CRUD + analytics (soft delete)
 * ================================================================
 */
package com.alpha.alphavault.controller;

import com.alpha.alphavault.dto.common.ApiResponse;
import com.alpha.alphavault.dto.expense.ExpenseRequestDTO;
import com.alpha.alphavault.dto.expense.ExpenseResponseDTO;
import com.alpha.alphavault.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/expenses") // keep plural for consistency
public class ExpenseController {

    private final ExpenseService expenseService;

    // ============================================================
    // == CRUD (DTO-based)
    // ============================================================

    @PostMapping
    public ResponseEntity<ApiResponse<ExpenseResponseDTO>> create(@Valid @RequestBody ExpenseRequestDTO dto) {
        var data = expenseService.create(dto);
        return ResponseEntity.status(201)
                .body(ApiResponse.created("Expense created", data, "/api/expenses"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpenseResponseDTO>> update(@PathVariable Long id,
                                                                  @Valid @RequestBody ExpenseRequestDTO dto) {
        var data = expenseService.update(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Expense updated", data, "/api/expenses/" + id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.ok(ApiResponse.ok("Expense deleted", null, "/api/expenses/" + id));
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restore(@PathVariable Long id) {
        expenseService.restoreExpense(id);
        return ResponseEntity.ok(ApiResponse.ok("Expense restored", null, "/api/expenses/" + id + "/restore"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpenseResponseDTO>> getById(@PathVariable Long id) {
        var data = expenseService.getDtoById(id);
        return ResponseEntity.ok(ApiResponse.ok("Expense fetched", data, "/api/expenses/" + id));
    }

    // ============================================================
    // == Lists
    // ============================================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Page<ExpenseResponseDTO>>> listByUser(
            @PathVariable Long userId,
            @PageableDefault(size = 20, sort = "expenseDate") Pageable pageable) {
        var page = expenseService.listByUser(userId, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Expenses fetched", page, "/api/expenses/user/" + userId));
    }

    @GetMapping("/user/{userId}/range")
    public ResponseEntity<ApiResponse<Page<ExpenseResponseDTO>>> listByUserInRange(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @PageableDefault(size = 20, sort = "expenseDate") Pageable pageable) {
        var page = expenseService.listByUserAndDateRange(userId, start, end, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Expenses fetched (range)", page,
                "/api/expenses/user/" + userId + "/range"));
    }

    // ============================================================
    // == Totals (end treated inclusive at API; service uses endExclusive)
    // ============================================================

    @GetMapping("/user/{userId}/sum")
    public ResponseEntity<ApiResponse<Double>> sumForPeriod(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        double total = expenseService.getExpenseForPeriod(userId, start, end.plusDays(1));
        return ResponseEntity.ok(ApiResponse.ok("Expense sum (period)", total,
                "/api/expenses/user/" + userId + "/sum"));
    }

    @GetMapping("/user/{userId}/today")
    public ResponseEntity<ApiResponse<Double>> today(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok("Expense sum (today)",
                expenseService.getExpenseForToday(userId), "/api/expenses/user/" + userId + "/today"));
    }

    @GetMapping("/user/{userId}/week")
    public ResponseEntity<ApiResponse<Double>> currentWeek(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok("Expense sum (current week)",
                expenseService.getExpenseForCurrentWeek(userId), "/api/expenses/user/" + userId + "/week"));
    }

    @GetMapping("/user/{userId}/month")
    public ResponseEntity<ApiResponse<Double>> currentMonth(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok("Expense sum (current month)",
                expenseService.getExpenseForCurrentMonth(userId), "/api/expenses/user/" + userId + "/month"));
    }

    @GetMapping("/user/{userId}/year")
    public ResponseEntity<ApiResponse<Double>> currentYear(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok("Expense sum (current year)",
                expenseService.getExpenseForCurrentYear(userId), "/api/expenses/user/" + userId + "/year"));
    }

    @GetMapping("/user/{userId}/previous-week")
    public ResponseEntity<ApiResponse<Double>> previousWeek(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok("Expense sum (previous week)",
                expenseService.getExpenseForPreviousWeek(userId), "/api/expenses/user/" + userId + "/previous-week"));
    }

    @GetMapping("/user/{userId}/previous-month")
    public ResponseEntity<ApiResponse<Double>> previousMonth(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok("Expense sum (previous month)",
                expenseService.getExpenseForPreviousMonth(userId), "/api/expenses/user/" + userId + "/previous-month"));
    }

    @GetMapping("/user/{userId}/previous-year")
    public ResponseEntity<ApiResponse<Double>> previousYear(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok("Expense sum (previous year)",
                expenseService.getExpenseForPreviousYear(userId), "/api/expenses/user/" + userId + "/previous-year"));
    }

    // ============================================================
    // == Summaries / Top-K
    // ============================================================

    @GetMapping("/summary/payment-method/{userId}")
    public ResponseEntity<ApiResponse<Map<String, Double>>> paymentMethodSummary(@PathVariable Long userId) {
        var data = expenseService.getCurrentMonthExpensePaymentMethodSummary(userId);
        return ResponseEntity.ok(ApiResponse.ok("Expense by payment method (current month)", data,
                "/api/expenses/summary/payment-method/" + userId));
    }

    @GetMapping("/summary/category/{userId}")
    public ResponseEntity<ApiResponse<Map<String, Double>>> categorySummary(@PathVariable Long userId) {
        var data = expenseService.getCurrentMonthExpenseCategorySummary(userId);
        return ResponseEntity.ok(ApiResponse.ok("Expense by category (current month)", data,
                "/api/expenses/summary/category/" + userId));
    }

    @GetMapping("/top5/{userId}")
    public ResponseEntity<ApiResponse<Map<String, Double>>> top5(@PathVariable Long userId) {
        var data = expenseService.getTop5HighestExpensesThisMonth(userId);
        return ResponseEntity.ok(ApiResponse.ok("Top 5 expenses (this month)", data,
                "/api/expenses/top5/" + userId));
    }

    @GetMapping("/weeks/{userId}")
    public ResponseEntity<ApiResponse<List<Double>>> weeklyExpenses(@PathVariable Long userId) {
        var data = expenseService.getExpenseForWeeksOfCurrentMonth(userId);
        return ResponseEntity.ok(ApiResponse.ok("Weekly expenses (current month)", data,
                "/api/expenses/weeks/" + userId));
    }

    @GetMapping("/yearly/{userId}")
    public ResponseEntity<ApiResponse<List<Double>>> yearlyExpenses(@PathVariable Long userId) {
        var data = expenseService.getExpenseForTwelveMonthsOfCurrentYear(userId);
        return ResponseEntity.ok(ApiResponse.ok("Monthly expenses (current year)", data,
                "/api/expenses/yearly/" + userId));
    }

    // ============================================================
    // == Evolutions (% change)
    // ============================================================

    @GetMapping("/evolution/week/{userId}")
    public ResponseEntity<ApiResponse<Double>> weeklyEvolution(@PathVariable Long userId) {
        double current = expenseService.getExpenseForCurrentWeek(userId);
        double previous = expenseService.getExpenseForPreviousWeek(userId);
        double pct = (previous == 0) ? (current == 0 ? 0.0 : 100.0) : ((current - previous) / previous) * 100.0;
        return ResponseEntity.ok(ApiResponse.ok("Weekly expense evolution (%)", pct,
                "/api/expenses/evolution/week/" + userId));
    }

    @GetMapping("/evolution/month/{userId}")
    public ResponseEntity<ApiResponse<Double>> monthlyEvolution(@PathVariable Long userId) {
        double current = expenseService.getExpenseForCurrentMonth(userId);
        double previous = expenseService.getExpenseForPreviousMonth(userId);
        double pct = (previous == 0) ? (current == 0 ? 0.0 : 100.0) : ((current - previous) / previous) * 100.0;
        return ResponseEntity.ok(ApiResponse.ok("Monthly expense evolution (%)", pct,
                "/api/expenses/evolution/month/" + userId));
    }

    @GetMapping("/evolution/year/{userId}")
    public ResponseEntity<ApiResponse<Double>> yearlyEvolution(@PathVariable Long userId) {
        double current = expenseService.getExpenseForCurrentYear(userId);
        double previous = expenseService.getExpenseForPreviousYear(userId);
        double pct = (previous == 0) ? (current == 0 ? 0.0 : 100.0) : ((current - previous) / previous) * 100.0;
        return ResponseEntity.ok(ApiResponse.ok("Yearly expense evolution (%)", pct,
                "/api/expenses/evolution/year/" + userId));
    }
}
