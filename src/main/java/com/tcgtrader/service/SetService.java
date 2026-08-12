package com.tcgtrader.service;

import com.tcgtrader.dto.SetRequest;
import com.tcgtrader.dto.SetResponse;

import java.util.List;
import java.util.UUID;

public interface SetService {
    SetResponse create(SetRequest request);
    SetResponse findById(UUID id);
    List<SetResponse> findAll();
    List<SetResponse> findByGame(UUID gameId);
}
