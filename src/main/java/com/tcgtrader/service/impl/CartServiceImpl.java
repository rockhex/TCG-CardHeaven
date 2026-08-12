package com.tcgtrader.service.impl;

import com.tcgtrader.dto.CartItemRequest;
import com.tcgtrader.dto.CartResponse;
import com.tcgtrader.entity.*;
import com.tcgtrader.exception.BusinessException;
import com.tcgtrader.exception.ResourceNotFoundException;
import com.tcgtrader.repository.CardRepository;
import com.tcgtrader.repository.CartRepository;
import com.tcgtrader.repository.DeckRepository;
import com.tcgtrader.repository.ItemRepository;
import com.tcgtrader.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final ItemRepository itemRepository;
    private final CardRepository cardRepository;
    private final DeckRepository deckRepository;

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCart(UUID userId) {
        return CartResponse.from(getOrFail(userId));
    }

    @Override
    @Transactional
    public CartResponse addItem(UUID userId, CartItemRequest request) {
        Cart cart = getOrFail(userId);
        Item item = itemRepository.findById(request.itemId())
                .orElseThrow(() -> new ResourceNotFoundException("Item not found: " + request.itemId()));

        checkStock(item, request.quantity());

        cart.getItems().stream()
                .filter(i -> i.getItem().getId().equals(item.getId()))
                .findFirst()
                .ifPresentOrElse(
                        i -> i.setQuantity(i.getQuantity() + request.quantity()),
                        () -> cart.getItems().add(CartItem.builder()
                                .cart(cart)
                                .item(item)
                                .quantity(request.quantity())
                                .build())
                );

        return CartResponse.from(cartRepository.save(cart));
    }

    @Override
    @Transactional
    public CartResponse removeItem(UUID userId, UUID itemId) {
        Cart cart = getOrFail(userId);
        cart.getItems().removeIf(i -> i.getItem().getId().equals(itemId));
        return CartResponse.from(cartRepository.save(cart));
    }

    @Override
    @Transactional
    public void clearCart(UUID userId) {
        Cart cart = getOrFail(userId);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    private Cart getOrFail(UUID userId) {
        return cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user: " + userId));
    }

    private void checkStock(Item item, int quantity) {
        if ("CARD".equals(item.getType())) {
            cardRepository.findAll().stream()
                    .filter(c -> c.getItem().getId().equals(item.getId()))
                    .findFirst()
                    .ifPresent(card -> {
                        if (card.getStock() < quantity) {
                            throw new BusinessException("Insufficient stock for card: " + card.getName());
                        }
                    });
        } else if ("DECK".equals(item.getType())) {
            deckRepository.findAll().stream()
                    .filter(d -> d.getItem().getId().equals(item.getId()))
                    .findFirst()
                    .ifPresent(deck -> {
                        if (deck.getStock() < quantity) {
                            throw new BusinessException("Insufficient stock for deck: " + deck.getName());
                        }
                    });
        }
    }
}
