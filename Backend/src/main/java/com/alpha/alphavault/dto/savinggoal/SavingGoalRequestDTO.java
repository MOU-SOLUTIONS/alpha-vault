/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  DTO: SavingGoalRequestDTO - create/update request (partial updates allowed)
 *  Notes:
 *    - Null fields are treated as "no change" in update paths
 *    - Currency is optional (defaults to user's preferredCurrency upstream)
 * ================================================================
 */
package com.alpha.alphavault.dto.savinggoal;

import com.alpha.alphavault.enums.SavingGoalPriority;
import com.alpha.alphavault.enums.SavingGoalCategory;
import com.alpha.alphavault.enums.SavingGoalStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SavingGoalRequestDTO(

    @NotNull(message = "User ID is required")
    Long userId,

    @Size(min = 1, max = 120, message = "Name must be between 1 and 120 characters")
    @NotBlank(message = "Name is required")
    String name,

    @NotNull(message = "Category is required")
    SavingGoalCategory category,

    @NotNull(message = "Priority is required")
    SavingGoalPriority priority,

    @NotNull(message = "Target amount is required")
    @DecimalMin(value = "0.00", inclusive = false, message = "Target amount must be > 0")
    @Digits(integer = 15, fraction = 4, message = "Target amount supports up to 4 decimals")
    BigDecimal targetAmount,

    /** Optional initial/current saved amount. If null, defaults to 0. */
    @Digits(integer = 15, fraction = 4, message = "Current amount supports up to 4 decimals")
    @DecimalMin(value = "0.00", inclusive = true, message = "Current amount must be >= 0")
    BigDecimal currentAmount,

    /** Optional ISO 4217 currency (uppercased in mapper). */
    @Size(min = 3, max = 3, message = "Currency must be a 3-letter ISO code")
    String currency,

    @NotNull(message = "Deadline is required")
    @JsonFormat(pattern = "MM/dd/yyyy")
    LocalDate deadline,

    /** Optional free text notes. */
    @Size(max = 500, message = "Notes must be <= 500 characters")
    String notes,

    /** Optional status to allow pause/cancel/reactivate via same DTO. */
    SavingGoalStatus status
) {}
