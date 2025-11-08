/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  License: Proprietary. All rights reserved.
 * ================================================================
 */
package com.alpha.alphavault.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ExpenseCategory {

    // ===== FIXED LIVING EXPENSES =====
    RENT,
    MORTGAGE,
    UTILITIES,
    INTERNET_PHONE,
    HOME_INSURANCE,
    PROPERTY_TAX,
    HOME_MAINTENANCE,

    // ===== FOOD & DINING =====
    GROCERIES,
    RESTAURANTS,
    COFFEE_SNACKS,
    FOOD_DELIVERY,

    // ===== TRANSPORTATION =====
    FUEL,
    CAR_PAYMENT,
    CAR_INSURANCE,
    CAR_REPAIRS,
    PARKING_TOLLS,
    PUBLIC_TRANSPORT,

    // ===== PERSONAL & HEALTH =====
    HEALTH_INSURANCE,
    MEDICAL,
    PHARMACY,
    FITNESS,
    PERSONAL_CARE,

    // ===== SHOPPING & ESSENTIALS =====
    CLOTHING,
    ELECTRONICS,
    HOME_SUPPLIES,
    BEAUTY_COSMETICS,

    // ===== FAMILY & CHILDCARE =====
    CHILDCARE,
    EDUCATION_CHILD,
    TOYS_GAMES,
    PET_EXPENSES,

    // ===== EDUCATION & SELF-DEVELOPMENT =====
    TUITION,
    ONLINE_COURSES,
    BOOKS,
    WORKSHOPS,

    // ===== ENTERTAINMENT & LEISURE =====
    STREAMING,
    MOVIES_EVENTS,
    TRAVEL,
    HOBBIES,

    // ===== DEBT & SAVINGS =====
    LOAN_PAYMENT,
    CREDIT_CARD_PAYMENT,
    SAVINGS_CONTRIBUTION,
    INVESTMENT_CONTRIBUTION,

    // ===== BUSINESS & PROFESSIONAL =====
    WORK_TOOLS,
    PROFESSIONAL_SERVICES,
    PROFESSIONAL_SUBSCRIPTIONS,
    OFFICE_RENT,

    // ===== GIVING & DONATIONS =====
    CHARITY,
    GIFTS,
    RELIGIOUS_OFFERING,

    // ===== EMERGENCY & UNPLANNED =====
    EMERGENCY_EXPENSE,
    ACCIDENT,
    UNPLANNED_TRAVEL,
    MEDICAL_EMERGENCY,

    // ===== FEES & CHARGES =====
    BANK_FEES,
    LATE_FEES,
    SERVICE_CHARGES,
    FOREIGN_FEES;

    // ============================================================
    // == JSON Serialization / Deserialization
    // ============================================================

    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public static ExpenseCategory fromJson(String value) {
        return ExpenseCategory.valueOf(value.toUpperCase());
    }
}
