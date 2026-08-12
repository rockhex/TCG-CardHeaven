package com.tcgtrader.controller;

import com.tcgtrader.dto.SetRequest;
import com.tcgtrader.dto.SetResponse;
import com.tcgtrader.service.SetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class SetController {

    private final SetService setService;

    @PostMapping("/api/sets")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public SetResponse create(@Valid @RequestBody SetRequest request) {
        return setService.create(request);
    }

    @GetMapping("/api/sets")
    public List<SetResponse> findAll() {
        return setService.findAll();
    }

    @GetMapping("/api/sets/{id}")
    public SetResponse findById(@PathVariable UUID id) {
        return setService.findById(id);
    }

    @GetMapping("/api/games/{gameId}/sets")
    public List<SetResponse> findByGame(@PathVariable UUID gameId) {
        return setService.findByGame(gameId);
    }
}
