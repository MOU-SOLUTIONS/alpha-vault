package com.alpha.alphavault.enums;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonValue;

@JsonFormat(shape = JsonFormat.Shape.STRING)
public enum InvestmentType {
    STOCKS,
    CRYPTO,
    REAL_ESTATE,
    COMMODITIES,
    BUSINESS,
    BONDS,
    ETF,
    FOREX,
    OTHER,
    MUTUAL_FUNDS;

}
