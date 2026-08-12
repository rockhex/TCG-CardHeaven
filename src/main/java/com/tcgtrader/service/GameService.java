package com.tcgtrader.service;

import com.tcgtrader.dto.GameRequest;
import com.tcgtrader.dto.GameResponse;

import java.util.List;
import java.util.UUID;

public interface GameService {
    GameResponse create(GameRequest request);
    GameResponse findById(UUID id);
    List<GameResponse> findAll();
}
