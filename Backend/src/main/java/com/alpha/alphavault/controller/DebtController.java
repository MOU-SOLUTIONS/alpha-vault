package com.alpha.alphavault.controller;

import com.alpha.alphavault.dto.DebtRequestDTO;
import com.alpha.alphavault.dto.DebtResponseDTO;
import com.alpha.alphavault.mapper.DebtMapper;
import com.alpha.alphavault.model.Debt;
import com.alpha.alphavault.model.DebtHistory;
import com.alpha.alphavault.service.DebtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/debt")
public class DebtController {

    private final DebtService debtService;
    private final DebtMapper debtMapper;

    @Autowired
    public DebtController(DebtService debtService, DebtMapper debtMapper) {
        this.debtService = debtService;
        this.debtMapper = debtMapper;
    }

    // CREATE or UPDATE
    @PostMapping
    public ResponseEntity<DebtResponseDTO> saveDebt(@RequestBody DebtRequestDTO dto) {
        Debt debt = debtMapper.toEntity(dto);  // Use the mapper here
        Debt saved = debtService.saveDebt(debt);
        return ResponseEntity.status(HttpStatus.CREATED).body(debtMapper.fromEntity(saved));  // Use the mapper again
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDebt(@PathVariable Long id) {
        debtService.deleteDebt(id);
        return ResponseEntity.ok("Debt deleted successfully.");
    }

    // GET by ID
    @GetMapping("/{id}")
    public ResponseEntity<DebtResponseDTO> getDebtById(@PathVariable Long id) {
        return ResponseEntity.ok(debtMapper.fromEntity(debtService.getDebtById(id)));
    }

    // GET all debts for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<DebtResponseDTO>> getAllDebts(@PathVariable Long userId) {
        return ResponseEntity.ok(debtService.getDebtsByUserId(userId)
                .stream().map(debtMapper::fromEntity).collect(Collectors.toList()));
    }

    // GET total debt for a user
    @GetMapping("/total/{userId}")
    public ResponseEntity<Double> getTotalDebt(@PathVariable Long userId) {
        return ResponseEntity.ok(debtService.getTotalDebt(userId));
    }

    // GET overdue debts for a user
    @GetMapping("/overdue/{userId}")
    public ResponseEntity<List<DebtResponseDTO>> getOverdueDebts(@PathVariable Long userId) {
        return ResponseEntity.ok(debtService.getOverdueDebts(userId)
                .stream().map(debtMapper::fromEntity).collect(Collectors.toList()));
    }

    // GET debt payment history for a debt
    @GetMapping("/payment-history/{debtId}")
    public ResponseEntity<List<Map<String, Object>>> getDebtPaymentHistory(@PathVariable Long debtId) {
        return ResponseEntity.ok(debtService.getDebtPaymentHistory(debtId)
                .stream().map(payment -> {
                    Map<String, Object> result = Map.of(
                            "paymentDate", payment.getPaymentDate(),
                            "paymentAmount", payment.getPaymentAmount(),
                            "remainingAmount", payment.getRemainingAmount(),
                            "note", payment.getNote()
                    );
                    return result;
                }).collect(Collectors.toList()));
    }

    // GET total minimum payments for a user
    @GetMapping("/total-min-payments/{userId}")
    public ResponseEntity<Double> getTotalMinPayments(@PathVariable Long userId) {
        return ResponseEntity.ok(debtService.getTotalMinPayments(userId));
    }

    // GET debts summarized by creditor for a user
    @GetMapping("/creditor-summary/{userId}")
    public ResponseEntity<Map<String, Double>> getDebtCreditorSummary(@PathVariable Long userId) {
        return ResponseEntity.ok(debtService.getDebtCreditorSummary(userId));
    }

    // GET top 5 largest debts for a user
    @GetMapping("/top5/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getTop5LargestDebts(@PathVariable Long userId) {
        return ResponseEntity.ok(debtService.getTop5LargestDebts(userId));
    }

    // ADD payment to a debt
    @PostMapping("/add-payment/{debtId}")
    public ResponseEntity<Map<String, Object>> addPaymentToDebt(@PathVariable Long debtId, @RequestBody Map<String, Object> paymentDetails) {
        Double paymentAmount = (Double) paymentDetails.get("paymentAmount");
        String note = (String) paymentDetails.get("note");
        DebtHistory payment = new DebtHistory(paymentAmount, note);  // Assuming constructor exists
        debtService.addPaymentToDebt(debtId, payment);
        return ResponseEntity.ok(Map.of("message", "Payment added successfully"));
    }
}
