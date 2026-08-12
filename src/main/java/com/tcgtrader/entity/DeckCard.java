package com.tcgtrader.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.*;

@Entity
@Table(name = "deck_cards")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DeckCard {

    @EmbeddedId
    private DeckCardId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("deckId")
    @JoinColumn(name = "deck_id", nullable = false)
    private Deck deck;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("cardId")
    @JoinColumn(name = "card_id", nullable = false)
    private Card card;

    @Min(1)
    @Column(nullable = false)
    private int quantity;
}
