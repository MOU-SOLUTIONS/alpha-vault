/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Enum: InvestmentStatus (API-safe as STRING)
 * ================================================================
 */
package com.alpha.alphavault.enums;

import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.STRING)
public enum InvestmentStatus {
    OPEN,
    CLOSED
}
