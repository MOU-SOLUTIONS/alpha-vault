/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  DTO: PaymentMethodSummary - Summary of income by payment method
 * ================================================================
 */
package com.alpha.alphavault.dto.income;

import java.util.Map;

public record PaymentMethodSummary(
    Map<String, Double> paymentMethods
) {}
