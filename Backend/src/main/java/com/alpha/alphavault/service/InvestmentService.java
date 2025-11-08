/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Service: InvestmentService — CRUD, MTM refresh, close/reopen
 *  Notes:
 *    - Uses status (OPEN/CLOSED) instead of legacy isSold flag
 *    - Derives currentValue = currentPrice * quantity when possible
 *    - Hard delete via repo.deleteById() (permanent deletion)
 * ================================================================
 */
package com.alpha.alphavault.service;

import com.alpha.alphavault.dto.investment.InvestmentCloseRequestDTO;
import com.alpha.alphavault.dto.investment.InvestmentPriceUpdateDTO;
import com.alpha.alphavault.dto.investment.InvestmentRequestDTO;
import com.alpha.alphavault.enums.InvestmentStatus;
import com.alpha.alphavault.enums.InvestmentType;
import com.alpha.alphavault.exception.InvestmentException;
import com.alpha.alphavault.exception.InvestmentNotFoundException;
import com.alpha.alphavault.mapper.InvestmentMapper;
import com.alpha.alphavault.model.Investment;
import com.alpha.alphavault.repository.InvestmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class InvestmentService {

    private final InvestmentRepository repo;
    private final InvestmentMapper mapper;
    private final MarketDataService market;

    // -------------------- CRUD --------------------

    @Transactional
    public Investment create(InvestmentRequestDTO dto) {
        Investment inv = mapper.toEntity(dto);

        // default currency from user preferredCurrency could be applied here if null (optional)
        // if (inv.getCurrency() == null && inv.getUser() != null && inv.getUser().getPreferredCurrency() != null) {
        //     inv.setCurrency(inv.getUser().getPreferredCurrency());
        // }

        // initialize currentValue if not derived by @PrePersist
        if (inv.getCurrentValue() == null) {
            if (inv.getCurrentPrice() != null && inv.getQuantity() != null) {
                inv.setCurrentValue(inv.getCurrentPrice().multiply(inv.getQuantity()).setScale(4, RoundingMode.HALF_UP));
            } else {
                inv.setCurrentValue(inv.getAmountInvested());
            }
        }
        return repo.save(inv);
    }

    @Transactional
    public Investment update(Long id, InvestmentRequestDTO dto) {
        Investment existing = repo.findById(id)
                .orElseThrow(() -> new InvestmentNotFoundException("Investment not found for id: " + id));
        mapper.updateEntity(existing, dto);
        return repo.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        // Check if investment exists before attempting deletion
        if (!repo.existsById(id)) {
            throw new InvestmentNotFoundException("Investment not found for id: " + id);
        }
        
        try {
            // Hard delete: permanently removes the investment from the database
            repo.deleteById(id);
            log.info("Investment {} hard deleted successfully", id);
        } catch (DataIntegrityViolationException e) {
            // Log detailed error for debugging
            String errorMsg = e.getMostSpecificCause() != null ? 
                    e.getMostSpecificCause().getMessage() : 
                    "Unknown constraint violation";
            log.error("Data integrity violation while deleting investment {}: {}", id, errorMsg, e);
            
            // Re-throw to let GlobalExceptionHandler provide proper 409 response with detailed message
            // The enhanced GlobalExceptionHandler will parse this and provide user-friendly error messages
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error deleting investment {}: {}", id, e.getMessage(), e);
            throw new InvestmentException("Failed to delete investment: " + e.getMessage(), e);
        }
    }

    // -------------------- Reads --------------------

    @Transactional(readOnly = true)
    public Investment getById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new InvestmentNotFoundException("Investment not found for id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Investment> getByUser(Long userId) {
        return repo.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<Investment> getByUserAndType(Long userId, InvestmentType type) {
        return repo.findByUserIdAndInvestmentType(userId, type);
    }

    @Transactional(readOnly = true)
    public List<Investment> getOpenByUser(Long userId) {
        return repo.findByUserIdAndStatus(userId, InvestmentStatus.OPEN);
    }

    @Transactional(readOnly = true)
    public List<Investment> getClosedByUser(Long userId) {
        return repo.findByUserIdAndStatus(userId, InvestmentStatus.CLOSED);
    }

    // -------------------- Market-to-Market (MTM) --------------------

    /** Update a single investment’s currentPrice/currentValue using external market data. */
    @Transactional
    public Investment refreshCurrentValue(Long id) {
        Investment inv = getById(id);
        // prefer symbol; fallback to name if symbol missing
        String key = (inv.getSymbol() != null && !inv.getSymbol().isBlank()) ? inv.getSymbol() : inv.getName();

        BigDecimal latestPrice = market.fetchCurrentPrice(inv.getInvestmentType(), key);
        if (latestPrice == null) latestPrice = BigDecimal.ZERO;

        inv.setCurrentPrice(latestPrice);
        // derive value
        if (inv.getQuantity() != null) {
            inv.setCurrentValue(latestPrice.multiply(inv.getQuantity()).setScale(4, RoundingMode.HALF_UP));
        } else {
            // for non-quantity assets (e.g., businesses/real estate snapshot), treat price as value
            inv.setCurrentValue(latestPrice.setScale(4, RoundingMode.HALF_UP));
        }
        return repo.save(inv);
    }

    /** Refresh all OPEN investments for a user. */
    @Transactional
    public List<Investment> refreshAllForUser(Long userId) {
        List<Investment> list = getOpenByUser(userId);
        for (Investment inv : list) {
            String key = (inv.getSymbol() != null && !inv.getSymbol().isBlank()) ? inv.getSymbol() : inv.getName();
            BigDecimal latestPrice = market.fetchCurrentPrice(inv.getInvestmentType(), key);
            if (latestPrice == null) latestPrice = BigDecimal.ZERO;

            inv.setCurrentPrice(latestPrice);
            if (inv.getQuantity() != null) {
                inv.setCurrentValue(latestPrice.multiply(inv.getQuantity()).setScale(4, RoundingMode.HALF_UP));
            } else {
                inv.setCurrentValue(latestPrice.setScale(4, RoundingMode.HALF_UP));
            }
        }
        return repo.saveAll(list);
    }

    /** Manual mark-to-market (from UI): set price, value auto-derived. */
    @Transactional
    public Investment markToMarket(Long id, InvestmentPriceUpdateDTO dto) {
        Investment inv = getById(id);
        mapper.applyMarkToMarket(inv, dto);
        // currentValue will be derived in @PreUpdate (and below for safety)
        if (inv.getQuantity() != null && inv.getCurrentPrice() != null) {
            inv.setCurrentValue(inv.getCurrentPrice().multiply(inv.getQuantity()).setScale(4, RoundingMode.HALF_UP));
        }
        return repo.save(inv);
    }

    // -------------------- Lifecycle (close/reopen) --------------------

    /** Close an open position with sold value/date; appends note. */
    @Transactional
    public Investment closePosition(Long id, InvestmentCloseRequestDTO dto) {
        Investment inv = getById(id);
        mapper.applyClose(inv, dto);
        return repo.save(inv);
    }

    /** Reopen a closed position (admin/backoffice use). */
    @Transactional
    public Investment reopen(Long id) {
        Investment inv = getById(id);
        inv.setStatus(InvestmentStatus.OPEN);
        inv.setSoldDate(null);
        inv.setSoldValue(null);
        return repo.save(inv);
    }
}
