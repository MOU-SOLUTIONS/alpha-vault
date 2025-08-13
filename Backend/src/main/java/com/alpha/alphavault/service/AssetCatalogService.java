// src/main/java/com/alpha/alphavault/service/AssetCatalogService.java
package com.alpha.alphavault.service;

import com.alpha.alphavault.dto.AssetDTO;
import com.alpha.alphavault.enums.InvestmentType;
import com.alpha.alphavault.repository.UserRepository;
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
    private final UserRepository userRepository;

    @Value("${fmp.api.key:}")
    private String fmpKey;

    public AssetCatalogService(RestTemplate rest, UserRepository userRepository) {
        this.rest = rest;
        this.userRepository = userRepository;
    }

    public List<AssetDTO> listAssets(InvestmentType type, String q) {
        switch (type) {
            case CRYPTO:
                return fetchCrypto(q);
            case FOREX:
                return fetchForex(q);
            case STOCKS:
                return fetchStock(q);
            case ETF:
                return fetchEtf(q);
            case COMMODITIES:
                return fetchCommodity(q);
            default:
                return Collections.emptyList();
        }
    }

    public List<AssetDTO> listAssets(InvestmentType type, String q, Long userId) {
        return listAssets(type, q);
    }

    // ————————————————————————————————————————————
    //   CRYPTO (unchanged)
    // ————————————————————————————————————————————
    @SuppressWarnings("unchecked")
    private List<AssetDTO> fetchCrypto(String q) {
        if (q == null || q.trim().isEmpty()) {
            String marketsUrl = "https://api.coingecko.com/api/v3/coins/markets"
                    + "?vs_currency=usd"
                    + "&order=market_cap_desc"
                    + "&per_page=50"
                    + "&page=1";
            List<Map<String, Object>> marketsResp = rest.getForObject(marketsUrl, List.class);
            if (marketsResp == null) {
                return Collections.emptyList();
            }
            return marketsResp.stream()
                    .map(m -> {
                        String symbol = ((String) m.get("symbol")).toUpperCase();
                        String name = (String) m.get("name");
                        return new AssetDTO(symbol, name);
                    })
                    .collect(Collectors.toList());
        }

        String encodedQuery = URLEncoder.encode(q.trim(), StandardCharsets.UTF_8);
        String searchUrl = "https://api.coingecko.com/api/v3/search?query=" + encodedQuery;
        Map<?, ?> resp = rest.getForObject(searchUrl, Map.class);
        if (resp == null || !resp.containsKey("coins")) {
            return Collections.emptyList();
        }
        List<Map<String, Object>> coins = (List<Map<String, Object>>) resp.get("coins");
        return coins.stream()
                .limit(50)
                .map(o -> {
                    Map<String, Object> m = o;
                    String symbol = ((String) m.get("symbol")).toUpperCase();
                    String name = (String) m.get("name");
                    return new AssetDTO(symbol, name);
                })
                .collect(Collectors.toList());
    }

    // ————————————————————————————————————————————
    //   FOREX: return a list of USD→XXX codes (fiat only)
    // ————————————————————————————————————————————
    @SuppressWarnings("unchecked")
    private List<AssetDTO> fetchForex(String filter) {
        String url = "https://api.exchangerate-api.com/v4/latest/USD";
        try {
            Map<String, Object> resp = rest.getForObject(url, Map.class);
            if (resp == null || !resp.containsKey("rates")) {
                return Collections.emptyList();
            }
            Map<String, Object> ratesRaw = (Map<String, Object>) resp.get("rates");
            String f = (filter == null ? "" : filter.trim().toUpperCase());

            return ratesRaw.entrySet().stream()
                    .filter(e -> f.isEmpty() || e.getKey().contains(f))
                    .map(e -> {
                        String symbol = e.getKey();  // e.g. "EUR", "JPY", "GBP", etc.
                        return new AssetDTO(symbol, symbol);
                    })
                    .limit(50)
                    .collect(Collectors.toList());

        } catch (Exception ex) {
            return Collections.emptyList();
        }
    }

    /**
     * New method: fetch the single USD→{symbol} rate as a double.
     * Returns <0 if symbol not found or error.
     */
    public double getForexRate(String targetCurrency) {
        try {
            String url = "https://api.exchangerate-api.com/v4/latest/USD";
            @SuppressWarnings("unchecked")
            Map<String, Object> resp = rest.getForObject(url, Map.class);
            if (resp == null || !resp.containsKey("rates")) {
                return -1;
            }
            @SuppressWarnings("unchecked")
            Map<String, Object> ratesRaw = (Map<String, Object>) resp.get("rates");
            Object raw = ratesRaw.get(targetCurrency.toUpperCase());
            if (raw == null) {
                return -1;
            }
            // data is typically a Double (or Number)
            return ((Number) raw).doubleValue();
        } catch (Exception ex) {
            return -1;
        }
    }

    // ————————————————————————————————————————————
    //   STOCKS / ETF / COMMODITIES (unchanged from previous answer)
    // ————————————————————————————————————————————
    @SuppressWarnings("unchecked")
    private List<AssetDTO> fetchStock(String q) {
        if (StringUtils.isEmpty(fmpKey)) return Collections.emptyList();
        String query = (q == null ? "" : q);
        String url = "https://financialmodelingprep.com/api/v3/search"
                + "?query=" + URLEncoder.encode(query, StandardCharsets.UTF_8)
                + "&limit=50"
                + "&exchange=NASDAQ"
                + "&apikey=" + fmpKey;
        List<Map<String, Object>> list = rest.getForObject(url, List.class);
        if (list == null) return Collections.emptyList();

        return list.stream()
                .map(m -> {
                    String symbol = m.get("symbol").toString();
                    String name = m.get("name").toString();
                    return new AssetDTO(symbol, name);
                })
                .collect(Collectors.toList());
    }

    @SuppressWarnings("unchecked")
    private List<AssetDTO> fetchEtf(String q) {
        if (StringUtils.isEmpty(fmpKey)) return Collections.emptyList();
        String query = (q == null ? "" : q);
        String url = "https://financialmodelingprep.com/api/v3/search"
                + "?query=" + URLEncoder.encode(query, StandardCharsets.UTF_8)
                + "&limit=50"
                + "&exchange=ETF"
                + "&apikey=" + fmpKey;
        List<Map<String, Object>> list = rest.getForObject(url, List.class);
        if (list == null) return Collections.emptyList();

        return list.stream()
                .map(m -> {
                    String symbol = m.get("symbol").toString();
                    String name = m.get("name").toString();
                    return new AssetDTO(symbol, name);
                })
                .collect(Collectors.toList());
    }

    private List<AssetDTO> fetchCommodity(String q) {
        return Collections.emptyList();
    }
}
