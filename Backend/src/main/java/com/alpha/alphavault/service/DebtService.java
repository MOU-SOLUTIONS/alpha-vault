/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Service: DebtService — DTO-first CRUD, payments, filters, totals
 *  Guarantees:
 *    - BigDecimal-safe money math
 *    - Optimistic locking friendly
 *    - Soft delete aware (via @SQLDelete/@Where)
 *    - Clear exceptions -> GlobalExceptionHandler
 * ================================================================
 */
package com.alpha.alphavault.service;

import com.alpha.alphavault.dto.debt.*;
import com.alpha.alphavault.enums.DebtStatus;
import com.alpha.alphavault.exception.DebtException;
import com.alpha.alphavault.exception.DebtNotFoundException;
import com.alpha.alphavault.mapper.DebtMapper;
import com.alpha.alphavault.model.Debt;
import com.alpha.alphavault.model.DebtHistory;
import com.alpha.alphavault.repository.DebtHistoryRepository;
import com.alpha.alphavault.repository.DebtRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class DebtService {

    private final DebtRepository debtRepository;
    private final DebtHistoryRepository paymentRepository;
    private final DebtMapper mapper;

    // ============================================================
    // == DTO-first CRUD
    // ============================================================

    @Transactional
    public DebtResponseDTO create(DebtRequestDTO dto) {
        try {
            Debt debt = mapper.toEntity(dto);
            Debt saved = debtRepository.save(debt);
            return mapper.toResponse(saved);
        } catch (Exception e) {
            throw new DebtException("Error creating debt: " + e.getMessage(), e);
        }
    }

    @Transactional
    public DebtResponseDTO update(Long id, DebtRequestDTO dto) {
        Debt debt = debtRepository.findById(id)
                .orElseThrow(() -> new DebtNotFoundException("Debt not found for id: " + id));
        mapper.updateEntity(debt, dto);
        Debt saved = debtRepository.save(debt);
        return mapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public DebtResponseDTO getDtoById(Long id) {
        Debt debt = debtRepository.findById(id)
                .orElseThrow(() -> new DebtNotFoundException("Debt not found for id: " + id));
        return mapper.toResponse(debt);
    }

    @Transactional(readOnly = true)
    public Page<DebtResponseDTO> listByUser(Long userId, Pageable pageable) {
        return debtRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable).map(mapper::toResponse);
    }

    @Transactional
    public void delete(Long id) {
        // Hard delete: first delete related payment history, then delete the debt
        // Note: We skip the existsById check since hard delete will handle non-existent records
        paymentRepository.deleteByDebtId(id);
        int deleted = debtRepository.hardDeleteById(id);
        if (deleted == 0) throw new DebtNotFoundException("Debt not found for id: " + id);
    }

    @Transactional
    public void restore(Long id) {
        int updated = debtRepository.restore(id);
        if (updated == 0) throw new DebtException("Failed to restore debt id: " + id);
    }

    // ============================================================
    // == Payments
    // ============================================================

    @Transactional
    public DebtPaymentResponseDTO addPayment(DebtPaymentRequestDTO dto) {
        Debt debt = debtRepository.findById(dto.debtId())
                .orElseThrow(() -> new DebtNotFoundException("Debt not found for id: " + dto.debtId()));

        if (dto.paymentAmount() == null || dto.paymentAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be > 0");
        }

        BigDecimal remaining = debt.getRemainingAmount() != null ? debt.getRemainingAmount() : BigDecimal.ZERO;
        BigDecimal after = remaining.subtract(dto.paymentAmount());
        if (after.compareTo(BigDecimal.ZERO) < 0) after = BigDecimal.ZERO;

        // Build and persist payment row
        DebtHistory pay = mapper.toPaymentEntity(dto);
        pay.setDebt(debt);
        pay.setRemainingAfterPayment(after);

        // Update debt
        debt.setRemainingAmount(after);
        if (after.compareTo(BigDecimal.ZERO) == 0) {
            debt.setStatus(DebtStatus.PAID_OFF);
        } else if (debt.getDueDate() != null && debt.getDueDate().isBefore(LocalDate.now())) {
            debt.setStatus(DebtStatus.DELINQUENT);
        } else if (debt.getStatus() == DebtStatus.DELINQUENT) {
            debt.setStatus(DebtStatus.ACTIVE); // recovered from delinquency
        }

        // Persist atomically
        debtRepository.save(debt);
        DebtHistory saved = paymentRepository.save(pay);

        return mapper.toPaymentResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<DebtPaymentResponseDTO> listPayments(Long debtId) {
        if (!debtRepository.existsById(debtId)) throw new DebtNotFoundException("Debt not found for id: " + debtId);
        return paymentRepository.findByDebtIdOrderByPaymentDateDesc(debtId)
                .stream().map(mapper::toPaymentResponse).toList();
    }

    // ============================================================
    // == Status / windows
    // ============================================================

    @Transactional
    public void setStatus(Long id, DebtStatus status) {
        Debt d = debtRepository.findById(id).orElseThrow(() -> new DebtNotFoundException("Debt not found for id: " + id));
        d.setStatus(status);
        debtRepository.save(d);
    }

    @Transactional(readOnly = true)
    public List<DebtResponseDTO> overdue(Long userId) {
        return debtRepository.findByUserIdAndDueDateBefore(userId, LocalDate.now())
                .stream()
                .filter(d -> d.getRemainingAmount() != null && d.getRemainingAmount().compareTo(BigDecimal.ZERO) > 0)
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DebtResponseDTO> dueWithinDays(Long userId, int days) {
        LocalDate start = LocalDate.now();
        LocalDate end = start.plusDays(days);
        return debtRepository.findDueWindow(userId, start, end).stream().map(mapper::toResponse).toList();
    }

    // ============================================================
    // == Aggregates / summaries
    // ============================================================

    @Transactional(readOnly = true)
    public Map<String, Object> totals(Long userId) {
        var debts = debtRepository.findByUserId(userId);
        BigDecimal sumRemaining = debts.stream()
                .map(Debt::getRemainingAmount).filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal sumMinPayments = debts.stream()
                .map(Debt::getMinPayment).filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("totalRemaining", sumRemaining);
        out.put("totalMinPayments", sumMinPayments);
        out.put("debtsCount", debts.size());
        return out;
    }

    @Transactional(readOnly = true)
    public Map<String, BigDecimal> creditorSummary(Long userId) {
        var debts = debtRepository.findByUserId(userId);
        Map<String, BigDecimal> map = new HashMap<>();
        for (Debt d : debts) {
            String k = d.getCreditorName();
            if (k == null || k.isBlank()) k = "UNKNOWN";
            map.merge(k, d.getRemainingAmount() == null ? BigDecimal.ZERO : d.getRemainingAmount(), BigDecimal::add);
        }
        return map;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> top5Largest(Long userId) {
        var debts = debtRepository.findByUserId(userId);
        return debts.stream()
                .sorted(Comparator.comparing(Debt::getRemainingAmount, Comparator.nullsLast(BigDecimal::compareTo)).reversed())
                .limit(5)
                .map(d -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id", d.getId());
                    row.put("creditor", d.getCreditorName());
                    row.put("remainingAmount", d.getRemainingAmount());
                    row.put("dueDate", d.getDueDate());
                    row.put("status", d.getStatus());
                    return row;
                }).collect(Collectors.toList());
    }

    // ============================================================
    // == Legacy methods (kept for compatibility with your old code)
    // ============================================================

    @Transactional
    public Debt saveDebt(Debt debt) {
        try {
            return debtRepository.save(debt);
        } catch (Exception e) {
            throw new DebtException("Error saving debt: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void deleteDebt(Long id) {
        if (!debtRepository.existsById(id)) throw new DebtNotFoundException("Debt not found for id: " + id);
        debtRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Debt getDebtById(Long id) {
        return debtRepository.findById(id).orElseThrow(() -> new DebtNotFoundException("Debt not found for id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Debt> getDebtsByUserId(Long userId) {
        return debtRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public BigDecimal getTotalDebt(Long userId) {
        return debtRepository.sumRemainingByUser(userId);
    }

    @Transactional
    public DebtHistory addPaymentToDebt(Long debtId, DebtHistory debtHistory) {
        // Route through new API but keep signature
        DebtPaymentRequestDTO dto = new DebtPaymentRequestDTO(
                debtId,
                debtHistory.getPaymentAmount(),
                debtHistory.getPaymentMethod(),
                debtHistory.getPaymentDate(),
                debtHistory.getNote()
        );
        var resp = addPayment(dto);
        // Return entity-style history if your old callers expect it:
        DebtHistory h = new DebtHistory();
        h.setId(resp.id());
        Debt d = new Debt(); d.setId(resp.debtId()); h.setDebt(d);
        h.setPaymentDate(resp.paymentDate());
        h.setPaymentMethod(resp.paymentMethod());
        h.setPaymentAmount(resp.paymentAmount());
        h.setRemainingAfterPayment(resp.remainingAfterPayment());
        h.setNote(resp.note());
        return h;
    }

    @Transactional(readOnly = true)
    public List<DebtHistory> getDebtPaymentHistory(Long debtId) {
        return paymentRepository.findByDebtIdOrderByPaymentDateDesc(debtId);
    }

    @Transactional(readOnly = true)
    public List<Debt> getOverdueDebts(Long userId) {
        LocalDate today = LocalDate.now();
        return debtRepository.findByUserIdAndDueDateBefore(userId, today).stream()
                .filter(d -> d.getRemainingAmount() != null && d.getRemainingAmount().compareTo(BigDecimal.ZERO) > 0)
                .toList();
    }

    @Transactional(readOnly = true)
    public BigDecimal getTotalMinPayments(Long userId) {
        var debts = debtRepository.findByUserId(userId);
        return debts.stream()
                .map(Debt::getMinPayment).filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Transactional(readOnly = true)
    public Map<String, BigDecimal> getDebtCreditorSummary(Long userId) {
        return creditorSummary(userId);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTop5LargestDebts(Long userId) {
        return top5Largest(userId);
    }
}
