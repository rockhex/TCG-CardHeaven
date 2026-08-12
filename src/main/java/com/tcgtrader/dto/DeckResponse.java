package com.tcgtrader.dto;

import com.tcgtrader.entity.Deck;
import com.tcgtrader.entity.DeckCard;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record DeckResponse(UUID id, UUID itemId, UUID setId, String setName, String gameName,
                           String name, String description, BigDecimal price, BigDecimal discountedPrice,
                           int stock, String imageUrl, List<DeckCardResponse> cards) {

    public record DeckCardResponse(UUID cardId, String name, Integer rarity, int quantity) {
        public static DeckCardResponse from(DeckCard dc) {
            return new DeckCardResponse(
                    dc.getCard().getId(),
                    dc.getCard().getName(),
                    dc.getCard().getRarity(),
                    dc.getQuantity()
            );
        }
    }

    public static DeckResponse from(Deck deck, BigDecimal discountedPrice) {
        List<DeckCardResponse> cards = deck.getDeckCards().stream().map(DeckCardResponse::from).toList();
        return new DeckResponse(
                deck.getId(),
                deck.getItem().getId(),
                deck.getSet().getId(),
                deck.getSet().getName(),
                deck.getSet().getGame().getName(),
                deck.getName(),
                deck.getDescription(),
                deck.getPrice(),
                discountedPrice,
                deck.getStock(),
                deck.getImageUrl(),
                cards
        );
    }
}
