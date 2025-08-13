package com.alpha.alphavault.controller;

import com.alpha.alphavault.dto.IncomeRequestDTO;
import com.alpha.alphavault.dto.IncomeResponseDTO;
import com.alpha.alphavault.mapper.IncomeMapper;
import com.alpha.alphavault.model.Income;
import com.alpha.alphavault.service.IncomeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/income")
public class IncomeController {

    private final IncomeService incomeService;
    private final IncomeMapper incomeMapper;

    @Autowired
    public IncomeController(IncomeService incomeService, IncomeMapper incomeMapper) {
        this.incomeService = incomeService;
        this.incomeMapper = incomeMapper;
    }

    // CREATE or UPDATE
    @PostMapping
    public ResponseEntity<IncomeResponseDTO> saveIncome(@RequestBody IncomeRequestDTO dto) {
        Income income = incomeMapper.toEntity(dto);
        Income saved = incomeService.saveIncome(income); // no check for existing ID
        return ResponseEntity.status(HttpStatus.CREATED).body(incomeMapper.fromEntity(saved));
    }


    @PutMapping("/{id}")
    public ResponseEntity<IncomeResponseDTO> updateIncome(
            @PathVariable Long id,
            @RequestBody IncomeRequestDTO dto
    ) {
        Income income = incomeMapper.toEntity(dto);
        income.setId(id); // set the correct ID to avoid INSERT
        Income updated = incomeService.saveIncome(income);
        return ResponseEntity.ok(incomeMapper.fromEntity(updated));
    }


    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncome(@PathVariable Long id) {
        incomeService.deleteIncome(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }


    // GET by ID
    @GetMapping("/{id}")
    public ResponseEntity<IncomeResponseDTO> getIncomeById(@PathVariable Long id) {
        return ResponseEntity.ok(IncomeResponseDTO.fromEntity(incomeService.getIncomeById(id)));
    }

    // GET all incomes for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<IncomeResponseDTO>> getAllIncomesByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(incomeService.getIncomesByUserId(userId)
                .stream().map(IncomeResponseDTO::fromEntity).collect(Collectors.toList()));
    }

    @GetMapping("/custom/{userId}")
    public ResponseEntity<Double> getIncomesForPeriod(@PathVariable Long userId,
                                                     @RequestParam("start") String start,
                                                     @RequestParam("end") String end) {
        LocalDate startDate = LocalDate.from(LocalDateTime.parse(start));
        LocalDate endDate = LocalDate.from(LocalDateTime.parse(end));
        return ResponseEntity.ok(incomeService.getIncomeForPeriod(userId, startDate, endDate));
    }

    @GetMapping("/today/{userId}")
    public ResponseEntity<Double> getTodayIncome(@PathVariable Long userId) {
        return ResponseEntity.ok(incomeService.getIncomeForToday(userId));
    }

    @GetMapping("/week/{userId}")
    public ResponseEntity<Double> getWeekIncome(@PathVariable Long userId) {
        return ResponseEntity.ok(incomeService.getIncomeForCurrentWeek(userId));
    }

    @GetMapping("/month/{userId}")
    public ResponseEntity<Double> getMonthIncome(@PathVariable Long userId) {
        return ResponseEntity.ok(incomeService.getIncomeForCurrentMonth(userId));
    }

    @GetMapping("/year/{userId}")
    public ResponseEntity<Double> getYearIncome(@PathVariable Long userId) {
        return ResponseEntity.ok(incomeService.getIncomeForCurrentYear(userId));
    }

    @GetMapping("/previous-week/{userId}")
    public ResponseEntity<Double> getPreviousWeekIncome(@PathVariable Long userId) {
        return ResponseEntity.ok(incomeService.getIncomeForPreviousWeek(userId));
    }

    @GetMapping("/previous-month/{userId}")
    public ResponseEntity<Double> getPreviousMonthIncome(@PathVariable Long userId) {
        return ResponseEntity.ok(incomeService.getIncomeForPreviousMonth(userId));
    }

    @GetMapping("/previous-year/{userId}")
    public ResponseEntity<Double> getPreviousYearIncome(@PathVariable Long userId) {
        return ResponseEntity.ok(incomeService.getIncomeForPreviousYear(userId));
    }

    @GetMapping("/summary/payment-method/{userId}")
    public ResponseEntity<Map<String, Double>> getPaymentMethodSummary(@PathVariable Long userId) {
        return ResponseEntity.ok(incomeService.getIncomePaymentMethodSummary(userId));
    }

    @GetMapping("/summary/income-source/{userId}")
    public ResponseEntity<Map<String, Double>> getIncomeSourceSummary(@PathVariable Long userId) {
        return ResponseEntity.ok(incomeService.getIncomeSourceSummary(userId));
    }

    @GetMapping("/top5/{userId}")
    public ResponseEntity<Map<String, Double>> getTop5IncomeMap(@PathVariable Long userId) {
        Map<String, Double> data = incomeService.getTop5HighestIncomesThisMonth(userId);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/weeks/{userId}")
    public ResponseEntity<List<Double>> getWeeklyIncomes(@PathVariable Long userId) {
        return ResponseEntity.ok(incomeService.getIncomeForWeeksOfCurrentMonth(userId));
    }

    @GetMapping("/yearly/{userId}")
    public ResponseEntity<List<Double>> getYearlyIncome(@PathVariable Long userId) {
        List<Double> data = incomeService.getIncomeForTwelveMonthsOfCurrentYear(userId);
        return ResponseEntity.ok(data);
    }

    // Endpoint to get weekly income evolution
    @GetMapping("/evolution/week/{userId}")
    public Double getWeeklyEvolution(@PathVariable Long userId) {
        double currentWeekIncome = incomeService.getIncomeForCurrentWeek(userId);
        double previousWeekIncome = incomeService.getIncomeForPreviousWeek(userId);

        // Handle case where previous week's income is 0 to avoid division by zero
        if (previousWeekIncome == 0) {
            // If both weeks have zero income, evolution is 0%
            return currentWeekIncome == 0 ? 0.0 : 100.0; // 100% increase if previous week income was 0
        }

        // Calculate percentage evolution
        return ((currentWeekIncome - previousWeekIncome) / previousWeekIncome) * 100;
    }

    // Endpoint to get monthly income evolution
    @GetMapping("/evolution/month/{userId}")
    public Double getMonthlyEvolution(@PathVariable Long userId) {
        double currentMonthIncome = incomeService.getIncomeForCurrentMonth(userId);
        double previousMonthIncome = incomeService.getIncomeForPreviousMonth(userId);

        if (previousMonthIncome == 0) {
            return currentMonthIncome == 0 ? 0.0 : 100.0;
        }

        return (currentMonthIncome - previousMonthIncome) / previousMonthIncome * 100;
    }

    // Endpoint to get yearly income evolution
    @GetMapping("/evolution/year/{userId}")
    public Double getYearlyEvolution(@PathVariable Long userId) {
        double currentYearIncome = incomeService.getIncomeForCurrentYear(userId);
        double previousYearIncome = incomeService.getIncomeForPreviousYear(userId);

        if (previousYearIncome == 0) {
            return currentYearIncome == 0 ? 0.0 : 100.0;
        }

        return (currentYearIncome - previousYearIncome) / previousYearIncome * 100;
    }

    @GetMapping("/source/{userId}")
    public ResponseEntity<List<String>> getSourcesByUser(@PathVariable Long userId) {
        List<String> sources = incomeService.getDistinctSourcesByUserId(userId);
        return ResponseEntity.ok(sources);
    }
}
