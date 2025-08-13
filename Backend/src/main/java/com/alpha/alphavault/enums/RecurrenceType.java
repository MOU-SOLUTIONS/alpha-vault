package com.alpha.alphavault.enums;


public enum RecurrenceType {
    DAILY,
    WEEKLY,
    MONTHLY,
    YEARLY;

    public String getLowerCase() {
        return this.name().toLowerCase();
    }
}
