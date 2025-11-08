/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  License: Proprietary. All rights reserved.
 * ================================================================
 */
package com.alpha.alphavault.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum RiskLevel {
    LOW,
    MEDIUM,
    HIGH;

    // ============================================================
    // == JSON Serialization / Deserialization
    // ============================================================

    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public static RiskLevel fromJson(String value) {
        return RiskLevel.valueOf(value.toUpperCase());
    }
}
