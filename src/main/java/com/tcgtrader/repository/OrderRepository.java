package com.tcgtrader.repository;

import com.tcgtrader.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByUserId(UUID userId);
    List<Order> findByUserIdAndStatus(UUID userId, Order.Status status);
    List<Order> findByStatus(Order.Status status);
    List<Order> findByPlacedAtBetween(Instant from, Instant to);
}
