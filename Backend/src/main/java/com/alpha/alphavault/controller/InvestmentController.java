// com/alpha/alphavault/controller/InvestmentController.java
package com.alpha.alphavault.controller;

import com.alpha.alphavault.dto.InvestmentRequestDTO;
import com.alpha.alphavault.dto.InvestmentResponseDTO;
import com.alpha.alphavault.mapper.InvestmentMapper;
import com.alpha.alphavault.model.Investment;
import com.alpha.alphavault.service.InvestmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/investment")
public class InvestmentController {

    private final InvestmentService svc;
    private final InvestmentMapper mapper;

    public InvestmentController(InvestmentService svc, InvestmentMapper mapper) {
        this.svc = svc;
        this.mapper = mapper;
    }

    @PostMapping
    public ResponseEntity<InvestmentResponseDTO> create(@RequestBody InvestmentRequestDTO dto) {
        Investment inv = svc.create(dto);
        return ResponseEntity.ok(mapper.fromEntity(inv));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InvestmentResponseDTO> update(@PathVariable Long id,
                                                        @RequestBody InvestmentRequestDTO dto) {
        Investment inv = svc.update(id, dto);
        return ResponseEntity.ok(mapper.fromEntity(inv));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        svc.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvestmentResponseDTO> getById(@PathVariable Long id) {
        Investment inv = svc.getById(id);
        return ResponseEntity.ok(mapper.fromEntity(inv));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<InvestmentResponseDTO>> getByUser(@PathVariable Long userId) {
        List<InvestmentResponseDTO> dtos = svc.getByUser(userId).stream()
            .map(mapper::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /** refresh a single holding’s currentValue from market data */
    @PostMapping("/{id}/refresh")
    public ResponseEntity<InvestmentResponseDTO> refresh(@PathVariable Long id) {
        Investment inv = svc.refreshCurrentValue(id);
        return ResponseEntity.ok(mapper.fromEntity(inv));
    }

    /** refresh all of a user’s holdings */
    @PostMapping("/user/{userId}/refresh")
    public ResponseEntity<List<InvestmentResponseDTO>> refreshAll(@PathVariable Long userId) {
        List<InvestmentResponseDTO> dtos = svc.refreshAllForUser(userId).stream()
            .map(mapper::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
