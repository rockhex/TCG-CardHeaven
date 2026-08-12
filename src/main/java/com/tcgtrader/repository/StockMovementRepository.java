package com.tcgtrader.repository;

import com.tcgtrader.entity.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface StockMovementRepository extends JpaRepository<StockMovement, UUID> {
    List<StockMovement> findByItemId(UUID itemId);
    List<StockMovement> findByReason(StockMovement.Reason reason);
    List<StockMovement> findByOccurredAtBetween(Instant from, Instant to);
    List<StockMovement> findByItemIdAndReasonAndOccurredAtBetween(UUID itemId, StockMovement.Reason reason, Instant from, Instant to);
}
