package com.tcgtrader.repository;

import com.tcgtrader.entity.Discount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DiscountRepository extends JpaRepository<Discount, UUID> {
    List<Discount> findByItemId(UUID itemId);
    List<Discount> findByItemIdAndActiveTrue(UUID itemId);
}
