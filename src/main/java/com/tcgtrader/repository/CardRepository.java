package com.tcgtrader.repository;

import com.tcgtrader.entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface CardRepository extends JpaRepository<Card, UUID> {
    List<Card> findByNameContainingIgnoreCase(String name);
    List<Card> findBySetId(UUID setId);

    @Query("SELECT c FROM Card c WHERE c.stock > 0")
    List<Card> findAvailable();
}
