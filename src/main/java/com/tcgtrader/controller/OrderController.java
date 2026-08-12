package com.tcgtrader.controller;

import com.tcgtrader.dto.CheckoutRequest;
import com.tcgtrader.dto.OrderResponse;
import com.tcgtrader.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/api/users/{userId}/checkout")
    @PreAuthorize("hasRole('ADMIN') or #userId.toString() == authentication.principal")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse checkout(@PathVariable UUID userId, @Valid @RequestBody CheckoutRequest request) {
        return orderService.checkout(userId, request);
    }

    @GetMapping("/api/users/{userId}/orders")
    @PreAuthorize("hasRole('ADMIN') or #userId.toString() == authentication.principal")
    public List<OrderResponse> listByUser(@PathVariable UUID userId) {
        return orderService.findByUser(userId);
    }

    @GetMapping("/api/orders/{id}")
    public OrderResponse findById(@PathVariable UUID id) {
        return orderService.findById(id);
    }

    @PostMapping("/api/users/{userId}/orders/{orderId}/cancel")
    @PreAuthorize("hasRole('ADMIN') or #userId.toString() == authentication.principal")
    public OrderResponse cancel(@PathVariable UUID userId, @PathVariable UUID orderId) {
        return orderService.cancel(userId, orderId);
    }
}
