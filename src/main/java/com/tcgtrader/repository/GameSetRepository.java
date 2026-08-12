package com.tcgtrader.repository;

import com.tcgtrader.entity.GameSet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GameSetRepository extends JpaRepository<GameSet, UUID> {
    List<GameSet> findByGameId(UUID gameId);
}
