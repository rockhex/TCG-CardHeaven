package com.tcgtrader.dto;

import com.tcgtrader.entity.Cart;
import com.tcgtrader.entity.CartItem;

import java.util.List;
import java.util.UUID;

public record CartResponse(UUID id, List<CartItemResponse> items) {

    public record CartItemResponse(UUID id, UUID itemId, String itemType, int quantity) {
        public static CartItemResponse from(CartItem ci) {
            return new CartItemResponse(ci.getId(), ci.getItem().getId(), ci.getItem().getType(), ci.getQuantity());
        }
    }

    public static CartResponse from(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream().map(CartItemResponse::from).toList();
        return new CartResponse(cart.getId(), items);
    }
}
