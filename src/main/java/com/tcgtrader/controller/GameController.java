package com.tcgtrader.controller;

import com.tcgtrader.dto.GameRequest;
import com.tcgtrader.dto.GameResponse;
import com.tcgtrader.service.GameService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/games")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public GameResponse create(@Valid @RequestBody GameRequest request) {
        return gameService.create(request);
    }

    @GetMapping
    public List<GameResponse> findAll() {
        return gameService.findAll();
    }

    @GetMapping("/{id}")
    public GameResponse findById(@PathVariable UUID id) {
        return gameService.findById(id);
    }
}
