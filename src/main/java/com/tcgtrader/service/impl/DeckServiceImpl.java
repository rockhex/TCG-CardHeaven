package com.tcgtrader.service.impl;

import com.tcgtrader.dto.DeckRequest;
import com.tcgtrader.dto.DeckResponse;
import com.tcgtrader.entity.Card;
import com.tcgtrader.entity.Deck;
import com.tcgtrader.entity.DeckCard;
import com.tcgtrader.entity.DeckCardId;
import com.tcgtrader.entity.GameSet;
import com.tcgtrader.entity.Item;
import com.tcgtrader.entity.StockMovement;
import com.tcgtrader.exception.ResourceNotFoundException;
import com.tcgtrader.repository.CardRepository;
import com.tcgtrader.repository.DeckRepository;
import com.tcgtrader.repository.GameSetRepository;
import com.tcgtrader.repository.ItemRepository;
import com.tcgtrader.security.AuthenticatedUserProvider;
import com.tcgtrader.service.DeckService;
import com.tcgtrader.service.DiscountService;
import com.tcgtrader.service.StockMovementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeckServiceImpl implements DeckService {

    private final DeckRepository deckRepository;
    private final GameSetRepository gameSetRepository;
    private final ItemRepository itemRepository;
    private final CardRepository cardRepository;
    private final StockMovementService stockMovementService;
    private final AuthenticatedUserProvider authenticatedUserProvider;
    private final DiscountService discountService;

    private DeckResponse toResponse(Deck deck) {
        return DeckResponse.from(deck,
                discountService.discountedPriceFor(deck.getItem().getId(), deck.getPrice()));
    }

    private void applyDeckCards(Deck deck, List<DeckRequest.DeckCardEntry> entries) {
        deck.getDeckCards().clear();
        if (entries == null) {
            return;
        }
        for (DeckRequest.DeckCardEntry entry : entries) {
            Card card = cardRepository.findById(entry.cardId())
                    .orElseThrow(() -> new ResourceNotFoundException("Card not found: " + entry.cardId()));
            DeckCard deckCard = DeckCard.builder()
                    .id(new DeckCardId())
                    .deck(deck)
                    .card(card)
                    .quantity(entry.quantity())
                    .build();
            deck.getDeckCards().add(deckCard);
        }
    }

    @Override
    @Transactional
    public DeckResponse create(DeckRequest request) {
        GameSet set = gameSetRepository.findById(request.setId())
                .orElseThrow(() -> new ResourceNotFoundException("Set not found: " + request.setId()));
        Item item = itemRepository.save(Item.builder().type("DECK").build());
        Deck deck = Deck.builder()
                .item(item)
                .set(set)
                .name(request.name())
                .description(request.description())
                .imageUrl(request.imageUrl())
                .price(request.price())
                .stock(request.stock())
                .build();
        applyDeckCards(deck, request.cards());
        Deck saved = deckRepository.save(deck);
        if (saved.getStock() > 0) {
            stockMovementService.record(item, saved.getStock(), StockMovement.Reason.INITIAL,
                    null, authenticatedUserProvider.current(), null, saved.getStock());
        }
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public DeckResponse findById(UUID id) {
        return deckRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Deck not found: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeckResponse> findAll() {
        return deckRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public DeckResponse update(UUID id, DeckRequest request) {
        Deck deck = deckRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deck not found: " + id));
        GameSet set = gameSetRepository.findById(request.setId())
                .orElseThrow(() -> new ResourceNotFoundException("Set not found: " + request.setId()));
        int previousStock = deck.getStock();
        deck.setSet(set);
        deck.setName(request.name());
        deck.setDescription(request.description());
        deck.setImageUrl(request.imageUrl());
        deck.setPrice(request.price());
        deck.setStock(request.stock());
        applyDeckCards(deck, request.cards());
        Deck saved = deckRepository.save(deck);

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
        if (!deckRepository.existsById(id)) {
            throw new ResourceNotFoundException("Deck not found: " + id);
        }
        deckRepository.deleteById(id);
    }
}
