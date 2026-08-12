package com.tcgtrader.controller;

import com.tcgtrader.dto.CardRequest;
import com.tcgtrader.dto.CardResponse;
import com.tcgtrader.service.CardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
public class CardController {

    private final CardService cardService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public CardResponse create(@Valid @RequestBody CardRequest request) {
        return cardService.create(request);
    }

    @GetMapping
    public List<CardResponse> list(@RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return cardService.search(search);
        }
        return cardService.findAll();
    }

    @GetMapping("/{id}")
    public CardResponse findById(@PathVariable UUID id) {
        return cardService.findById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public CardResponse update(@PathVariable UUID id, @Valid @RequestBody CardRequest request) {
        return cardService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        cardService.delete(id);
    }
}
