package com.tcgtrader.service;

import com.tcgtrader.dto.CheckoutRequest;
import com.tcgtrader.dto.OrderResponse;

import java.util.List;
import java.util.UUID;

public interface OrderService {
    OrderResponse checkout(UUID userId, CheckoutRequest request);
    OrderResponse findById(UUID id);
    List<OrderResponse> findByUser(UUID userId);
    OrderResponse cancel(UUID userId, UUID orderId);
}
