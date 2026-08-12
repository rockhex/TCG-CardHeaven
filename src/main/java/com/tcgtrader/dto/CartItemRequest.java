package com.tcgtrader.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CartItemRequest(
        @NotNull UUID itemId,
        @Min(1) int quantity
) {}
