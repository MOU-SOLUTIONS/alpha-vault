/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  License: Proprietary. All rights reserved.
 * ================================================================
 */
package com.alpha.alphavault.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum PaymentMethod {

    // ===== TRADITIONAL METHODS =====
    CASH,
    CARD,
    CHECK,
    TRANSFER,

    // ===== DIGITAL METHODS =====
    CRYPTO,
    PAYPAL;

    // ============================================================
    // == JSON Serialization / Deserialization
    // ============================================================

    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public static PaymentMethod fromJson(String value) {
        return PaymentMethod.valueOf(value.toUpperCase());
    }
}
