package com.tcgtrader.service;

import com.tcgtrader.dto.CartItemRequest;
import com.tcgtrader.dto.CartResponse;

import java.util.UUID;

public interface CartService {
    CartResponse getCart(UUID userId);
    CartResponse addItem(UUID userId, CartItemRequest request);
    CartResponse removeItem(UUID userId, UUID itemId);
    void clearCart(UUID userId);
}
