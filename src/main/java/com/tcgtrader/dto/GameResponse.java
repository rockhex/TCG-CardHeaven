package com.tcgtrader.dto;

import com.tcgtrader.entity.Game;

import java.util.UUID;

public record GameResponse(UUID id, String name) {
    public static GameResponse from(Game game) {
        return new GameResponse(game.getId(), game.getName());
    }
}
