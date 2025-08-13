package com.alpha.alphavault.service;

import com.alpha.alphavault.model.Income;
import com.alpha.alphavault.repository.IncomeRepository;
import com.alpha.alphavault.exception.IncomeNotFoundException;
import com.alpha.alphavault.exception.IncomeException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class IncomeService {

    private final IncomeRepository incomeRepository;

    @Autowired
    public IncomeService(IncomeRepository incomeRepository) {
        this.incomeRepository = incomeRepository;
    }

    public Income saveIncome(Income income) {
        try {
            return incomeRepository.save(income);
        } catch (Exception e) {
            throw new IncomeException("Error saving income: " + e.getMessage());
        }
    }

    public void deleteIncome(Long id) {
        try {
            if (!incomeRepository.existsById(id)) {
                throw new IncomeNotFoundException("Income not found for id: " + id);
            }
            incomeRepository.deleteById(id);
        } catch (IncomeNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new IncomeException("Error deleting income: " + e.getMessage());
        }
    }

    public Income getIncomeById(Long id) {
        return incomeRepository.findById(id)
                .orElseThrow(() -> new IncomeNotFoundException("Income not found for id: " + id));
    }

    public List<Income> getIncomesByUserId(Long userId) {
        try {
            return incomeRepository.findByUserId(userId);
        } catch (Exception e) {
            throw new IncomeException("Error fetching incomes for user: " + userId);
        }
    }

    public Double getIncomeForPeriod(Long userId, LocalDate startDate, LocalDate endDate) {
        try {
            List<Income> incomes = incomeRepository.findByUserIdAndDateBetween(userId, startDate, endDate.minusDays(1));
            return incomes.stream().mapToDouble(income -> income.getAmount().doubleValue()).sum();
        } catch (Exception e) {
            throw new IncomeException("Error fetching income for the specified period for user: " + userId);
        }
    }

    public Double getIncomeForToday(Long userId) {
        LocalDate today = LocalDate.now();
        return getIncomeForPeriod(userId, today, today.plusDays(1));
    }

    public Double getIncomeForCurrentWeek(Long userId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate startOfWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            LocalDate endOfWeek = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY)).plusDays(1);
            return getIncomeForPeriod(userId, startOfWeek, endOfWeek);
        } catch (Exception e) {
            throw new IncomeException("Error fetching current week's income for user: " + userId);
        }
    }

    public Double getIncomeForCurrentMonth(Long userId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate startOfMonth = today.with(TemporalAdjusters.firstDayOfMonth());
            LocalDate endOfMonth = today.with(TemporalAdjusters.lastDayOfMonth()).plusDays(1);
            return getIncomeForPeriod(userId, startOfMonth, endOfMonth);
        } catch (Exception e) {
            throw new IncomeException("Error fetching current month's income for user: " + userId);
        }
    }

    public Double getIncomeForCurrentYear(Long userId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate startOfYear = today.with(TemporalAdjusters.firstDayOfYear());
            LocalDate endOfYear = today.with(TemporalAdjusters.lastDayOfYear()).plusDays(1);
            return getIncomeForPeriod(userId, startOfYear, endOfYear);
        } catch (Exception e) {
            throw new IncomeException("Error fetching current year's income for user: " + userId);
        }
    }

    public Double getIncomeForPreviousWeek(Long userId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate startOfPreviousWeek = today.minusWeeks(1).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            LocalDate endOfPreviousWeek = today.minusWeeks(1).with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY)).plusDays(1);
            return getIncomeForPeriod(userId, startOfPreviousWeek, endOfPreviousWeek);
        } catch (Exception e) {
            throw new IncomeException("Error fetching previous week's income for user: " + userId);
        }
    }

    public Double getIncomeForPreviousMonth(Long userId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate startOfPreviousMonth = today.minusMonths(1).with(TemporalAdjusters.firstDayOfMonth());
            LocalDate endOfPreviousMonth = today.minusMonths(1).with(TemporalAdjusters.lastDayOfMonth()).plusDays(1);
            return getIncomeForPeriod(userId, startOfPreviousMonth, endOfPreviousMonth);
        } catch (Exception e) {
            throw new IncomeException("Error fetching previous month's income for user: " + userId);
        }
    }

    public Double getIncomeForPreviousYear(Long userId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate startOfPreviousYear = today.minusYears(1).with(TemporalAdjusters.firstDayOfYear());
            LocalDate endOfPreviousYear = today.minusYears(1).with(TemporalAdjusters.lastDayOfYear()).plusDays(1);
            return getIncomeForPeriod(userId, startOfPreviousYear, endOfPreviousYear);
        } catch (Exception e) {
            throw new IncomeException("Error fetching previous year's income for user: " + userId);
        }
    }

    public Map<String, Double> getIncomePaymentMethodSummary(Long userId) {
        try {
            List<Income> incomes = getIncomesByUserId(userId);
            return incomes.stream()
                    .collect(Collectors.groupingBy(income -> income.getPaymentMethod().name(),
                            Collectors.mapping(Income::getAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))))
                    .entrySet().stream()
                    .collect(Collectors.toMap(Map.Entry::getKey, entry -> entry.getValue().doubleValue()));
        } catch (Exception e) {
            throw new IncomeException("Error fetching payment method summary for user: " + userId);
        }
    }

    public Map<String, Double> getTop5HighestIncomesThisMonth(Long userId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate startOfMonth = today.with(TemporalAdjusters.firstDayOfMonth());
            LocalDate endOfMonth = today.with(TemporalAdjusters.lastDayOfMonth()).plusDays(1);

            List<Income> top5 = incomeRepository.findByUserIdAndDateBetween(userId, startOfMonth, endOfMonth)
                    .stream()
                    .sorted(Comparator.comparing(Income::getAmount).reversed())
                    .limit(5)
                    .toList();

            return top5.stream().collect(Collectors.toMap(
                    Income::getSource,
                    inc -> inc.getAmount().doubleValue(),
                    (existing, replacement) -> existing,
                    LinkedHashMap::new
            ));
        } catch (Exception e) {
            throw new IncomeException("Error fetching top-5 incomes for user " + userId);
        }
    }

    public List<Double> getIncomeForWeeksOfCurrentMonth(Long userId) {
        List<Double> weeklyIncomes = new ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfMonth = today.with(TemporalAdjusters.lastDayOfMonth());

        LocalDate weekStart = startOfMonth.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        while (!weekStart.isAfter(endOfMonth)) {
            LocalDate weekEnd = weekStart.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
            if (weekEnd.isAfter(endOfMonth)) {
                weekEnd = endOfMonth;
            }
            double sum = getIncomeForPeriod(userId, weekStart, weekEnd.plusDays(1));
            weeklyIncomes.add(sum);
            weekStart = weekEnd.plusDays(1);
        }

        return weeklyIncomes;
    }

    public List<Double> getIncomeForTwelveMonthsOfCurrentYear(Long userId) {
        List<Double> monthlyIncomes = new ArrayList<>(12);
        LocalDate today = LocalDate.now();
        LocalDate startOfYear = today.with(TemporalAdjusters.firstDayOfYear());

        for (int monthIndex = 0; monthIndex < 12; monthIndex++) {
            LocalDate startOfMonth = startOfYear.plusMonths(monthIndex);
            LocalDate endOfMonth = startOfMonth.with(TemporalAdjusters.lastDayOfMonth()).plusDays(1);
            double monthlyTotal = getIncomeForPeriod(userId, startOfMonth, endOfMonth);
            monthlyIncomes.add(monthlyTotal);
        }

        return monthlyIncomes;
    }

    public Map<String, Double> getIncomeSourceSummary(Long userId) {
        try {
            List<Income> incomes = getIncomesByUserId(userId);
            return incomes.stream()
                    .collect(Collectors.groupingBy(
                            Income::getSource,
                            Collectors.mapping(
                                    Income::getAmount,
                                    Collectors.reducing(BigDecimal.ZERO, BigDecimal::add)
                            )
                    ))
                    .entrySet().stream()
                    .collect(Collectors.toMap(
                            Map.Entry::getKey,
                            entry -> entry.getValue().doubleValue()
                    ));
        } catch (Exception e) {
            throw new IncomeException("Error fetching income summary by source for user: " + userId);
        }
    }

    public List<String> getDistinctSourcesByUserId(Long userId) {
        try {
            return incomeRepository.findDistinctSourcesByUserId(userId);
        } catch (Exception e) {
            throw new IncomeException("Error fetching distinct sources for user: " + userId);
        }
    }
}
