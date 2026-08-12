package com.tcgtrader.service.impl;

import com.tcgtrader.dto.CheckoutRequest;
import com.tcgtrader.dto.OrderResponse;
import com.tcgtrader.entity.*;
import com.tcgtrader.exception.BusinessException;
import com.tcgtrader.exception.ResourceNotFoundException;
import com.tcgtrader.repository.*;
import com.tcgtrader.service.CartService;
import com.tcgtrader.service.EmailService;
import com.tcgtrader.service.OrderService;
import com.tcgtrader.service.StockMovementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final CardRepository cardRepository;
    private final DeckRepository deckRepository;
    private final CartService cartService;
    private final StockMovementService stockMovementService;
    private final EmailServiceImpl emailService;

    @Override
    @Transactional
    public OrderResponse checkout(UUID userId, CheckoutRequest request) {
        if (request.addressId() == null) {
            throw new BusinessException("Address is required for checkout");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        if (user.getAddresses().isEmpty()) {
            throw new BusinessException("No address registered; add an address before checkout");
        }

        Address address = user.getAddresses().stream()
                .filter(a -> a.getId().equals(request.addressId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Address not found: " + request.addressId()));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user: " + userId));

        if (cart.getItems().isEmpty()) {
            throw new BusinessException("Cannot checkout with an empty cart");
        }

        List<PendingStockMovement> pendingMovements = new ArrayList<>();
        List<OrderItem> orderItems = cart.getItems().stream().map(cartItem -> {
            Item item = cartItem.getItem();
            BigDecimal unitPrice = resolvePrice(item, cartItem.getQuantity(), pendingMovements);
            return OrderItem.builder()
                    .item(item)
                    .quantity(cartItem.getQuantity())
                    .unitPrice(unitPrice)
                    .build();
        }).toList();

        BigDecimal total = orderItems.stream()
                .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = Order.builder()
                .user(user)
                .address(address)
                .totalAmount(total)
                .build();

        orderItems.forEach(i -> {
            i.setOrder(order);
            order.getItems().add(i);
        });

        Payment payment = Payment.builder()
                .order(order)
                .provider(request.paymentProvider())
                .externalProcessorId(request.externalProcessorId())
                .amount(total)
                .status(Payment.Status.APPROVED)
                .build();

        order.setPayment(payment);
        order.setStatus(Order.Status.PAID);

        Order saved = orderRepository.save(order);
        // emailService.sendOrderConfirmation(user, saved);

        pendingMovements.forEach(m -> stockMovementService.record(
                m.item, m.delta, StockMovement.Reason.SALE, saved.getId(), user, null, m.stockAfter));

        cartService.clearCart(userId);

        return OrderResponse.from(saved);
    }

    private record PendingStockMovement(Item item, int delta, int stockAfter) {}

    @Override
    @Transactional(readOnly = true)
    public OrderResponse findById(UUID id) {
        return orderRepository.findById(id)
                .map(OrderResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> findByUser(UUID userId) {
        return orderRepository.findByUserId(userId).stream().map(OrderResponse::from).toList();
    }

    @Override
    @Transactional
    public OrderResponse cancel(UUID userId, UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new BusinessException("Order does not belong to user: " + userId);
        }
        if (order.getStatus() == Order.Status.CANCELLED) {
            throw new BusinessException("Order is already cancelled");
        }
        if (order.getStatus() == Order.Status.SHIPPED || order.getStatus() == Order.Status.DELIVERED) {
            throw new BusinessException("Cannot cancel an order that has already been " + order.getStatus().name().toLowerCase());
        }

        // Devolvemos el stock reservado por cada ítem del pedido.
        order.getItems().forEach(orderItem -> {
            Item item = orderItem.getItem();
            int qty = orderItem.getQuantity();
            int stockAfter = restoreStock(item, qty);
            stockMovementService.record(item, qty, StockMovement.Reason.RETURN,
                    order.getId(), order.getUser(), "Order cancelled", stockAfter);
        });

        order.setStatus(Order.Status.CANCELLED);
        return OrderResponse.from(orderRepository.save(order));
    }

    private int restoreStock(Item item, int quantity) {
        if ("CARD".equals(item.getType())) {
            Card card = cardRepository.findAll().stream()
                    .filter(c -> c.getItem().getId().equals(item.getId()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Card not found for item: " + item.getId()));
            card.setStock(card.getStock() + quantity);
            return card.getStock();
        } else {
            Deck deck = deckRepository.findAll().stream()
                    .filter(d -> d.getItem().getId().equals(item.getId()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Deck not found for item: " + item.getId()));
            deck.setStock(deck.getStock() + quantity);
            return deck.getStock();
        }
    }

    private BigDecimal resolvePrice(Item item, int quantity, List<PendingStockMovement> pending) {
        if ("CARD".equals(item.getType())) {
            Card card = cardRepository.findAll().stream()
                    .filter(c -> c.getItem().getId().equals(item.getId()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Card not found for item: " + item.getId()));
            if (card.getStock() < quantity) {
                throw new BusinessException("Insufficient stock for card: " + card.getName());
            }
            card.setStock(card.getStock() - quantity);
            pending.add(new PendingStockMovement(item, -quantity, card.getStock()));
            return card.getPrice();
        } else {
            Deck deck = deckRepository.findAll().stream()
                    .filter(d -> d.getItem().getId().equals(item.getId()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Deck not found for item: " + item.getId()));
            if (deck.getStock() < quantity) {
                throw new BusinessException("Insufficient stock for deck: " + deck.getName());
            }
            deck.setStock(deck.getStock() - quantity);
            pending.add(new PendingStockMovement(item, -quantity, deck.getStock()));
            return deck.getPrice();
        }
    }
}
