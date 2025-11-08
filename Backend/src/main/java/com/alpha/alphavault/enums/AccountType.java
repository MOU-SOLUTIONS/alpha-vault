/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  License: Proprietary. All rights reserved.
 * ================================================================
 */
package com.alpha.alphavault.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum AccountType {
    BASIC, PREMIUM, ADMIN;

    @JsonValue
    public String toJson() { return name().toLowerCase(); }

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public static AccountType fromJson(String value) {
        return AccountType.valueOf(value.toUpperCase());
    }
}
