// com/alpha/alphavault/service/InvestmentService.java
package com.alpha.alphavault.service;

import com.alpha.alphavault.dto.InvestmentRequestDTO;
import com.alpha.alphavault.exception.InvestmentNotFoundException;
import com.alpha.alphavault.mapper.InvestmentMapper;
import com.alpha.alphavault.model.Investment;
import com.alpha.alphavault.repository.InvestmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class InvestmentService {

    private final InvestmentRepository repo;
    private final InvestmentMapper mapper;
    private final MarketDataService market;

    public InvestmentService(InvestmentRepository repo,
                             InvestmentMapper mapper,
                             MarketDataService market) {
        this.repo = repo;
        this.mapper = mapper;
        this.market = market;
    }

    @Transactional
    public Investment create(InvestmentRequestDTO dto) {
        Investment inv = mapper.toEntity(dto);
        // set initial currentValue from amountInvested if not provided
        if (inv.getCurrentValue() == null) {
            inv.setCurrentValue(inv.getAmountInvested());
        }
        return repo.save(inv);
    }

    @Transactional
    public Investment update(Long id, InvestmentRequestDTO dto) {
        Investment existing = repo.findById(id)
            .orElseThrow(() -> new InvestmentNotFoundException("Error updating investment:"));
        mapper.updateEntity(existing, dto);
        return repo.save(existing);
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new InvestmentNotFoundException("Error updating investment:");
        }
        repo.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Investment getById(Long id) {
        return repo.findById(id)
            .orElseThrow(() -> new InvestmentNotFoundException("Error updating investment:"));
    }

    @Transactional(readOnly = true)
    public List<Investment> getByUser(Long userId) {
        return repo.findByUserId(userId);
    }

    @Transactional
    public Investment refreshCurrentValue(Long id) {
        Investment inv = getById(id);
        BigDecimal latest = market.fetchCurrentPrice(inv.getInvestmentType(), inv.getName());
        inv.setCurrentValue(latest);
        return repo.save(inv);
    }

    @Transactional
    public List<Investment> refreshAllForUser(Long userId) {
        List<Investment> list = getByUser(userId);
        for (Investment inv : list) {
            BigDecimal latest = market.fetchCurrentPrice(inv.getInvestmentType(), inv.getName());
            inv.setCurrentValue(latest);
        }
        return repo.saveAll(list);
    }
}
