/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Service: MarketDataService — external price feed hook
 * ================================================================
 */
package com.alpha.alphavault.service;

import com.alpha.alphavault.enums.InvestmentType;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class MarketDataService {
    /**
     * Plug in a real provider here. Return the latest price for the asset.
     * For non-quantity assets you can treat this as the latest valuation.
     */
    public BigDecimal fetchCurrentPrice(InvestmentType type, String symbolOrName) {
        // TODO: call real API (FMP, AlphaVantage, CoinGecko Pro, etc.)
        return BigDecimal.ZERO;
    }
}
