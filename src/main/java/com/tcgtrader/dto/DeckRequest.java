package com.tcgtrader.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record DeckRequest(
        @NotNull UUID setId,
        @NotBlank String name,
        String description,
        @NotNull BigDecimal price,
        @Min(0) int stock,
        String imageUrl,
        List<DeckCardEntry> cards
) {
    public record DeckCardEntry(@NotNull UUID cardId, @Min(1) int quantity) {}
}
