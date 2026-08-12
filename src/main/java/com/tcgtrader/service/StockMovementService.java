package com.tcgtrader.service;

import com.tcgtrader.dto.StockMovementResponse;
import com.tcgtrader.entity.Item;
import com.tcgtrader.entity.StockMovement;
import com.tcgtrader.entity.User;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface StockMovementService {
    void record(Item item, int quantityDelta, StockMovement.Reason reason, UUID referenceId, User performedBy, String note, int stockAfter);
    List<StockMovementResponse> search(UUID itemId, StockMovement.Reason reason, Instant from, Instant to);
}
