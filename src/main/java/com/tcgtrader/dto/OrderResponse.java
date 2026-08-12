package com.tcgtrader.dto;

import com.tcgtrader.entity.Order;
import com.tcgtrader.entity.OrderItem;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderResponse(UUID id, String status, BigDecimal totalAmount, Instant placedAt,
                            UUID customerId, String customerName, String customerEmail,
                            AddressResponse address, List<OrderItemResponse> items) {

    public record OrderItemResponse(UUID itemId, String itemType, int quantity, BigDecimal unitPrice) {
        public static OrderItemResponse from(OrderItem oi) {
            return new OrderItemResponse(oi.getItem().getId(), oi.getItem().getType(), oi.getQuantity(), oi.getUnitPrice());
        }
    }

    public static OrderResponse from(Order order) {
        List<OrderItemResponse> items = order.getItems().stream().map(OrderItemResponse::from).toList();
        return new OrderResponse(order.getId(), order.getStatus().name(), order.getTotalAmount(),
                order.getPlacedAt(),
                order.getUser().getId(), order.getUser().getName(), order.getUser().getEmail(),
                AddressResponse.from(order.getAddress()), items);
    }
}
