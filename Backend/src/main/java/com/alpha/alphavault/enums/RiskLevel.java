package com.alpha.alphavault.enums;

public enum RiskLevel {
    LOW,
    MEDIUM,
    HIGH;

    public String getLowerCase() {
        return this.name().toLowerCase();
    }
}
