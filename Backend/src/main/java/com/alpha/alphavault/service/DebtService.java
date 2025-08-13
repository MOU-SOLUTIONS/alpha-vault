package com.alpha.alphavault.service;

import com.alpha.alphavault.model.Debt;
import com.alpha.alphavault.model.DebtHistory;
import com.alpha.alphavault.repository.DebtRepository;
import com.alpha.alphavault.repository.DebtHistoryRepository;
import com.alpha.alphavault.exception.DebtNotFoundException;
import com.alpha.alphavault.exception.DebtException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DebtService {

    private final DebtRepository debtRepository;
    private final DebtHistoryRepository debtHistoryRepository;

    @Autowired
    public DebtService(DebtRepository debtRepository, DebtHistoryRepository debtHistoryRepository) {
        this.debtRepository = debtRepository;
        this.debtHistoryRepository = debtHistoryRepository;
    }

    // Create or update a debt
    public Debt saveDebt(Debt debt) {
        try {
            return debtRepository.save(debt);
        } catch (Exception e) {
            throw new DebtException("Error saving debt: " + e.getMessage());
        }
    }

    // Delete a debt
    public void deleteDebt(Long id) {
        try {
            if (!debtRepository.existsById(id)) {
                throw new DebtNotFoundException("Debt not found for id: " + id);
            }
            debtRepository.deleteById(id);
        } catch (DebtNotFoundException e) {
            throw e; // Rethrow custom exception if debt is not found
        } catch (Exception e) {
            throw new DebtException("Error deleting debt: " + e.getMessage());
        }
    }

    // Get debt by ID
    public Debt getDebtById(Long id) {
        return debtRepository.findById(id)
                .orElseThrow(() -> new DebtNotFoundException("Debt not found for id: " + id));
    }

    // Get all debts for a user
    public List<Debt> getDebtsByUserId(Long userId) {
        try {
            return debtRepository.findByUserId(userId);
        } catch (Exception e) {
            throw new DebtException("Error fetching debts for user: " + userId);
        }
    }

    // Get total debt for a user
    public Double getTotalDebt(Long userId) {
        try {
            List<Debt> debts = debtRepository.findByUserId(userId);
            return debts.stream().mapToDouble(Debt::getRemainingAmount).sum();
        } catch (Exception e) {
            throw new DebtException("Error fetching total debt for user: " + userId);
        }
    }

    // Add a payment to a debt
    public DebtHistory addPaymentToDebt(Long debtId, DebtHistory debtHistory) {
        try {
            Debt debt = getDebtById(debtId);
            debtHistory.setDebt(debt);

            // Update the remaining amount after the payment
            debt.setRemainingAmount(debt.getRemainingAmount() - debtHistory.getPaymentAmount());
            debtRepository.save(debt);

            return debtHistoryRepository.save(debtHistory);
        } catch (Exception e) {
            throw new DebtException("Error adding payment to debt: " + e.getMessage());
        }
    }

    // Get debt payment history for a user
    public List<DebtHistory> getDebtPaymentHistory(Long debtId) {
        try {
            return debtHistoryRepository.findByDebtId(debtId);
        } catch (Exception e) {
            throw new DebtException("Error fetching payment history for debt: " + debtId);
        }
    }

    // Get all debts for a user with overdue debts
    public List<Debt> getOverdueDebts(Long userId) {
        try {
            List<Debt> debts = getDebtsByUserId(userId);
            Date currentDate = new Date(System.currentTimeMillis());
            return debts.stream()
                    .filter(debt -> debt.getDueDate().before(currentDate) && debt.getRemainingAmount() > 0)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new DebtException("Error fetching overdue debts for user: " + userId);
        }
    }

    // Get the total minimum payments for a user
    public Double getTotalMinPayments(Long userId) {
        try {
            List<Debt> debts = getDebtsByUserId(userId);
            return debts.stream().mapToDouble(Debt::getMinPayment).sum();
        } catch (Exception e) {
            throw new DebtException("Error fetching total minimum payments for user: " + userId);
        }
    }

    // Get debts categorized by creditor
    public Map<String, Double> getDebtCreditorSummary(Long userId) {
        try {
            List<Debt> debts = getDebtsByUserId(userId);
            return debts.stream()
                    .collect(Collectors.groupingBy(Debt::getCreditorName,
                            Collectors.mapping(Debt::getRemainingAmount, Collectors.summingDouble(Double::doubleValue))));
        } catch (Exception e) {
            throw new DebtException("Error fetching debt creditor summary for user: " + userId);
        }
    }

    // Get the top 5 largest debts for a user
    public List<Map<String, Object>> getTop5LargestDebts(Long userId) {
        try {
            List<Debt> debts = getDebtsByUserId(userId);
            return debts.stream()
                    .sorted(Comparator.comparing(Debt::getRemainingAmount).reversed())
                    .limit(5)
                    .map(debt -> {
                        Map<String, Object> result = new HashMap<>();
                        result.put("creditor", debt.getCreditorName());
                        result.put("remainingAmount", debt.getRemainingAmount());
                        result.put("dueDate", debt.getDueDate());
                        return result;
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new DebtException("Error fetching top 5 largest debts for user: " + userId);
        }
    }
}
