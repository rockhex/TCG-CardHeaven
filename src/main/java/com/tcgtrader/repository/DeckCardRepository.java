package com.tcgtrader.repository;

import com.tcgtrader.entity.DeckCard;
import com.tcgtrader.entity.DeckCardId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface DeckCardRepository extends JpaRepository<DeckCard, DeckCardId> {

    // Borra todas las asociaciones deck-carta para una carta dada.
    // Se ejecuta como DELETE directo para evitar violar la FK al eliminar la carta.
    @Modifying
    @Query("DELETE FROM DeckCard dc WHERE dc.id.cardId = :cardId")
    void deleteByCardId(@Param("cardId") UUID cardId);
}
