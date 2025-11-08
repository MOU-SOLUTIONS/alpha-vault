/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  DTO: SourceSummary - Summary of income by source
 * ================================================================
 */
package com.alpha.alphavault.dto.income;

import java.util.Map;

public record SourceSummary(
    Map<String, Double> sources
) {}
