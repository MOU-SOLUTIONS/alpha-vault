/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Service: SavingGoalService — create/update, contributions, status,
 *           filters, overdue/upcoming, soft delete/restore
 * ================================================================
 */
package com.alpha.alphavault.service;

import com.alpha.alphavault.dto.savinggoal.SavingGoalRequestDTO;
import com.alpha.alphavault.dto.savinggoal.SavingGoalResponseDTO;
import com.alpha.alphavault.enums.SavingGoalPriority;
import com.alpha.alphavault.enums.SavingGoalCategory;
import com.alpha.alphavault.enums.SavingGoalStatus;
import com.alpha.alphavault.exception.SavingGoalException;
import com.alpha.alphavault.exception.SavingGoalNotFoundException;
import com.alpha.alphavault.mapper.SavingGoalMapper;
import com.alpha.alphavault.model.SavingGoal;
import com.alpha.alphavault.model.User;
import com.alpha.alphavault.repository.SavingGoalRepository;
import com.alpha.alphavault.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Slf4j
@RequiredArgsConstructor
@Service
public class SavingGoalService {

    private final SavingGoalRepository repo;
    private final SavingGoalMapper mapper;
    private final UserRepository userRepo;
    
    @PersistenceContext
    private EntityManager entityManager;

    // ======================== CRUD (DTO) ========================

    @Transactional
    public SavingGoalResponseDTO create(SavingGoalRequestDTO dto) {
        // Validate user exists for clean error messages
        userRepo.findById(dto.userId()).orElseThrow(() -> new SavingGoalException("User not found: " + dto.userId()));

        // Enforce unique (user, name) with clear 400
        if (nameExistsForUser(dto.userId(), dto.name())) {
            throw new IllegalArgumentException("A goal with this name already exists for the user");
        }

        SavingGoal g = mapper.toEntity(dto);
        g.setUser(new User(dto.userId())); // ensure association
        SavingGoal saved = repo.save(g);
        return mapper.toResponse(saved);
    }

