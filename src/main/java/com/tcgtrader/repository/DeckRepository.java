package com.tcgtrader.repository;

import com.tcgtrader.entity.Deck;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DeckRepository extends JpaRepository<Deck, UUID> {
    List<Deck> findBySetId(UUID setId);
}
