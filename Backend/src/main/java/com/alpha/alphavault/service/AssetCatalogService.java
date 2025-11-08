/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Service: AssetCatalogService — lookup tickers/symbols by type
 *  Notes:
 *    - Keeps your original logic; uses hasText, small guards
 * ================================================================
 */
package com.alpha.alphavault.service;

import com.alpha.alphavault.dto.AssetDTO;
import com.alpha.alphavault.enums.InvestmentType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AssetCatalogService {

    private final RestTemplate rest;

    @Value("${fmp.api.key:}")
    private String fmpKey;

    public AssetCatalogService(RestTemplate rest) {
        this.rest = rest;
    }

    public List<AssetDTO> listAssets(InvestmentType type, String q) {
        return switch (type) {
            case CRYPTO -> fetchCrypto(q);
            case FOREX -> fetchForex(q);
            case STOCKS -> fetchStock(q);
            case ETF -> fetchEtf(q);
            case COMMODITIES -> fetchCommodity(q);
            default -> Collections.emptyList();
        };
    }

    public List<AssetDTO> listAssets(InvestmentType type, String q, Long userId) {
        // hook for user personalization later (favorites, held assets, etc.)
        return listAssets(type, q);
    }

    // ---------------- CRYPTO (CoinGecko) ----------------
    @SuppressWarnings("unchecked")
    private List<AssetDTO> fetchCrypto(String q) {
        try {
            if (!StringUtils.hasText(q)) {
                String marketsUrl = "https://api.coingecko.com/api/v3/coins/markets"
                        + "?vs_currency=usd&order=market_cap_desc&per_page=50&page=1";
                List<Map<String, Object>> marketsResp = rest.getForObject(marketsUrl, List.class);
                if (marketsResp == null) return Collections.emptyList();
                return marketsResp.stream()
                        .map(m -> new AssetDTO(
                                String.valueOf(m.get("symbol")).toUpperCase(),
                                String.valueOf(m.get("name"))
                        ))
                        .collect(Collectors.toList());
            }
            String searchUrl = "https://api.coingecko.com/api/v3/search?query="
                    + URLEncoder.encode(q.trim(), StandardCharsets.UTF_8);
            Map<?, ?> resp = rest.getForObject(searchUrl, Map.class);
            if (resp == null || !resp.containsKey("coins")) return Collections.emptyList();
            List<Map<String, Object>> coins = (List<Map<String, Object>>) resp.get("coins");
            return coins.stream().limit(50)
                    .map(m -> new AssetDTO(
                            String.valueOf(m.get("symbol")).toUpperCase(),
                            String.valueOf(m.get("name"))
                    ))
                    .collect(Collectors.toList());
        } catch (Exception ex) {
            return Collections.emptyList();
        }
    }

    // ---------------- FOREX (public USD base) ----------------
    @SuppressWarnings("unchecked")
    private List<AssetDTO> fetchForex(String filter) {
        try {
            Map<String, Object> resp = rest.getForObject("https://api.exchangerate-api.com/v4/latest/USD", Map.class);
            if (resp == null || !resp.containsKey("rates")) return Collections.emptyList();
            Map<String, Object> ratesRaw = (Map<String, Object>) resp.get("rates");
            String f = StringUtils.hasText(filter) ? filter.trim().toUpperCase() : "";
            return ratesRaw.keySet().stream()
                    .map(String::valueOf)
                    .filter(ccy -> f.isEmpty() || ccy.contains(f))
                    .limit(50)
                    .map(ccy -> new AssetDTO(ccy, ccy))
                    .collect(Collectors.toList());
        } catch (Exception ex) {
            return Collections.emptyList();
        }
    }

    // ---------------- STOCKS / ETF (FMP) ----------------
    @SuppressWarnings("unchecked")
    private List<AssetDTO> fetchStock(String q) {
        if (!StringUtils.hasText(fmpKey)) return Collections.emptyList();
        String url = "https://financialmodelingprep.com/api/v3/search"
                + "?query=" + URLEncoder.encode((q == null ? "" : q), StandardCharsets.UTF_8)
                + "&limit=50&exchange=NASDAQ&apikey=" + fmpKey;
        List<Map<String, Object>> list = rest.getForObject(url, List.class);
        if (list == null) return Collections.emptyList();
        return list.stream()
                .map(m -> new AssetDTO(String.valueOf(m.get("symbol")), String.valueOf(m.get("name"))))
                .collect(Collectors.toList());
    }

    @SuppressWarnings("unchecked")
    private List<AssetDTO> fetchEtf(String q) {
        if (!StringUtils.hasText(fmpKey)) return Collections.emptyList();
        String url = "https://financialmodelingprep.com/api/v3/search"
                + "?query=" + URLEncoder.encode((q == null ? "" : q), StandardCharsets.UTF_8)
                + "&limit=50&exchange=ETF&apikey=" + fmpKey;
        List<Map<String, Object>> list = rest.getForObject(url, List.class);
        if (list == null) return Collections.emptyList();
        return list.stream()
                .map(m -> new AssetDTO(String.valueOf(m.get("symbol")), String.valueOf(m.get("name"))))
                .collect(Collectors.toList());
    }

    private List<AssetDTO> fetchCommodity(String q) {
        // Placeholder: connect to your commodity source (e.g., FMP futures, Quandl)
        return Collections.emptyList();
    }

    /** Single USD→{symbol} FX rate; returns <0 on error. */
    public double getForexRate(String targetCurrency) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> resp = rest.getForObject("https://api.exchangerate-api.com/v4/latest/USD", Map.class);
            if (resp == null || !resp.containsKey("rates")) return -1;
            @SuppressWarnings("unchecked")
            Map<String, Object> rates = (Map<String, Object>) resp.get("rates");
            Object raw = rates.get(targetCurrency == null ? "" : targetCurrency.toUpperCase());
            return (raw instanceof Number) ? ((Number) raw).doubleValue() : -1;
        } catch (Exception ex) {
            return -1;
        }
    }
}
