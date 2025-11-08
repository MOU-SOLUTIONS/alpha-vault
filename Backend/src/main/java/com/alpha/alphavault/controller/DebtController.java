/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Controller: DebtController — CRUD, payments, windows, totals
 * ================================================================
 */
package com.alpha.alphavault.controller;

import com.alpha.alphavault.dto.common.ApiResponse;
import com.alpha.alphavault.dto.debt.*;
import com.alpha.alphavault.enums.DebtStatus;
import com.alpha.alphavault.service.DebtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/debts")
public class DebtController {

    private final DebtService service;

    // ===================== CRUD (DTO) =====================

    @PostMapping
    public ResponseEntity<ApiResponse<DebtResponseDTO>> create(@Valid @RequestBody DebtRequestDTO dto) {
        var data = service.create(dto);
        return ResponseEntity.status(201).body(ApiResponse.created("Debt created", data, "/api/debts"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DebtResponseDTO>> update(@PathVariable Long id,
                                                               @Valid @RequestBody DebtRequestDTO dto) {
        var data = service.update(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Debt updated", data, "/api/debts/" + id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DebtResponseDTO>> get(@PathVariable Long id) {
        var data = service.getDtoById(id);
        return ResponseEntity.ok(ApiResponse.ok("Debt fetched", data, "/api/debts/" + id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Page<DebtResponseDTO>>> list(@PathVariable Long userId,
                                                                   @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        var page = service.listByUser(userId, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Debts fetched", page, "/api/debts/user/" + userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Debt deleted", null, "/api/debts/" + id));
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restore(@PathVariable Long id) {
        service.restore(id);
        return ResponseEntity.ok(ApiResponse.ok("Debt restored", null, "/api/debts/" + id + "/restore"));
    }

    // ===================== Payments =====================

    @PostMapping("/{id}/payments")
    public ResponseEntity<ApiResponse<DebtPaymentResponseDTO>> addPayment(@PathVariable Long id,
                                                                          @Valid @RequestBody DebtPaymentRequestDTO body) {
        DebtPaymentRequestDTO dto = body.debtId() == null
                ? new DebtPaymentRequestDTO(id, body.paymentAmount(), body.paymentMethod(), body.paymentDate(), body.note())
                : body;
        var data = service.addPayment(dto);
        return ResponseEntity.ok(ApiResponse.ok("Payment recorded", data, "/api/debts/" + id + "/payments"));
    }

    @GetMapping("/{id}/payments")
    public ResponseEntity<ApiResponse<List<DebtPaymentResponseDTO>>> listPayments(@PathVariable Long id) {
        var data = service.listPayments(id);
        return ResponseEntity.ok(ApiResponse.ok("Payments fetched", data, "/api/debts/" + id + "/payments"));
    }

    // ===================== Status / windows =====================

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> setStatus(@PathVariable Long id,
                                                       @RequestParam("value") DebtStatus status) {
        service.setStatus(id, status);
        return ResponseEntity.ok(ApiResponse.ok("Status updated", null, "/api/debts/" + id + "/status"));
    }

    @GetMapping("/user/{userId}/overdue")
    public ResponseEntity<ApiResponse<List<DebtResponseDTO>>> overdue(@PathVariable Long userId) {
        var data = service.overdue(userId);
        return ResponseEntity.ok(ApiResponse.ok("Overdue debts", data, "/api/debts/user/" + userId + "/overdue"));
    }

    @GetMapping("/user/{userId}/due-in")
    public ResponseEntity<ApiResponse<List<DebtResponseDTO>>> dueWithin(@PathVariable Long userId,
                                                                        @RequestParam("days") int days) {
        var data = service.dueWithinDays(userId, days);
        return ResponseEntity.ok(ApiResponse.ok("Debts due within window", data, "/api/debts/user/" + userId + "/due-in?days=" + days));
    }

    // ===================== Aggregates =====================

    @GetMapping("/user/{userId}/totals")
    public ResponseEntity<ApiResponse<Map<String, Object>>> totals(@PathVariable Long userId) {
        var data = service.totals(userId);
        return ResponseEntity.ok(ApiResponse.ok("Debt totals", data, "/api/debts/user/" + userId + "/totals"));
    }

    @GetMapping("/user/{userId}/creditor-summary")
    public ResponseEntity<ApiResponse<Map<String, BigDecimal>>> creditorSummary(@PathVariable Long userId) {
        var data = service.creditorSummary(userId);
        return ResponseEntity.ok(ApiResponse.ok("Debt by creditor", data, "/api/debts/user/" + userId + "/creditor-summary"));
    }

    @GetMapping("/user/{userId}/top5")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> top5(@PathVariable Long userId) {
        var data = service.top5Largest(userId);
        return ResponseEntity.ok(ApiResponse.ok("Top 5 largest debts", data, "/api/debts/user/" + userId + "/top5"));
    }
}
