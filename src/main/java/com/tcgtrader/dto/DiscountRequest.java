package com.tcgtrader.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record DiscountRequest(
        @NotNull UUID itemId,
        @NotNull BigDecimal percentage,
        @NotNull Instant validFrom,
        @NotNull Instant validTo,
        boolean active
) {}
