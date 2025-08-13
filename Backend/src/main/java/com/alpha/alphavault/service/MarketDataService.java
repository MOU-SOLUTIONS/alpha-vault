// com/alpha/alphavault/service/MarketDataService.java
package com.alpha.alphavault.service;

import com.alpha.alphavault.enums.InvestmentType;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class MarketDataService {
    /**
     * Hook into your external market‐data provider here.
     * @param type   type of asset (CRYPTO, STOCK, COMMODITY...)
     * @param symbol e.g. "BTC", "AAPL", "GC=F"
     */
    public BigDecimal fetchCurrentPrice(InvestmentType type, String symbol) {
        // TODO: call real API
        return BigDecimal.ZERO;
    }
}
