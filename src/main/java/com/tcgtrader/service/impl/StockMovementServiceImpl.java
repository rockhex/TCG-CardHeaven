package com.tcgtrader.service.impl;

import com.tcgtrader.dto.StockMovementResponse;
import com.tcgtrader.entity.Item;
import com.tcgtrader.entity.StockMovement;
import com.tcgtrader.entity.User;
import com.tcgtrader.repository.StockMovementRepository;
import com.tcgtrader.service.StockMovementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StockMovementServiceImpl implements StockMovementService {

    private final StockMovementRepository repository;

    @Override
    @Transactional
    public void record(Item item, int quantityDelta, StockMovement.Reason reason, UUID referenceId, User performedBy, String note, int stockAfter) {
        StockMovement movement = StockMovement.builder()
                .item(item)
                .quantityDelta(quantityDelta)
                .reason(reason)
                .referenceId(referenceId)
                .performedBy(performedBy)
                .note(note)
                .stockAfter(stockAfter)
                .build();
        repository.save(movement);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockMovementResponse> search(UUID itemId, StockMovement.Reason reason, Instant from, Instant to) {
        Instant start = from != null ? from : Instant.EPOCH;
        Instant end = to != null ? to : Instant.now().plusSeconds(60);

        List<StockMovement> result;
        if (itemId != null && reason != null) {
            result = repository.findByItemIdAndReasonAndOccurredAtBetween(itemId, reason, start, end);
        } else if (itemId != null) {
            result = repository.findByItemId(itemId).stream()
                    .filter(m -> !m.getOccurredAt().isBefore(start) && !m.getOccurredAt().isAfter(end))
                    .toList();
        } else if (reason != null) {
            result = repository.findByReason(reason).stream()
                    .filter(m -> !m.getOccurredAt().isBefore(start) && !m.getOccurredAt().isAfter(end))
                    .toList();
        } else {
            result = repository.findByOccurredAtBetween(start, end);
        }
        return result.stream().map(StockMovementResponse::from).toList();
    }
}
