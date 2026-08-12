package com.tcgtrader.controller;

import com.tcgtrader.dto.OrderResponse;
import com.tcgtrader.dto.StockMovementResponse;
import com.tcgtrader.entity.Order;
import com.tcgtrader.entity.StockMovement;
import com.tcgtrader.repository.OrderRepository;
import com.tcgtrader.service.StockMovementService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final StockMovementService stockMovementService;
    private final OrderRepository orderRepository;

    @GetMapping("/stock-movements")
    public List<StockMovementResponse> stockMovements(
            @RequestParam(required = false) UUID itemId,
            @RequestParam(required = false) StockMovement.Reason reason,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to
    ) {
        return stockMovementService.search(itemId, reason, from, to);
    }

    @GetMapping("/orders")
    public List<OrderResponse> orders(
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) Order.Status status,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to
    ) {
        List<Order> result;
        if (userId != null && status != null) {
            result = orderRepository.findByUserIdAndStatus(userId, status);
        } else if (userId != null) {
            result = orderRepository.findByUserId(userId);
        } else if (status != null) {
            result = orderRepository.findByStatus(status);
        } else if (from != null && to != null) {
            result = orderRepository.findByPlacedAtBetween(from, to);
        } else {
            result = orderRepository.findAll();
        }
        if (from != null || to != null) {
            Instant start = from != null ? from : Instant.EPOCH;
            Instant end = to != null ? to : Instant.now().plusSeconds(60);
            result = result.stream()
                    .filter(o -> !o.getPlacedAt().isBefore(start) && !o.getPlacedAt().isAfter(end))
                    .toList();
        }
        return result.stream().map(OrderResponse::from).toList();
    }
}
