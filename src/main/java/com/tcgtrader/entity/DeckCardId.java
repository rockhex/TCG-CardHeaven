package com.tcgtrader.entity;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class DeckCardId implements Serializable {
    private UUID deckId;
    private UUID cardId;
}
