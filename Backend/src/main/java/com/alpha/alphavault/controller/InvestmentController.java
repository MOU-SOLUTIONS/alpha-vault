/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Controller: InvestmentController — CRUD, MTM, close/reopen
 * ================================================================
 */
package com.alpha.alphavault.controller;

import com.alpha.alphavault.dto.common.ApiResponse;
import com.alpha.alphavault.dto.investment.InvestmentCloseRequestDTO;
import com.alpha.alphavault.dto.investment.InvestmentPriceUpdateDTO;
import com.alpha.alphavault.dto.investment.InvestmentRequestDTO;
import com.alpha.alphavault.dto.investment.InvestmentResponseDTO;
import com.alpha.alphavault.enums.InvestmentType;
import com.alpha.alphavault.mapper.InvestmentMapper;
import com.alpha.alphavault.model.Investment;
import com.alpha.alphavault.service.InvestmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/investments")
public class InvestmentController {

    private final InvestmentService service;
    private final InvestmentMapper mapper;

    // -------------------- Create / Update / Delete --------------------

    @PostMapping
    public ResponseEntity<ApiResponse<InvestmentResponseDTO>> create(@Valid @RequestBody InvestmentRequestDTO dto) {
        Investment saved = service.create(dto);
        var data = mapper.toResponse(saved);
        return ResponseEntity.status(201)
                .body(ApiResponse.created("Investment created", data, "/api/investments/" + saved.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<InvestmentResponseDTO>> update(@PathVariable Long id,
                                                                     @Valid @RequestBody InvestmentRequestDTO dto) {
        Investment updated = service.update(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Investment updated", mapper.toResponse(updated),
                "/api/investments/" + id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id); // hard delete - permanently removes the investment
        return ResponseEntity.ok(ApiResponse.ok("Investment deleted", null, "/api/investments/" + id));
    }

    // -------------------- Reads --------------------

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InvestmentResponseDTO>> getById(@PathVariable Long id) {
        Investment inv = service.getById(id);
        return ResponseEntity.ok(ApiResponse.ok("Investment fetched", mapper.toResponse(inv),
                "/api/investments/" + id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<InvestmentResponseDTO>>> getByUser(@PathVariable Long userId) {
        List<InvestmentResponseDTO> list = service.getByUser(userId).stream().map(mapper::toResponse).toList();
        return ResponseEntity.ok(ApiResponse.ok("Investments fetched", list, "/api/investments/user/" + userId));
    }

    @GetMapping("/user/{userId}/type/{type}")
    public ResponseEntity<ApiResponse<List<InvestmentResponseDTO>>> getByUserAndType(@PathVariable Long userId,
                                                                                     @PathVariable String type) {
        InvestmentType t = InvestmentType.valueOf(type.toUpperCase());
        List<InvestmentResponseDTO> list = service.getByUserAndType(userId, t).stream().map(mapper::toResponse).toList();
        return ResponseEntity.ok(ApiResponse.ok("Investments by type fetched", list,
                "/api/investments/user/" + userId + "/type/" + type));
    }

    @GetMapping("/user/{userId}/open")
    public ResponseEntity<ApiResponse<List<InvestmentResponseDTO>>> getOpenByUser(@PathVariable Long userId) {
        List<InvestmentResponseDTO> list = service.getOpenByUser(userId).stream().map(mapper::toResponse).toList();
        return ResponseEntity.ok(ApiResponse.ok("Open investments fetched", list,
                "/api/investments/user/" + userId + "/open"));
    }

    @GetMapping("/user/{userId}/closed")
    public ResponseEntity<ApiResponse<List<InvestmentResponseDTO>>> getClosedByUser(@PathVariable Long userId) {
        List<InvestmentResponseDTO> list = service.getClosedByUser(userId).stream().map(mapper::toResponse).toList();
        return ResponseEntity.ok(ApiResponse.ok("Closed investments fetched", list,
                "/api/investments/user/" + userId + "/closed"));
    }

    // -------------------- Mark-to-Market (manual + external refresh) --------------------

    /** Manual MTM from UI: set currentPrice, derive currentValue. */
    @PostMapping("/{id}/mtm")
    public ResponseEntity<ApiResponse<InvestmentResponseDTO>> markToMarket(@PathVariable Long id,
                                                                           @Valid @RequestBody InvestmentPriceUpdateDTO dto) {
        Investment updated = service.markToMarket(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Price updated", mapper.toResponse(updated),
                "/api/investments/" + id + "/mtm"));
    }

    /** Pull latest price from MarketDataService for a single investment. */
    @PostMapping("/{id}/refresh")
    public ResponseEntity<ApiResponse<InvestmentResponseDTO>> refresh(@PathVariable Long id) {
        Investment updated = service.refreshCurrentValue(id);
        return ResponseEntity.ok(ApiResponse.ok("Price refreshed", mapper.toResponse(updated),
                "/api/investments/" + id + "/refresh"));
    }

    /** Refresh all OPEN investments for a user. */
    @PostMapping("/user/{userId}/refresh")
    public ResponseEntity<ApiResponse<List<InvestmentResponseDTO>>> refreshAll(@PathVariable Long userId) {
        List<InvestmentResponseDTO> list = service.refreshAllForUser(userId).stream().map(mapper::toResponse).toList();
        return ResponseEntity.ok(ApiResponse.ok("All open investments refreshed", list,
                "/api/investments/user/" + userId + "/refresh"));
    }

    // -------------------- Lifecycle: close / reopen --------------------

    @PostMapping("/{id}/close")
    public ResponseEntity<ApiResponse<InvestmentResponseDTO>> close(@PathVariable Long id,
                                                                    @Valid @RequestBody InvestmentCloseRequestDTO dto) {
        Investment closed = service.closePosition(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Position closed", mapper.toResponse(closed),
                "/api/investments/" + id + "/close"));
    }

    @PostMapping("/{id}/reopen")
    public ResponseEntity<ApiResponse<InvestmentResponseDTO>> reopen(@PathVariable Long id) {
        Investment reopened = service.reopen(id);
        return ResponseEntity.ok(ApiResponse.ok("Position reopened", mapper.toResponse(reopened),
                "/api/investments/" + id + "/reopen"));
    }
}
