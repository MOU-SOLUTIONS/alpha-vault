// src/main/java/com/alpha/alphavault/dto/AssetDTO.java
package com.alpha.alphavault.dto;

public class AssetDTO {
    private String symbol;
    private String name;

    public AssetDTO() { }

    public AssetDTO(String symbol, String name) {
        this.symbol = symbol;
        this.name = name;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
