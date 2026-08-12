package com.tcgtrader.dto;

import com.tcgtrader.entity.GameSet;

import java.util.UUID;

public record SetResponse(UUID id, UUID gameId, String gameName, String name, String code) {
    public static SetResponse from(GameSet gs) {
        return new SetResponse(gs.getId(), gs.getGame().getId(), gs.getGame().getName(), gs.getName(), gs.getCode());
    }
}
