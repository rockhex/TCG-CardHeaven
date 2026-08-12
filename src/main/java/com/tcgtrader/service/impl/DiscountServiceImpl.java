package com.tcgtrader.service.impl;

import com.tcgtrader.dto.DiscountRequest;
import com.tcgtrader.dto.DiscountResponse;
import com.tcgtrader.entity.Discount;
import com.tcgtrader.entity.Item;
import com.tcgtrader.exception.ResourceNotFoundException;
import com.tcgtrader.repository.DiscountRepository;
import com.tcgtrader.repository.ItemRepository;
import com.tcgtrader.service.DiscountService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DiscountServiceImpl implements DiscountService {

    private final DiscountRepository discountRepository;
    private final ItemRepository itemRepository;

    @Override
    @Transactional
    public DiscountResponse create(DiscountRequest request) {
        Item item = itemRepository.findById(request.itemId())
                .orElseThrow(() -> new ResourceNotFoundException("Item not found: " + request.itemId()));
        Discount discount = Discount.builder()
                .item(item)
                .percentage(request.percentage())
                .validFrom(request.validFrom())
                .validTo(request.validTo())
                .active(request.active())
                .build();
        return DiscountResponse.from(discountRepository.save(discount));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DiscountResponse> findByItem(UUID itemId) {
        return discountRepository.findByItemId(itemId).stream().map(DiscountResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DiscountResponse> findActiveByItem(UUID itemId) {
        return discountRepository.findByItemIdAndActiveTrue(itemId).stream().map(DiscountResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal discountedPriceFor(UUID itemId, BigDecimal basePrice) {
        if (basePrice == null) {
            return null;
        }
        Instant now = Instant.now();
        return discountRepository.findByItemIdAndActiveTrue(itemId).stream()
                .filter(d -> !now.isBefore(d.getValidFrom()) && !now.isAfter(d.getValidTo()))
                .map(Discount::getPercentage)
                .max(Comparator.naturalOrder())
                .map(pct -> basePrice
                        .multiply(BigDecimal.ONE.subtract(pct.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP)))
                        .setScale(2, RoundingMode.HALF_UP))
                .orElse(null);
    }
}
