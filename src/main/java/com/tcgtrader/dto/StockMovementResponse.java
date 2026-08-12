package com.tcgtrader.dto;

import com.tcgtrader.entity.StockMovement;

import java.time.Instant;
import java.util.UUID;

public record StockMovementResponse(
        UUID id,
        UUID itemId,
        int quantityDelta,
        String reason,
        UUID referenceId,
        UUID performedBy,
        String note,
        int stockAfter,
        Instant occurredAt
) {
    public static StockMovementResponse from(StockMovement m) {
        return new StockMovementResponse(
                m.getId(),
                m.getItem().getId(),
                m.getQuantityDelta(),
                m.getReason().name(),
                m.getReferenceId(),
                m.getPerformedBy().getId(),
                m.getNote(),
                m.getStockAfter(),
                m.getOccurredAt()
        );
    }
}
