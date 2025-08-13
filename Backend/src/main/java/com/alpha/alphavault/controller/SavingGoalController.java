package com.alpha.alphavault.controller;

import com.alpha.alphavault.dto.SavingGoalRequestDTO;
import com.alpha.alphavault.dto.SavingGoalResponseDTO;
import com.alpha.alphavault.mapper.SavingGoalMapper;
import com.alpha.alphavault.model.SavingGoal;
import com.alpha.alphavault.service.SavingGoalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/saving-goal")
public class SavingGoalController {

    private final SavingGoalService savingGoalService;
    private final SavingGoalMapper savingGoalMapper;

    @Autowired
    public SavingGoalController(SavingGoalService savingGoalService, SavingGoalMapper savingGoalMapper) {
        this.savingGoalService = savingGoalService;
        this.savingGoalMapper = savingGoalMapper;
    }

    // CREATE or UPDATE
    @PostMapping
    public ResponseEntity<SavingGoalResponseDTO> saveSavingGoal(@RequestBody SavingGoalRequestDTO dto) {
        SavingGoal saved = savingGoalService.saveSavingGoal(savingGoalMapper.toEntity(dto));
        return ResponseEntity.status(HttpStatus.CREATED).body(savingGoalMapper.fromEntity(saved));
    }

    @PutMapping("/{id}")
public ResponseEntity<SavingGoalResponseDTO> updateSavingGoal(@PathVariable Long id,
                                                               @RequestBody SavingGoalRequestDTO dto) {
    SavingGoal updated = savingGoalService.updateSavingGoal(id, savingGoalMapper.toEntity(dto));
    return ResponseEntity.ok(savingGoalMapper.fromEntity(updated));
}


    // DELETE
   @DeleteMapping("/{id}")
public ResponseEntity<Void> deleteSavingGoal(@PathVariable Long id) {
    savingGoalService.deleteSavingGoal(id);
    return ResponseEntity.noContent().build(); // ✅ No body
}


    // GET by ID
    @GetMapping("/{id}")
    public ResponseEntity<SavingGoalResponseDTO> getSavingGoalById(@PathVariable Long id) {
        return ResponseEntity.ok(savingGoalMapper.fromEntity(savingGoalService.getSavingGoalById(id)));
    }

    // GET all saving goals for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SavingGoalResponseDTO>> getAllSavingGoals(@PathVariable Long userId) {
        return ResponseEntity.ok(
                savingGoalService.getSavingGoalsByUserId(userId)
                        .stream()
                        .map(savingGoalMapper::fromEntity)
                        .collect(Collectors.toList())
        );
    }

    @GetMapping("/user/{userId}/ordered")
    public ResponseEntity<List<SavingGoalResponseDTO>> getSavingGoalsOrdered(@PathVariable Long userId) {
        return ResponseEntity.ok(
                savingGoalService.getSavingGoalsByUserIdOrderByCreationDateDesc(userId)
                        .stream()
                        .map(savingGoalMapper::fromEntity)
                        .collect(Collectors.toList())
        );
    }

    @GetMapping("/user/{userId}/deadline")
    public ResponseEntity<List<SavingGoalResponseDTO>> getSavingGoalsBeforeDeadline(@PathVariable Long userId,
                                                                                    @RequestParam("date") String date) {
        LocalDate deadline = LocalDate.parse(date);
        return ResponseEntity.ok(
                savingGoalService.getSavingGoalsByUserIdAndDeadlineBefore(userId, deadline)
                        .stream()
                        .map(savingGoalMapper::fromEntity)
                        .collect(Collectors.toList())
        );
    }

    @GetMapping("/user/{userId}/category")
    public ResponseEntity<List<SavingGoalResponseDTO>> getByCategory(@PathVariable Long userId,
                                                                     @RequestParam("category") String category) {
        return ResponseEntity.ok(
                savingGoalService.getSavingGoalsByUserIdAndCategory(userId, category)
                        .stream()
                        .map(savingGoalMapper::fromEntity)
                        .collect(Collectors.toList())
        );
    }

    @GetMapping("/user/{userId}/priority")
    public ResponseEntity<List<SavingGoalResponseDTO>> getByPriority(@PathVariable Long userId,
                                                                     @RequestParam("priority") String priority) {
        return ResponseEntity.ok(
                savingGoalService.getSavingGoalsByUserIdAndPriority(userId, priority)
                        .stream()
                        .map(savingGoalMapper::fromEntity)
                        .collect(Collectors.toList())
        );
    }

    @GetMapping("/user/{userId}/target-gt")
    public ResponseEntity<List<SavingGoalResponseDTO>> getByTargetAmountGreaterThan(@PathVariable Long userId,
                                                                                    @RequestParam("amount") Double amount) {
        return ResponseEntity.ok(
                savingGoalService.getSavingGoalsByUserIdAndTargetAmountGreaterThan(userId, amount)
                        .stream()
                        .map(savingGoalMapper::fromEntity)
                        .collect(Collectors.toList())
        );
    }

    @GetMapping("/user/{userId}/current-lt")
    public ResponseEntity<List<SavingGoalResponseDTO>> getByCurrentAmountLessThan(@PathVariable Long userId,
                                                                                  @RequestParam("amount") Double amount) {
        return ResponseEntity.ok(
                savingGoalService.getSavingGoalsByUserIdAndCurrentAmountLessThan(userId, amount)
                        .stream()
                        .map(savingGoalMapper::fromEntity)
                        .collect(Collectors.toList())
        );
    }
}
