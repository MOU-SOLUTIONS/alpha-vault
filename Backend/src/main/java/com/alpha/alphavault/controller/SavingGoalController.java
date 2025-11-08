/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Controller: SavingGoalController — CRUD + money ops + filters
 * ================================================================
 */
package com.alpha.alphavault.controller;

import com.alpha.alphavault.dto.common.ApiResponse;
import com.alpha.alphavault.dto.savinggoal.SavingGoalRequestDTO;
import com.alpha.alphavault.dto.savinggoal.SavingGoalResponseDTO;
import com.alpha.alphavault.enums.SavingGoalPriority;
import com.alpha.alphavault.enums.SavingGoalCategory;
import com.alpha.alphavault.enums.SavingGoalStatus;
import com.alpha.alphavault.service.SavingGoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/saving-goals")
public class SavingGoalController {

    private final SavingGoalService service;

    // =============== CRUD ===============

    @PostMapping
    public ResponseEntity<ApiResponse<SavingGoalResponseDTO>> create(@Valid @RequestBody SavingGoalRequestDTO dto) {
        var data = service.create(dto);
        return ResponseEntity.status(201).body(ApiResponse.created("Saving goal created", data, "/api/saving-goals"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SavingGoalResponseDTO>> update(@PathVariable Long id,
                                                                     @RequestBody SavingGoalRequestDTO dto) {
        // Note: @Valid removed to allow partial updates (null fields = no change)
        // Validation is handled in the service layer for updates
        try {
            var data = service.update(id, dto);
            return ResponseEntity.ok(ApiResponse.ok("Saving goal updated", data, "/api/saving-goals/" + id));
        } catch (Exception e) {
            // Log at controller level for debugging
            org.slf4j.LoggerFactory.getLogger(SavingGoalController.class)
                .error("Error in PUT /api/saving-goals/{}: {}", id, e.getMessage(), e);
            throw e; // Re-throw to let GlobalExceptionHandler handle it
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SavingGoalResponseDTO>> get(@PathVariable Long id) {
        var data = service.get(id);
        return ResponseEntity.ok(ApiResponse.ok("Saving goal fetched", data, "/api/saving-goals/" + id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Page<SavingGoalResponseDTO>>> list(@PathVariable Long userId,
                                                                         @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        var page = service.listByUser(userId, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Saving goals fetched", page, "/api/saving-goals/user/" + userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Saving goal deleted", null, "/api/saving-goals/" + id));
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restore(@PathVariable Long id) {
        service.restore(id);
        return ResponseEntity.ok(ApiResponse.ok("Saving goal restored", null, "/api/saving-goals/" + id + "/restore"));
    }

    // =============== Money Ops ===============

    @PostMapping("/{id}/contribute")
    public ResponseEntity<ApiResponse<SavingGoalResponseDTO>> contribute(@PathVariable Long id,
                                                                         @RequestParam("amount") BigDecimal amount) {
        var data = service.contribute(id, amount);
        return ResponseEntity.ok(ApiResponse.ok("Contribution added", data, "/api/saving-goals/" + id + "/contribute"));
    }

    @PostMapping("/{id}/withdraw")
    public ResponseEntity<ApiResponse<SavingGoalResponseDTO>> withdraw(@PathVariable Long id,
                                                                       @RequestParam("amount") BigDecimal amount) {
        var data = service.withdraw(id, amount);
        return ResponseEntity.ok(ApiResponse.ok("Withdrawal applied", data, "/api/saving-goals/" + id + "/withdraw"));
    }

    // =============== Status / Attributes ===============

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<SavingGoalResponseDTO>> setStatus(@PathVariable Long id,
                                                                        @RequestParam("value") SavingGoalStatus status) {
        var data = service.setStatus(id, status);
        return ResponseEntity.ok(ApiResponse.ok("Status updated", data, "/api/saving-goals/" + id + "/status"));
    }

    @PatchMapping("/{id}/deadline")
    public ResponseEntity<ApiResponse<SavingGoalResponseDTO>> moveDeadline(@PathVariable Long id,
                                                                           @RequestParam("date") String isoDate) {
        var data = service.moveDeadline(id, LocalDate.parse(isoDate));
        return ResponseEntity.ok(ApiResponse.ok("Deadline moved", data, "/api/saving-goals/" + id + "/deadline"));
    }

    @PatchMapping("/{id}/rename")
    public ResponseEntity<ApiResponse<SavingGoalResponseDTO>> rename(@PathVariable Long id,
                                                                     @RequestParam("name") String name) {
        var data = service.rename(id, name);
        return ResponseEntity.ok(ApiResponse.ok("Name updated", data, "/api/saving-goals/" + id + "/rename"));
    }

    // =============== Filters / Windows ===============

    @GetMapping("/user/{userId}/status/{status}")
    public ResponseEntity<ApiResponse<List<SavingGoalResponseDTO>>> byStatus(@PathVariable Long userId,
                                                                             @PathVariable SavingGoalStatus status) {
        var data = service.listByStatus(userId, status);
        return ResponseEntity.ok(ApiResponse.ok("Goals by status", data, "/api/saving-goals/user/" + userId + "/status/" + status));
    }

    @GetMapping("/user/{userId}/category/{category}")
    public ResponseEntity<ApiResponse<List<SavingGoalResponseDTO>>> byCategory(@PathVariable Long userId,
                                                                               @PathVariable SavingGoalCategory category) {
        var data = service.listByCategory(userId, category);
        return ResponseEntity.ok(ApiResponse.ok("Goals by category", data, "/api/saving-goals/user/" + userId + "/category/" + category));
    }

    @GetMapping("/user/{userId}/priority/{priority}")
    public ResponseEntity<ApiResponse<List<SavingGoalResponseDTO>>> byPriority(@PathVariable Long userId,
                                                                               @PathVariable SavingGoalPriority priority) {
        var data = service.listByPriority(userId, priority);
        return ResponseEntity.ok(ApiResponse.ok("Goals by priority", data, "/api/saving-goals/user/" + userId + "/priority/" + priority));
    }

    @GetMapping("/user/{userId}/overdue")
    public ResponseEntity<ApiResponse<List<SavingGoalResponseDTO>>> overdue(@PathVariable Long userId) {
        var data = service.overdue(userId);
        return ResponseEntity.ok(ApiResponse.ok("Overdue goals", data, "/api/saving-goals/user/" + userId + "/overdue"));
    }

    @GetMapping("/user/{userId}/due-in")
    public ResponseEntity<ApiResponse<List<SavingGoalResponseDTO>>> dueWithin(@PathVariable Long userId,
                                                                              @RequestParam("days") int days) {
        var data = service.dueWithinDays(userId, days);
        return ResponseEntity.ok(ApiResponse.ok("Goals due within window", data, "/api/saving-goals/user/" + userId + "/due-in?days=" + days));
    }

    // =============== Aggregates ===============

    @GetMapping("/user/{userId}/totals")
    public ResponseEntity<ApiResponse<Map<String, Object>>> totals(@PathVariable Long userId) {
        var data = service.totals(userId);
        return ResponseEntity.ok(ApiResponse.ok("Saving goals totals", data, "/api/saving-goals/user/" + userId + "/totals"));
    }
}
