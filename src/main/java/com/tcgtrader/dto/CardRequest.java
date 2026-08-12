package com.tcgtrader.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record CardRequest(
        @NotNull UUID setId,
        @NotBlank String name,
        @Min(1) @Max(5) Integer rarity,
        String condition,
        @NotNull BigDecimal price,
        @Min(0) int stock,
        String imageUrl
) {}
