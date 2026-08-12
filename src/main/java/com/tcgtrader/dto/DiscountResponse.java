package com.tcgtrader.dto;

import com.tcgtrader.entity.Discount;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record DiscountResponse(UUID id, UUID itemId, BigDecimal percentage,
                               Instant validFrom, Instant validTo, boolean active) {
    public static DiscountResponse from(Discount d) {
        return new DiscountResponse(d.getId(), d.getItem().getId(), d.getPercentage(),
                d.getValidFrom(), d.getValidTo(), d.isActive());
    }
}