    @Transactional
    public SavingGoalResponseDTO update(Long id, SavingGoalRequestDTO dto) {
        try {
            log.debug("Updating saving goal id={}, dto={}", id, dto);
            
            SavingGoal g = repo.findById(id).orElseThrow(() -> new SavingGoalNotFoundException("SavingGoal not found: " + id));
            
            // CRITICAL: Ensure version is initialized before any operations
            // Hibernate's optimistic locking requires version to be non-null
            // If version is null, it means the record was created before version tracking was added
            if (g.getVersion() == null) {
                log.warn("Version is null for saving goal id={}, fixing by setting to 0 in database", id);
                // Use repository method to directly update version in database (bypasses Hibernate's version increment)
                repo.fixNullVersion(id);
                
                // Reload the entity to get the updated version
                entityManager.detach(g);
                g = repo.findById(id).orElseThrow(() -> new SavingGoalNotFoundException("SavingGoal not found after version fix: " + id));
                
                // Double-check version is now set
                if (g.getVersion() == null) {
                    log.error("Version is still null after fix for saving goal id={}, manually setting", id);
                    g.setVersion(0L);
                }
            }
            
            log.debug("Found saving goal: id={}, version={}, currentAmount={}, targetAmount={}", 
                    g.getId(), g.getVersion(), g.getCurrentAmount(), g.getTargetAmount());

            // Ensure user is loaded to avoid LazyInitializationException
            if (g.getUser() != null) {
                Long userId = g.getUser().getId(); // Trigger lazy loading if needed
                log.debug("User loaded: userId={}", userId);
            }

            // If name is changing, check uniqueness within the user
            if (dto.name() != null && !dto.name().equalsIgnoreCase(g.getName()) && g.getUser() != null) {
                if (nameExistsForUser(g.getUser().getId(), dto.name())) {
                    throw new IllegalArgumentException("A goal with this name already exists for the user");
                }
            }

            // Validate updated fields if they were provided (before updating)
            if (dto.currentAmount() != null && dto.currentAmount().compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Current amount cannot be negative");
            }
            
            if (dto.targetAmount() != null && dto.targetAmount().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Target amount must be greater than zero");
            }

            // Update entity - mapper only updates non-null fields (partial update support)
            mapper.updateEntity(g, dto);
            log.debug("Entity updated: currentAmount={}, targetAmount={}, deadline={}", 
                    g.getCurrentAmount(), g.getTargetAmount(), g.getDeadline());
            
            // Ensure currentAmount is never null after update (entity-level safety)
            if (g.getCurrentAmount() == null) {
                g.setCurrentAmount(BigDecimal.ZERO);
                log.debug("Set currentAmount to ZERO (was null)");
            }
            
            // Entity should already have required fields from creation, but validate if they're being updated
            // Note: We don't throw if these are null because they might not be in the update request
            // The @PreUpdate hook and database constraints will handle null violations

            // Save - optimistic locking will be handled by GlobalExceptionHandler if version conflict occurs
            log.debug("Saving entity with version={}, currentAmount={}, targetAmount={}", 
                    g.getVersion(), g.getCurrentAmount(), g.getTargetAmount());
            
            SavingGoal saved;
            try {
                saved = repo.save(g);
                log.debug("Entity saved successfully: id={}, version={}", saved.getId(), saved.getVersion());
            } catch (Exception saveException) {
                log.error("Error saving saving goal id={}: {}", id, saveException.getMessage(), saveException);
                throw saveException;
            }
            
            // Ensure user is loaded before mapping to response to avoid LazyInitializationException
            if (saved.getUser() != null) {
                saved.getUser().getId(); // Trigger lazy loading
            }
            
            log.debug("Mapping to response...");
            SavingGoalResponseDTO response = mapper.toResponse(saved);
            log.debug("Update completed successfully");
            return response;
            
        } catch (SavingGoalNotFoundException e) {
            log.error("SavingGoal not found: id={}", id);
            throw e;
        } catch (IllegalArgumentException e) {
            log.error("Validation error updating saving goal id={}: {}", id, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error updating saving goal id={}: {}", id, e.getMessage(), e);
            throw new SavingGoalException("Failed to update saving goal: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public SavingGoalResponseDTO get(Long id) {
        return repo.findById(id).map(mapper::toResponse)
                .orElseThrow(() -> new SavingGoalNotFoundException("SavingGoal not found: " + id));
    }

    @Transactional(readOnly = true)
    public Page<SavingGoalResponseDTO> listByUser(Long userId, Pageable pageable) {
        return repo.findByUserIdOrderByCreatedAtDesc(userId, pageable).map(mapper::toResponse);
    }

    // ===================== Money operations =====================

    @Transactional
    public SavingGoalResponseDTO contribute(Long id, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Contribution must be > 0");
        }
        SavingGoal g = repo.findById(id).orElseThrow(() -> new SavingGoalNotFoundException("SavingGoal not found: " + id));
        if (g.getStatus() == SavingGoalStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot contribute to a CANCELLED goal");
        }
        g.setCurrentAmount(g.getCurrentAmount().add(amount));
        return mapper.toResponse(repo.save(g));
    }

    @Transactional
    public SavingGoalResponseDTO withdraw(Long id, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Withdrawal must be > 0");
        }
        SavingGoal g = repo.findById(id).orElseThrow(() -> new SavingGoalNotFoundException("SavingGoal not found: " + id));
        if (g.getStatus() == SavingGoalStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot withdraw from a CANCELLED goal");
        }
        if (g.getCurrentAmount().compareTo(amount) < 0) {
            throw new IllegalArgumentException("Insufficient saved amount");
        }
        g.setCurrentAmount(g.getCurrentAmount().subtract(amount));
        return mapper.toResponse(repo.save(g));
    }

    // ===================== Status / attributes =====================

    @Transactional
    public SavingGoalResponseDTO setStatus(Long id, SavingGoalStatus status) {
        SavingGoal g = repo.findById(id).orElseThrow(() -> new SavingGoalNotFoundException("SavingGoal not found: " + id));
        g.setStatus(status);
        return mapper.toResponse(repo.save(g));
    }

    @Transactional
    public SavingGoalResponseDTO moveDeadline(Long id, LocalDate newDeadline) {
        if (newDeadline == null) throw new IllegalArgumentException("Deadline is required");
        SavingGoal g = repo.findById(id).orElseThrow(() -> new SavingGoalNotFoundException("SavingGoal not found: " + id));
        g.setDeadline(newDeadline);
        return mapper.toResponse(repo.save(g));
    }

    @Transactional
    public SavingGoalResponseDTO rename(Long id, String newName) {
        if (newName == null || newName.isBlank()) throw new IllegalArgumentException("Name is required");
        SavingGoal g = repo.findById(id).orElseThrow(() -> new SavingGoalNotFoundException("SavingGoal not found: " + id));
        if (nameExistsForUser(g.getUser().getId(), newName)) {
            throw new IllegalArgumentException("A goal with this name already exists for the user");
        }
        g.setName(newName.trim());
        return mapper.toResponse(repo.save(g));
    }

    // ===================== Filters / windows =====================

    @Transactional(readOnly = true)
    public List<SavingGoalResponseDTO> listByStatus(Long userId, SavingGoalStatus status) {
        return repo.findByUserIdAndStatus(userId, status).stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<SavingGoalResponseDTO> listByCategory(Long userId, SavingGoalCategory category) {
        return repo.findByUserIdAndCategory(userId, category).stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<SavingGoalResponseDTO> listByPriority(Long userId, SavingGoalPriority priority) {
        return repo.findByUserIdAndPriority(userId, priority).stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<SavingGoalResponseDTO> overdue(Long userId) {
        return repo.findActiveOverdue(userId, LocalDate.now()).stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<SavingGoalResponseDTO> dueWithinDays(Long userId, int days) {
        LocalDate now = LocalDate.now();
        LocalDate end = now.plusDays(days);
        return repo.findDueWindow(userId, now, end).stream().map(mapper::toResponse).toList();
    }

    // ===================== Aggregates / summaries =====================

    @Transactional(readOnly = true)
    public Map<String, Object> totals(Long userId) {
        var goals = repo.findByUserId(userId);
        BigDecimal totalTarget = goals.stream().map(SavingGoal::getTargetAmount)
                .filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCurrent = goals.stream().map(SavingGoal::getCurrentAmount)
                .filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalRemaining = totalTarget.subtract(totalCurrent);
        if (totalRemaining.compareTo(BigDecimal.ZERO) < 0) totalRemaining = BigDecimal.ZERO;

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("totalTarget", totalTarget);
        out.put("totalCurrent", totalCurrent);
        out.put("totalRemaining", totalRemaining);
        out.put("goalsCount", goals.size());
        return out;
    }

    // ===================== Delete / restore =====================

    @Transactional
    public void delete(Long id) {
        // Try to find the goal (including soft-deleted ones)
        SavingGoal goal = repo.findByIdIncludingDeleted(id);
        
        if (goal == null) {
            throw new SavingGoalNotFoundException("SavingGoal not found: " + id);
        }
        
        // Permanently delete the record from database using native SQL
        int deleted = repo.deleteByIdNative(id);
        if (deleted == 0) {
            throw new SavingGoalException("Failed to delete saving goal with id: " + id);
        }
    }

    @Transactional
    public void restore(Long id) {
        int updated = repo.restore(id);
        if (updated == 0) throw new SavingGoalException("Failed to restore saving goal: " + id);
    }

    // ===================== Helpers =====================

    private boolean nameExistsForUser(Long userId, String name) {
        if (name == null || name.isBlank()) return false;
        String nm = name.trim();
        // quick in-memory check; for guaranteed uniqueness ensure DB unique (user_id, name)
        return repo.findByUserId(userId).stream().anyMatch(g -> g.getName() != null && g.getName().equalsIgnoreCase(nm));
    }
}
