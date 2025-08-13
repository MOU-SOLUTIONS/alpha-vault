package com.alpha.alphavault.service;

import com.alpha.alphavault.enums.PriorityLevel;
import com.alpha.alphavault.enums.SavingGoalCategory;
import com.alpha.alphavault.exception.SavingGoalNotFoundException;
import com.alpha.alphavault.model.SavingGoal;
import com.alpha.alphavault.repository.SavingGoalRepository;
import com.alpha.alphavault.exception.SavingGoalException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class SavingGoalService {

    private final SavingGoalRepository savingGoalRepository;

    @Autowired
    public SavingGoalService(SavingGoalRepository savingGoalRepository) {
        this.savingGoalRepository = savingGoalRepository;
    }

    // Create or update a saving goal
    public SavingGoal saveSavingGoal(SavingGoal savingGoal) {
        try {
            return savingGoalRepository.save(savingGoal);
        } catch (Exception e) {
            throw new SavingGoalException("Error saving saving goal: " + e.getMessage());
        }
    }

    public SavingGoal updateSavingGoal(Long id, SavingGoal updatedGoal) {
    SavingGoal existing = savingGoalRepository.findById(id)
        .orElseThrow(() -> new SavingGoalNotFoundException("Saving goal not found with ID: " + id));

    existing.setName(updatedGoal.getName());
    existing.setTargetAmount(updatedGoal.getTargetAmount());
    existing.setCurrentAmount(updatedGoal.getCurrentAmount());
    existing.setDeadline(updatedGoal.getDeadline());
    existing.setCategory(updatedGoal.getCategory());
    existing.setPriority(updatedGoal.getPriority());

    // Don't overwrite creationDate if it's null
    if (updatedGoal.getCreationDate() != null) {
        existing.setCreationDate(updatedGoal.getCreationDate());
    }

    return savingGoalRepository.save(existing);
}



    // Get all saving goals for a user
    public List<SavingGoal> getSavingGoalsByUserId(Long userId) {
        try {
            return savingGoalRepository.findByUserId(userId);
        } catch (Exception e) {
            throw new SavingGoalException("Error fetching saving goals for user: " + userId);
        }
    }

    // Get all saving goals for a user ordered by creation date in descending order
    public List<SavingGoal> getSavingGoalsByUserIdOrderByCreationDateDesc(Long userId) {
        try {
            return savingGoalRepository.findByUserIdOrderByCreationDateDesc(userId);
        } catch (Exception e) {
            throw new SavingGoalException("Error fetching saving goals ordered by creation date for user: " + userId);
        }
    }

    // Get saving goals with deadline before a specific date
    public List<SavingGoal> getSavingGoalsByUserIdAndDeadlineBefore(Long userId, LocalDate deadline) {
        try {
            return savingGoalRepository.findByUserIdAndDeadlineBefore(userId, deadline);
        } catch (Exception e) {
            throw new SavingGoalException("Error fetching saving goals with deadline before " + deadline + " for user: " + userId);
        }
    }

    // Get saving goals by category
    public List<SavingGoal> getSavingGoalsByUserIdAndCategory(Long userId, String category) {
        try {
            SavingGoalCategory categoryEnum = SavingGoalCategory.valueOf(category.toUpperCase());
            return savingGoalRepository.findByUserIdAndCategory(userId, categoryEnum);
        } catch (IllegalArgumentException e) {
            throw new SavingGoalException("Invalid saving goal category: " + category);
        } catch (Exception e) {
            throw new SavingGoalException("Error fetching saving goals by category for user: " + userId);
        }
    }

    // Get saving goals by priority
    public List<SavingGoal> getSavingGoalsByUserIdAndPriority(Long userId, String priority) {
        try {
            PriorityLevel priorityEnum = PriorityLevel.valueOf(priority.toUpperCase());
            return savingGoalRepository.findByUserIdAndPriority(userId, priorityEnum);
        } catch (IllegalArgumentException e) {
            throw new SavingGoalException("Invalid priority level: " + priority);
        } catch (Exception e) {
            throw new SavingGoalException("Error fetching saving goals by priority for user: " + userId);
        }
    }

    // Get saving goals with a target amount greater than a specified amount
    public List<SavingGoal> getSavingGoalsByUserIdAndTargetAmountGreaterThan(Long userId, Double amount) {
        try {
            return savingGoalRepository.findByUserIdAndTargetAmountGreaterThan(userId, amount);
        } catch (Exception e) {
            throw new SavingGoalException("Error fetching saving goals with target amount greater than " + amount + " for user: " + userId);
        }
    }

    // Get saving goals with current amount less than a specified amount
    public List<SavingGoal> getSavingGoalsByUserIdAndCurrentAmountLessThan(Long userId, Double amount) {
        try {
            return savingGoalRepository.findByUserIdAndCurrentAmountLessThan(userId, amount);
        } catch (Exception e) {
            throw new SavingGoalException("Error fetching saving goals with current amount less than " + amount + " for user: " + userId);
        }
    }

    // Get a saving goal by ID
    public SavingGoal getSavingGoalById(Long id) {
        return savingGoalRepository.findById(id)
                .orElseThrow(() -> new SavingGoalNotFoundException("Saving goal not found for id: " + id));
    }

    // Delete a saving goal by ID
    public void deleteSavingGoal(Long id) {
        try {
            if (!savingGoalRepository.existsById(id)) {
                throw new SavingGoalException("Saving goal not found for id: " + id);
            }
            savingGoalRepository.deleteById(id);
        } catch (Exception e) {
            throw new SavingGoalException("Error deleting saving goal: " + e.getMessage());
        }
    }
}
