package com.tcgtrader.service;

import com.tcgtrader.dto.DiscountRequest;
import com.tcgtrader.dto.DiscountResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface DiscountService {
    DiscountResponse create(DiscountRequest request);
    List<DiscountResponse> findByItem(UUID itemId);
    List<DiscountResponse> findActiveByItem(UUID itemId);

    /**
     * Effective price for an item after applying its best currently-valid active discount,
     * or {@code null} when there is no applicable discount.
     */
    BigDecimal discountedPriceFor(UUID itemId, BigDecimal basePrice);
}
