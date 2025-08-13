package com.alpha.alphavault.enums;

public enum SavingGoalCategory {
    HEALTH,
    MARRIAGE,
    EDUCATION,
    TRAVEL,
    EMERGENCY,
    OTHER;

    // Custom method to return enum in lowercase
    public String getLowerCase() {
        return this.name().toLowerCase();
    }
}
