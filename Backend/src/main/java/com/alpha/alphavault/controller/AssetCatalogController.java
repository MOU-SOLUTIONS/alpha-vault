/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Controller: AssetCatalogController — symbol search & FX rate
 *  Notes:
 *    - Wraps responses in ApiResponse
 *    - Validates InvestmentType and symbol
 *    - Ready for caching/rate-limit at gateway
 * ================================================================
 */
package com.alpha.alphavault.controller;

import com.alpha.alphavault.dto.AssetDTO;
import com.alpha.alphavault.dto.common.ApiResponse;
import com.alpha.alphavault.enums.InvestmentType;
import com.alpha.alphavault.service.AssetCatalogService;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/assets")
public class AssetCatalogController {

    private final AssetCatalogService svc;

    /**
     * GET /api/assets/{type}?search=TSLA
     * type ∈ {CRYPTO, FOREX, STOCKS, ETF, COMMODITIES}
     */
    @GetMapping("/{type}")
    public ResponseEntity<ApiResponse<List<AssetDTO>>> list(
            @PathVariable String type,
            @RequestParam(value = "search", required = false, defaultValue = "") String q
    ) {
        InvestmentType it = InvestmentType.valueOf(type.toUpperCase());
        List<AssetDTO> list = Optional.ofNullable(svc.listAssets(it, q)).orElseGet(Collections::emptyList);
        return ResponseEntity.ok(ApiResponse.ok("Assets fetched", list, "/api/assets/" + it.name()));
    }

    /**
     * GET /api/assets/forex/rate?symbol=EUR
     * Returns { "rate": 0.92 } or 400 with error in ApiResponse
     */
    @GetMapping("/forex/rate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getForexRate(
            @RequestParam("symbol")
            @Pattern(regexp = "^[A-Za-z]{3}$", message = "Symbol must be a 3-letter currency code")
            String symbol
    ) {
        double rate = svc.getForexRate(symbol);
        if (rate < 0) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.badRequest("Currency not found or service error",
                            Map.of("symbol", symbol.toUpperCase())));
        }
        return ResponseEntity.ok(ApiResponse.ok("Rate fetched",
                Map.of("symbol", symbol.toUpperCase(), "rate", rate), "/api/assets/forex/rate"));
    }

    /**
     * Optional helper: list supported types for the client.
     */
    @GetMapping("/types")
    public ResponseEntity<ApiResponse<List<String>>> supportedTypes() {
        List<String> types = Arrays.stream(InvestmentType.values()).map(Enum::name).toList();
        return ResponseEntity.ok(ApiResponse.ok("Supported asset types", types, "/api/assets/types"));
    }
}
