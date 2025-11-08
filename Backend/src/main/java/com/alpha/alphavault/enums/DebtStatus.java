/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Enum: DebtStatus (API-safe as STRING)
 * ================================================================
 */
package com.alpha.alphavault.enums;

import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.STRING)
public enum DebtStatus {
    ACTIVE,
    DELINQUENT,
    PAID_OFF,
    CLOSED,
    CANCELLED
}
