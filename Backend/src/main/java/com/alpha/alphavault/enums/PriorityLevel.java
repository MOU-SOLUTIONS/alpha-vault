package com.alpha.alphavault.enums;

public enum PriorityLevel {
    HIGH,
    MEDIUM,
    LOW;

    // Custom method to return enum in lowercase
    public String getLowerCase() {
        return this.name().toLowerCase();
    }
}
