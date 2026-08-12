package com.tcgtrader.controller;

import com.tcgtrader.dto.DeckRequest;
import com.tcgtrader.dto.DeckResponse;
import com.tcgtrader.service.DeckService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/decks")
@RequiredArgsConstructor
public class DeckController {

    private final DeckService deckService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public DeckResponse create(@Valid @RequestBody DeckRequest request) {
        return deckService.create(request);
    }

    @GetMapping
    public List<DeckResponse> findAll() {
        return deckService.findAll();
    }

    @GetMapping("/{id}")
    public DeckResponse findById(@PathVariable UUID id) {
        return deckService.findById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public DeckResponse update(@PathVariable UUID id, @Valid @RequestBody DeckRequest request) {
        return deckService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        deckService.delete(id);
    }
}
