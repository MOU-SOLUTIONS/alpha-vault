package com.alpha.alphavault.dto;

import com.alpha.alphavault.enums.PriorityLevel;
import com.alpha.alphavault.enums.SavingGoalCategory;
import com.alpha.alphavault.model.User;
import jakarta.validation.constraints.*;

import lombok.Getter;
import lombok.Setter;

import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class SavingGoalRequestDTO {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Goal name is required")
    private String name;

    @Positive(message = "Target amount must be greater than zero")
    private double targetAmount;

    @PositiveOrZero(message = "Current amount must be zero or more")
    private double currentAmount;

    @NotNull(message = "Deadline is required")
    private LocalDate deadline;

    @NotNull(message = "Category is required")
    private SavingGoalCategory category;

    @NotNull(message = "Priority is required")
    private PriorityLevel priority;

    public User getUser() {
        return new User(userId);
    }

    public static class DebtRequestDTO {

        private Long userId;
        private String creditorName;
        private Double totalAmount;
        private Double remainingAmount;
        private Double interestRate;
        private Date dueDate;
        private Double minPayment;

        // Getters and Setters
        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public String getCreditorName() {
            return creditorName;
        }

        public void setCreditorName(String creditorName) {
            this.creditorName = creditorName;
        }

        public Double getTotalAmount() {
            return totalAmount;
        }

        public void setTotalAmount(Double totalAmount) {
            this.totalAmount = totalAmount;
        }

        public Double getRemainingAmount() {
            return remainingAmount;
        }

        public void setRemainingAmount(Double remainingAmount) {
            this.remainingAmount = remainingAmount;
        }

        public Double getInterestRate() {
            return interestRate;
        }

        public void setInterestRate(Double interestRate) {
            this.interestRate = interestRate;
        }

        public Date getDueDate() {
            return dueDate;
        }

        public void setDueDate(Date dueDate) {
            this.dueDate = dueDate;
        }

        public Double getMinPayment() {
            return minPayment;
        }

        public void setMinPayment(Double minPayment) {
            this.minPayment = minPayment;
        }
    }
}
