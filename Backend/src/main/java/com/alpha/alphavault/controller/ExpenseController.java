package com.alpha.alphavault.controller;

import com.alpha.alphavault.dto.ExpenseRequestDTO;
import com.alpha.alphavault.dto.ExpenseResponseDTO;
import com.alpha.alphavault.mapper.ExpenseMapper;
import com.alpha.alphavault.model.Expense;
import com.alpha.alphavault.service.ExpenseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/expense")
public class ExpenseController {

    private final ExpenseService expenseService;
    private final ExpenseMapper expenseMapper;

    public ExpenseController(ExpenseService expenseService, ExpenseMapper expenseMapper) {
        this.expenseService = expenseService;
        this.expenseMapper = expenseMapper;
    }

    // ─────────────── Create or Update ───────────────
    @PostMapping
    public ResponseEntity<ExpenseResponseDTO> saveExpense(@RequestBody ExpenseRequestDTO dto) {
        Expense expense = expenseMapper.toEntity(dto);
        Expense saved = expenseService.saveExpense(expense); // no check for existing ID
        return ResponseEntity.status(HttpStatus.CREATED).body(expenseMapper.fromEntity(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseResponseDTO> updateExpense(
            @PathVariable Long id,
            @RequestBody ExpenseRequestDTO dto
    ) {
        Expense expense = expenseMapper.toEntity(dto);
        expense.setId(id); // set the correct ID to avoid INSERT
        Expense updated = expenseService.saveExpense(expense);
        return ResponseEntity.ok(expenseMapper.fromEntity(updated));
    }

    // ─────────────── Delete by ID ───────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
return ResponseEntity.ok(Map.of("message", "Expense deleted successfully."));
    }

    // ─────────────── Get by ID ───────────────
    @GetMapping("/{id}")
    public ResponseEntity<ExpenseResponseDTO> getExpenseById(@PathVariable Long id) {
        return ResponseEntity.ok(expenseMapper.fromEntity(expenseService.getExpenseById(id)));
    }

    // ─────────────── Get All by User ───────────────
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ExpenseResponseDTO>> getAllExpensesByUser(@PathVariable Long userId) {
        List<ExpenseResponseDTO> list = expenseService.getExpensesByUserId(userId)
                .stream().map(expenseMapper::fromEntity).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    // ─────────────── Custom Period Query ───────────────
    @GetMapping("/custom/{userId}")
    public ResponseEntity<Double> getExpensesForPeriod(
            @PathVariable Long userId,
            @RequestParam("start") String start,
            @RequestParam("end") String end
    ) {
        DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE;
        LocalDate startDate = LocalDate.parse(start, formatter);
        LocalDate endDate = LocalDate.parse(end, formatter);
        return ResponseEntity.ok(expenseService.getExpenseForPeriod(userId, startDate, endDate));
    }

    // ─────────────── KPIs ───────────────
    @GetMapping("/today/{userId}")
    public ResponseEntity<Double> getTodayExpenses(@PathVariable Long userId) {
        return ResponseEntity.ok(expenseService.getExpenseForToday(userId));
    }

    @GetMapping("/week/{userId}")
    public ResponseEntity<Double> getCurrentWeekExpenses(@PathVariable Long userId) {
        return ResponseEntity.ok(expenseService.getExpenseForCurrentWeek(userId));
    }

    @GetMapping("/month/{userId}")
    public ResponseEntity<Double> getCurrentMonthExpenses(@PathVariable Long userId) {
        return ResponseEntity.ok(expenseService.getExpenseForCurrentMonth(userId));
    }

    @GetMapping("/year/{userId}")
    public ResponseEntity<Double> getCurrentYearExpenses(@PathVariable Long userId) {
        return ResponseEntity.ok(expenseService.getExpenseForCurrentYear(userId));
    }

    @GetMapping("/previous-week/{userId}")
    public ResponseEntity<Double> getPreviousWeekExpenses(@PathVariable Long userId) {
        return ResponseEntity.ok(expenseService.getExpenseForPreviousWeek(userId));
    }

    @GetMapping("/previous-month/{userId}")
    public ResponseEntity<Double> getPreviousMonthExpenses(@PathVariable Long userId) {
        return ResponseEntity.ok(expenseService.getExpenseForPreviousMonth(userId));
    }

    @GetMapping("/previous-year/{userId}")
    public ResponseEntity<Double> getPreviousYearExpenses(@PathVariable Long userId) {
        return ResponseEntity.ok(expenseService.getExpenseForPreviousYear(userId));
    }

    // ─────────────── Summary Views ───────────────
    @GetMapping("/summary/payment-method/{userId}")
    public ResponseEntity<Map<String, Double>> getExpensesMethodSummary(@PathVariable Long userId) {
        return ResponseEntity.ok(expenseService.getExpensePaymentMethodSummary(userId));
    }

    @GetMapping("/summary/category/{userId}")
    public ResponseEntity<Map<String, Double>> getExpensesCategorySummary(@PathVariable Long userId) {
        return ResponseEntity.ok(expenseService.getExpenseCategorySummary(userId));
    }

    // ─────────────── Top 5 Breakdown ───────────────
    @GetMapping("/top5/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getTop5Expenses(@PathVariable Long userId) {
        return ResponseEntity.ok(expenseService.getTop5HighestExpensesThisMonth(userId));
    }

    // ─────────────── Weekly and Monthly Charts ───────────────
    @GetMapping("/weeks/{userId}")
    public ResponseEntity<List<Double>> getWeeklyExpenses(@PathVariable Long userId) {
        return ResponseEntity.ok(expenseService.getExpenseForWeeksOfCurrentMonth(userId));
    }

    @GetMapping("/yearly/{userId}")
    public ResponseEntity<List<Double>> getMonthlyExpenses(@PathVariable Long userId) {
        return ResponseEntity.ok(expenseService.getExpenseForTwelveMonthsOfCurrentYear(userId));
    }

    @GetMapping("/evolution/week/{userId}")
    public Double getWeeklyExpenseEvolution(@PathVariable Long userId) {
        double currentWeek = expenseService.getExpenseForCurrentWeek(userId);
        double previousWeek = expenseService.getExpenseForPreviousWeek(userId);

        if (previousWeek == 0) {
            return currentWeek == 0 ? 0.0 : -100.0;
        }

        return ((previousWeek - currentWeek) / previousWeek) * 100;
    }

    @GetMapping("/evolution/month/{userId}")
    public Double getMonthlyExpenseEvolution(@PathVariable Long userId) {
        double currentMonth = expenseService.getExpenseForCurrentMonth(userId);
        double previousMonth = expenseService.getExpenseForPreviousMonth(userId);

        if (previousMonth == 0) {
            return currentMonth == 0 ? 0.0 : -100.0;
        }

        return ((previousMonth - currentMonth) / previousMonth) * 100;
    }

    @GetMapping("/evolution/year/{userId}")
    public Double getYearlyExpenseEvolution(@PathVariable Long userId) {
        double currentYear = expenseService.getExpenseForCurrentYear(userId);
        double previousYear = expenseService.getExpenseForPreviousYear(userId);

        if (previousYear == 0) {
            return currentYear == 0 ? 0.0 : -100.0;
        }

        return ((previousYear - currentYear) / previousYear) * 100;
    }



}
