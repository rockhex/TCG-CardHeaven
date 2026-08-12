package com.tcgtrader.service.impl;

import com.tcgtrader.dto.CardRequest;
import com.tcgtrader.dto.CardResponse;
import com.tcgtrader.entity.Card;
import com.tcgtrader.entity.GameSet;
import com.tcgtrader.entity.Item;
import com.tcgtrader.entity.StockMovement;
import com.tcgtrader.exception.ResourceNotFoundException;
import com.tcgtrader.repository.CardRepository;
import com.tcgtrader.repository.DeckCardRepository;
import com.tcgtrader.repository.GameSetRepository;
import com.tcgtrader.repository.ItemRepository;
import com.tcgtrader.security.AuthenticatedUserProvider;
import com.tcgtrader.service.CardService;
import com.tcgtrader.service.DiscountService;
import com.tcgtrader.service.StockMovementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CardServiceImpl implements CardService {

    private final CardRepository cardRepository;
    private final DeckCardRepository deckCardRepository;
    private final GameSetRepository gameSetRepository;
    private final ItemRepository itemRepository;
    private final StockMovementService stockMovementService;
    private final AuthenticatedUserProvider authenticatedUserProvider;
    private final DiscountService discountService;

    private CardResponse toResponse(Card card) {
        return CardResponse.from(card,
                discountService.discountedPriceFor(card.getItem().getId(), card.getPrice()));
    }

    @Override
    @Transactional
    public CardResponse create(CardRequest request) {
        GameSet set = gameSetRepository.findById(request.setId())
                .orElseThrow(() -> new ResourceNotFoundException("Set not found: " + request.setId()));
        Item item = itemRepository.save(Item.builder().type("CARD").build());
        Card card = Card.builder()
                .item(item)
                .set(set)
                .name(request.name())
                .rarity(request.rarity())
                .condition(request.condition())
                .price(request.price())
                .stock(request.stock())
                .imageUrl(request.imageUrl())
                .build();
        Card saved = cardRepository.save(card);
        if (saved.getStock() > 0) {
            stockMovementService.record(item, saved.getStock(), StockMovement.Reason.INITIAL,
                    null, authenticatedUserProvider.current(), null, saved.getStock());
        }
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public CardResponse findById(UUID id) {
        return cardRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CardResponse> findAll() {
        return cardRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CardResponse> search(String name) {
        return cardRepository.findByNameContainingIgnoreCase(name).stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public CardResponse update(UUID id, CardRequest request) {
        Card card = cardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found: " + id));
        GameSet set = gameSetRepository.findById(request.setId())
                .orElseThrow(() -> new ResourceNotFoundException("Set not found: " + request.setId()));
        int previousStock = card.getStock();
        card.setSet(set);
        card.setName(request.name());
        card.setRarity(request.rarity());
        card.setCondition(request.condition());
        card.setPrice(request.price());
        card.setStock(request.stock());
        card.setImageUrl(request.imageUrl());
        Card saved = cardRepository.save(card);

        int delta = saved.getStock() - previousStock;
        if (delta != 0) {
            StockMovement.Reason reason = delta > 0 ? StockMovement.Reason.RESTOCK : StockMovement.Reason.ADJUSTMENT;
            stockMovementService.record(saved.getItem(), delta, reason, null,
                    authenticatedUserProvider.current(), null, saved.getStock());
        }
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        if (!cardRepository.existsById(id)) {
            throw new ResourceNotFoundException("Card not found: " + id);
        }
        // La carta puede formar parte de uno o más decks (FK deck_cards.card_id).
        // Borramos esas asociaciones primero (DELETE directo) para no violar la FK.
        deckCardRepository.deleteByCardId(id);
        cardRepository.deleteById(id);
    }
}
