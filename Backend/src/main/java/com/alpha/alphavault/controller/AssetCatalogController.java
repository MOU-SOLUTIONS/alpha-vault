// src/main/java/com/alpha/alphavault/controller/AssetCatalogController.java
package com.alpha.alphavault.controller;

import com.alpha.alphavault.dto.AssetDTO;
import com.alpha.alphavault.enums.InvestmentType;
import com.alpha.alphavault.service.AssetCatalogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assets")
public class AssetCatalogController {

    private final AssetCatalogService svc;

    public AssetCatalogController(AssetCatalogService svc) {
        this.svc = svc;
    }

    /**
     * GET /api/assets/{type}?search={q}
     *   - type = CRYPTO, FOREX, STOCKS, ETF, COMMODITIES
     *   - q is optional search string (default = "")
     */
    @GetMapping("/{type}")
    public List<AssetDTO> list(
            @PathVariable InvestmentType type,
            @RequestParam(value = "search", required = false, defaultValue = "") String q
    ) {
        List<AssetDTO> list = svc.listAssets(type, q);
        return (list == null ? Collections.emptyList() : list);
    }

    /**
     * GET /api/assets/FOREX/rate?symbol={CURRENCY_CODE}
     *   - symbol: e.g. "EUR", "JPY", etc.
     *   - Returns JSON: { "rate": <double> }
     *   - If “rate” < 0, treat as “not found / error”
     */
    @GetMapping("/FOREX/rate")
    public ResponseEntity<Map<String, Object>> getForexRate(
            @RequestParam("symbol") String symbol
    ) {
        double rate = svc.getForexRate(symbol);
        if (rate < 0) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", "Currency not found or service error"));
        }
        return ResponseEntity.ok(Map.of("rate", rate));
    }
}
