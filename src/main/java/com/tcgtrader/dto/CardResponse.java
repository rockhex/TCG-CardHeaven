package com.tcgtrader.dto;

import com.tcgtrader.entity.Card;

import java.math.BigDecimal;
import java.util.UUID;

public record CardResponse(UUID id, UUID itemId, UUID setId, String setName, String gameName,
                           String name, Integer rarity, String condition, BigDecimal price,
                           BigDecimal discountedPrice, int stock, String imageUrl) {
    public static CardResponse from(Card card, BigDecimal discountedPrice) {
        return new CardResponse(
                card.getId(),
                card.getItem().getId(),
                card.getSet().getId(),
                card.getSet().getName(),
                card.getSet().getGame().getName(),
                card.getName(),
                card.getRarity(),
                card.getCondition(),
                card.getPrice(),
                discountedPrice,
                card.getStock(),
                card.getImageUrl()
        );
    }
}
