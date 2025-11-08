/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Enum: SavingGoalStatus
 *  Purpose: Lifecycle states for saving goals (API-safe as STRING)
 * ================================================================
 */
package com.alpha.alphavault.enums;

import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.STRING)
public enum SavingGoalStatus {
    ACTIVE,
    COMPLETED,
    PAUSED,
    CANCELLED
}
